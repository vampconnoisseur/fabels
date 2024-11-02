import { getServerSession } from 'next-auth';
import { fetchSignedUrl } from '@/app/lib/data';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/lib/auth';

const ReadBook = async ({ params }: { params: Promise<{ id: string }> }) => {
    const session = await getServerSession(authOptions);

    if (!session) {
        return redirect("/");
    }

    const id = (await params).id;

    const userEmail = session.user?.email;

    if (!userEmail) {
        return <div>You do not have access to this book.</div>;
    }

    const url = await fetchSignedUrl(id, userEmail);

    if (!url) {
        return <div>You do not have access to this book.</div>;
    }

    return (
        <div className="flex justify-center items-center h-screen w-full">
            <iframe src={url} className="w-full h-full" title="Reading Book"></iframe>
        </div>
    );
};

export default ReadBook;