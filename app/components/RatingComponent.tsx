"use client"

import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { createRating } from "../lib/data";
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function RatingComponent({ bookId, userEmail, userRating }: { bookId: string; userEmail: string; userRating: number | null }) {
    const [rating, setRating] = useState<number | null>(userRating);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setRating(userRating);
    }, [userRating]);

    const handleRatingSubmit = async () => {
        if (rating) {
            setLoading(true);
            try {
                await createRating(bookId, userEmail, rating);
                toast({
                    title: "Rating Submitted",
                    description: "Thank you for updating your rating!",
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to submit rating.",
                });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className='flex '>
            {/* <label className="block mb-2">Rate this book:</label> */}
            <Select value={rating ? rating.toString() : undefined} onValueChange={(value) => setRating(Number(value))}>
                <SelectTrigger className="w-[95px]">
                    <SelectValue placeholder="Rate" />
                </SelectTrigger>
                <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                            {num} Star{num > 1 ? 's' : ''}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {loading ? (
                <div className="loader ml-4"></div>
            ) : (
                <Button onClick={handleRatingSubmit} disabled={!rating} className="ml-2">
                    Submit
                </Button>
            )}
        </div>
    );
}

export default RatingComponent;