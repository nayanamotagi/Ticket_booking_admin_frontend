import { useEffect, useState } from 'react';

type Seat = {
    id: string;
    row: string;
    number: number;
    status: 'Available' | 'Booked' | 'Blocked';
};

type SeatStat = {
    label: string;
    value: number;
    color: string;
};

type SeatOverviewResponse = {
    eventId: string;
    title: string;
    date: string;
    venue: string;
    totalSeats: number;
    seats: { number: number; status: string }[];
};

type EventOption = {
    id: string;
    title: string;
};

const initialSeatStats: SeatStat[] = [
    { label: 'Available', value: 0, color: 'bg-emerald-500' },
    { label: 'Booked', value: 0, color: 'bg-sky-500' },
    { label: 'Blocked', value: 0, color: 'bg-slate-500' },
];

const initialSeats: Seat[] = [];

function SeatOverviewPage() {
    const [seatStats, setSeatStats] = useState<SeatStat[]>(initialSeatStats);
    const [seats, setSeats] = useState<Seat[]>(initialSeats);
    const [events, setEvents] = useState<EventOption[]>([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [seatCount, setSeatCount] = useState(20);
    const [loading, setLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const updateSeats = (seatData: { number: number; status: string }[]) => {
        const updatedSeats: Seat[] = seatData.map((seat) => ({
            id: `A-${seat.number}`,
            row: 'A',
            number: seat.number,
            status: seat.status === 'AVAILABLE' ? 'Available' : seat.status === 'BOOKED' ? 'Booked' : 'Blocked',
        }));

        setSeats(updatedSeats);

        const availableCount = updatedSeats.filter((seat) => seat.status === 'Available').length;
        const bookedCount = updatedSeats.filter((seat) => seat.status === 'Booked').length;
        const blockedCount = updatedSeats.filter((seat) => seat.status === 'Blocked').length;

        setSeatStats([
            { label: 'Available', value: availableCount, color: 'bg-emerald-500' },
            { label: 'Booked', value: bookedCount, color: 'bg-sky-500' },
            { label: 'Blocked', value: blockedCount, color: 'bg-slate-500' },
        ]);
    };

    async function fetchSeatStatus() {
        setError('');
        setSuccess('');
        setSyncLoading(true);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/events/6a60849803139e8c04e3a385/seats', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error((data as any)?.message || 'Failed to fetch seat status.');
            }

            updateSeats((data as SeatOverviewResponse).seats);
            setSuccess('Seat status updated successfully.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to fetch seat status. Please try again.');
        } finally {
            setSyncLoading(false);
        }
    }

    useEffect(() => {
        fetchSeatStatus();
        fetchEvents();
    }, []);

    async function fetchEvents() {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/events', {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const eventsData = await response.json();
            if (!response.ok) {
                throw new Error(eventsData?.message || 'Failed to load events.');
            }
            setEvents(eventsData.map((event: any) => ({ id: event._id, title: event.title })));
            if (eventsData.length > 0) {
                setSelectedEventId(eventsData[0]._id);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function handleBulkCreateSeats() {
        setError('');
        setSuccess('');
        setLoading(true);

        if (!selectedEventId) {
            setError('Select an event before creating seats.');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/events/seats/bulk-create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    eventId: selectedEventId,
                    count: seatCount,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to create seats.');
            }

            const updatedSeats = data.seats.map((seat: any) => ({
                id: `A-${seat.number}`,
                row: 'A',
                number: seat.number,
                status: seat.status === 'AVAILABLE' ? 'Available' : seat.status === 'BOOKED' ? 'Booked' : 'Blocked',
            }));

            updateSeats(data.seats);
            setSuccess('Seats created successfully.');
            setOpenModal(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to create seats. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleSyncSeats() {
        setError('');
        setSuccess('');
        setSyncLoading(true);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/events/6a60849803139e8c04e3a385/seats', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error((data as any)?.message || 'Failed to fetch seat status.');
            }

            updateSeats((data as SeatOverviewResponse).seats);
            setSuccess('Seat status updated successfully.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to fetch seat status. Please try again.');
        } finally {
            setSyncLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Seat overview</h2>
                        <p className="mt-1 text-sm text-slate-500">Bulk create seats and monitor seat states across events.</p>
                    </div>
                    <button
                        onClick={() => setOpenModal(true)}
                        disabled={loading}
                        className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        Bulk create seats
                    </button>
                </div>
            </section>

            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Bulk Create Seats</h2>
                                <p className="mt-1 text-sm text-slate-500">Add seats for the selected event.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpenModal(false)}
                                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Select Event</label>
                                <select
                                    value={selectedEventId}
                                    onChange={(event) => setSelectedEventId(event.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-500"
                                >
                                    {events.map((event) => (
                                        <option key={event.id} value={event.id}>
                                            {event.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Seats to Create</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={seatCount}
                                    onChange={(event) => setSeatCount(Number(event.target.value))}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setOpenModal(false)}
                                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBulkCreateSeats}
                                    disabled={loading}
                                    className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                    {loading ? 'Creating…' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <section className="grid gap-4 md:grid-cols-3">
                {seatStats.map((stat) => (
                    <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                        <p className="mt-4 text-3xl font-semibold text-slate-900">{stat.value}</p>
                        <div className={`mt-4 h-2 rounded-full ${stat.color}`} />
                    </div>
                ))}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-900">Seat states</h3>
                        <p className="text-sm text-slate-500">Review seat assignments and current availability.</p>
                    </div>
                    <button
                        onClick={handleSyncSeats}
                        disabled={syncLoading}
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {syncLoading ? 'Syncing…' : 'Sync seat map'}
                    </button>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    {seats.map((seat) => (
                        <div
                            key={seat.id}
                            className="rounded-3xl border border-slate-200 p-4 text-sm shadow-sm"
                        >
                            <p className="font-semibold text-slate-900">{seat.id}</p>
                            <p className="mt-2 text-slate-500">Row {seat.row}</p>
                            <p className="mt-1 text-slate-500">Seat {seat.number}</p>
                            <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${seat.status === 'Available'
                                ? 'bg-emerald-100 text-emerald-700'
                                : seat.status === 'Booked'
                                    ? 'bg-sky-100 text-sky-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                {seat.status}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default SeatOverviewPage;
