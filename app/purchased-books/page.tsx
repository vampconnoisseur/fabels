import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/lib/auth";
import { redirect } from 'next/navigation';
import { fetchUserByEmail } from '@/app/lib/data';
import RatingComponent from '../components/RatingComponent';

const PurchasedBooks = async () => {
    const session = await getServerSession(authOptions);

    try {
        if (!session || !session.user || !session.user.email) {
            return redirect("/");
        }

        const userEmail = session.user.email;
        const user = await fetchUserByEmail(userEmail);

        const purchasedBooks = user?.purchasedBooks || [];

        if (purchasedBooks.length === 0) {
            return (
                <div className="p-4 text-center">
                    <h1 className="text-xl font-bold">Your Purchased Books</h1>
                    <p>You have not purchased any books yet.</p>
                </div>
            );
        }

        return (
            <div className='min-h-screen p-6'>
                <h1 className="text-4xl font-bold my-4 ml-6">Your Purchased Books</h1>
                <div className="p-8 flex justify-center">
                    <div className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            {purchasedBooks.map((book) => {
                                const userRating = book.ratings.find((rating) => rating.userId === user?.id)?.rating || null;

                                return (
                                    <div key={book.id} className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105">
                                        <Link href={`/read/${book.id}`}>
                                            <div className="relative">
                                                <img src={book.thumbnail} alt={book.title} className="w-80 h-80 object-cover" />
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                                                    <h2 className="text-xl font-bold text-white">{book.title}</h2>
                                                </div>
                                            </div>
                                        </Link>
                                        <div className="p-4">
                                            <p className="text-gray-700">Authors: {book.authors.join(', ')}</p>
                                            <p className="text-gray-700">Price: <span className="font-semibold">${book.price.toFixed(2)}</span></p>
                                        </div>
                                        <div className="m-4">
                                            <RatingComponent
                                                bookId={book.id}
                                                userEmail={userEmail}
                                                userRating={userRating}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    catch (error) {
        if (error instanceof Error) {
            return (
                <div className="p-4">
                    <h1 className="text-xl font-bold">Error</h1>
                    <p>Failed to load your purchased books. Please try again later.</p>
                </div>
            );
        }
    }
};


export default PurchasedBooks;