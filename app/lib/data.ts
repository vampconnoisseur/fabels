"use server"

import AWS from 'aws-sdk';
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "./prisma"

export const fetchSignedUrl = async (bookId: string, userEmail: string): Promise<string | null> => {
  const s3 = new AWS.S3();

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { purchasedBooks: true },
    });

    if (!user || !user.purchasedBooks) {
      return null;
    }

    const book = user.purchasedBooks.find(b => b.id === bookId);
    if (!book) {
      return null;
    }

    const presignedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: 'fabels-books',
      Key: book.s3Url,
      Expires: 60,
    });

    return presignedUrl;
  } catch (error) {
    console.error('Error fetching book or generating presigned URL:', error);
    return null;
  }
};

export async function createRating(bookId: string, userEmail: string, rating: number): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { purchasedBooks: true },
    });

    if (!user || !user.purchasedBooks.some(book => book.id === bookId)) {
      throw new Error("User has not purchased this book.");
    }

    await prisma.rating.upsert({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: bookId,
        },
      },
      update: { rating },
      create: {
        userId: user.id,
        bookId: bookId,
        rating,
      },
    });

    const ratings = await prisma.rating.findMany({
      where: { bookId: bookId },
      select: { rating: true },
    });

    const totalRatings = ratings.reduce((sum, { rating }) => sum + rating, 0);
    const averageRating = totalRatings / ratings.length;

    await prisma.book.update({
      where: { id: bookId },
      data: { averageRating },
    });
  } catch (error) {
    console.error("Error creating or updating rating:", error);
    throw new Error("Failed to submit rating.");
  }
}

export async function fetchUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        purchasedBooks: {
          include: {
            ratings: true,
          },
        },
        ratings: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}

export async function fetchBooks(): Promise<Book[]> {
  noStore();
  try {
    return await prisma.book.findMany();
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch books.");
  }
}

export async function fetchBook(bookId: string): Promise<Book> {
  noStore();
  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });
    if (!book) {
      throw new Error("Book not found.");
    }
    return book;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch book.");
  }
}

interface SalesData {
  [bookId: string]: SalesDataEntry;
}

interface SalesDataEntry {
  title: string;
  sales: number;
  price: number;
  averageRating: number | null;
}

export const fetchBookSales = async (): Promise<SalesData> => {
  const transactions = await prisma.transaction.findMany({
    include: {
      user: true,
    },
  });

  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      price: true,
      averageRating: true,
    },
  });

  const bookDetailsMap = books.reduce((acc, book) => {
    acc[book.id] = { price: book.price, title: book.title, averageRating: book.averageRating };
    return acc;
  }, {} as Record<string, { price: number; title: string; averageRating: number | null }>);

  const salesData = transactions.reduce<SalesData>((acc, transaction) => {
    transaction.bookIds.forEach((bookId) => {
      if (!acc[bookId]) {
        acc[bookId] = {
          title: bookDetailsMap[bookId].title,
          sales: 0,
          price: 0,
          averageRating: bookDetailsMap[bookId].averageRating,
        };
      }
      acc[bookId].sales += 1;
      acc[bookId].price += bookDetailsMap[bookId].price;
    });

    return acc;
  }, {});

  return salesData;
};

export async function fetchTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: { name: true, email: true, isAdmin: true }
        },
      }
    });

    const transactionsWithBooks = await Promise.all(
      transactions.map(async (transaction) => {
        const books = await prisma.book.findMany({
          where: { id: { in: transaction.bookIds } }
        });
        return { ...transaction, books };
      })
    );

    return transactionsWithBooks;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch transactions.");
  }
}

export async function fetchTransactionsByUserEmail(userEmail: string) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { user: { email: userEmail } },
      include: {
        user: {
          select: { name: true, email: true, isAdmin: true }
        },
      }
    });

    const transactionsWithBooks = await Promise.all(
      transactions.map(async (transaction) => {
        const books = await prisma.book.findMany({
          where: { id: { in: transaction.bookIds } }
        });
        return { ...transaction, books };
      })
    );

    return transactionsWithBooks;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch transactions.");
  }
}

export async function fetchCartByEmail(userEmail: string) {
  try {
    const cart = await prisma.cart.findFirst({
      where: { user: { email: userEmail } },
      include: { user: true }
    });

    if (!cart) {
      return null;
    }

    const books = await prisma.book.findMany({
      where: {
        id: { in: cart.bookIds }
      }
    });

    const totalPrice = books.reduce((sum, book) => sum + book.price, 0);

    return { books, totalPrice };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch cart.");
  }
}
