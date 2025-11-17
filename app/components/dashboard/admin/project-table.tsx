'use client'

import { Fragment, useCallback, useState } from 'react'
import { ArrowRight, ChevronDownIcon, ChevronUpIcon, ExternalLink, DownloadIcon, Trash2Icon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import ProjectUserDialog from './project-user-dialog'
import { api } from '@/convex/_generated/api'
import { FunctionReturnType } from 'convex/server'
import { useMutation, useQuery } from 'convex/react'
import type { Id } from '@/convex/_generated/dataModel'
import Link from 'next/link'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'


type Projects = FunctionReturnType<typeof api.projects.getProjects>
type Project = Projects[number]
type Reports = FunctionReturnType<typeof api.projects.getProjectReports>

export default function ProjectTable() {
    const projects = useQuery(api.projects.getProjects, {}) || [];
    const deleteProjectMutation = useMutation(api.projects.deleteProject);
    const deleteReportMutation = useMutation(api.reports.deleteReport);
    const [deletingProjectId, setDeletingProjectId] = useState<Id<'projects'> | null>(null);
    const [deletingReportId, setDeletingReportId] = useState<Id<'reports'> | null>(null);

    const handleDeleteProject = useCallback(async (projectId: Id<'projects'>) => {
        try {
            setDeletingProjectId(projectId);
            await deleteProjectMutation({ projectId });
        } catch (error) {
            console.error('Failed to delete project', error);
        } finally {
            setDeletingProjectId(null);
        }
    }, [deleteProjectMutation]);

    const handleDeleteReport = useCallback(async (reportId: Id<'reports'>) => {
        try {
            setDeletingReportId(reportId);
            await deleteReportMutation({ reportId });
        } catch (error) {
            console.error('Failed to delete report', error);
        } finally {
            setDeletingReportId(null);
        }
    }, [deleteReportMutation]);

    const columns: ColumnDef<Project>[] = [
        {
            id: 'expander',
            header: () => null,
            cell: ({ row }) => {
                return row.getCanExpand() ? (
                    <Button
                        {...{
                            className: 'size-7 shadow-none text-muted-foreground cursor-pointer',
                            onClick: row.getToggleExpandedHandler(),
                            'aria-expanded': row.getIsExpanded(),
                            'aria-label': row.getIsExpanded()
                                ? `Collapse details for ${row.original.projectName}`
                                : `Expand details for ${row.original.projectName}`,
                            size: 'icon',
                            variant: 'ghost'
                        }}
                    >
                        {row.getIsExpanded() ? (
                            <ChevronUpIcon className='opacity-60' size={16} aria-hidden='true' />
                        ) : (
                            <ChevronDownIcon className='opacity-60' size={16} aria-hidden='true' />
                        )}
                    </Button>
                ) : undefined
            }
        },
        {
            header: 'Project Name',
            accessorKey: 'projectName',
            cell: ({ row }) => (
                <Link
                    href={`/dashboard/projects/${row.original._id}`}
                    className="underline"
                >
                    {row.original.projectName}
                </Link>
            )
        },
        {
            header: 'Agency',
            accessorKey: 'sponsoringAgency',
            cell: ({ row }) => <div>{row.original.sponsoringAgency}</div>
        },
        {
            header: 'Vendor',
            accessorKey: 'vendorName',
            cell: ({ row }) => {
                const value = row.original.vendorName as string | undefined
                return <div>{value && value.trim() !== '' ? value : '-'}</div>
            }
        },
        {
            header: 'Status',
            accessorKey: 'currentStatus',
            cell: ({ row }) => {
                const status = row.original.currentStatus
                switch (status) {
                    case 'On Track':
                        return <Badge variant={'outline'} className='rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'>
                            {status}
                        </Badge>
                    case 'At Risk':
                        return <Badge variant={'outline'} className='rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5'>
                            {status}
                        </Badge>
                    default:
                        return <Badge variant={'outline'} className='rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5'>
                            {status}
                        </Badge>
                }
            }
        },
        {
            header: 'Budget Used',
            accessorKey: 'budgetUsed',
            cell: ({ row }) => {
                const originalContractAmount = row.original.originalContractAmount
                const totalPaidToDate = row.original.totalPaidToDate
                const percentage = totalPaidToDate / originalContractAmount
                const originalContractAmountFormatted = `$${(originalContractAmount / 1_000_000).toFixed(1)}M`
                const totalPaidToDateFormatted = `$${(totalPaidToDate / 1_000_000).toFixed(1)}M`
                return (
                    <div className='inline-block space-y-1'>
                        <div className='flex flex-row items-center gap-4'>
                            <div className='text-xs text-muted-foreground'>
                                {Math.ceil(percentage * 100)}%
                            </div>
                            <div className='text-xs text-muted-foreground'>
                                {`${totalPaidToDateFormatted} / ${originalContractAmountFormatted}`}
                            </div>
                        </div>
                        <Progress value={percentage * 100} />
                    </div>
                )
            }
        },
        {
            header: 'Timeline',
            accessorKey: 'timeline',
            cell: ({ row }) => {
                const startDate = row.original.startDate
                const plannedEndDate = row.original.plannedEndDate
                const startDateObj = new Date(startDate)
                const endDateObj = new Date(plannedEndDate)
                const startStr = isNaN(startDateObj.getTime())
                    ? '-'
                    : `${String(startDateObj.getMonth() + 1).padStart(2, '0')}/${startDateObj.getFullYear()}`
                const endStr = isNaN(endDateObj.getTime())
                    ? '-'
                    : `${String(endDateObj.getMonth() + 1).padStart(2, '0')}/${endDateObj.getFullYear()}`
                return (
                    <div className='flex flex-row items-center gap-1'>
                        <span className='text-xs'>
                            {startStr}
                        </span>
                        <ArrowRight className='size-3' />
                        <span className='text-xs'>
                            {endStr}
                        </span>
                    </div>
                )
            }
        },
        {
            id: 'actions',
            header: () => 'Actions',
            cell: ({ row }) => (
                <div className='flex items-center gap-1'>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant='ghost' size='icon' className='cursor-pointer' asChild>
                                <Link href={`/dashboard/projects/${row.original._id}`}>
                                    <ExternalLink />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>View Project</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <ProjectUserDialog projectId={row.original._id} />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Assoicated Users</p>
                        </TooltipContent>
                    </Tooltip>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='cursor-pointer'
                                disabled={deletingProjectId === row.original._id}
                            >
                                <Trash2Icon className='size-4' />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete project</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. Deleting this project will also remove all associated reports, findings, comments, and members.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={deletingProjectId === row.original._id}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDeleteProject(row.original._id as Id<'projects'>)}
                                    disabled={deletingProjectId === row.original._id}
                                >
                                    {deletingProjectId === row.original._id ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ),
        },
    ]

    const ProjectMembers = ({ projectId }: { projectId: Id<'projects'> }) => {
        const reports: Reports = useQuery(api.projects.getProjectReports, { projectId }) || []
        if (reports.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={8} className='h-16 text-center text-muted-foreground'>
                        No report submitted for this project.
                    </TableCell>
                </TableRow>
            )
        }
        return (
            <>
                {reports.map(report => (
                    <TableRow key={report._id}>
                        <TableCell className='text-right'>
                            <Button variant='ghost' size='icon' className='cursor-pointer' asChild>
                                <Link href={`/dashboard/reports/${report._id}`}>
                                    <ExternalLink />
                                </Link>
                            </Button>
                        </TableCell>
                        <TableCell>
                            {(() => {
                                const status = report.currentStatus
                                switch (status) {
                                    case 'On Track':
                                        return (
                                            <Badge variant='outline' className='rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'>
                                                {status}
                                            </Badge>
                                        )
                                    case 'Minor Issues':
                                        return (
                                            <Badge variant='outline' className='rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5'>
                                                {status}
                                            </Badge>
                                        )
                                    default:
                                        return (
                                            <Badge variant='outline' className='rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5'>
                                                {status}
                                            </Badge>
                                        )
                                }
                            })()}
                        </TableCell>
                        <TableCell>{`${report.month}/${report.year}`}</TableCell>
                        <TableCell>{report.findings.length}</TableCell>
                        <TableCell>
                            {(() => {
                                const status = report.aproved ? 'Approved' : 'Pending'
                                switch (status) {
                                    case 'Approved':
                                        return (
                                            <Badge variant='outline' className='rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'>
                                                {status}
                                            </Badge>
                                        )
                                    default:
                                        return (
                                            <Badge variant='outline' className='rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5'>
                                                {status}
                                            </Badge>
                                        )
                                }
                            })()}
                        </TableCell>
                        <TableCell>
                            <Button variant='ghost' size='icon' className='cursor-pointer'>
                                <Link href={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file?id=${report.attachmentId}`} target='_blank'>
                                    <DownloadIcon className='size-4' />
                                </Link>
                            </Button>
                        </TableCell>
                        <TableCell>
                            {report.finalAttachmentId ? (
                                <Button variant='ghost' size='icon' className='cursor-pointer'>
                                    <Link href={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file?id=${report.finalAttachmentId}`} target='_blank'>
                                        <DownloadIcon className='size-4' />
                                    </Link>
                                </Button>
                            ) : (
                                '-'
                            )}
                        </TableCell>
                        <TableCell>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='cursor-pointer'
                                        disabled={deletingReportId === report._id}
                                    >
                                        <Trash2Icon className='size-4' />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete report</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. Deleting this report will remove all related findings and comments.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={deletingReportId === report._id}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDeleteReport(report._id)}
                                            disabled={deletingReportId === report._id}
                                        >
                                            {deletingReportId === report._id ? 'Deleting...' : 'Delete'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </>
        )
    }

    const table = useReactTable({
        data: projects || [],
        columns: columns as ColumnDef<Project>[],
        getRowCanExpand: () => true,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel()
    })

    return (
        <div className='w-full bg-background border rounded-lg shadow'>
            <Table className='w-full'>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id} className='hover:bg-transparent'>
                            {headerGroup.headers.map(header => {
                                return (
                                    <TableHead key={header.id}>
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
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map(row => (
                            <Fragment key={row.id}>
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell
                                            key={cell.id}
                                            className='[&:has([aria-expanded])]: [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0'
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                {row.getIsExpanded() && (
                                    <TableRow className='hover:bg-transparent'>
                                        <TableCell colSpan={row.getVisibleCells().length} className='p-0'>
                                            <Table>
                                                <TableHeader className='border-b text-xs'>
                                                    <TableRow className='hover:bg-muted/30!'>
                                                        <TableHead className='w-23.5 text-muted-foreground'></TableHead>
                                                        <TableHead className='text-muted-foreground'>Overall Project Rating</TableHead>
                                                        <TableHead className='text-muted-foreground'>Report Period</TableHead>
                                                        <TableHead className='text-muted-foreground'>Total Findings Reported</TableHead>
                                                        <TableHead className='text-muted-foreground'>Approval Status</TableHead>
                                                        <TableHead className='text-muted-foreground'>Original Report</TableHead>
                                                        <TableHead className='text-muted-foreground'>Final Report</TableHead>
                                                        <TableHead className='text-muted-foreground'>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <ProjectMembers projectId={row.original._id as Id<'projects'>} />
                                                </TableBody>
                                            </Table>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className='h-24 text-center'>
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
