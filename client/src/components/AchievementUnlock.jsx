import { useEffect, useState } from 'react'

export default function AchievementUnlock({ achievement, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 400)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  const tierColors = {
    1: 'from-amber-500 to-yellow-400',
    2: 'from-blue-500 to-blue-700',
    3: 'from-purple-600 to-purple-900'
  }

  const tierLabel = { 1: 'Tier I', 2: 'Tier II', 3: 'Tier III' }

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className={`bg-gradient-to-r ${tierColors[achievement.tier]} rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 min-w-72 max-w-sm`}>
        <div className="text-4xl flex-shrink-0">{achievement.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold opacity-80 mb-0.5">🏆 Achievement Unlocked!</p>
          <p className="text-white font-bold text-base truncate">{achievement.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-white bg-opacity-20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {tierLabel[achievement.tier]}
            </span>
            <span className="text-white text-xs opacity-80">+{achievement.xpReward} XP</span>
          </div>
        </div>
        <button onClick={() => { setVisible(false); setTimeout(onClose, 400) }}
          className="text-white opacity-60 hover:opacity-100 text-xl flex-shrink-0">✕</button>
      </div>
    </div>
  )
}