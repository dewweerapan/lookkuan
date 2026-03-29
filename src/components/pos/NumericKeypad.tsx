'use client'

interface Props {
  value: string
  onChange: (value: string) => void
  total: number
}

export default function NumericKeypad({ value, onChange, total }: Props) {
  const handleDigit = (digit: string) => {
    if (value === '' && digit === '0') return // prevent leading zero
    if (value.length >= 7) return // max 7 digits
    // prevent leading zeros when current value is '0'
    if (value === '0') {
      onChange(digit)
      return
    }
    onChange(value + digit)
  }

  const handleBackspace = () => {
    if (value.length <= 1) {
      onChange('')
    } else {
      onChange(value.slice(0, -1))
    }
  }

  const handleExact = () => {
    onChange(String(Math.ceil(total)))
  }

  const numBtnClass =
    'h-14 rounded-xl text-2xl font-bold bg-white text-gray-800 border border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition-colors'
  const backspaceBtnClass =
    'h-14 rounded-xl text-2xl font-bold bg-red-50 text-red-400 border border-red-200 hover:bg-red-100 active:bg-red-200 transition-colors'
  const exactBtnClass =
    'h-14 rounded-xl text-xl font-bold bg-brand-100 text-brand-700 border border-brand-300 hover:bg-brand-200 active:bg-brand-300 transition-colors'

  return (
    <div className='grid grid-cols-3 gap-2 mt-2'>
      {/* Row 1 */}
      <button className={numBtnClass} onClick={() => handleDigit('1')}>1</button>
      <button className={numBtnClass} onClick={() => handleDigit('2')}>2</button>
      <button className={numBtnClass} onClick={() => handleDigit('3')}>3</button>
      {/* Row 2 */}
      <button className={numBtnClass} onClick={() => handleDigit('4')}>4</button>
      <button className={numBtnClass} onClick={() => handleDigit('5')}>5</button>
      <button className={numBtnClass} onClick={() => handleDigit('6')}>6</button>
      {/* Row 3 */}
      <button className={numBtnClass} onClick={() => handleDigit('7')}>7</button>
      <button className={numBtnClass} onClick={() => handleDigit('8')}>8</button>
      <button className={numBtnClass} onClick={() => handleDigit('9')}>9</button>
      {/* Row 4 */}
      <button className={backspaceBtnClass} onClick={handleBackspace}>←</button>
      <button className={numBtnClass} onClick={() => handleDigit('0')}>0</button>
      <button className={exactBtnClass} onClick={handleExact}>พอดี</button>
    </div>
  )
}
