"use client";

import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { SignInComponent } from "./components/SignInComponent";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (session) {
    return redirect("/books");
  }

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <SignInComponent />
    </div>
  );
}
