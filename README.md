# Fabels - E-Commerce Bookstore

Fabels is an e-commerce bookstore that allows users to view, sell, and rate books. Admins can track sales metrics, providing a comprehensive platform for both customers and administrators. This README guides you through the user interface, demonstrating sign-in options, book viewing, purchasing, and rating functionalities.

## Features

- **User Authentication**: Sign in using email or Google OAuth.
- **Book Viewing**: Browse a wide selection of books with detailed descriptions, ratings, and pricing.
- **Purchasing**: Add books to the cart and proceed to checkout using Stripe as the payment gateway.
- **Rating System**: Users can rate books they have purchased, helping others make informed decisions.
- **Admin Dashboard**: Admins can track sales metrics and manage book listings.
- **Email Notifications**: Users receive order confirmation emails via Nodemailer.
- **Secure File Storage**: Book PDFs are stored in AWS S3, with secure retrieval through signed URLs.

## Technologies Used

- **Next.js**: A React framework for building server-rendered applications.
- **TypeScript**: For static typing and improved code quality.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **Prisma**: An ORM for database management.
- **PostgreSQL 16**: The database used for storing application data.
- **Vercel**: Hosting platform for deploying the application.
- **Stripe**: Payment gateway for processing transactions.
- **NextAuth**: Authentication library for managing user sessions.
- **Radix UI**: Component library for building accessible UI components.
- **Nodemailer**: For sending emails.
- **AWS S3**: For storing and securely retrieving book PDFs.
- **Zod**: For data validation.

## Approach

The application utilizes a relational database schema, as defined in the Prisma schema file, to manage relationships between different entities such as users, books, and transactions. 
In addition to the core functionalities, the project includes:

- **Search and Filter Options**: Users can easily search for books and filter results based on genres, ratings, and price ranges.
- **User Ratings**: Users can leave Ratings for books, providing feedback for other readers.
- **Admin Management**: Admins have the ability to manage user accounts, including banning users or resetting passwords.
- **Analytics Dashboard**: Admins can view detailed analytics on sales, user engagement, and book performance.
- **Accessibility Features**: The application is designed with accessibility in mind, ensuring that all users can navigate and interact with the platform effectively, the sidebar is handy.

### Next.js SSR Features

Next.js leverages Server-Side Rendering (SSR) to enhance performance and SEO. By rendering pages on the server, it reduces the JavaScript bundle size sent to the client, leading to faster load times. This approach also improves SEO, as search engines can easily crawl the fully rendered HTML content.

Next.js reconciles client components with the server through React Server Components (RSC) payloads. This allows for a seamless integration of server-rendered content with client-side interactivity, ensuring that pages with state management are implemented as client components. This architecture provides a better user experience while maintaining the benefits of server-side rendering.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/vampconnoisseur/fabels.git
   cd fabels
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables in a `.env` file.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Live Demo

You can view the live application at [Fabels](https://fabels.vercel.app/).

## Conclusion

Fabels is a robust e-commerce platform that combines modern web technologies to provide a seamless experience for users and administrators alike. With features like secure authentication, payment processing, and a user-friendly interface, it stands out as a comprehensive solution for book lovers.
