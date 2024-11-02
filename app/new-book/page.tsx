"use client";

import { useRouter } from "next/navigation";
import { addBook } from "@/app/lib/actions";
import { useFormStatus } from "react-dom";
import { useActionState, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fetchUserByEmail } from "@/app/lib/data";

interface FormState {
    message: string | null;
}

const initialState: FormState = { message: null };

const SubmitButton = () => {
    const { pending } = useFormStatus();

    return (
        <div>
            {!pending ? (
                <Button type="submit" disabled={pending} className="">
                    Submit
                </Button>
            ) : (
                <div className="loader mb-8"></div>
            )}
        </div>
    );
};

const PAGE = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [tags, setTags] = useState<string[]>([""]);
    const [authors, setAuthors] = useState<string[]>([""]);
    const [authorizationStatus, setAuthorizationStatus] = useState<"loading" | "unauthorized" | "authorized">("loading");
    const [state, formAction] = useActionState(addBook, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/");
            return;
        }

        const checkAdminStatus = async () => {
            if (session?.user?.email) {
                try {
                    const user = await fetchUserByEmail(session.user.email);
                    if (user?.isAdmin) {
                        setAuthorizationStatus("authorized");
                    } else {
                        setAuthorizationStatus("unauthorized");
                        toast({
                            title: "Unauthorized",
                            description: "You do not have permission to access this page.",
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user:", error);
                    setAuthorizationStatus("unauthorized");
                }
            } else {
                setAuthorizationStatus("loading");
            }
        };

        checkAdminStatus();
    }, [session, status, toast, router]);

    useEffect(() => {
        if (state && state.message) {
            setTags([""]);
            setAuthors([""]);
            toast({
                title: "Added.",
                description: state.message,
            });
        }
    }, [state]);

    if (authorizationStatus === "loading") {
        return (
            <div className="flex flex-col min-h-screen justify-center items-center">
                <div className="loader"></div>
            </div>
        );
    }

    if (authorizationStatus === "unauthorized") {
        return <div>Unauthorized Access.</div>;
    }

    const handleAddField = (setFields: React.Dispatch<React.SetStateAction<string[]>>, fields: string[]) => {
        setFields([...fields, ""]);
    };

    const handleRemoveField = (
        setFields: React.Dispatch<React.SetStateAction<string[]>>,
        fields: string[],
        index: number
    ) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
    };

    const handleChange = (
        setFields: React.Dispatch<React.SetStateAction<string[]>>,
        index: number,
        value: string
    ) => {
        setFields(prevFields => prevFields.map((field, i) => (i === index ? value : field)));
    };

    return (
        <div className="w-2/4 p-4 my-8">
            <h1 className="text-4xl font-bold mb-12">Add New Book</h1>
            <form action={formAction} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium ">Thumbnail URL</label>
                    <Input
                        name="thumbnail"
                        placeholder="Thumbnail URL"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium ">Title</label>
                    <Input
                        name="title"
                        placeholder="Title"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium 0">Description</label>
                    <Textarea
                        name="description"
                        placeholder="Description"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium ">Price</label>
                    <Input
                        name="price"
                        placeholder="Price"
                        type="number"
                        step="0.01"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium ">Genre</label>
                    <Input
                        name="genre"
                        placeholder="Genre"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium ">S3 URL</label>
                    <Input
                        name="s3Url"
                        placeholder="S3 URL"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <label className="block text-sm font-medium ">Tags</label>
                {tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <Input
                            type="text"
                            name={`tags`}
                            value={tag}
                            placeholder="Tag"
                            onChange={(e) => handleChange(setTags, index, e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                        />
                        {index > 0 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveField(setTags, tags, index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => handleAddField(setTags, tags)}
                    className="text-blue-500 hover:text-blue-700"
                >
                    + Add Tag
                </button>

                <label className="block text-sm font-medium ">Authors</label>
                {authors.map((author, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <Input
                            type="text"
                            name={`authors`}
                            value={author}
                            placeholder="Author"
                            onChange={(e) => handleChange(setAuthors, index, e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                        />
                        {index > 0 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveField(setAuthors, authors, index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => handleAddField(setAuthors, authors)}
                    className="text-blue-500 hover:text-blue-700"
                >
                    + Add Author
                </button>

                <div>
                    <label className="block text-sm font-medium ">Publisher</label>
                    <Input
                        name="publisher"
                        placeholder="Publisher"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <div>
                    <SubmitButton />
                </div>
            </form >
        </div >
    );
};

export default PAGE;