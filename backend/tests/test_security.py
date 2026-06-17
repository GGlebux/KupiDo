"""Unit-тесты модуля app.core.security — хеширование паролей (bcrypt) и
выпуск/проверка JWT-токенов доступа. Это критичная для безопасности логика:
ошибка здесь напрямую ведёт к компрометации аутентификации.
"""
from datetime import timedelta

from app.core import security


# --------------------------- Пароли (bcrypt) ---------------------------------

def test_hash_password_is_not_plaintext():
    """Хеш не равен исходному паролю и имеет формат bcrypt ($2b$...)."""
    hashed = security.hash_password("MyS3cret!")
    assert hashed != "MyS3cret!"
    assert hashed.startswith("$2")


def test_verify_password_correct():
    hashed = security.hash_password("correct horse battery staple")
    assert security.verify_password("correct horse battery staple", hashed) is True


def test_verify_password_wrong():
    hashed = security.hash_password("right-password")
    assert security.verify_password("wrong-password", hashed) is False


def test_hash_password_is_salted():
    """Два хеша одного пароля различаются — соль генерируется случайно,
    но оба проходят проверку."""
    h1 = security.hash_password("same-password")
    h2 = security.hash_password("same-password")
    assert h1 != h2
    assert security.verify_password("same-password", h1)
    assert security.verify_password("same-password", h2)


# ------------------------------ JWT-токены -----------------------------------

def test_token_roundtrip_returns_subject():
    """Выпущенный токен декодируется обратно в исходный subject (id пользователя)."""
    token = security.create_access_token("user-123")
    assert security.decode_token(token) == "user-123"


def test_decode_invalid_token_returns_none():
    assert security.decode_token("not-a-real-jwt") is None
    assert security.decode_token("") is None


def test_decode_tampered_token_returns_none():
    """Подмена подписи токена должна приводить к отказу (None), а не к доверию."""
    token = security.create_access_token("user-123")
    # Портим последний символ подписи.
    tampered = token[:-1] + ("a" if token[-1] != "a" else "b")
    assert security.decode_token(tampered) is None


def test_expired_token_returns_none():
    """Токен с истёкшим сроком жизни не принимается."""
    token = security.create_access_token("user-123", expires_delta=timedelta(seconds=-1))
    assert security.decode_token(token) is None


def test_token_signed_with_other_secret_rejected(monkeypatch):
    """Токен, подписанный чужим ключом, отклоняется текущим SECRET_KEY."""
    from jose import jwt
    from datetime import datetime

    foreign = jwt.encode(
        {"sub": "user-123", "exp": datetime.utcnow() + timedelta(minutes=5)},
        "completely-different-secret",
        algorithm=security.ALGORITHM,
    )
    assert security.decode_token(foreign) is None
