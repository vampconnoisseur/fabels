import Modal from "@/app/components/Modal";
import { fetchCartByEmail } from "@/app/lib/data";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CheckoutButton from "@/app/components/CheckoutButton";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const CheckoutPage = async () => {
    const session = await getServerSession(authOptions);

    if (!session) {
        return redirect("/");
    }

    const cart = await fetchCartByEmail(session?.user?.email!);

    if (!cart || !Array.isArray(cart.books) || cart.books.length === 0) {
        return (
            <Modal>
                <div className="flex flex-col items-center p-6 text-center">
                    <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
                    <p className="text-gray-600">Your cart is empty.</p>
                </div>
            </Modal>
        );
    }

    const { books } = cart;
    const totalPrice = books.reduce((acc, book) => acc + book.price, 0);

    return (
        <div className="flex flex-col min-h-screen justify-center items-center w-2/4">
            <h1 className="text-4xl font-bold mb-6 text-black my-12">Checkout</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {books.map((book) => (
                    <div key={book.id} className="p-4 border rounded-lg shadow-lg bg-white">
                        <img
                            src={book.thumbnail}
                            alt={book.title}
                            className="mb-4 w-full h-72 object-cover rounded"
                        />
                        <h2 className="text-xl font-semibold text-black">{book.title}</h2>
                        <p className="text-gray-700">Price: <span className="font-bold">${book.price.toFixed(2)}</span></p>
                    </div>
                ))}
            </div>
            <div className="mt-6 w-full max-w-4xl">
                <h2 className="text-2xl font-bold text-black">Total Price</h2>
                <p className="text-lg font-semibold text-green-600">${totalPrice.toFixed(2)}</p>
            </div>
            <div className="mb-24">
                <CheckoutButton userEmail={session?.user?.email!} />
            </div>
        </div>
    );
};

export default CheckoutPage;