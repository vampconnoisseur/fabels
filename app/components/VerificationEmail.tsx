import React from "react";
import { Html, Head, Preview, Body, Container, Heading, Text, Link, Hr } from "@react-email/components";

interface VerificationEmailProps {
    url: string;
    identifier: string;
}

const VerificationEmail: React.FC<VerificationEmailProps> = ({ url, identifier }) => (
    <Html>
        <Head />
        <Preview>Your Fabels Login Link</Preview>
        <Body style={{ fontFamily: "Arial, sans-serif", color: "#333", backgroundColor: "#f9f9f9" }}>
            <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "30px", backgroundColor: "#ffffff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
                <Heading as="h2" style={{ color: "#333333", textAlign: "center", marginBottom: "20px", fontWeight: "bold", fontSize: "24px" }}>
                    Welcome to Fabels!
                </Heading>
                <Text style={{ fontSize: "16px", color: "#555555", lineHeight: "1.6", textAlign: "center" }}>
                    Hi there! Please click the button below to sign in to your account and continue exploring Fabels.
                </Text>
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <Link
                        href={url}
                        style={{
                            display: "inline-block",
                            padding: "12px 24px",
                            backgroundColor: "#000000",
                            color: "#ffffff",
                            textDecoration: "none",
                            fontWeight: "bold",
                            borderRadius: "5px",
                            fontSize: "16px",
                        }}
                    >
                        Sign in to Fabels
                    </Link>
                </div>
                <Text style={{ fontSize: "14px", color: "#555555", lineHeight: "1.6", textAlign: "center" }}>
                    If the button doesn’t work, you can copy and paste the following URL into your browser:
                </Text>
                <Text style={{ textAlign: "center", margin: "10px 0" }}>
                    <Link href={url} style={{ color: "#4A90E2", wordBreak: "break-all" }}>{url}</Link>
                </Text>
                <Hr style={{ margin: "30px 0", borderColor: "#dddddd" }} />
                <Text style={{ fontSize: "12px", color: "#999999", textAlign: "center" }}>
                    This email was intended for {identifier}. If you did not request this, please ignore this email.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default VerificationEmail;