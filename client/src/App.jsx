import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Partners from './pages/Partners'
import FindSessions from './pages/FindSessions'
import CourseSessions from './pages/CourseSessions'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import PublicProfile from './pages/PublicProfile'
import Onboarding from './pages/Onboarding'
import CampusMap from './pages/CampusMap'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import BrainGames from './pages/BrainGames'
import BrainGamesHub from './pages/BrainGamesHub'
import FlashChallenge from './pages/FlashChallenge'
import DailyTrivia from './pages/DailyTrivia'




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/profile/:userId" element={<PublicProfile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sessions/:courseCode" element={<CourseSessions />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/find-sessions" element={<FindSessions />} />
        <Route path="/map" element={<CampusMap />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
<Route path="/games" element={<BrainGamesHub />} />
<Route path="/games/live" element={<BrainGames />} />
<Route path="/games/flash" element={<FlashChallenge />} />
<Route path="/games/trivia" element={<DailyTrivia />} />
<Route path="/games/leaderboard" element={<Leaderboard />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App