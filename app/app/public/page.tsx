"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { SearchIcon, DownloadIcon, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CLEAR_SELECT_VALUE = "__clear";

export default function Page() {
    const filterSelections = useQuery(api.reports.getApprovedFilterSelections);
    const filterOptions = filterSelections ?? {
        agencies: [],
        vendors: [],
        periods: [],
        ratings: [],
    };

    const [selectedAgency, setSelectedAgency] = useState<string>();
    const [selectedVendor, setSelectedVendor] = useState<string>();
    const [selectedPeriod, setSelectedPeriod] = useState<string>();
    const [selectedRating, setSelectedRating] = useState<string>();

    const reportFilters = useMemo(
        () => ({
            agency: selectedAgency,
            vendor: selectedVendor,
            period: selectedPeriod,
            rating: selectedRating,
        }),
        [selectedAgency, selectedVendor, selectedPeriod, selectedRating]
    );

    const approvedReports = useQuery(api.reports.getApprovedReports, reportFilters);
    const reports = approvedReports ?? [];
    const isLoadingReports = approvedReports === undefined;

    const handleSelectChange = (setter: (value: string | undefined) => void) => (value: string) => {
        setter(value === CLEAR_SELECT_VALUE ? undefined : value);
    };

    return (
        <div>
            <div className="flex flex-col items-center justify-center bg-cyan-800 py-20 gap-5">
                <h1 className="text-4xl font-bold text-background">Public IV&V Reports Catalog</h1>
                <div className="relative w-11/12 max-w-2xl md:w-4/5">
                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                        <SearchIcon className="size-4" />
                        <span className="sr-only">Search</span>
                    </div>
                    <Input
                        placeholder="Search by project name or keywords..."
                        className="peer w-full h-12 bg-background pl-11 text-lg"
                    />
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    <Select
                        value={selectedAgency ?? CLEAR_SELECT_VALUE}
                        onValueChange={handleSelectChange(setSelectedAgency)}
                    >
                        <SelectTrigger
                            id="agency-select"
                            className="bg-background cursor-pointer truncate w-36"
                        >
                            <SelectValue placeholder="All agencies" className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={CLEAR_SELECT_VALUE} className="cursor-pointer">
                                    All agencies
                                </SelectItem>
                                {filterOptions.agencies.map((agency) => (
                                    <SelectItem key={agency} value={agency} className="cursor-pointer">
                                        {agency}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select
                        value={selectedVendor ?? CLEAR_SELECT_VALUE}
                        onValueChange={handleSelectChange(setSelectedVendor)}
                    >
                        <SelectTrigger
                            id="vendor-select"
                            className="bg-background cursor-pointer truncate w-36"
                        >
                            <SelectValue placeholder="All vendors" className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={CLEAR_SELECT_VALUE} className="cursor-pointer">
                                    All vendors
                                </SelectItem>
                                {filterOptions.vendors.map((vendor) => (
                                    <SelectItem key={vendor} value={vendor} className="cursor-pointer">
                                        {vendor}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select
                        value={selectedPeriod ?? CLEAR_SELECT_VALUE}
                        onValueChange={handleSelectChange(setSelectedPeriod)}
                    >
                        <SelectTrigger
                            id="period-select"
                            className="bg-background cursor-pointer truncate w-36"
                        >
                            <SelectValue placeholder="All periods" className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={CLEAR_SELECT_VALUE} className="cursor-pointer">
                                    All periods
                                </SelectItem>
                                {filterOptions.periods.map((period) => (
                                    <SelectItem key={period} value={period} className="cursor-pointer">
                                        {period}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select
                        value={selectedRating ?? CLEAR_SELECT_VALUE}
                        onValueChange={handleSelectChange(setSelectedRating)}
                    >
                        <SelectTrigger
                            id="rating-select"
                            className="bg-background cursor-pointer truncate w-36"
                        >
                            <SelectValue placeholder="All ratings" className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={CLEAR_SELECT_VALUE} className="cursor-pointer">
                                    All ratings
                                </SelectItem>
                                {filterOptions.ratings.map((rating) => (
                                    <SelectItem key={rating} value={rating} className="cursor-pointer">
                                        {rating}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center p-16">
                <div className="w-full max-w-6xl space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Approved IV&V reports</p>
                            <h2 className="text-2xl font-semibold">Latest publications</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {isLoadingReports ? "Loading reports..." : `${reports.length} result${reports.length === 1 ? "" : "s"}`}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 w-16" />
                                    <TableHead>Project Name</TableHead>
                                    <TableHead>Reporting Period</TableHead>
                                    <TableHead>Agency</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="pr-6 text-right">Download</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingReports ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            Fetching approved reports...
                                        </TableCell>
                                    </TableRow>
                                ) : reports.length > 0 ? (
                                    reports.map((report) => {
                                        const period = `${report.month}/${report.year}`;
                                        const status = report.currentStatus ?? "Unknown";
                                        const displayStatus = status === "Minor Issues" ? "At Risk" : status;
                                        const statusClass =
                                            displayStatus === "On Track"
                                                ? "rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40"
                                                : displayStatus === "At Risk"
                                                    ? "rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40"
                                                    : "rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40";

                                        return (
                                            <TableRow key={report._id} className="hover:bg-muted/50">
                                                <TableCell className="pl-6">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 shrink-0"
                                                    >
                                                        <Link href={`/public/${report._id}`} aria-label="View report details">
                                                            <ExternalLink className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {report.projectName ?? "Untitled Project"}
                                                </TableCell>
                                                <TableCell>{period}</TableCell>
                                                <TableCell>{report.sponsoringAgency ?? "-"}</TableCell>
                                                <TableCell>{report.vendorName ?? "-"}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={statusClass}>
                                                        {displayStatus}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    {report.finalAttachmentId ? (
                                                        <Button asChild variant="ghost" size="icon" className="cursor-pointer">
                                                            <Link
                                                                href={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file?id=${report.finalAttachmentId}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <DownloadIcon className="size-4" />
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">Not available</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            No approved reports match your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    )
}