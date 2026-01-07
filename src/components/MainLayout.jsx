import { Outlet, useNavigate, useLocation } from 'react-router-dom'

function MainLayout({ profile }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/shifts', label: 'Shifts', icon: '📋' },
    { path: '/requests', label: 'Requests', icon: '🔄' },
    { path: '/create', label: 'Create', icon: '+', isCenter: true },
    { path: '/my-shifts', label: 'My Shifts', icon: '📅' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Banner */}
      {profile?.is_admin && (
        <div className="bg-accent text-primary py-2 px-4 text-center font-bold">
          <button
            onClick={() => navigate('/admin')}
            className="hover:underline"
          >
            🛡️ ADMIN MODE - Click to access dashboard
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto pb-20">
        <Outlet />
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-secondary border-t-2 border-gray-200">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 py-3 flex flex-col items-center justify-center transition-colors ${
                item.isCenter
                  ? 'relative -top-4'
                  : ''
              }`}
            >
              {item.isCenter ? (
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg">
                  <span className="text-4xl text-primary font-bold">{item.icon}</span>
                </div>
              ) : (
                <>
                  <span
                    className={`text-2xl mb-1 ${
                      isActive(item.path) ? 'filter brightness-0' : 'filter brightness-0 opacity-40'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isActive(item.path) ? 'text-accent' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default MainLayout
