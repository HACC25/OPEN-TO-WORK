'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export const Hero = () => {
    return (
        <section className="relative min-h-[500px] flex items-center overflow-hidden py-4 md:py-6">
            <div className="mx-auto max-w-3xl text-center">
                <h1 className="mt-16 mb-4 text-6xl font-bold text-cyan-800 tracking-tight">
                    One place to review and publish reports <span className="italic font-normal"> &mdash; in real time.</span>
                </h1>
                <p className="mb-8 text-muted-foreground">
                    No more manual PDFs or inconsistent templates.
                </p>
                <div className="justify-center mb-8">
                    <Button
                        className="px-6 py-5 bg-teal-700 hover:bg-teal-800"
                        asChild
                    >
                        <Link href="/login">Get Started</Link>
                    </Button>
                </div>
                <Image
                    src="/landing/dashboard-overview.png"
                    alt="Dashboard Overview"
                    width={2500}
                    height={0}
                />
            </div>
        </section>
    );
};
