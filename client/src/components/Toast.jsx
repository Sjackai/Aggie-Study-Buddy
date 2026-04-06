export default function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg text-white font-semibold transition-all
      ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white opacity-70 hover:opacity-100">✕</button>
    </div>
  )
}
