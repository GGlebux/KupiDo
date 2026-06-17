"""Unit-тесты валидации входных данных.

Самая нетривиальная часть — регулярное выражение для российского номера
телефона (app.schemas.validators.validate_phone): оно допускает разные
разделители (пробел, дефис, скобки) и оба префикса (+7 / 8), но должно
отсекать заведомо некорректные номера. Дополнительно проверяем, что
валидатор корректно подключён в Pydantic-схемы и что граничные ограничения
схем (рейтинг отзыва, длина пароля, нормализация пустого email) работают.
"""
import pytest
from pydantic import ValidationError

from app.schemas.validators import validate_phone


# ----------------------- validate_phone (чистая функция) ---------------------

@pytest.mark.parametrize("value", [
    "+79991234567",
    "89991234567",
    "+7 (999) 123-45-67",
    "8-999-123-45-67",
    "+7 999 123 45 67",
    "8 (999) 123 45 67",
])
def test_valid_phone_numbers(value):
    # Не должно бросать исключение; возвращает очищенную (strip) строку.
    assert validate_phone(value) == value.strip()


@pytest.mark.parametrize("value", [
    "12345",              # слишком короткий, без префикса
    "+7999123456",        # не хватает цифр
    "+7 (999) 123-45-6",  # на одну цифру меньше
    "+1 555 123 4567",    # иностранный код
    "abcdefghijk",        # не цифры
    "+7(999)12345678",    # лишняя цифра
])
def test_invalid_phone_numbers_raise(value):
    with pytest.raises(ValueError):
        validate_phone(value)


def test_empty_phone_is_allowed():
    """Телефон необязателен: None и пустая строка проходят без ошибки."""
    assert validate_phone(None) is None
    assert validate_phone("") == ""


def test_phone_is_stripped():
    assert validate_phone("  +7 999 123 45 67  ") == "+7 999 123 45 67"


# ------------------ Интеграция валидатора с Pydantic-схемами -----------------

def test_consultation_accepts_valid_phone():
    from app.schemas.consultation import ConsultationCreate
    c = ConsultationCreate(name="Иван", phone="+7 (999) 123-45-67")
    assert c.phone == "+7 (999) 123-45-67"


def test_consultation_rejects_invalid_phone():
    from app.schemas.consultation import ConsultationCreate
    with pytest.raises(ValidationError):
        ConsultationCreate(name="Иван", phone="123")


@pytest.mark.parametrize("raw_email", ["", "   ", None])
def test_consultation_empty_email_becomes_none(raw_email):
    """Формы присылают пустую строку — она должна стать None, иначе EmailStr
    отклонит "" и заявка не отправится."""
    from app.schemas.consultation import ConsultationCreate
    c = ConsultationCreate(name="Иван", phone="+79991234567", email=raw_email)
    assert c.email is None


def test_consultation_valid_email_preserved():
    from app.schemas.consultation import ConsultationCreate
    c = ConsultationCreate(name="Иван", phone="+79991234567", email="user@example.com")
    assert c.email == "user@example.com"


# --------------------- Граничные ограничения схем ----------------------------

@pytest.mark.parametrize("rating", [1, 3, 5])
def test_review_rating_within_range_ok(rating):
    from app.schemas.review import ReviewCreate
    r = ReviewCreate(rating=rating, text="Нормальный отзыв")
    assert r.rating == rating


@pytest.mark.parametrize("rating", [0, 6, -1, 100])
def test_review_rating_out_of_range_raises(rating):
    from app.schemas.review import ReviewCreate
    with pytest.raises(ValidationError):
        ReviewCreate(rating=rating, text="Нормальный отзыв")


def test_review_text_too_short_raises():
    from app.schemas.review import ReviewCreate
    with pytest.raises(ValidationError):
        ReviewCreate(rating=5, text="ok")  # < 3 символов


def test_user_password_min_length_enforced():
    from app.schemas.user import UserCreate
    with pytest.raises(ValidationError):
        UserCreate(
            email="user@example.com",
            password="12345",  # < 6 символов
            first_name="Иван",
            last_name="Иванов",
        )
