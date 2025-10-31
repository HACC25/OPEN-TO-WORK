'use client';

import { Upload, CheckCircle2, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
    {
        icon: Upload,
        title: "Vendors Submit Reports",
        description: "Upload standardized IV&V deliverables"
    },
    {
        icon: CheckCircle2,
        title: "ETS Reviews & Validates",
        description: "Oversee compliance and project health"
    },
    {
        icon: Eye,
        title: "Reports Published Publicly",
        description: "Transparency for all"
    },
];

export const Workflow = () => {

    return (
        <section className="bg-green-50/30 py-16 flex flex-col items-center justify-center gap-12">
            <h1 className="text-4xl font-bold max-w-md text-primary text-center">
                How Lōkahi Works
            </h1>

            <div className="flex flex-row gap-12 mx-8">
                {steps.map((step, index) => (
                    <div key={index} className="relative">
                        <Card className="bg-card p-8 shadow-sm transition-all hover:shadow-md animate-fade-in">
                            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary`}>
                                <step.icon className="h-7 w-7" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xl font-semibold">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                            </div>
                        </Card>

                        {/* Connector line for desktop */}
                        {index < steps.length - 1 && (
                            <div className="absolute right-0 top-1/2 hidden h-0.5 w-16 -translate-y-1/2 translate-x-full bg-border md:block"></div>
                        )}
                    </div>
                ))}
            </div>
        </section >
    );
};
