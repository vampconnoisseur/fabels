"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { redirect } from "next/navigation"


export function SignInError() {
    const redirectToHome = () => {
        redirect("/");
    }

    return (
        <div className="flex flex-col min-h-screen justify-center items-center">
            <Card className="w-[420px] text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Unable to Sign In</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        The sign-in link is no longer valid. It may have been used already or it may have expired.
                    </CardDescription>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button onClick={redirectToHome}>Sign in</Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default SignInError