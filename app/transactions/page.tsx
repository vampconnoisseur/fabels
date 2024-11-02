import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { fetchTransactions, fetchTransactionsByUserEmail, fetchUserByEmail } from '@/app/lib/data';
import { authOptions } from '../api/auth/[...nextauth]/route';

const TransactionsPage = async () => {
    const session = await getServerSession(authOptions);

    if (!session) {
        return redirect("/");
    }

    const user = await fetchUserByEmail(session?.user?.email!);
    const transactions = user?.isAdmin
        ? await fetchTransactions()
        : await fetchTransactionsByUserEmail(user?.email!);

    transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="flex flex-col items-center min-h-screen p-6 mt-4">
            <h1 className="text-5xl font-bold mb-8 text-black">{user?.isAdmin ? "Transactions" : "Your Transactions"}</h1>
            {transactions.length === 0 ? (
                <div className="text-center text-gray-600">
                    <p className="text-lg">No transactions found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 max-w-7xl mx-auto text-black items-start">
                    {transactions.map(transaction => (
                        <div
                            key={transaction.id}
                            className="bg-white p-8 rounded-lg shadow-md transition-transform transform hover:scale-105"
                            style={{ minWidth: '500px', minHeight: '250px' }}
                        >
                            <div className="mb-4">
                                {user?.isAdmin && (
                                    <>
                                        <p className="text-2xl font-semibold">Name: {transaction.user.name}</p>
                                        <p className="text-gray-600 text-xl">Email: {transaction.user.email}</p>
                                    </>
                                )}
                            </div>

                            <p className="text-2xl text-gray-800">Total Price: <span className="font-bold">${transaction.price.toFixed(2)}</span></p>
                            <p className="text-gray-600 text-2xl">Date: {new Date(transaction.timestamp).toLocaleString()}</p>

                            <h3 className="text-2xl font-semibold mt-4">Books:</h3>
                            <ul className="list-disc pl-5 mt-2">
                                {transaction.books.map(book => (
                                    <li key={book.id} className="text-gray-700 text-2xl">
                                        <p>Book Title: {book.title}</p>
                                        <p>Price: <span className="font-bold">${book.price.toFixed(2)}</span></p>
                                    </li>
                                ))}
                            </ul>

                            <p className="text-xs text-gray-500 mt-4">Transaction ID: {transaction.id}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;