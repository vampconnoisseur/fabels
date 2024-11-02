import React from "react";
import OrderConfirmationEmail from "../components/OrderConfirmationEmail";

export default function TestOrderConfirmationEmail() {
    const dummyData = {
        userEmail: "testuser@fabels.com",
        books: [
            { title: "The Great Gatsby", price: 10.99 },
            { title: "1984", price: 8.49 },
            { title: "To Kill a Mockingbird", price: 12.00 },
        ],
        totalPrice: 31.48,
    };

    return <OrderConfirmationEmail {...dummyData} />;
};
