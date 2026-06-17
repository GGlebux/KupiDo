"""Общая настройка для unit-тестов бэкенда.

Добавляет каталог `backend/` в `sys.path`, чтобы пакет `app` импортировался
при запуске `pytest` из любой директории, и фиксирует предсказуемые значения
переменных окружения (SECRET_KEY и т. п.) ДО импорта приложения.
"""
import os
import sys
from pathlib import Path

# .../backend/tests/conftest.py -> BACKEND_DIR = .../backend
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Детерминированный секрет для тестов JWT (не зависим от .env разработчика).
os.environ.setdefault("SECRET_KEY", "unit-test-secret-key-0123456789abcdef")
