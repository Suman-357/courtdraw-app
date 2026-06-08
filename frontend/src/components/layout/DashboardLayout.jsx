import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSessionStore } from '../../store/sessionStore';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ allowedRoles }) {
  const { user, logout } = useAuthStore();
  const { sessions } = useSessionStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSession = sessions?.find(s => s.status === 'open');

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, allowedRoles, navigate]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased overflow-x-hidden min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 right-0 left-0 md:left-[280px] h-14 md:h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-4 md:px-margin-desktop z-40">
        <div className="flex items-center gap-3">
          {/* Hamburger - mobile only */}
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-on-surface-variant p-1">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="md:hidden font-bold text-primary-fixed text-lg">ShuttlePro</span>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={logout} className="bg-surface-container-highest text-on-surface hover:bg-surface-container-high transition-colors px-4 md:px-6 py-1.5 md:py-2 rounded-full font-label-md text-label-md font-semibold cursor-pointer border border-outline-variant text-sm">
            Logout
          </button>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden flex items-center justify-center text-primary-fixed font-bold text-sm">
            {user.name?.charAt(0) || 'U'}
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SideNavBar */}
      <aside className={`fixed left-0 top-0 h-screen w-[280px] bg-surface-container border-r border-outline-variant flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4 md:p-6 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
              <span className="material-symbols-outlined text-xl md:text-headline-lg font-bold">sports_tennis</span>
            </div>
            <div>
              <h1 className="font-display-md text-lg md:text-headline-md font-bold text-primary-fixed tracking-tight">ShuttlePro</h1>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-secondary hover:text-primary p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 md:py-6">
          <nav className="flex flex-col gap-1 md:gap-2">
            <NavLink to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'member' ? '/member/dashboard' : '/superadmin/dashboard'} className={() => `flex items-center gap-3 px-4 py-3 transition-all duration-150 border-l-4 ${location.pathname.includes('dashboard') ? 'border-primary-fixed bg-surface-container-highest text-primary font-bold' : 'text-secondary hover:bg-surface-container-high hover:text-primary border-transparent'}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              <span className="font-label-md text-label-md">Dashboard</span>
            </NavLink>
            {user.role === 'admin' && (
              <>
                <NavLink to="/admin/session/new" className={() => `flex items-center gap-3 px-4 py-3 transition-colors duration-200 border-l-4 ${location.pathname.includes('session/new') ? 'border-primary-fixed bg-surface-container-highest text-primary font-bold' : 'text-secondary hover:bg-surface-container-high hover:text-primary border-transparent'}`}>
                  <span className="material-symbols-outlined">calendar_add_on</span>
                  <span className="font-label-md text-label-md">Session Setup</span>
                </NavLink>
                {activeSession && (
                  <NavLink to={`/admin/session/${activeSession._id}`} className={() => `flex items-center gap-3 px-4 py-3 transition-colors duration-200 border-l-4 ${location.pathname === `/admin/session/${activeSession._id}` ? 'border-primary-fixed bg-surface-container-highest text-primary font-bold' : 'text-secondary hover:bg-surface-container-high hover:text-primary border-transparent'}`}>
                    <span className="material-symbols-outlined">sports_tennis</span>
                    <span className="font-label-md text-label-md">Active Session</span>
                  </NavLink>
                )}
                <NavLink to="/admin/sessions" className={() => `flex items-center gap-3 px-4 py-3 transition-colors duration-200 border-l-4 ${location.pathname.includes('/admin/sessions') ? 'border-primary-fixed bg-surface-container-highest text-primary font-bold' : 'text-secondary hover:bg-surface-container-high hover:text-primary border-transparent'}`}>
                  <span className="material-symbols-outlined">history</span>
                  <span className="font-label-md text-label-md">Session History</span>
                </NavLink>
                <NavLink to="/admin/fines" className={() => `flex items-center gap-3 px-4 py-3 transition-colors duration-200 border-l-4 ${location.pathname.includes('/admin/fines') ? 'border-primary-fixed bg-surface-container-highest text-primary font-bold' : 'text-secondary hover:bg-surface-container-high hover:text-primary border-transparent'}`}>
                  <span className="material-symbols-outlined">account_balance</span>
                  <span className="font-label-md text-label-md">Fine Ledger</span>
                </NavLink>
                {/* <NavLink to="/member/dashboard" className={() => `flex items-center gap-3 px-4 py-3 transition-colors duration-200 border-l-4 ${location.pathname.includes('member') ? 'border-primary-fixed bg-surface-container-highest text-primary font-bold' : 'text-secondary hover:bg-surface-container-high hover:text-primary border-transparent'}`}>
                  <span className="material-symbols-outlined">monitoring</span>
                  <span className="font-label-md text-label-md">Player Analytics</span>
                </NavLink> */}
                <NavLink to="/admin/settings" className={() => `flex items-center gap-3 px-4 py-3 transition-colors duration-200 border-l-4 ${location.pathname.includes('settings') ? 'border-primary-fixed bg-surface-container-highest text-primary font-bold' : 'text-secondary hover:bg-surface-container-high hover:text-primary border-transparent'}`}>
                  <span className="material-symbols-outlined">settings</span>
                  <span className="font-label-md text-label-md">Group Settings</span>
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </aside>

      <main className="md:ml-[280px] mt-14 md:mt-16 p-4 md:p-margin-desktop min-h-screen">
        <div className="max-w-container-max-width mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
