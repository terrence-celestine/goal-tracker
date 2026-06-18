import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Onboarding from './pages/Onboarding'
import GoalSuggestions from './pages/GoalSuggestions'
import Home from './pages/Home'
import GoalDetails from './pages/GoalDetails'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import CustomGoal from './pages/CustomGoal'
import Achievements from './pages/Achievements'
import Profile from './pages/Pages'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth pages — no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public onboarding — no auth needed */}
        <Route element={<Layout />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding/goals" element={<GoalSuggestions />} />
        </Route>

        {/* Protected pages — redirect to /login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/goals/new" element={<CustomGoal />} />
            <Route path="/goals/:id" element={<GoalDetails />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App