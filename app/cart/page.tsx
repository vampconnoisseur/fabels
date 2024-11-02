import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { fetchCartByEmail } from '@/app/lib/data';
import { authOptions } from '../api/auth/[...nextauth]/route';
import RemoveFromCartButton from "@/app/components/RemoveFromCartButton";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CartPage = async () => {
    const session = await getServerSession(authOptions);

    if (!session) {
        return redirect("/");
    }

    const cart = await fetchCartByEmail(session?.user?.email!);

    if (!cart || !Array.isArray(cart.books) || cart.books.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
                <p className="mt-2 text-gray-600">Your cart is empty.</p>
            </div>
        );
    }

    const { books, totalPrice } = cart;

    return (
        <div className="flex flex-col min-h-screen justify-center items-center p-6 text-3xl">
            <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">Your Cart</h1>
            <div className="bg-white rounded-lg shadow-lg p-6">
                <ul className="divide-y divide-gray-200 mb-8">
                    {books.map(book => (
                        <li key={book.id} className="flex justify-between items-center py-4">
                            <div className='mr-24'>
                                <p className="text-3xl font-semibold text-gray-800">{book.title}</p>
                                <p className="text-2xl text-gray-600">Price: <span className="font-bold">${book.price.toFixed(2)}</span></p>
                            </div>
                            <RemoveFromCartButton bookId={book.id} userEmail={session?.user?.email!} />
                        </li>
                    ))}
                </ul>
                <div className="mt-4 flex justify-between items-center">
                    <p className="text-2xl font-semibold text-gray-800">Total Price:</p>
                    <p className="font-bold text-green-600">${totalPrice.toFixed(2)}</p>
                </div>
            </div>
            <div className="flex justify-center mt-6">
                <Link href={"/cart/checkout"}>
                    <Button className="px-6 py-2">
                        Checkout
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default CartPage;