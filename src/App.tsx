import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Onboarding from './pages/Onboarding'
import GoalSuggestions from './pages/GoalSuggestions'
import Home from './pages/Home'
import GoalDetails from './pages/GoalDetails'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
function App() {
  
  return (
    <>
      <Router>
        <Routes>
          {/* Auth pages no layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* App pages wrapped in a layout */}
          <Route element={<Layout/>}>
          <Route path="/" element={<Home/>} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding/goals" element={<GoalSuggestions />} />
          <Route path="/goal/:id" element={<GoalDetails />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
