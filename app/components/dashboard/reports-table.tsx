import { api } from "@/convex/_generated/api";
import { DownloadIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import type { ColumnDef } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FunctionReturnType } from 'convex/server'
import Link from 'next/link'
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

type Reports = FunctionReturnType<typeof api.reports.getReport>
type Report = Reports[number]

const reportColumns: ColumnDef<Report>[] = [
    {
        accessorKey: 'period',
        header: 'Report Period',
        cell: ({ row }) => (
            <Link
                href={`/dashboard/reports/${row.original._id}`}
                className="underline"
            >
                <span className="font-medium">{row.original.month}/{row.original.year}</span>
            </Link>
        )
    },
    {
        accessorKey: 'currentStatus',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.currentStatus
            return (
                <Badge
                    variant="outline"
                    className={
                        status === 'On Track'
                            ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
                            : status === 'Minor Issues'
                                ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5'
                                : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5'
                    }
                >
                    {status}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'published',
        header: 'Publication Status',
        cell: ({ row }) => {
            return <span className="font-medium">{row.original.published ? 'Published' : 'In Review'}</span>
        }
    },
    {
        accessorKey: 'attachment',
        header: 'Attachment',
        cell: ({ row }) => {
            return (
                <Button variant='ghost' size='icon' className='cursor-pointer'>
                    <Link href={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file?id=${row.original.attachmentId}`} target='_blank'>
                        <DownloadIcon className='size-4' />
                    </Link>
                </Button>
            )
        }
    },
    {
        accessorKey: 'finalAttachment',
        header: 'Final Attachment',
        cell: ({ row }) => {
            return row.original.finalAttachmentId ? (
                <Button variant='ghost' size='icon' className='cursor-pointer'>
                    <Link href={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file?id=${row.original.finalAttachmentId}`} target='_blank'>
                        <DownloadIcon className='size-4' />
                    </Link>
                </Button>
            ) : (
                <span className='text-muted-foreground'>-</span>
            )
        }
    },
]

export default function ReportsTable({
    projectId
}: {
    projectId: Id<'projects'>
}) {
    const reports = useQuery(api.reports.getReport, { projectId }) || [];

    const table = useReactTable({
        data: reports,
        columns: reportColumns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className='w-full'>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
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
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map(row => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id} className='first:pl-6 last:px-6'>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={reportColumns.length} className='h-24 text-center'>
                                No reports found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
