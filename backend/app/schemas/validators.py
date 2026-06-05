import re

# Российский номер: +7 / 8, допускаются пробелы, дефисы и скобки.
PHONE_RE = re.compile(r"^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$")


def validate_phone(value):
    """Проверяет номер телефона. Пустое значение допустимо (телефон необязателен)."""
    if value is None or value == "":
        return value
    if not PHONE_RE.match(value.strip()):
        raise ValueError("Неверный формат телефона. Ожидается +7 (XXX) XXX-XX-XX")
    return value.strip()
