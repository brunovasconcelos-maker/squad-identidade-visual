import { NavLink } from 'react-router-dom'
import AppRoutes, { navLinks } from './routes.jsx'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="app-brand">
          Squad — Identidade Visual
        </NavLink>
        <nav className="app-nav">
          {navLinks.map(({ path, label }) => (
            <NavLink key={path} to={path} end={path === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <AppRoutes />
      </main>
    </div>
  )
}
