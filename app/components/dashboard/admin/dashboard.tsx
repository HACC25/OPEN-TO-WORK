"use client";

import { Card, CardDescription, CardHeader, CardTitle, CardFooter, CardContent } from "@/components/ui/card";
import { ArrowRightIcon, FolderKanbanIcon, TrendingUp, TrendingDown, MoveRight, MessageCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FunctionReturnType } from 'convex/server';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type PendingReports = FunctionReturnType<typeof api.reports.getReportsPendingApproval>;
type PendingReport = PendingReports[number];

const pendingReportColumns: ColumnDef<PendingReport>[] = [
    {
        accessorKey: 'projectName',
        header: 'Project Name',
        cell: ({ row }) => (
            <span className="font-medium">{row.original.projectName ?? '-'}</span>
        )
    },
    {
        accessorKey: 'period',
        header: 'Reporting Period',
        cell: ({ row }) => (
            <span className="font-medium">{row.original.month}/{row.original.year}</span>
        )
    },
    {
        accessorKey: 'sponsoringAgency',
        header: 'Agency',
        cell: ({ row }) => (
            <span className="font-medium">{row.original.sponsoringAgency ?? '-'}</span>
        )
    },
    {
        accessorKey: 'vendorName',
        header: 'Vendor',
        cell: ({ row }) => (
            <span className="font-medium">{row.original.vendorName ?? '-'}</span>
        )
    },
    {
        accessorKey: 'currentStatus',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.currentStatus;
            // Map 'Minor Issues' to 'At Risk' for display
            const displayStatus = status === 'Minor Issues' ? 'At Risk' : status;
            return (
                <Badge
                    variant="outline"
                    className={
                        displayStatus === 'On Track'
                            ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
                            : displayStatus === 'At Risk'
                                ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5'
                                : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5'
                    }
                >
                    {displayStatus}
                </Badge>
            )
        }
    },
];

function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

