import { forwardRef } from 'react'

/**
 * Маска для российских номеров: всегда +7 (XXX) XXX-XX-XX.
 * Принимает любой ввод, оставляет только цифры, нормализует ведущую 8/7
 * и форматирует. Возвращает '' при пустом вводе (чтобы поле можно было очистить).
 */
export function maskRuPhone(raw: string): string {
  let digits = (raw || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits[0] === '8') digits = '7' + digits.slice(1)
  if (digits[0] !== '7') digits = '7' + digits
  digits = digits.slice(0, 11)
  const d = digits.slice(1) // до 10 национальных цифр
  let out = '+7'
  if (d.length > 0) out += ' (' + d.slice(0, 3)
  if (d.length >= 3) out += ')'
  if (d.length > 3) out += ' ' + d.slice(3, 6)
  if (d.length > 6) out += '-' + d.slice(6, 8)
  if (d.length > 8) out += '-' + d.slice(8, 10)
  return out
}

export const RU_PHONE_RE = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: string
  onChange: (value: string) => void
}

export const PhoneInput = forwardRef<HTMLInputElement, Props>(function PhoneInput(
  { value, onChange, className = 'input', placeholder = '+7 (___) ___-__-__', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type="tel"
      inputMode="tel"
      className={className}
      placeholder={placeholder}
      value={value || ''}
      onChange={e => onChange(maskRuPhone(e.target.value))}
      {...rest}
    />
  )
})
