import { Button } from "@/components/ui/button";
import { MailIcon } from "lucide-react";
import Link from "next/link";

const VerifyRequest = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-gray-700">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 text-center">
                <MailIcon className="w-16 h-16 mx-auto mb-4" />

                <h1 className="text-2xl font-semibold text-gray-800 mb-4">Check Your Email</h1>

                <p className="text-gray-600 mb-6">
                    We've sent a link to your email address. Click the link in the email to complete your sign-in.
                </p>

                <Link href="/">
                    <Button>
                        Back to Home
                    </Button>
                </Link>

                <div className="mt-4 text-gray-500 text-sm">
                    <p>Didn't receive an email? Please check your spam folder or <Link href="/" className="text-blue-500 hover:underline">resend the link</Link>.</p>
                </div>
            </div>
        </div>
    );
};

export default VerifyRequest;