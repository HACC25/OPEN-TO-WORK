"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const sampleReports = [
    {
        id: "1",
        projectName: "Student Information System",
        sponsoringAgency: "Department of Education",
        date: "2025-10-15",
    },
    {
        id: "2",
        projectName: "Healthcare Data Platform",
        sponsoringAgency: "Department of Health",
        date: "2025-10-12",
    },
    {
        id: "3",
        projectName: "Fleet Management System",
        sponsoringAgency: "Department of Transportation",
        date: "2025-10-08",
    },
];


export const PublicReports = () => {
    const reports = useQuery(api.reports.getHomePageReports) ?? [];

    return (
        <section className="py-12 bg-background">
            <div className="max-w-4xl mx-auto">
                {/* Recent Reports */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Recent Reports</h3>
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <Link
                                key={report._id}
                                href={`/public/${report._id}`}
                                className="block"
                            >
                                <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors group">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                            {report.sponsoringAgency} - {report.projectName}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{new Date(report.updatedAt).toLocaleDateString(undefined, {
                                                    month: "long",
                                                    day: "numeric",
                                                    year: "numeric",
                                                }).replace(/^\w/, c => c.toUpperCase())}</span>
                                            </div>
                                            <Badge>
                                                Approved
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* View All Button */}
                <div className="text-center">
                    <Link href="/public">
                        <Button size="lg" className="cursor-pointer">
                            View All Reports
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
