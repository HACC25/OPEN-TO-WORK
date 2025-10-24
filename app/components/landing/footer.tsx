import Link from "next/link";
import Image from "next/image";

export const Footer = () => {
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
                <Link href="/api" className="text-sm font-bold text-muted-foreground">API</Link>
                <Link href="/help" className="text-sm font-bold text-muted-foreground">Help</Link>
            </div>
            <div className="border-t border-border pt-4 text-center w-full">
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} State of Hawai&apos;i - Enterprise Technology Services. All rights reserved.
                </p>
            </div>
        </footer>
    );
};
