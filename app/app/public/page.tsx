"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useQuery, useAction } from "convex/react";
import { SearchIcon, DownloadIcon, ExternalLink, SparklesIcon, LibraryBig, Brain, Send } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CLEAR_SELECT_VALUE = "__clear";

type AIMode = "search" | "answer";

type SemanticSearchResult = {
    report: {
        _id: string;
        month: number;
        year: number;
        currentStatus?: "On Track" | "Minor Issues" | "Critical" | null;
        finalAttachmentId?: string | null;
    };
    project: {
        projectName?: string | null;
        sponsoringAgency?: string | null;
        vendorName?: string | null;
    } | null;
};

type ReportDisplay = {
    _id: string;
    projectName: string;
    month: number;
    year: number;
    sponsoringAgency: string;
    vendorName: string;
    currentStatus: string;
    finalAttachmentId?: string | null;
};

export default function Page() {
    const filterSelections = useQuery(api.reports.getApprovedFilterSelections);
    const filterOptions = filterSelections ?? {
        agencies: [],
        vendors: [],
        periods: [],
        ratings: [],
    };

    const [aiSearch, setAiSearch] = useState(false);
    const [aiMode, setAiMode] = useState<AIMode>("search");
    const [selectedAgency, setSelectedAgency] = useState<string>();
    const [selectedVendor, setSelectedVendor] = useState<string>();
    const [selectedPeriod, setSelectedPeriod] = useState<string>();
    const [selectedRating, setSelectedRating] = useState<string>();
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [semanticSearchResults, setSemanticSearchResults] = useState<ReportDisplay[]>([]);
    const [aiAnswer, setAiAnswer] = useState<string>("");
    const [currentImage, setCurrentImage] = useState<"figure1" | "figure2" | "figure3">("figure1");

    const semanticSearchAction = useAction(api.rag.semanticSearch);
    const askQuestionAction = useAction(api.rag.askQuestion);

    const reportFilters = useMemo(() => {
        const trimmedSearch = searchTerm.trim();
        return {
            agency: selectedAgency,
            vendor: selectedVendor,
            period: selectedPeriod,
            rating: selectedRating,
            search: trimmedSearch.length ? trimmedSearch : undefined,
        };
    }, [searchTerm, selectedAgency, selectedVendor, selectedPeriod, selectedRating]);

    const approvedReports = useQuery(api.reports.getApprovedReports, aiSearch ? "skip" : reportFilters);
    const reports = aiSearch && aiMode === "search" && semanticSearchResults.length > 0
        ? semanticSearchResults
        : (approvedReports ?? []);
    const isLoadingReports = !aiSearch && approvedReports === undefined;

    const handleSelectChange = (setter: (value: string | undefined) => void) => (value: string) => {
        setter(value === CLEAR_SELECT_VALUE ? undefined : value);
    };

    const handleAISearch = useCallback(async () => {
        if (!searchTerm.trim() || isLoadingAI) return;

        setIsLoadingAI(true);
        setSemanticSearchResults([]);
        setAiAnswer("");
        setCurrentImage("figure1");

        try {
            if (aiMode === "search") {
                const results = await semanticSearchAction({ query: searchTerm.trim() }) as SemanticSearchResult[];
                // Transform results to match the format expected by the table
                // Filter out any items where report is undefined/null
                const transformedResults: ReportDisplay[] = results
                    .filter((item) => item?.report != null)
                    .map((item) => ({
                        _id: item.report._id,
                        projectName: item.project?.projectName ?? "Untitled Project",
                        month: item.report.month,
                        year: item.report.year,
                        sponsoringAgency: item.project?.sponsoringAgency ?? "-",
                        vendorName: item.project?.vendorName ?? "-",
                        currentStatus: item.report.currentStatus ?? "Unknown",
                        finalAttachmentId: item.report.finalAttachmentId,
                    }));
                setSemanticSearchResults(transformedResults);
                // Randomly choose between figure2 and figure3 after search completes
                setCurrentImage(Math.random() < 0.5 ? "figure2" : "figure3");
            } else {
                const answer = await askQuestionAction({ prompt: searchTerm.trim() });
                setAiAnswer(answer);
                // Randomly choose between figure2 and figure3
                setCurrentImage(Math.random() < 0.5 ? "figure2" : "figure3");
            }
        } catch (error) {
            console.error("AI search error:", error);
        } finally {
            setIsLoadingAI(false);
        }
    }, [searchTerm, aiMode, isLoadingAI, semanticSearchAction, askQuestionAction]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && aiSearch && searchTerm.trim()) {
            handleAISearch();
        }
    };

    // Reset AI state when toggling AI search off
    const handleToggleAISearch = () => {
        if (aiSearch) {
            // Turning off AI search
            setSemanticSearchResults([]);
            setAiAnswer("");
            setCurrentImage("figure1");
            setSearchTerm("");
        }
        setAiSearch(!aiSearch);
    };

    return (
        <div>
            <div className="flex flex-col items-center justify-center bg-cyan-800 py-20 gap-5">
                <h1 className="text-4xl font-bold text-background">Public IV&V Reports Catalog</h1>
                <div className="flex flex-row items-center justify-center w-full gap-2.5">
                    <div className="w-11/12 max-w-2xl md:w-4/5">
                        {aiSearch ? (
                            <div className="flex rounded-md shadow-xs">
                                <div className="relative flex-1">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                                        <SearchIcon className="size-5.5" />
                                        <span className="sr-only">Search</span>
                                    </div>
                                    <Input
                                        placeholder={aiMode === "search" ? "Search reports semantically..." : "Ask a question about the reports..."}
                                        className="peer w-full h-12 bg-background pl-11 text-lg -me-px rounded-r-none shadow-none focus-visible:z-1"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={isLoadingAI}
                                    />
                                </div>
                                <Button
                                    onClick={handleAISearch}
                                    disabled={!searchTerm.trim() || isLoadingAI}
                                    className="h-12 rounded-l-none cursor-pointer"
                                >
                                    <Send className="size-5.5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                                    <SearchIcon className="size-5.5" />
                                    <span className="sr-only">Search</span>
                                </div>
                                <Input
                                    placeholder="Search by project name or keywords..."
                                    className="peer w-full h-12 bg-background pl-11 text-lg"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    <div className='flex items-center gap-2.5'>
                        {aiSearch && (
                            <Tabs
                                value={aiMode}
                                onValueChange={(value) => {
                                    setAiMode(value as AIMode);
                                    setCurrentImage("figure1");
                                    setSemanticSearchResults([]);
                                    setAiAnswer("");
                                }}
                                className="h-12"
                            >
                                <TabsList className="h-12 bg-background/80 cursor-pointer">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <TabsTrigger
                                                    value="search"
                                                    className="flex flex-col items-center gap-1 px-2.5 sm:px-3 h-11 cursor-pointer"
                                                    aria-label="Semantic Search"
                                                >
                                                    <LibraryBig className="size-4" />
                                                </TabsTrigger>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="px-2 py-1 text-xs">Semantic Search</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <TabsTrigger
                                                    value="answer"
                                                    className="flex flex-col items-center gap-1 px-2.5 sm:px-3 h-11 cursor-pointer"
                                                    aria-label="AI Response"
                                                >
                                                    <Brain className="size-4" />
                                                </TabsTrigger>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="px-2 py-1 text-xs">AI Response</TooltipContent>
                                    </Tooltip>
                                </TabsList>
                            </Tabs>
                        )}
                        <div className='flex items-center justify-center rounded-lg bg-linear-to-r from-teal-500 to-pink-500 p-0.5 shadow-lg'>
                            <Button
                                size="lg"
                                className='cursor-pointer h-12 from-teal-600 via-teal-600/60 to-teal-600 focus-visible:ring-teal-600/20 dark:focus-visible:ring-teal-600/40 bg-transparent bg-linear-to-r bg-size-[200%_auto] text-white hover:bg-transparent hover:bg-position-[99%_center]'
                                onClick={handleToggleAISearch}
                            >
                                <SparklesIcon className="size-5.5" />
                            </Button>
                        </div>
                    </div>
                </div>
                {!aiSearch && (
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
                )}
            </div>
            <div className="flex flex-col items-center justify-center p-16">
                <div className="w-full max-w-6xl space-y-4">
                    {aiSearch && aiMode === "answer" && (
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">AI Answer</p>
                                    <h2 className="text-2xl font-semibold">Response</h2>
                                </div>
                                <div className="rounded-xl border bg-card p-6 min-h-[200px]">
                                    {isLoadingAI ? (
                                        <div className="flex items-center justify-center h-32">
                                            <p className="text-muted-foreground">Generating answer...</p>
                                        </div>
                                    ) : aiAnswer ? (
                                        <div className="prose prose-sm max-w-none dark:prose-invert prose-table:overflow-x-auto">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAnswer}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-32">
                                            <p className="text-muted-foreground">Ask a question to get an answer</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="shrink-0">
                                <div className="relative w-48 h-48 md:w-64 md:h-64">
                                    <Image
                                        src={`/chat/${currentImage}.png`}
                                        alt="AI Assistant"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {(!aiSearch || aiMode === "search") && (
                        <div className={`flex gap-6 ${aiSearch && aiMode === "search" ? "flex-col md:flex-row items-start" : ""}`}>
                            <div className={`${aiSearch && aiMode === "search" ? "flex-1 space-y-4" : "w-full"}`}>
                                {!aiSearch && (
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Approved IV&V reports
                                            </p>
                                            <h2 className="text-2xl font-semibold">
                                                Latest publications
                                            </h2>
                                        </div>
                                        {(isLoadingReports || reports.length > 0) && (
                                            <p className="text-sm text-muted-foreground">
                                                {isLoadingReports
                                                    ? "Loading..."
                                                    : `${reports.length} result${reports.length === 1 ? "" : "s"}`}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {aiSearch && aiMode === "search" && (
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Semantic search results
                                            </p>
                                            <h2 className="text-2xl font-semibold">
                                                Search Results
                                            </h2>
                                        </div>
                                        {(isLoadingAI || reports.length > 0) && (
                                            <p className="text-sm text-muted-foreground">
                                                {isLoadingAI
                                                    ? "Loading..."
                                                    : reports.length === 1
                                                        ? "1 result (only one result can be shown)"
                                                        : `${reports.length} results`}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div className={`rounded-xl border bg-card ${aiSearch && aiMode === "search" ? "" : "w-full"}`}>
                                    <Table className="w-full">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="pl-6 w-16" />
                                                <TableHead className="text-left">Project Name</TableHead>
                                                <TableHead className="text-left">Reporting Period</TableHead>
                                                <TableHead className="text-left">Agency</TableHead>
                                                <TableHead className="text-left">Vendor</TableHead>
                                                <TableHead className="text-left">Status</TableHead>
                                                <TableHead className="pr-6 text-right">Download</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoadingReports || isLoadingAI ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                        {aiSearch ? "Searching..." : "Fetching approved reports..."}
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
                                                            <TableCell className="font-medium text-left">
                                                                {report.projectName ?? "Untitled Project"}
                                                            </TableCell>
                                                            <TableCell className="text-left">{period}</TableCell>
                                                            <TableCell className="text-left">{report.sponsoringAgency ?? "-"}</TableCell>
                                                            <TableCell className="text-left">{report.vendorName ?? "-"}</TableCell>
                                                            <TableCell className="text-left">
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
                                                    <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                                                        {aiSearch
                                                            ? "No reports found. Try a different search query."
                                                            : "No approved reports match your filters."}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                            {aiSearch && aiMode === "search" && (
                                <div className="shrink-0">
                                    <div className="relative w-48 h-48 md:w-64 md:h-64">
                                        <Image
                                            src={`/chat/${currentImage}.png`}
                                            alt="AI Assistant"
                                            fill
                                            className="object-contain"
                                            priority
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}