import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Compass, Trophy, User, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Explore', icon: Compass, path: '/onboarding' },
  { label: 'Achievements', icon: Trophy, path: '/achievements' },
  { label: 'Profile', icon: User, path: '/profile' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const handleSignOut = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen md:h-screen bg-[#F7F6F2] font-sans md:overflow-hidden">

      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-52 min-w-[208px] bg-[#1A1A2E] flex-col py-6">
        <div className="px-5 mb-8">
          <span className="text-[18px] font-black text-white tracking-tight">
            goal<span className="text-[#A78BFA]">.</span>
          </span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium border-none cursor-pointer transition-all duration-150 text-left w-full bg-transparent"
                style={{
                  color: isActive ? '#fff' : '#7C7CA8',
                  background: isActive ? 'rgba(167,139,250,0.1)' : 'transparent',
                  borderRight: isActive ? '2px solid #A78BFA' : '2px solid transparent',
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-[#F87171] bg-transparent border-none cursor-pointer w-full"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </aside>

      {/* Page content */}
      <div className="flex-1 flex flex-col md:overflow-hidden">
        <Outlet />
      </div>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0EEE8] flex py-3 pb-5 z-20">
      {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex-1 flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer"
            >
              <Icon size={20} color={isActive ? '#A78BFA' : '#9CA3AF'} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: isActive ? '#A78BFA' : '#9CA3AF' }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

    </div>
  )
}