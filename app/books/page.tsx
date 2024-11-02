"use client";

import { useState, useEffect } from "react";
import { fetchBooks, fetchUserByEmail } from "../lib/data";
import Link from 'next/link';
import AddToCartButton from "@/app/components/AddToCartButton";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Toggle } from "@/components/ui/toggle"
import StarRating from "../components/StarRating";

const PAGE = () => {
    const { data: sessionData, status } = useSession();
    const [books, setBooks] = useState<Book[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
    const [purchasedBookIds, setPurchasedBookIds] = useState<Set<string>>(new Set());
    const [userRatings, setUserRatings] = useState<Record<string, number>>({});
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeData = async () => {
            try {
                if (sessionData?.user?.email) {
                    const user = await fetchUserByEmail(sessionData.user.email);
                    setIsAdmin(user!.isAdmin);

                    const purchasedBookIds = new Set(user?.purchasedBooks?.map(book => book.id) || []);
                    setPurchasedBookIds(purchasedBookIds);

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
            } finally {
                setLoading(false);
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

        if (selectedTags.length > 0) {
            result = result.filter(book =>
                selectedTags.every(tag => book.tags.includes(tag))
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
                } else if (sortOption === "rating") {
                    return (userRatings[b.id] || 0) - (userRatings[a.id] || 0);
                }
                return 0;
            });
        }

        setFilteredBooks(result);
    }, [books, searchTerm, selectedTags, sortOption, userRatings]);

    const handleTagSelection = (tag: string) => {
        setSelectedTags(prevTags =>
            prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]
        );
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSortOption(e.target.value);
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

    return (
        <>
            {loading || status === "loading" ? (
                <div className="flex min-h-screen justify-center items-center">
                    <div className="loader"></div>
                </div>
            ) : (
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
                            <option value="rating">Rating</option>
                        </select>
                        {["classic", "romance", "social commentary"].map(tag => (
                            <Toggle
                                variant="outline"
                                size="lg"
                                key={tag}
                                onClick={() => handleTagSelection(tag)}
                            >
                                {tag}
                            </Toggle>
                        ))}
                    </div>
                </div>
            )}
            {!loading && status !== "loading" && (
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
                                    {(isAdmin || purchasedBookIds.size > 0) ?
                                        isAdmin ? (
                                            <Link href={`/update-book/${book.id}`}>
                                                <Button className="m-4">Update</Button>
                                            </Link>
                                        ) : purchasedBookIds.has(book.id) ? (
                                            <Link href={`/read/${book.id}`}>
                                                <Button className="m-4">Read</Button>
                                            </Link>
                                        ) : (
                                            <div className="m-4">
                                                <AddToCartButton bookId={book.id} userEmail={sessionData?.user?.email!} />
                                            </div>
                                        ) :
                                        sessionData ?
                                            <div className="ml-4 mb-4">
                                                <div className="loader"></div>
                                            </div>
                                            :
                                            null
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PAGE;