export default function AdminDashboard() {
    const router = useRouter();
    const totalReports = useQuery(api.reports.getReportStats, { month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    const pendingReports = useQuery(api.reports.getReportsPendingApproval) || [];
    const logsResult = useQuery(api.logs.getLogs, { paginationOpts: { numItems: 5, cursor: null } });
    const logs = logsResult?.page || [];
    const commentsResult = useQuery(api.comments.getComments, { paginationOpts: { numItems: 5, cursor: null } });
    const comments = commentsResult?.page || [];

    const calculateTrend = (current: number | undefined, lastMonth: number | undefined) => {
        if (current === undefined || lastMonth === undefined) return { diff: 0, percentage: 0, isPositive: true };
        const diff = current - lastMonth;
        const percentage = lastMonth > 0 ? Math.round((diff / lastMonth) * 100) : (diff > 0 ? 100 : diff < 0 ? -100 : 0);
        return { diff, percentage, isPositive: diff >= 0 };
    };

    const totalReportsTrend = calculateTrend(totalReports?.totalReports, totalReports?.totalLastMonthReports);
    const inReviewTrend = calculateTrend(totalReports?.totalReportsInReview, totalReports?.totalLastMonthReportsInReview);
    const publishedTrend = calculateTrend(totalReports?.totalReportsPublished, totalReports?.totalLastMonthReportsPublished);
    const highRiskTrend = calculateTrend(totalReports?.totalHighRiskReports, totalReports?.totalLastMonthHighRiskReports);

    const pendingReportsTable = useReactTable({
        data: pendingReports,
        columns: pendingReportColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Total Reports</p>
                    <FolderKanbanIcon className="size-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{totalReports?.totalReports}</p>
                <div className="flex flex-row items-center gap-1">
                    {totalReportsTrend.percentage > 0 ? (
                        <TrendingUp className="size-4 text-green-600" />
                    ) : totalReportsTrend.percentage < 0 ? (
                        <TrendingDown className="size-4 text-red-600" />
                    ) : (
                        <MoveRight className="size-4 text-yellow-600" />
                    )}
                    <p className="text-xs">
                        <span className={totalReportsTrend.percentage > 0 ? 'text-green-600' : totalReportsTrend.percentage < 0 ? 'text-red-600' : 'text-yellow-600'}>
                            {totalReportsTrend.percentage > 0 ? '+' : ''}{totalReportsTrend.percentage}%
                        </span> from last month
                    </p>
                </div>
                <Link href="/dashboard/projects" className="flex flex-row items-center gap-1 mt-3 hover:underline hover:text-primary cursor-pointer">
                    <p className="text-xs">View projects</p>
                    <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                </Link>
            </Card>
            <Card className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Reports in Review</p>
                    <FolderKanbanIcon className="size-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{totalReports?.totalReportsInReview}</p>
                <div className="flex flex-row items-center gap-1">
                    {inReviewTrend.percentage > 0 ? (
                        <TrendingUp className="size-4 text-green-600" />
                    ) : inReviewTrend.percentage < 0 ? (
                        <TrendingDown className="size-4 text-red-600" />
                    ) : (
                        <MoveRight className="size-4 text-yellow-600" />
                    )}
                    <p className="text-xs">
                        <span className={inReviewTrend.percentage > 0 ? 'text-green-600' : inReviewTrend.percentage < 0 ? 'text-red-600' : 'text-yellow-600'}>
                            {inReviewTrend.percentage > 0 ? '+' : ''}{inReviewTrend.percentage}%
                        </span> from last month
                    </p>
                </div>
                <Link href="/dashboard/projects" className="flex flex-row items-center gap-1 mt-3 hover:underline hover:text-primary cursor-pointer">
                    <p className="text-xs">View projects</p>
                    <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                </Link>
            </Card>
            <Card className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Published Reports</p>
                    <FolderKanbanIcon className="size-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{totalReports?.totalReportsPublished}</p>
                <div className="flex flex-row items-center gap-1">
                    {publishedTrend.percentage > 0 ? (
                        <TrendingUp className="size-4 text-green-600" />
                    ) : publishedTrend.percentage < 0 ? (
                        <TrendingDown className="size-4 text-red-600" />
                    ) : (
                        <MoveRight className="size-4 text-yellow-600" />
                    )}
                    <p className="text-xs">
                        <span className={publishedTrend.percentage > 0 ? 'text-green-600' : publishedTrend.percentage < 0 ? 'text-red-600' : 'text-yellow-600'}>
                            {publishedTrend.percentage > 0 ? '+' : ''}{publishedTrend.percentage}%
                        </span> from last month
                    </p>
                </div>
                <Link href="/dashboard/projects" className="flex flex-row items-center gap-1 mt-3 hover:underline hover:text-primary cursor-pointer">
                    <p className="text-xs">View projects</p>
                    <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                </Link>
            </Card>
            <Card className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">High Risk Reports</p>
                    <FolderKanbanIcon className="size-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{totalReports?.totalHighRiskReports}</p>
                <div className="flex flex-row items-center gap-1">
                    {highRiskTrend.percentage > 0 ? (
                        <TrendingUp className="size-4 text-green-600" />
                    ) : highRiskTrend.percentage < 0 ? (
                        <TrendingDown className="size-4 text-red-600" />
                    ) : (
                        <MoveRight className="size-4 text-yellow-600" />
                    )}
                    <p className="text-xs">
                        <span className={highRiskTrend.percentage > 0 ? 'text-green-600' : highRiskTrend.percentage < 0 ? 'text-red-600' : 'text-yellow-600'}>
                            {highRiskTrend.percentage > 0 ? '+' : ''}{highRiskTrend.percentage}%
                        </span> from last month
                    </p>
                </div>
                <Link href="/dashboard/projects" className="flex flex-row items-center gap-1 mt-3 hover:underline hover:text-primary cursor-pointer">
                    <p className="text-xs">View projects</p>
                    <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                </Link>
            </Card>
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Reports Pending Approval</CardTitle>
                    <CardDescription>
                        Reports that are waiting for approval to be published
                    </CardDescription>
                </CardHeader>
                <Table>
                    <TableHeader>
                        {pendingReportsTable.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan} className='first:pl-6 last:px-6'>
                                            {header.isPlaceholder ? null : (
                                                <div className='text-xs text-muted-foreground'>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                                            )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {pendingReportsTable.getRowModel().rows?.length ? (
                            pendingReportsTable.getRowModel().rows.map(row => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push(`/dashboard/reports/${row.original._id}`)}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} className='first:pl-6 last:px-6'>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={pendingReportColumns.length} className='h-24 text-center'>
                                    No reports pending approval
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <CardFooter className="flex flex-row items-center gap-2 justify-end">
                    <Link href="/dashboard/projects" className="text-sm hover:underline hover:text-primary">
                        View All Reports
                    </Link>
                    <ArrowRightIcon className="size-4.5 text-muted-foreground" />
                </CardFooter>
            </Card>
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                        Latest updates and events
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {logs.length > 0 ? (
                            logs.map((log) => {
                                const colorClass =
                                    log.action === 'creation' ? 'bg-green-600' :
                                        log.action === 'update' ? 'bg-blue-600' :
                                            'bg-red-600';

                                return (
                                    <div key={log._id} className="flex items-start gap-4">
                                        <div className={`w-1 h-12 rounded-full ${colorClass} shrink-0`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">
                                                {log.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatTimeAgo(log._creationTime)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No recent activity
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Recent Comments</CardTitle>
                    <CardDescription>
                        Latest comments on reports
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {comments.length > 0 ? (
                            comments.map((comment) => {
                                return (
                                    <div key={comment._id} className="flex gap-3 items-center">
                                        <Avatar className="size-8">
                                            <AvatarImage src={comment.author?.imageUrl} alt={comment.author?.name} />
                                            <AvatarFallback className="text-xs">
                                                {comment.author?.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1 min-w-0">
                                            <div className="flex items-center gap-2 justify-between">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold">{comment.author?.name || 'Unknown User'}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatTimeAgo(comment._creationTime)}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-foreground whitespace-pre-wrap break-words line-clamp-2">
                                                {comment.content}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/dashboard/reports/${comment.reportId}`}
                                            className="shrink-0"
                                        >
                                            <ArrowRightIcon className="size-4 text-muted-foreground hover:text-primary" />
                                        </Link>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
                                <MessageCircle className="size-10" />
                                <p className="text-sm">No recent comments yet</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}