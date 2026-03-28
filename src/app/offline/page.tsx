'use client';

export default function OfflinePage() {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center'>
      <div className='text-6xl mb-4'>📡</div>
      <h1 className='text-2xl font-bold text-gray-800 mb-2'>
        ไม่มีการเชื่อมต่ออินเทอร์เน็ต
      </h1>
      <p className='text-gray-500 mb-6 max-w-sm'>
        กรุณาตรวจสอบการเชื่อมต่อเครือข่ายและลองใหม่อีกครั้ง
      </p>
      <button
        onClick={() => window.location.reload()}
        className='px-6 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors'
      >
        ลองใหม่อีกครั้ง
      </button>
      <p className='mt-6 text-sm text-gray-400'>
        หน้าที่เคยเยี่ยมชมแล้วอาจยังใช้งานได้ในโหมดออฟไลน์
      </p>
    </div>
  );
}
