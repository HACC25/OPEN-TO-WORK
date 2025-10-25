import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Calendar, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

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
    return (
        <section className="py-16 md:py-20 bg-background">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h2 className="mb-3 text-4xl font-bold text-primary">
                        Search Public Reports
                    </h2>
                    <p className="text-base text-muted-foreground">
                        Explore validated IV&V reports across all state agencies
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-12 flex flex-row items-center justify-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search health, education, or technology projects..."
                            className="pl-10 h-11 bg-background border-border"
                        />
                    </div>
                    <Button size="lg" className="cursor-pointer">
                        Search
                    </Button>
                </div>

                {/* Recent Reports */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Recent Reports</h3>
                    <div className="space-y-3">
                        {sampleReports.map((report) => (
                            <Link
                                key={report.id}
                                href={`/public/report/${report.id}`}
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
                                                <span>{report.date}</span>
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
                    <Link href="/public/catalog">
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
