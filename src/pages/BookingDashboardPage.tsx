import { useEffect, useState } from 'react';
import { apiUrl } from '../api';

const filters = ['All', 'BOOKED', 'PENDING', 'CANCELLED'];

type Booking = {
    id: string;
    userId: string;
    eventId: string;
    seatNumbers: number[];
    amount: number;
    status: string;
    createdAt: string;
};

function BookingDashboardPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function fetchBookings() {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiUrl('/api/admin/bookings'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to fetch bookings.');
            }

            setBookings(
                data.map((item: any) => ({
                    id: item._id,
                    userId: item.userId,
                    eventId: item.eventId,
                    seatNumbers: item.seatNumbers,
                    amount: item.amount,
                    status: item.status,
                    createdAt: item.createdAt,
                })),
            );
            setSuccess('Bookings loaded successfully.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to fetch bookings.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBookings();
    }, []);

    const filteredBookings = activeFilter === 'All'
        ? bookings
        : bookings.filter((booking) => booking.status === activeFilter);

    async function handleCancelBooking(bookingId: string) {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiUrl(`/api/admin/bookings/${bookingId}/cancel`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to cancel booking.');
            }

            const cancelledBooking = data.booking;
            setBookings((current) =>
                current.map((booking) =>
                    booking.id === bookingId
                        ? {
                            ...booking,
                            status: cancelledBooking?.status ?? 'CANCELLED',
                        }
                        : booking,
                ),
            );
            setSuccess(data?.message || 'Booking cancelled successfully.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to cancel booking. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Booking monitoring</h2>
                        <p className="mt-1 text-sm text-slate-500">View all bookings and filter by user, event, or status.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${activeFilter === filter ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                            >
                                {filter === 'BOOKED' ? 'Booked' : filter === 'PENDING' ? 'Pending' : filter === 'CANCELLED' ? 'Cancelled' : 'All'}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-900">All bookings</h3>
                        <p className="text-sm text-slate-500">Search or filter bookings to monitor payments and status.</p>
                    </div>
                    <button
                        onClick={fetchBookings}
                        disabled={loading}
                        className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-600"
                    >
                        {loading ? 'Refreshing…' : 'Refresh data'}
                    </button>
                </div>
                {error && <p className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
                {success && <p className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

                <div className="overflow-hidden rounded-3xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Booking</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">User ID</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Event ID</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Seats</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Amount</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Status</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="px-6 py-4 text-slate-900">{booking.id}</td>
                                    <td className="px-6 py-4 text-slate-600">{booking.userId}</td>
                                    <td className="px-6 py-4 text-slate-600">{booking.eventId}</td>
                                    <td className="px-6 py-4 text-slate-600">{booking.seatNumbers.join(', ')}</td>
                                    <td className="px-6 py-4 text-slate-600">₹{booking.amount}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${booking.status === 'BOOKED'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : booking.status === 'PENDING'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-rose-100 text-rose-700'
                                                }`}
                                        >
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleCancelBooking(booking.id)}
                                            disabled={loading || booking.status === 'CANCELLED'}
                                            className="rounded-2xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                                        >
                                            {booking.status === 'CANCELLED' ? 'Cancelled' : 'Cancel'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                                        No bookings found for this filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default BookingDashboardPage;
