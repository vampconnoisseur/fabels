"use client";

import { useState, useEffect } from "react";
import { fetchBooks, fetchUserByEmail } from "../lib/data";
import Link from 'next/link';
import AddToCartButton from "@/app/components/AddToCartButton";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import StarRating from "../components/StarRating";

const PAGE = () => {
    const { data: sessionData, status } = useSession();
    const [books, setBooks] = useState<Book[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
    const [purchasedBookIds, setPurchasedBookIds] = useState<Set<string>>(new Set());
    const [userRatings, setUserRatings] = useState<Record<string, number>>({});
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState<string>("");
    const [purchasedBooksLoaded, setpurchasedBooksLoaded] = useState(false);

    useEffect(() => {
        const initializeData = async () => {
            try {
                if (sessionData && sessionData.user && sessionData.user.email) {
                    const user = await fetchUserByEmail(sessionData.user.email);

                    const purchasedBookIds = new Set(user?.purchasedBooks?.map(book => book.id) || []);
                    setPurchasedBookIds(purchasedBookIds);
                    setpurchasedBooksLoaded(true);

                    setIsAdmin(user!.isAdmin);

                    const ratings = user?.purchasedBooks?.reduce((acc: Record<string, number>, book) => {
                        const bookRating = book.ratings.find(r => r.userId === user.id);
                        if (bookRating) {
                            acc[book.id] = bookRating.rating;
                        }
                        return acc;
                    }, {}) || {};
                    setUserRatings(ratings);
                }

                const allBooks = await fetchBooks();
                setBooks(allBooks);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        initializeData();
    }, [sessionData]);

    useEffect(() => {
        let result = books;

        if (searchTerm) {
            result = result.filter(book =>
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                book.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                book.publisher.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (sortOption) {
            result = [...result].sort((a, b) => {
                if (sortOption === "priceAsc") {
                    return a.price - b.price;
                } else if (sortOption === "priceDesc") {
                    return b.price - a.price;
                } else if (sortOption === "releaseDateAsc") {
                    return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
                } else if (sortOption === "releaseDateDesc") {
                    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
                } else if (sortOption === "ratingAsc") {
                    return a.averageRating - b.averageRating;
                } else if (sortOption === "ratingDesc") {
                    return b.averageRating - a.averageRating;
                }
                return 0;
            });
        }

        setFilteredBooks(result);
    }, [books, searchTerm, sortOption, userRatings]);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSortOption(e.target.value);
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

    return (
        <>
            <div className="mt-8 ml-8">
                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search books..."
                        className="p-2 border border-gray-300 rounded"
                    />
                    <select onChange={handleSortChange} className="p-2 border border-gray-300 rounded">
                        <option value="">Sort By</option>
                        <option value="priceAsc">Price: Low to High</option>
                        <option value="priceDesc">Price: High to Low</option>
                        <option value="releaseDateAsc">Release Date: Oldest to Newest</option>
                        <option value="releaseDateDesc">Release Date: Newest to Oldest</option>
                        <option value="ratingAsc">Rating: Low to High</option>
                        <option value="ratingDesc">Rating: High to Low</option>
                    </select>
                </div>
            </div>
            {status !== "loading" ? (
                <div className="flex justify-center">
                    <div className="max-w-7xl p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBooks.map((book) => (
                                <div key={book.id} className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 relative flex flex-col justify-between">
                                    <Link href={`/books/${book.id}`}>
                                        <div className="relative">
                                            <img src={book.thumbnail} alt={book.title} className="w-full h-80 object-cover" />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                                                <h2 className="text-xl font-bold text-white">{book.title}</h2>
                                                <p className="text-gray-300">{book.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="p-4">
                                        <p className="text-gray-700">Price: <span className="font-semibold">${book.price.toFixed(2)}</span></p>
                                        <p className="text-gray-700">Release Date: <span className="font-semibold">{new Date(book.releaseDate).toLocaleDateString()}</span></p>
                                        <p className="text-gray-700">Genre: {book.genre}</p>
                                        <p className="text-gray-700">Tags: {book.tags.join(', ')}</p>
                                        <p className="text-gray-700">Publisher: {book.publisher}</p>
                                        <p className="text-gray-700">Authors: {book.authors.join(', ')}</p>
                                        <div className="absolute top-4 right-4">
                                            <StarRating rating={book.averageRating} />
                                        </div>
                                    </div>
                                    {sessionData ? (purchasedBooksLoaded) ? (isAdmin)
                                        ? (
                                            <Link href={`/update-book/${book.id}`}>
                                                <Button className="m-4">Update</Button>
                                            </Link>
                                        ) : (purchasedBookIds.has(book.id)) ? (
                                            <Link href={`/read/${book.id}`}>
                                                <Button className="m-4">Read</Button>
                                            </Link>
                                        ) : (
                                            <div className="m-4">
                                                {sessionData?.user?.email && (
                                                    <AddToCartButton bookId={book.id} userEmail={sessionData.user.email} />
                                                )}
                                            </div>
                                        )
                                        : <div className="ml-4 mb-4">
                                            <div className="loader"></div>
                                        </div>
                                        : null
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) :
                <div className="flex flex-col min-h-screen justify-center items-center">
                    <div className="loader"></div>
                </div>
            }
        </>
    );
};

export default PAGE;