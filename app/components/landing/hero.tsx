'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Image3D } from "@/components/landing/card3d";

export const Hero = () => {
    return (
        <section className="relative min-h-[500px] flex items-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 w-full h-0 border-l-[50vw] border-l-transparent border-r-[50vw] border-r-transparent border-b-300 border-b-cyan-800 opacity-20"></div>
            </div>
            <div className="mx-auto max-w-4xl text-center relative z-10">
                <h1 className="mt-16 mb-4 text-6xl font-bold text-cyan-800 tracking-tight">
                    One place to review and publish reports <span className="italic font-normal"> &mdash; in real time.</span>
                </h1>
                <p className="mb-8 text-muted-foreground">
                    No more manual PDFs or inconsistent templates.
                </p>
                <div className="justify-center">
                    <Button
                        className="px-6 py-5 cursor-pointer"
                        asChild
                    >
                        <Link href="/dashboard">Get Started</Link>
                    </Button>
                </div>
                <div className="flex justify-center mt-8 mb-12">
                    <Image3D
                        src="/landing/dashboard-overview.png"
                        alt="Dashboard Overview"
                        width={750}
                        height={0}
                    />
                </div>
            </div>
        </section>
    );
};
