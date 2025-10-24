'use client';

import { FileCheck, Link2, Search, Settings } from "lucide-react";
import { Image3D } from "@/components/landing/card3d";


const features = [
    {
        icon: FileCheck,
        label: "Consistency",
        title: "Standardized Reporting",
        description: "Unified templates across all agencies for comparable results.",
        image: "/landing/consistency.png"
    },
    {
        icon: Settings,
        label: "Collaboration",
        title: "Real-Time Review",
        description: "Reviewers and vendors can see updates instantly. — no waiting for files or email attachments.",
        image: "/landing/realtime-review.png"
    },
    {
        icon: Search,
        label: "Accountability",
        title: "Public Transparency",
        description: "Approved reports are searchable and accessible to the public.",
        image: "/landing/accountability.png"
    },
    {
        icon: Link2,
        label: "Integration",
        title: "Open Data API",
        description: "Share data securely with civic tools and oversight partners.",
        image: "/landing/integration.png"
    }
]

export const Features = () => {

    return (
        <section className="bg-cyan-800/20 py-20 flex flex-col items-center justify-center gap-36">
            <h1 className="text-4xl font-bold max-w-md text-cyan-800 text-center">
                Built for transparency, efficiency, and public trust.
            </h1>

            {features.map((feature) => (
                <div key={feature.title} className="grid grid-cols-2 justify-between items-center max-w-7xl px-20">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <feature.icon />
                            <span className="uppercase font-bold">{feature.title}</span>
                        </div>
                        <h2 className="text-4xl font-bold">
                            {feature.title}
                        </h2>
                        <p className="text-foreground max-w-xs">
                            {feature.description}
                        </p>
                    </div>
                    <Image3D
                        src={feature.image}
                        alt={feature.title}
                        width={700}
                        height={300}
                    />
                </div>
            ))}
        </section >
    );
};
