/**
 * PromptPay QR Code payload generator (EMVCo format)
 */

function crc16(str: string): string {
  let crc = 0xFFFF
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021
      else crc <<= 1
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
}

function tlv(tag: string, value: string): string {
  return `${tag}${String(value.length).padStart(2, '0')}${value}`
}

export function generatePromptPayPayload(phone: string, amount?: number): string {
  // Normalize phone: remove dashes, spaces; convert 0XX to 66XX
  const clean = phone.replace(/[-\s]/g, '')
  const normalized = clean.startsWith('0') ? '66' + clean.slice(1) : clean

  // We need exactly the last 9 digits of Thai phone after country code
  // E.g. 0812345678 → 66812345678
  const proxyValue = '0066' + normalized.slice(2) // "006681234567" - but use only 9 digits

  // Build merchant account info (Tag 29)
  const accountInfo = tlv('00', 'A000000677010111') + tlv('01', proxyValue)

  let payload = ''
  payload += tlv('00', '01')           // Payload Format Indicator
  payload += tlv('01', '12')           // Dynamic QR
  payload += tlv('29', accountInfo)    // Merchant Account Info
  payload += tlv('53', '764')          // Currency: THB
  if (amount && amount > 0) {
    payload += tlv('54', amount.toFixed(2)) // Amount
  }
  payload += tlv('58', 'TH')           // Country Code
  payload += tlv('59', 'LOOKKUAN')     // Merchant Name (max 25 chars)
  payload += '6304'                    // CRC placeholder

  return payload + crc16(payload)
}
