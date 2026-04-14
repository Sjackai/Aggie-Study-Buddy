import { useState } from 'react'
import majors from '../data/majors'

export default function MajorSelector({ value, onChange }) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filtered = majors.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.college.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce((acc, major) => {
    if (!acc[major.college]) acc[major.college] = []
    acc[major.college].push(major)
    return acc
  }, {})

  const handleSelect = (name) => {
    onChange(name)
    setSearch('')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-left focus:outline-none focus:ring-2 focus:ring-ncat-blue flex justify-between items-center"
      >
        <span className={value ? 'text-black' : 'text-gray-400'}>
          {value || 'Select your major...'}
        </span>
        <span className="text-gray-400">▾</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
            <input
              type="text"
              placeholder="Search majors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
              autoFocus
            />
          </div>

          {Object.entries(grouped).map(([college, collegeMajors]) => (
            <div key={college}>
              <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50">
                {college}
              </p>
              {collegeMajors.map(major => (
                <button
                  key={major.name}
                  type="button"
                  onClick={() => handleSelect(major.name)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition text-sm text-gray-700"
                >
                  {major.name}
                </button>
              ))}
            </div>
          ))}

          {Object.keys(grouped).length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">No majors found</p>
          )}
        </div>
      )}
    </div>
  )
}