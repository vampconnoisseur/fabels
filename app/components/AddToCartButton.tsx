"use client";

import { useState } from "react";
import { addToCart } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

interface AddToCartButtonProps {
  bookId: string;
  userEmail: string;
}

const AddToCartButton = ({ bookId, userEmail }: AddToCartButtonProps) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!session) {
    return (
      <Button
        onClick={() => {
          toast({
            title: "Not logged in.",
            description: "Log in to continue.",
          });
        }}
      >
        Add to Cart
      </Button>
    );
  }

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(userEmail, bookId);
      toast({
        title: "Added.",
        description: "Book added to cart.",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error.",
          description: error.message,
        });
      } else {
        toast({
          title: "Error.",
          description: "Failed to add book to cart.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="loader"></div>
      ) : (
        <Button onClick={handleAddToCart}>Add to Cart</Button>
      )}
    </>
  );
};

export default AddToCartButton;
