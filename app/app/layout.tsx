import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/providers/convex-client-provider";
import { shadcn } from '@clerk/themes';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Lōkahi Dashboard",
    description: "One place to review and publish IV&V reports in real time.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ClerkProvider
                    appearance={{
                        baseTheme: shadcn,
                    }}
                >
                    <ConvexClientProvider>
                        {children}
                    </ConvexClientProvider>
                </ClerkProvider>
            </body>
        </html>
    );
};
