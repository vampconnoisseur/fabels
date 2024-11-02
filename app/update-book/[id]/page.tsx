"use client";

import { use, useActionState, useEffect, useState } from "react";
import { updateBook } from "@/app/lib/actions";
import { useFormStatus } from "react-dom";
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchUserByEmail, fetchBook } from "@/app/lib/data";
import { useToast } from "@/hooks/use-toast";

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

const PAGE = ({ params }: { params: Promise<{ id: string }> }) => {
    const { data: session, status } = useSession();
    const { toast } = useToast();
    const router = useRouter();
    const id = use(params).id;

    const [formState, formAction] = useActionState(updateBook, initialState);
    const [book, setBook] = useState<Book | null>(null);
    const [tags, setTags] = useState<string[]>([""]);
    const [authors, setAuthors] = useState<string[]>([""]);
    const [authorizationStatus, setAuthorizationStatus] = useState<"loading" | "unauthorized" | "authorized">("loading");

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
    }, [session, router, status]);

    useEffect(() => {
        const loadBook = async () => {
            const id = (await params).id;
            const fetchedBook = await fetchBook(id);
            setBook(fetchedBook);
            setTags(fetchedBook.tags || [""]);
            setAuthors(fetchedBook.authors || [""]);
        };

        loadBook();
    }, [id, params, router, status]);

    useEffect(() => {
        if (formState && formState.message) {
            toast({
                title: "Added.",
                description: formState.message,
            });
        }
    }, [formState, toast]);

    if (authorizationStatus === "loading" || !book) {
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
            <h1 className="text-4xl font-bold mb-12">Edit Book</h1>
            <form action={formAction} className="space-y-4">
                <Input type="hidden" name="bookId" value={id} />

                <div>
                    <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                    <Input
                        name="thumbnail"
                        defaultValue={book.thumbnail}
                        placeholder="Thumbnail URL"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <Input
                        name="title"
                        defaultValue={book.title}
                        placeholder="Title"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <Textarea
                        name="description"
                        defaultValue={book.description}
                        placeholder="Description"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <Input
                        name="price"
                        defaultValue={book.price}
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Genre</label>
                    <Input
                        name="genre"
                        defaultValue={book.genre}
                        placeholder="Genre"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">S3 URL</label>
                    <Input
                        name="s3Url"
                        defaultValue={book.s3Url}
                        placeholder="S3 URL"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                {/* Tags Input */}
                <label className="block text-sm font-medium text-gray-700">Tags</label>
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

                {/* Authors Input */}
                <label className="block text-sm font-medium text-gray-700">Authors</label>
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
                    <label className="block text-sm font-medium text-gray-700">Publisher</label>
                    <Input
                        name="publisher"
                        defaultValue={book.publisher}
                        placeholder="Publisher"
                        required
                        className="mt-1 mb-6 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-500"
                    />
                </div>

                <SubmitButton />
            </form>
        </div>
    );
};

export default PAGE;