"use client";

import { use } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, CircleAlert, DownloadIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page({
    params
}: {
    params: Promise<{ reportId: Id<'reports'> }>
}) {
    const { reportId } = use(params);
    const report = useQuery(api.reports.getReportById, { reportId });
    const project = useQuery(api.projects.getProjectById, report ? { projectId: report.projectId } : "skip");
    const findings = useQuery(api.reports.getFindingsByReport, { reportId });

    return (
        <div className="flex flex-col items-center justify-center gap-5 p-16 bg-primary/10 w-full">
            <div className="flex flex-col gap-2 w-full max-w-4xl">
                <div className="flex flex-row items-center justify-between gap-2">
                    <h1 className="text-3xl font-bold">{project?.projectName}</h1>
                    {report?.finalAttachmentId ? (
                        <Button variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground/90 cursor-pointer" asChild>
                            <Link
                                href={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file?id=${report.finalAttachmentId}`}
                                target="_blank"
                                download
                            >
                                <DownloadIcon className="size-4 mr-2" />
                                Download Report
                            </Link>
                        </Button>
                    ) : <></>}
                </div>
                <p className="text-sm text-muted-foreground">IV&V Report — {report?.month}/{report?.year}</p>
                <Badge variant="outline" className="rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5">Approved</Badge>
            </div>
            <div className="grid grid-cols-4 gap-4 w-full max-w-4xl">
                <Card className="col-span-3">
                    <CardContent className="flex flex-col gap-4">
                        <h3 className="text-2xl font-semibold">Overview</h3>
                        <div>
                            <p className="text-muted-foreground text-xs font-semibold">Executive Summary</p>
                            <p>{project?.projectDescription}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs font-semibold">Report Summary</p>
                            <p>{report?.summary}</p>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-muted-foreground text-xs font-semibold">Sponsoring Agency</p>
                                <p>{project?.sponsoringAgency}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs font-semibold">IV&V Vendor</p>
                                <p>{project?.vendorName}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs font-semibold">Publication Date</p>
                                <p>
                                    {report?.updatedAt
                                        ? new Date(report.updatedAt).toLocaleDateString(undefined, {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                        : "Not available"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Status Indicators</CardTitle>
                        <CardDescription>
                            Key performance metrics
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {report?.currentStatus && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">Overall Status</p>
                                <Badge
                                    variant="outline"
                                    className={
                                        report.currentStatus === 'On Track'
                                            ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5 w-fit'
                                            : report.currentStatus === 'Minor Issues'
                                                ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5 w-fit'
                                                : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5 w-fit'
                                    }
                                >
                                    {report.currentStatus}
                                </Badge>
                            </div>
                        )}
                        {report?.teamPerformance && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">Team Performance</p>
                                <Badge
                                    variant="outline"
                                    className={
                                        report.teamPerformance === 'On Track'
                                            ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5 w-fit'
                                            : report.teamPerformance === 'Minor Issues'
                                                ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5 w-fit'
                                                : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5 w-fit'
                                    }
                                >
                                    {report.teamPerformance}
                                </Badge>
                            </div>
                        )}
                        {report?.projectManagement && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">Project Management</p>
                                <Badge
                                    variant="outline"
                                    className={
                                        report.projectManagement === 'On Track'
                                            ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5 w-fit'
                                            : report.projectManagement === 'Minor Issues'
                                                ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5 w-fit'
                                                : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5 w-fit'
                                    }
                                >
                                    {report.projectManagement}
                                </Badge>
                            </div>
                        )}
                        {report?.technicalReadiness && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">Technical Readiness</p>
                                <Badge
                                    variant="outline"
                                    className={
                                        report.technicalReadiness === 'On Track'
                                            ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5 w-fit'
                                            : report.technicalReadiness === 'Minor Issues'
                                                ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5 w-fit'
                                                : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5 w-fit'
                                    }
                                >
                                    {report.technicalReadiness}
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-row items-center gap-2">
                            <Sparkles className="size-4 text-yellow-500" />
                            Key Highlights
                        </CardTitle>
                        <CardDescription>
                            Accomplishments, challenges, and upcoming milestones
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        {report?.accomplishments && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold">Key Accomplishments</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.accomplishments}</p>
                            </div>
                        )}
                        {report?.challenges && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold">Challenges and Issues</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.challenges}</p>
                            </div>
                        )}
                        {report?.upcomingMilestones && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold">Upcoming Milestones</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.upcomingMilestones}</p>
                            </div>
                        )}
                        {!report?.accomplishments && !report?.challenges && !report?.upcomingMilestones && (
                            <div className='flex flex-col items-center justify-center p-8 gap-2'>
                                <CircleAlert className="size-8 text-muted-foreground" />
                                <p className='text-muted-foreground text-sm'>No key highlights have been added to this report yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-row items-center gap-2">
                            <CalendarDays className="size-4 text-blue-500" />
                            Budget & Schedule Status
                        </CardTitle>
                        <CardDescription>
                            Provide current status for budget and schedule
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        {report?.budgetStatus && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold">Budget Status</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.budgetStatus}</p>
                            </div>
                        )}
                        {report?.scheduleStatus && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold">Schedule Status</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.scheduleStatus}</p>
                            </div>
                        )}
                        {report?.riskSummary && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold">Key Risks and Mitigation Strategies</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.riskSummary}</p>
                            </div>
                        )}
                        {!report?.budgetStatus && !report?.scheduleStatus && !report?.riskSummary && (
                            <div className='flex flex-col items-center justify-center p-8 gap-2'>
                                <CircleAlert className="size-8 text-muted-foreground" />
                                <p className='text-muted-foreground text-sm'>No budget and schedule information has been added to this report yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle>Findings & Recommendations</CardTitle>
                    <CardDescription>
                        Key observations and suggested actions
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    {findings && findings.length === 0 ? (
                        <div className='flex flex-col items-center justify-center p-8 gap-2'>
                            <CircleAlert className="size-8 text-muted-foreground" />
                            <p className='text-muted-foreground text-sm'>No findings have been added to this report yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {findings && findings.map((finding) => (
                                <div key={finding._id} className="relative pl-4 border-l-2 border-primary">
                                    <div className="flex flex-col gap-2 mb-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-lg">
                                                Finding #{finding.findingNumber}
                                            </h3>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    finding.findingType === 'Risk'
                                                        ? 'rounded-full border-blue-600 bg-blue-600/10 text-blue-800 focus-visible:ring-blue-600/20 focus-visible:outline-none dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5'
                                                        : 'rounded-full border-orange-600 bg-orange-600/10 text-orange-800 focus-visible:ring-orange-600/20 focus-visible:outline-none dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5'
                                                }
                                            >
                                                {finding.findingType}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    finding.status === 'Closed'
                                                        ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
                                                        : finding.status === 'In Progress'
                                                            ? 'rounded-full border-blue-600 bg-blue-600/10 text-blue-800 focus-visible:ring-blue-600/20 focus-visible:outline-none dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5'
                                                            : 'rounded-full border-orange-600 bg-orange-600/10 text-orange-800 focus-visible:ring-orange-600/20 focus-visible:outline-none dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5'
                                                }
                                            >
                                                {finding.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    finding.impactRating === 'Low'
                                                        ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
                                                        : finding.impactRating === 'Medium'
                                                            ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5'
                                                            : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5'
                                                }
                                            >
                                                Impact: {finding.impactRating}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    finding.likelihoodRating === 'Low'
                                                        ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
                                                        : finding.likelihoodRating === 'Medium'
                                                            ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5'
                                                            : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5'
                                                }
                                            >
                                                Likelihood: {finding.likelihoodRating}
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground mb-3">
                                        {finding.description}
                                    </p>
                                    <p className="text-sm">
                                        <span className="text-primary">Recommendation: {finding.recommendation}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card className="w-full max-w-4xl">
                <CardContent className="mx-auto">
                    <p className="text-xs">
                        This report was prepared by <strong>{project?.vendorName}</strong> for the{' '}
                        <strong>Hawai&apos;i Office of Enterprise Technology Services</strong> as part of the IV&V oversight process.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}