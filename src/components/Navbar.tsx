import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV_ITEMS = [
  { path: '/jogos', label: 'Jogos', icon: '⚽' },
  { path: '/ranking', label: 'Ranking', icon: '🏆' },
  { path: '/perfil', label: 'Perfil', icon: '👤' },
]

export function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="glass border-b border-dark-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/jogos" className="flex items-center gap-2 group">
          <span className="text-2xl">🏆</span>
          <div className="hidden sm:block">
            <p className="font-display font-black text-xl leading-none uppercase gradient-text">
              Bolão
            </p>
            <p className="text-[10px] text-gray-500 leading-none uppercase tracking-widest">
              Copa 2026
            </p>
          </div>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={pathname.startsWith(path) ? 'nav-link-active' : 'nav-link'}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
          {profile?.is_admin && (
            <Link
              to="/admin"
              className={pathname.startsWith('/admin') ? 'nav-link-active' : 'nav-link'}
            >
              <span>⚙️</span>
              Admin
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {profile && (
            <span className="hidden sm:block text-sm text-gray-400">
              {profile.nome}
            </span>
          )}
          <button
            id="btn-signout"
            onClick={handleSignOut}
            className="btn-secondary text-sm px-3 py-1.5"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden flex items-center border-t border-dark-border">
        {NAV_ITEMS.map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors duration-200 ${
              pathname.startsWith(path)
                ? 'text-verde'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-lg">{icon}</span>
            {label}
          </Link>
        ))}
        {profile?.is_admin && (
          <Link
            to="/admin"
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors duration-200 ${
              pathname.startsWith('/admin')
                ? 'text-verde'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-lg">⚙️</span>
            Admin
          </Link>
        )}
      </nav>
    </header>
  )
}
