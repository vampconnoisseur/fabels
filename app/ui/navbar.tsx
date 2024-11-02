"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between py-4 px-6 bg-black">
            <div className="flex items-center flex-shrink-0">
                <Link href="/books">
                    <h1 className="mr-4 text-white">BOOKS</h1>
                </Link>
                <Link href="/purchased-books">
                    <h1 className="mr-4 text-white">MY BOOKS</h1>
                </Link>
                <Link href="/cart">
                    <h1 className="mr-4 text-white">CART</h1>
                </Link>
                <Link href="/transactions">
                    <h1 className="mr-4 text-white">TRANSACTIONS</h1>
                </Link>
            </div>

            <div className="flex items-center">
                <Link href="/new-book" className="ml-2">
                    <button className="text-white">NEW BOOK</button>
                </Link>
                {session ? (
                    <button
                        className="ml-6 text-white"
                        onClick={() => {
                            signOut();
                        }}
                    >
                        LOGOUT
                    </button>
                ) : (
                    <Link href="/">
                        <button className="ml-6 text-white">LOGIN</button>
                    </Link>
                )}
            </div>
        </nav >
    );
}
