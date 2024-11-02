import React from "react";
import { Html, Head, Preview, Body, Container, Heading, Text, Link, Hr } from "@react-email/components";

interface OrderConfirmationEmailProps {
    userEmail: string;
    books: { title: string; price: number }[];
    totalPrice: number;
}

const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({ userEmail, books, totalPrice }) => (
    <Html>
        <Head />
        <Preview>Thank you for your purchase from Fabels!</Preview>
        <Body style={{ fontFamily: "Arial, sans-serif", color: "#333", backgroundColor: "#ffffff", padding: "40px" }}>
            <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "30px", backgroundColor: "#ffffff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
                <Heading as="h2" style={{ fontWeight: "bold", fontSize: "20px", color: "#333333", textAlign: "center", marginBottom: "20px" }}>
                    Thank You for Your Purchase!
                </Heading>
                <Text style={{ fontSize: "16px", color: "#555555", lineHeight: "1.6", textAlign: "start", padding: "0 10px" }}>
                    Hello {userEmail}, thank you for shopping with Fabels. Here are the details of your purchase.
                </Text>

                <Hr style={{ margin: "20px 0", borderColor: "#dddddd" }} />

                <Heading as="h3" style={{ fontWeight: "bolder", fontSize: "25px", color: "#333333", marginBottom: "10px", padding: "0 10px" }}>Order Summary</Heading>
                <ul style={{ paddingLeft: "0", listStyle: "none", padding: "0 10px" }}>
                    {books.map((book, index) => (
                        <li key={index} style={{ padding: "10px 0", borderBottom: "1px solid #eeeeee" }}>
                            <Text style={{ fontWeight: "bold" }}>{book.title}</Text>
                            <Text> - ${book.price.toFixed(2)}</Text>
                        </li>
                    ))}
                </ul>

                <div style={{ marginTop: "20px", textAlign: "right", padding: "0 10px" }}>
                    <Text style={{ fontSize: "16px", fontWeight: "bold" }}>Total Price: ${totalPrice.toFixed(2)}</Text>
                </div>

                <Hr style={{ margin: "30px 0", borderColor: "#dddddd" }} />
                <Text style={{ fontSize: "14px", color: "#777777", textAlign: "center", padding: "0 10px" }}>
                    If you have any questions about your order, feel free to <Link href="mailto:vampconnoisseur@gmail.com" style={{ color: "#4A90E2" }}>contact us</Link>.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default OrderConfirmationEmail;