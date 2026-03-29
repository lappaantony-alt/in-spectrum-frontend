import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/useAuth';

const navLinks = [
  { to: '/dashboard', label: 'Головна' },
  { to: '/assessment', label: 'Оцінювання' },
  { to: '/plan', label: 'Мій план' },
];

export function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-surface-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <span className="text-lg font-bold text-text-primary">
                In<span className="text-primary">Spectrum</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-light text-primary-dark'
                        : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="hidden items-center gap-3 md:flex">
              <div className="relative">
                <button
                  id="user-menu-button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-50 hover:text-text-primary"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-light">
                    <span className="text-sm font-semibold text-secondary-dark">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span>{user?.name || 'User'}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-surface-card py-1 shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-2">
                      <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                      <p className="text-xs text-text-secondary">{user?.email}</p>
                    </div>
                    <button
                      id="logout-button"
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      Вийти
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-gray-50 md:hidden"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-100 md:hidden">
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-light text-primary-dark'
                        : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-gray-100 px-4 py-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-light">
                  <span className="text-sm font-semibold text-secondary-dark">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-secondary">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Вийти
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Click-away backdrop for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}

      {/* Page Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
