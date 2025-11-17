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
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export const Footer = () => {
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
        <footer className="flex flex-col gap-8 pt-12 pb-4 items-center justify-center border-t border-border bg-cyan-100/20 w-full px-8">
            <div className="flex flex-col items-center justify-center">
                <Image src="/logo-text.svg" alt="Lōkahi Dashboard" width={150} height={0} />
                <p className="text-sm text-muted-foreground">
                    Built by the Hawai&apos;i Office of Enterprise Technology Services.
                </p>
            </div>

            <div className="flex flex-row gap-8">
                <Link href="/" className="text-sm font-bold text-muted-foreground">Home</Link>
                <Link href="/public" className="text-sm font-bold text-muted-foreground">Public Reports</Link>
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="text-sm font-bold text-muted-foreground cursor-pointer">
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
                <Link target="_blank" href="https://github.com/HACC25/OPEN-TO-WORK" className="text-sm font-bold text-muted-foreground">Report an Issue</Link>
            </div>
            <div className="border-t border-border pt-4 text-center w-full">
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} State of Hawai&apos;i - Enterprise Technology Services. All rights reserved.
                </p>
            </div>
        </footer>
    );
};
