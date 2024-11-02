type Book = {
    id: string;
    thumbnail: string;
    title: string;
    description: string;
    genre: string;
    tags: string[];
    publisher: string;
    authors: string[];
    price: number;
    s3Url: string;
    sales: number;
    releaseDate: Date;
    averageRating: number;
};

interface SalesDataEntry {
    title: string;
    sales: number;
    price: number;
    averageRating: number | null;
}

interface SalesData {
    [bookId: string]: SalesDataEntry;
}

type User = {
    id: string;
    name?: string | null;
    email?: string | null;
    emailVerified?: Date | null;
    image?: string | null;
    isAdmin: boolean;
    accounts: Account[];
    sessions: Session[];
    cart?: Cart | null;
    transactions: Transaction[];
    purchasedBooks: Book[]; // Array of books purchased by the user
    ratings: Rating[];       // Ratings submitted by the user
};

type Rating = {
    id: string;
    userId: string;
    bookId: string;
    rating: number;
    timestamp: Date;         // Automatically set on creation
    user: User;              // Relation to the user who submitted the rating
    book: Book;              // Relation to the book being rated
};

type Account = {
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refreshToken?: string | null;
    accessToken?: string | null;
    expiresAt?: number | null;
    tokenType?: string | null;
    scope?: string | null;
    idToken?: string | null;
    sessionState?: string | null;
    user: User;              // Relation to the associated user
};

type Session = {
    id: string;
    sessionToken: string;
    userId: string;
    expires: Date;
    user: User;              // Relation to the associated user
};

type VerificationToken = {
    identifier: string;
    token: string;
    expires: Date;
};

type Cart = {
    id: string;
    userId: string;
    bookIds: string[];
    user: User;              // Relation to the associated user
};

type Transaction = {
    id: string;
    userId: string;
    bookIds: string[];
    timestamp: Date;         // Automatically set on creation
    price: number;
    averageRating: number | undefined;
    user: User;              // Relation to the associated user
};