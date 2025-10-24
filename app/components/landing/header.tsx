'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const Header = () => {

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <nav className="flex h-16 items-center justify-between mx-8">
                <div className="flex items-center">
                    <Image src={'/logo-text.svg'} alt="Lōkahi Dashboard" width={150} height={0} />
                </div>

                {/* Desktop Navigation */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link href="/public" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        Public Reports
                    </Link>
                    <Link href="/api" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        API
                    </Link>
                    <Link href="/help" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        Help
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search projects..."
                            className="h-10 w-64 pl-9"
                        />
                    </div>
                    <Button variant="default" className="cursor-pointer bg-teal-700 hover:bg-teal-800">
                        Sign In
                    </Button>
                </div>
            </nav>
        </header>
    );
};
