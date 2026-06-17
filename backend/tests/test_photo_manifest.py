"""Unit-тесты модуля app.crud.photo — самой сложной части бэкенда.

Каталог фото хранится в репозитории (файлы едут с git), а связи фото с
проектами/объектами восстанавливаются из manifest.json. Здесь проверяется
безопасная для файловой системы логика:

* remove_local_file   — удаляет только локальные файлы (/media/...), не трогая
                        внешние ссылки и чужие пути;
* _read_manifest      — устойчиво читает манифест (отсутствует / битый JSON);
* sweep_orphan_files  — вычищает «осиротевшие» картинки, но бережёт файлы,
                        на которые ссылается БД или манифест, и не-изображения.

DB-зависимая функция sweep_orphan_files проверяется с минимальной заглушкой
AsyncSession, возвращающей заранее заданный список url из таблицы photos.
Это позволяет тестировать сложную файловую логику без реальной БД.
"""
import asyncio
import json
import os

import pytest

from app.core.config import settings
from app.crud import photo


@pytest.fixture
def media_dir(tmp_path, monkeypatch):
    """Подменяет MEDIA_DIR на временный каталог на время теста."""
    monkeypatch.setattr(settings, "MEDIA_DIR", str(tmp_path))
    return tmp_path


def _write(path, content="x"):
    path.write_text(content, encoding="utf-8")


# --------------------------- remove_local_file -------------------------------

def test_remove_local_file_deletes_media_file(media_dir):
    f = media_dir / "photo.jpg"
    _write(f)
    photo.remove_local_file("/media/photo.jpg")
    assert not f.exists()


def test_remove_local_file_ignores_external_url(media_dir):
    """Внешние ссылки (http...) не должны приводить к удалению локальных файлов
    с тем же именем."""
    f = media_dir / "photo.jpg"
    _write(f)
    photo.remove_local_file("https://cdn.example.com/photo.jpg")
    assert f.exists()  # локальный файл не тронут


@pytest.mark.parametrize("url", [None, "", "photo.jpg", "/other/photo.jpg"])
def test_remove_local_file_ignores_non_media(media_dir, url):
    # Не должно бросать исключение и не должно ничего удалять вне /media/.
    photo.remove_local_file(url)


def test_remove_local_file_missing_is_safe(media_dir):
    # Файла нет — функция не должна падать.
    photo.remove_local_file("/media/does-not-exist.jpg")


# ----------------------------- _read_manifest --------------------------------

def test_read_manifest_missing_returns_default(media_dir):
    assert photo._read_manifest() == {"photos": []}


def test_read_manifest_valid(media_dir):
    data = {"photos": [{"url": "/media/a.jpg", "project": "proj"}]}
    _write(media_dir / settings.MANIFEST_NAME, json.dumps(data))
    assert photo._read_manifest() == data


def test_read_manifest_corrupt_returns_default(media_dir):
    _write(media_dir / settings.MANIFEST_NAME, "{ not valid json ")
    assert photo._read_manifest() == {"photos": []}


def test_read_manifest_non_dict_returns_default(media_dir):
    # Корневой элемент — список, а не объект -> безопасный дефолт.
    _write(media_dir / settings.MANIFEST_NAME, json.dumps([1, 2, 3]))
    assert photo._read_manifest() == {"photos": []}


# ---------------------------- sweep_orphan_files -----------------------------

class _FakeScalars:
    def __init__(self, values):
        self._values = values

    def all(self):
        return self._values


class _FakeResult:
    def __init__(self, values):
        self._values = values

    def scalars(self):
        return _FakeScalars(self._values)


class FakeSession:
    """Минимальная замена AsyncSession: на любой execute() возвращает заранее
    заданный список url из таблицы photos."""

    def __init__(self, urls):
        self._urls = urls

    async def execute(self, *args, **kwargs):
        return _FakeResult(self._urls)


def test_sweep_orphan_files(media_dir):
    # Готовим каталог:
    _write(media_dir / "keep_db.jpg")        # на файл ссылается БД  -> сохранить
    _write(media_dir / "keep_manifest.jpg")  # на файл ссылается манифест -> сохранить
    _write(media_dir / "orphan.jpg")         # ничей -> удалить
    _write(media_dir / "note.txt")           # не изображение -> не трогать
    # Манифест ссылается на keep_manifest.jpg (и сам manifest.json — не картинка).
    manifest = {"photos": [{"url": "/media/keep_manifest.jpg", "project": "p"}]}
    _write(media_dir / settings.MANIFEST_NAME, json.dumps(manifest))

    db = FakeSession(["/media/keep_db.jpg"])  # photos в БД
    removed = asyncio.run(photo.sweep_orphan_files(db))

    assert removed == 1
    assert not (media_dir / "orphan.jpg").exists()
    assert (media_dir / "keep_db.jpg").exists()
    assert (media_dir / "keep_manifest.jpg").exists()
    assert (media_dir / "note.txt").exists()
    assert (media_dir / settings.MANIFEST_NAME).exists()


def test_sweep_orphan_files_no_media_dir(monkeypatch, tmp_path):
    """Если каталога нет — функция возвращает 0 и не падает."""
    monkeypatch.setattr(settings, "MEDIA_DIR", str(tmp_path / "missing"))
    db = FakeSession([])
    assert asyncio.run(photo.sweep_orphan_files(db)) == 0
