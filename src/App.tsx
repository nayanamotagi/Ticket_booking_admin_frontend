import { Route, Routes, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import EventManagementPage from './pages/EventManagementPage';
import SeatOverviewPage from './pages/SeatOverviewPage';
import BookingDashboardPage from './pages/BookingDashboardPage';
import TransactionsDashboardPage from './pages/TransactionsDashboardPage';

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<AdminLayout />}>
                <Route index element={<Navigate to="events" replace />} />
                <Route path="events" element={<EventManagementPage />} />
                <Route path="seats" element={<SeatOverviewPage />} />
                <Route path="bookings" element={<BookingDashboardPage />} />
                <Route path="transactions" element={<TransactionsDashboardPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
