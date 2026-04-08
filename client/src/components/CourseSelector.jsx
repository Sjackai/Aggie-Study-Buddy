import { useState } from 'react'
import courses from '../data/courses'

export default function CourseSelector({ value, onChange }) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [customCode, setCustomCode] = useState('')
  const [customName, setCustomName] = useState('')

  const filtered = courses.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (course) => {
    onChange({ code: course.code, name: course.name })
    setSearch('')
    setIsOpen(false)
  }

  const handleCustomSubmit = () => {
    if (!customCode.trim()) return
    onChange({ code: customCode.toUpperCase().trim(), name: customName.trim() || customCode.toUpperCase().trim() })
    setCustomMode(false)
    setCustomCode('')
    setCustomName('')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-ncat-blue flex justify-between items-center"
      >
        <span className={value ? 'text-black' : 'text-gray-400'}>
          {value || 'Select or search a course...'}
        </span>
        <span className="text-gray-400">▾</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          
          {!customMode ? (
            <>
              {/* Search input */}
              <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                  autoFocus
                />
              </div>

              {/* Course list */}
              {filtered.map(course => (
                <button
                  key={course.code}
                  type="button"
                  onClick={() => handleSelect(course)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition"
                >
                  <span className="font-semibold text-ncat-blue text-sm">{course.code}</span>
                  <span className="text-gray-500 text-sm ml-2">{course.name}</span>
                </button>
              ))}

              {/* Custom course option */}
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-ncat-blue text-sm font-semibold border-t border-gray-100"
              >
                ➕ My course isn't listed — add custom
              </button>
            </>
          ) : (
            /* Custom course form */
            <div className="p-4">
              <p className="text-sm font-semibold text-ncat-blue mb-3">Add Custom Course</p>
              <input
                type="text"
                placeholder="Course code (e.g. ARCH 301)"
                value={customCode}
                onChange={e => setCustomCode(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue mb-2"
              />
              <input
                type="text"
                placeholder="Course name (optional)"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue mb-3"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  className="flex-1 bg-ncat-blue text-white text-sm font-semibold py-2 rounded-lg hover:opacity-90 transition"
                >
                  Add Course
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}