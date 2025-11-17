'use client'

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2Icon, Calendar, CircleAlert, Clock, DollarSign, FileText, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress";
import { ChartConfig, ChartContainer } from "../ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import ReportsTable from "@/components/dashboard/reports-table";
import FindingsTable from "@/components/dashboard/findings-table";
import Link from "next/link";

function formatDate(timestamp: number | undefined): string {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFullDate(timestamp: number | undefined): string {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function calculateDelayDays(plannedEnd: number | undefined, currentEnd: number | undefined): number | null {
    if (!plannedEnd || !currentEnd) return null;
    const diffMs = currentEnd - plannedEnd;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
}

function calculateDaysFromStart(startDate: number | undefined, endDate: number | undefined): number {
    if (!startDate || !endDate) return 0;
    const diffMs = endDate - startDate;
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function formatCurrencyInMillions(amount: number | undefined): string {
    if (!amount) return '$0.00M';
    const millions = amount / 1000000;
    return `$${millions.toFixed(2)}M`;
}

const chartConfig = {
    current: {
        label: "Current",
        color: "var(--chart-1)",
    },
    projected: {
        label: "Projected",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig


export default function ProjectDetails({
    projectId
}: {
    projectId: Id<'projects'>
}) {
    const project = useQuery(api.projects.getProjectById, { projectId });
    const reports = useQuery(api.reports.getReport, { projectId }) || [];
    const findings = useQuery(api.reports.getFindingsByProject, { projectId }) || [];
    const isAdmin = useQuery(api.users.isAdmin);
    const delayDays = calculateDelayDays(project?.plannedEndDate, project?.currentProjectedEndDate);

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Project Details
                    </CardTitle>
                    {project?.projectDescription}
                    {isAdmin && (
                        <CardAction className="flex flex-row gap-2">
                            <Link href={`/dashboard/projects/${projectId}/edit`}>
                                <Button variant="outline" className="cursor-pointer">Edit Project</Button>
                            </Link>
                        </CardAction>
                    )}
                </CardHeader>
            </Card>
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Project Details
                        </CardTitle>
                        <div className="flex flex-col gap-4 mt-2">
                            <div className="flex flex-row items-center gap-3">
                                <Building2Icon className="text-primary" />
                                <div className="flex flex-col">
                                    <p className="text-xs text-muted-foreground">Sponsoring Agency</p>
                                    <p className="text-sm font-medium">{project?.sponsoringAgency}</p>
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-3">
                                <User className="text-primary" />
                                <div className="flex flex-col">
                                    <p className="text-xs text-muted-foreground">IV&V Vendor</p>
                                    <p className="text-sm font-medium">{project?.vendorName ?? '-'}</p>
                                </div>
                            </div>
                            <div className="flex flex-row gap-3">
                                <Calendar className="text-primary" />
                                <div className="flex flex-col">
                                    <p className="text-xs text-muted-foreground">Project Dates</p>
                                    <p className="text-sm font-medium">Start: {formatDate(project?.startDate)}</p>
                                    <p className="text-sm font-medium">Current End: {formatDate(project?.currentProjectedEndDate)}</p>
                                    {delayDays !== null && delayDays !== 0 && (
                                        <p className={`text-sm font-medium ${delayDays > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {delayDays > 0 ? (
                                                <>
                                                    Delayed {delayDays} {Math.abs(delayDays) === 1 ? 'day' : 'days'} • <span className="line-through">{formatFullDate(project?.plannedEndDate)}</span>
                                                </>
                                            ) : (
                                                <>
                                                    Early {Math.abs(delayDays)} {Math.abs(delayDays) === 1 ? 'day' : 'days'} • <span className="line-through">{formatFullDate(project?.plannedEndDate)}</span>
                                                </>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-3">
                                <CircleAlert className="text-primary" />
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    {project?.currentStatus && (
                                        <Badge
                                            variant="outline"
                                            className={
                                                project.currentStatus === 'On Track'
                                                    ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
                                                    : project.currentStatus === 'At Risk'
                                                        ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5'
                                                        : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5'
                                            }
                                        >
                                            {project.currentStatus}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Budget & Schedule
                        </CardTitle>
                        <div className="flex flex-col gap-4 mt-2">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row items-center gap-2">
                                    <DollarSign size={14} className="text-primary" />
                                    <p className="text-sm font-medium">Budget Progress</p>
                                </div>
                                <div className='inline-block space-y-2'>
                                    <div className='flex flex-row justify-between gap-4'>
                                        <div className='text-xs text-muted-foreground'>
                                            Budget used {Math.round((project?.totalPaidToDate ?? 0) / (project?.originalContractAmount ?? 0) * 100)}%
                                        </div>
                                        <div className='text-xs'>
                                            {formatCurrencyInMillions(project?.totalPaidToDate)} of {formatCurrencyInMillions(project?.originalContractAmount)}
                                        </div>
                                    </div>
                                    <Progress value={(project?.totalPaidToDate ?? 0) / (project?.originalContractAmount ?? 0) * 100} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row items-center gap-2">
                                    <Clock size={14} className="text-primary" />
                                    <p className="text-sm font-medium">Schedule Comparison</p>
                                </div>
                                <ChartContainer config={chartConfig} className="h-[125px]">
                                    <BarChart
                                        accessibilityLayer
                                        data={[
                                            {
                                                name: 'current',
                                                label: 'Current',
                                                value: Math.round(calculateDaysFromStart(project?.startDate, project?.currentProjectedEndDate) / 7),
                                                date: formatDate(project?.currentProjectedEndDate)
                                            },
                                            {
                                                name: 'projected',
                                                label: 'Projected',
                                                value: Math.round(calculateDaysFromStart(project?.startDate, project?.plannedEndDate) / 7),
                                                date: formatDate(project?.plannedEndDate)
                                            }
                                        ]}
                                        layout="vertical"
                                        margin={{ left: 0, right: 100, top: 0, bottom: 0 }}
                                        barCategoryGap={5}
                                    >
                                        <CartesianGrid horizontal={false} />
                                        <YAxis
                                            dataKey="label"
                                            type="category"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                            width={0}
                                            tick={false}
                                        />
                                        <XAxis
                                            dataKey="value"
                                            type="number"
                                            tickFormatter={(value) => `${Math.round(value)} ${Math.round(value) === 1 ? 'week' : 'weeks'}`}
                                            axisLine={false}
                                            tickLine={false}
                                            allowDecimals={false}
                                        />
                                        <Bar
                                            dataKey="value"
                                            radius={4}
                                            barSize={30}
                                        >
                                            <LabelList
                                                dataKey="label"
                                                position="insideLeft"
                                                offset={8}
                                                className="fill-foreground"
                                                fontSize={12}
                                            />
                                            <LabelList
                                                dataKey="date"
                                                position="right"
                                                offset={8}
                                                className="fill-foreground"
                                                fontSize={12}
                                            />
                                            <Cell fill="var(--color-current)" />
                                            <Cell fill="var(--color-projected)" />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Monthly Reports
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">All IV&V reports submitted for this project</p>
                </CardHeader>
                <CardContent>
                    {reports.length === 0 ? (
                        <div className='flex flex-col items-center justify-center p-8 gap-2'>
                            <FileText className="size-8 text-muted-foreground" />
                            <p className='text-muted-foreground text-sm'>No reports have been submitted for this project yet.</p>
                        </div>
                    ) : (
                        <ReportsTable projectId={projectId} />
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Risk Findings & Tasks
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Action items and issues requiring attention</p>
                </CardHeader>
                <CardContent>
                    {findings.length === 0 ? (
                        <div className='flex flex-col items-center justify-center p-8 gap-2'>
                            <FileText className="size-8 text-muted-foreground" />
                            <p className='text-muted-foreground text-sm'>No risk findings or tasks have been added for this project yet.</p>
                        </div>
                    ) : (
                        <FindingsTable projectId={projectId} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
