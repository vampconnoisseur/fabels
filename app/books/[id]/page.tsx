import { fetchBook, fetchUserByEmail } from "@/app/lib/data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import AddToCartButton from "@/app/components/AddToCartButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RatingComponent from "@/app/components/RatingComponent";
import { redirect } from "next/navigation";

export default async function PAGE({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return redirect("/");
    }

    try {
        const book = await fetchBook(id);
        let isPurchased;
        let isAdmin: boolean | undefined = false;
        let userRating: number | null = null;


        if (session && session.user && session.user.email) {
            const user = await fetchUserByEmail(session.user.email);
            isAdmin = user?.isAdmin;
            isPurchased = user?.purchasedBooks.some(b => b.id === book.id);

            if (isPurchased) {
                const purchasedBook = user?.purchasedBooks.find(b => b.id === book.id);
                userRating = purchasedBook?.ratings[0]?.rating || null;
            }
        }

        return (
            <div className="min-h-screen">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mb-6">
                    <img src={book.thumbnail} alt={book.title} className="mb-4 w-full h-128 object-cover rounded-md" />
                    <h2 className="text-4xl font-bold mb-2 text-center text-gray-800">{book.title}</h2>
                    <p className="mb-4 text-gray-700 text-center">{book.description}</p>
                    <div className="flex flex-col space-y-2">
                        <span className="text-gray-800 font-semibold">Price: <span className="text-green-600">${book.price}</span></span>
                        <span className="text-gray-800">Genre: {book.genre}</span>
                        <span className="text-gray-800">Tags: {book.tags.join(', ')}</span>
                        <span className="text-gray-800">Publisher: {book.publisher}</span>
                        <span className="text-gray-800">Authors: {book.authors.join(', ')}</span>
                    </div>
                    <div className="mt-4">
                        {session &&
                            (isAdmin ? (
                                <Link href={`/update-book/${book.id}`}>
                                    <Button>Update</Button>
                                </Link>
                            ) : (
                                isPurchased ? (
                                    <div className="flex justify-between items-end">
                                        <Link href={`/read/${book.id}`} className="mt-8">
                                            <Button>Read</Button>
                                        </Link>
                                        <RatingComponent
                                            bookId={book.id}
                                            userEmail={session.user.email}
                                            userRating={userRating}
                                        />
                                    </div>
                                ) : (
                                    <AddToCartButton bookId={book.id} userEmail={session.user.email} />
                                )
                            ))}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        if (error instanceof Error) {
            return (
                <div>
                    <h1>Error fetching book.</h1>
                </div>
            );
        }
    }
}