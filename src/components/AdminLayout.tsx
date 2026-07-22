import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { apiUrl } from '../api';

const navItems = [
    { label: 'Events', path: '/events' },
    { label: 'Seats', path: '/seats' },
    { label: 'Bookings', path: '/bookings' },
    { label: 'Transactions', path: '/transactions' },
];

function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    async function handleLogout() {
        const token = localStorage.getItem('adminToken');

        try {
            await fetch(apiUrl('/api/auth/logout'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({}),
            });
        } catch {
            // Ignore network errors and still log out locally
        } finally {
            localStorage.removeItem('adminToken');
            navigate('/login');
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white/90 shadow-sm sticky top-0 z-20">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Admin Portal</p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Ticket Booking Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span>Admin</span>
                        <button onClick={handleLogout} className="rounded-md bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200">Log out</button>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:grid-cols-[240px_1fr]">
                <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Navigation</p>
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const active = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? 'bg-sky-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <main className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
