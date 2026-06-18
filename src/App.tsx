import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
function App() {
  
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/register" element={<div>Register</div>} />
          <Route path="/onboarding" element={<div>Onboarding</div>} />
          <Route path="/onboarding/goals" element={<div>Goal Suggestions</div>} />
        </Routes>
      </Router>
    </>
  )
}

export default App
