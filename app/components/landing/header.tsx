'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const Header = () => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/get-info`);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (error) {
            console.error("Failed to copy API URL", error);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <nav className="flex h-16 items-center justify-between mx-8">
                <div className="flex items-center">
                    <Image src={'/logo-text.svg'} alt="Lōkahi Dashboard" width={150} height={0} />
                </div>

                {/* Desktop Navigation */}
                <div className="flex items-center gap-6 pr-30">
                    <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link href="/public" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        Public Reports
                    </Link>
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                                API
                            </button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>REST API endpoint</DialogTitle>
                                <DialogDescription>
                                    Share this endpoint with contributors whenever they need the freshest project and report data.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex items-center gap-2">
                                <Input readOnly value={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/get-info`} />
                                <Button onClick={handleCopy} variant="secondary" className="cursor-pointer">
                                    {copied ? "Copied!" : "Copy"}
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Send a GET request to this URL to receive a JSON payload that includes the current reports and findings.
                            </p>
                        </DialogContent>
                    </Dialog>
                    <Link target="_blank" href="https://github.com/HACC25/OPEN-TO-WORK" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        Report an Issue
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <SignedOut>
                        <SignInButton>
                            <Button variant="default" className="cursor-pointer">
                                Sign In
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton appearance={{
                            elements: {
                                avatarBox: "h-9 w-9 rounded-lg",
                            },
                        }} />
                    </SignedIn>
                </div>
            </nav>
        </header>
    );
};
