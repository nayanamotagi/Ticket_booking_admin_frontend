import { FormEvent, useEffect, useState } from 'react';
import { apiUrl } from '../api';

type EventItem = {
    id: string;
    name: string;
    date: string;
    venue: string;
    price: number;
    totalSeats?: number;
    status: 'Active' | 'Draft';
    seats?: { number: number; status: string }[];
};

type EventResponse = {
    _id: string;
    title: string;
    date: string;
    venue: string;
    price: number;
    totalSeats: number;
    seats: { number: number; status: string }[];
};

const initialEvents: EventItem[] = [];

function createSeats(totalSeats: number) {
    return Array.from({ length: totalSeats }, (_, index) => ({
        number: index + 1,
        status: 'AVAILABLE',
    }));
}

function EventManagementPage() {
    const [events, setEvents] = useState<EventItem[]>(initialEvents);
    const [loading, setLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editingEvent, setEditingEvent] = useState<{
        id: string;
        title: string;
        date: string;
        venue: string;
        price: number;
    } | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchEvents = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiUrl('/api/admin/events'), {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data: EventResponse[] = await response.json();

            if (!response.ok) {
                throw new Error((data as any)?.message || 'Failed to load events.');
            }

            setEvents(
                data.map((event) => ({
                    id: event._id,
                    name: event.title,
                    date: event.date,
                    venue: event.venue,
                    price: event.price,
                    status: 'Active',
                })),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load events. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    async function handleCreateEvent() {
        setError('');
        setSuccess('');
        setLoading(true);

        const payload = {
            title: 'Coldplay Music Concert',
            date: '2026-08-15',
            venue: 'Bangalore Palace',
            price: 2500,
            totalSeats: 500,
            seats: createSeats(500),
        };

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiUrl('/api/admin/events'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to create event.');
            }

            setEvents((current) => [
                ...current,
                {
                    id: data._id ?? `E-${Math.floor(Math.random() * 10000)}`,
                    name: data.title ?? payload.title,
                    date: data.date ?? payload.date,
                    venue: data.venue ?? payload.venue,
                    price: data.price ?? payload.price,
                    status: 'Active',
                },
            ]);
            setSuccess('Event created successfully.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to create event. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function openEditForm(eventId: string) {
        const event = events.find((item) => item.id === eventId);
        if (!event) return;

        setError('');
        setSuccess('');
        setEditingEvent({
            id: event.id,
            title: event.name,
            date: event.date,
            venue: event.venue,
            price: event.price ?? 0,
        });
    }

    function handleEditFieldChange(field: 'title' | 'date' | 'venue' | 'price', value: string) {
        if (!editingEvent) return;
        setEditingEvent({
            ...editingEvent,
            [field]: field === 'price' ? Number(value) : value,
        });
    }

    function handleCancelEdit() {
        setEditingEvent(null);
        setError('');
        setSuccess('');
    }

    async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!editingEvent) return;

        setError('');
        setSuccess('');
        setEditLoading(true);

        const payload = {
            title: editingEvent.title,
            date: editingEvent.date,
            venue: editingEvent.venue,
            price: editingEvent.price,
        };

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiUrl(`/api/admin/events/${editingEvent.id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to update event.');
            }

            setEvents((current) =>
                current.map((item) =>
                    item.id === editingEvent.id
                        ? {
                            ...item,
                            name: data.title ?? payload.title,
                            date: data.date ?? payload.date,
                            venue: data.venue ?? payload.venue,
                            price: data.price ?? payload.price,
                            status: 'Active',
                        }
                        : item,
                ),
            );
            setSuccess('Event updated successfully.');
            setEditingEvent(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to update event. Please try again.');
        } finally {
            setEditLoading(false);
        }
    }

    async function handleDeleteEvent(eventId: string) {
        const confirmed = window.confirm('Delete this event?');
        if (!confirmed) return;

        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(apiUrl(`/api/admin/events/${eventId}`), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to delete event.');
            }

            setEvents((current) => current.filter((item) => item.id !== eventId));
            setSuccess('Event deleted successfully.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to delete event. Please try again.');
        }
    }

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Event management</h2>
                        <p className="mt-1 text-sm text-slate-500">Create, update, and delete events for your ticketing platform.</p>
                    </div>
                    <button
                        onClick={handleCreateEvent}
                        disabled={loading}
                        className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        {loading ? 'Creating event…' : 'New event'}
                    </button>
                </div>
                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                {success && <p className="mt-4 text-sm text-emerald-600">{success}</p>}
                {editingEvent && (
                    <form onSubmit={handleEditSubmit} className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700">Title</label>
                                <input
                                    value={editingEvent.title}
                                    onChange={(event) => handleEditFieldChange('title', event.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700">Date</label>
                                <input
                                    type="date"
                                    value={editingEvent.date}
                                    onChange={(event) => handleEditFieldChange('date', event.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500"
                                />
                            </div>
                        </div>
                        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700">Venue</label>
                                <input
                                    value={editingEvent.venue}
                                    onChange={(event) => handleEditFieldChange('venue', event.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500"
                                />
                            </div>
                            <div className="w-full sm:w-56">
                                <label className="block text-sm font-medium text-slate-700">Price</label>
                                <input
                                    type="number"
                                    value={editingEvent.price}
                                    onChange={(event) => handleEditFieldChange('price', event.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={editLoading}
                                className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                                {editLoading ? 'Saving…' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                )}
                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                {success && <p className="mt-4 text-sm text-emerald-600">{success}</p>}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Events</p>
                        <h3 className="text-2xl font-semibold text-slate-900">Manage event details</h3>
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 bg-white text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Event</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Date</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Venue</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Status</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {events.map((event) => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 text-slate-900">{event.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{event.date}</td>
                                    <td className="px-6 py-4 text-slate-600">{event.venue}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${event.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}
                                        >
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 space-x-2">
                                        <button
                                            onClick={() => openEditForm(event.id)}
                                            className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="rounded-2xl bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200"
                                        >
                                            Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {loading && events.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Loading events...
                                    </td>
                                </tr>
                            )}
                            {!loading && events.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No events available.
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

export default EventManagementPage;
