export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-r-transparent" />
        <p className="mt-4 text-lg text-gray-600 font-medium">กำลังโหลด...</p>
      </div>
    </div>
  )
}
