import { useEffect, useState } from 'react';

type Transaction = {
    _id: string;
    userId: string;
    bookingId: string;
    eventId: string;
    type: string;
    amount: number;
    note: string;
    createdAt: string;
};

function TransactionsDashboardPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/transactions', {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unable to load transactions' }));
                throw new Error(errorData.message || 'Unable to load transactions');
            }

            const data = await response.json();
            setTransactions(data);
        } catch (fetchError) {
            setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Wallet monitoring</h2>
                        <p className="mt-1 text-sm text-slate-500">View transactions and refund activity for user wallets.</p>
                    </div>
                    <button className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700">
                        New refund
                    </button>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-900">Transactions dashboard</h3>
                        <p className="text-sm text-slate-500">Track payments, refunds, and wallet balance updates.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchTransactions}
                            type="button"
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                            Refresh
                        </button>
                        <button className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100" type="button">
                            Export CSV
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-3xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Transaction</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Type</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Amount</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Note</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-[0.16em]">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <tr key={transaction._id}>
                                        <td className="px-6 py-4 text-slate-900">{transaction._id}</td>
                                        <td className="px-6 py-4 text-slate-600">{transaction.type}</td>
                                        <td className="px-6 py-4 text-slate-600">₹{transaction.amount}</td>
                                        <td className="px-6 py-4 text-slate-600">{transaction.note}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(transaction.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default TransactionsDashboardPage;
