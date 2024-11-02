"use server"

import { prisma } from "./prisma"
import { z } from 'zod';
import Stripe from 'stripe';
import { Resend } from "resend";
import OrderConfirmationEmail from "../components/OrderConfirmationEmail";

export async function checkout(userEmail: string): Promise<{ url: string | null }> {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-09-30.acacia' });

    try {
        const cart = await prisma.cart.findFirst({
            where: { user: { email: userEmail } },
        });

        if (!cart || cart.bookIds.length === 0) {
            throw new Error("Cart is empty.");
        }

        const books = await prisma.book.findMany({
            where: { id: { in: cart.bookIds } },
        });

        const totalPrice = books.reduce((sum, book) => sum + book.price, 0);

        const product = await stripe.products.create({
            name: "Book Purchase",
            description: `Purchase of books for ${userEmail}`,
            metadata: { userEmail },
        });

        const price = await stripe.prices.create({
            unit_amount: Math.round(totalPrice * 100),
            currency: 'usd',
            product: product.id,
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: price.id, quantity: 1 }],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
            metadata: { userEmail, cartId: cart.id },
        });

        await prisma.transaction.create({
            data: {
                user: { connect: { email: userEmail } },
                bookIds: cart.bookIds,
                price: totalPrice,
            },
        });

        await Promise.all(
            books.map((book) =>
                prisma.book.update({
                    where: { id: book.id },
                    data: { sales: { increment: 1 } },
                })
            )
        );

        await prisma.user.update({
            where: { email: userEmail },
            data: {
                purchasedBooks: {
                    connect: books.map((book) => ({ id: book.id })),
                },
            },
        });

        await prisma.cart.update({
            where: { id: cart.id },
            data: { bookIds: [] },
        });

        let resend = new Resend(process.env.EMAIL_SERVER_PASSWORD)
        await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: userEmail,
            subject: "Your Fabels Order Confirmation",
            react: OrderConfirmationEmail({ userEmail, books, totalPrice })
        });

        return { url: session.url };
    } catch (error) {
        console.error("Checkout failed:", error);
        throw new Error("Could not complete checkout.");
    }
}

export async function removeFromCart(userEmail: string, bookId: string) {
    try {
        const cart = await prisma.cart.findFirst({
            where: { user: { email: userEmail } }
        });

        if (cart && cart.bookIds.includes(bookId)) {
            const updatedBookIds = cart.bookIds.filter(id => id !== bookId);

            await prisma.cart.update({
                where: { id: cart.id },
                data: { bookIds: updatedBookIds }
            });
        }
    } catch (error) {
        console.error("Failed to remove item from cart:", error);
        throw new Error("Could not remove book from cart.");
    }
}

export async function addToCart(userEmail: string, bookId: string) {
    try {
        const cart = await prisma.cart.findFirst({
            where: { user: { email: userEmail } }
        });

        if (cart) {
            if (cart.bookIds.includes(bookId)) {
                throw new Error("Book is already in the cart.");
            }
            await prisma.cart.update({
                where: { id: cart.id },
                data: { bookIds: [...cart.bookIds, bookId] }
            });
        } else {
            await prisma.cart.create({
                data: {
                    user: { connect: { email: userEmail } },
                    bookIds: [bookId]
                }
            });
        }
    } catch (error) {
        console.error("Failed to add item to cart:", error);
        throw error;
    }
}

export const addBook = async (prevState: any, formData: FormData): Promise<{ message: string }> => {
    const BookDataSchema = z.object({
        thumbnail: z.string().min(1, "Thumbnail is required."),
        title: z.string().min(1, "Title is required."),
        description: z.string().min(1, "Description is required."),
        price: z.number().positive("Price must be a positive number."),
        genre: z.string().min(1, "Genre is required."),
        tags: z.array(z.string()).min(1, "At least one tag is required."),
        publisher: z.string().min(1, "Publisher is required."),
        authors: z.array(z.string()).min(1, "At least one author is required."),
        s3Url: z.string().min(1, "S3 URL is required."),
    });

    // Collecting tags and authors
    const tags = formData.getAll("tags").filter(Boolean) as string[];
    const authors = formData.getAll("authors").filter(Boolean) as string[];

    const bookData = {
        thumbnail: (formData.get("thumbnail") as string) || "",
        title: (formData.get("title") as string) || "",
        description: (formData.get("description") as string) || "",
        price: parseFloat((formData.get("price") as string) || "0"),
        genre: (formData.get("genre") as string) || "",
        tags,
        publisher: (formData.get("publisher") as string) || "",
        authors,
        s3Url: (formData.get("s3Url") as string) || "",
    };

    try {
        const validatedData = BookDataSchema.parse(bookData);

        await prisma.book.create({
            data: validatedData,
        });

        return { message: "Book added successfully." };
    } catch (error) {
        console.error(error);
        return { message: "Failed to add book." };
    }
};

export const updateBook = async (prevState: any, formData: FormData): Promise<{ message: string }> => {
    const BookDataSchema = z.object({
        thumbnail: z.string().min(1, "Thumbnail is required."),
        title: z.string().min(1, "Title is required."),
        description: z.string().min(1, "Description is required."),
        price: z.number().positive("Price must be a positive number."),
        genre: z.string().min(1, "Genre is required."),
        tags: z.array(z.string()).min(1, "At least one tag is required."),
        publisher: z.string().min(1, "Publisher is required."),
        authors: z.array(z.string()).min(1, "At least one author is required."),
        s3Url: z.string().min(1, "S3 URL is required."),
    });

    const bookId = formData.get("bookId") as string;
    const tags = formData.getAll("tags").filter(Boolean) as string[];
    const authors = formData.getAll("authors").filter(Boolean) as string[];

    const bookData = {
        thumbnail: (formData.get("thumbnail") as string) || "",
        title: (formData.get("title") as string) || "",
        description: (formData.get("description") as string) || "",
        price: parseFloat((formData.get("price") as string) || "0"),
        genre: (formData.get("genre") as string) || "",
        tags,
        publisher: (formData.get("publisher") as string) || "",
        authors,
        s3Url: (formData.get("s3Url") as string) || "",
    };

    try {
        const validatedData = BookDataSchema.parse(bookData);

        await prisma.book.update({
            where: { id: bookId },
            data: validatedData,
        });

        return { message: "Book updated successfully." };
    } catch (error) {
        console.error(error);
        return { message: "Failed to update book." };
    }
};