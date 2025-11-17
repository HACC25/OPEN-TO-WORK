import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge"
import type { ColumnDef } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FunctionReturnType } from 'convex/server'
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

type Findings = FunctionReturnType<typeof api.reports.getFindingsByProject>
type Finding = Findings[number]

const findingColumns: ColumnDef<Finding>[] = [
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
            const description = row.original.description
            const maxLength = 50
            const truncated = description.length > maxLength
                ? description.slice(0, maxLength) + '...'
                : description
            return <span className="font-medium">{truncated}</span>
        }
    },
    {
        accessorKey: 'findingType',
        header: 'Type',
        cell: ({ row }) => {
            const type = row.original.findingType
            return (
                <Badge
                    variant="outline"
                    className={
                        type === 'Risk'
                            ? 'rounded-full border-blue-600 bg-blue-600/10 text-blue-800 focus-visible:ring-blue-600/20 focus-visible:outline-none dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5'
                            : 'rounded-full border-orange-600 bg-orange-600/10 text-orange-800 focus-visible:ring-orange-600/20 focus-visible:outline-none dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5'
                    }
                >
                    {type}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'impactRating',
        header: 'Impact Rating',
        cell: ({ row }) => {
            const rating = row.original.impactRating
            return (
                <Badge
                    variant="outline"
                    className={
                        rating === 'Low'
                            ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
                            : rating === 'Medium'
                                ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5'
                                : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5'
                    }
                >
                    {rating}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'likelihoodRating',
        header: 'Likelihood Rating',
        cell: ({ row }) => {
            const rating = row.original.likelihoodRating
            return (
                <Badge
                    variant="outline"
                    className={
                        rating === 'Low'
                            ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
                            : rating === 'Medium'
                                ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5'
                                : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5'
                    }
                >
                    {rating}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <Badge
                    variant="outline"
                    className={
                        status === 'Closed'
                            ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
                            : status === 'In Progress'
                                ? 'rounded-full border-blue-600 bg-blue-600/10 text-blue-800 focus-visible:ring-blue-600/20 focus-visible:outline-none dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5'
                                : 'rounded-full border-orange-600 bg-orange-600/10 text-orange-800 focus-visible:ring-orange-600/20 focus-visible:outline-none dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5'
                    }
                >
                    {status}
                </Badge>
            )
        }
    },
]

export default function FindingsTable({
    projectId
}: {
    projectId: Id<'projects'>
}) {
    const findings = useQuery(api.reports.getFindingsByProject, { projectId }) || [];

    const table = useReactTable({
        data: findings,
        columns: findingColumns,
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
                            <TableCell colSpan={findingColumns.length} className='h-24 text-center'>
                                No findings found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
