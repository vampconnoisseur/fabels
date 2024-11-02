"use client";

import React from "react";
import { removeFromCart } from "@/app/lib/actions";
import { toast } from "@/hooks/use-toast";


interface RemoveFromCartButtonProps {
    bookId: string;
    userEmail: string;
}

const RemoveFromCartButton = ({ bookId, userEmail }: RemoveFromCartButtonProps) => {
    const [loading, setLoading] = React.useState(false);

    const handleRemove = async () => {
        setLoading(true);
        try {
            await removeFromCart(userEmail, bookId);
            toast({
                title: "Removed",
                description: "Book removed from cart.",
            });
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message || "Failed to remove book from cart.");
            } else {
                alert("Failed to remove book from cart.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading ? (
                <div className="loader mb-8"></div>
            ) : (
                <button
                    onClick={handleRemove}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded text-base"
                >
                    Remove from Cart
                </button>
            )}
        </>
    );
};

export default RemoveFromCartButton;