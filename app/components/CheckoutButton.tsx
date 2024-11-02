"use client"

import React from "react";
import { checkout } from "../lib/actions";
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
    userEmail: string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ userEmail }) => {
    const [loading, setLoading] = React.useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const { url } = await checkout(userEmail);

            if (url) {
                window.location.href = url;
            } else {
                alert("Failed to create checkout session.");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Failed to complete checkout.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading ? (
                <div className="loader mb-8"></div>
            ) : (
                <Button
                    onClick={handleCheckout}
                    className="mt-8 px-6 py-2"
                >
                    Checkout
                </Button>
            )}
        </>
    );
};

export default CheckoutButton;