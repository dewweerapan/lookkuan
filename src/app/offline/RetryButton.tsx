'use client';

export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className='px-6 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors'
    >
      ลองใหม่อีกครั้ง
    </button>
  );
}
