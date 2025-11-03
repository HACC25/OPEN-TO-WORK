'use client'

import { Fragment } from 'react'

import { ArrowRight, ChevronDownIcon, ChevronUpIcon, ExternalLink } from 'lucide-react'

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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'


type Projects = FunctionReturnType<typeof api.projects.getProjects>
type Project = Projects[number]

export default function ProjectTable({
    projects,
    getUsers,
    addProjectMember,
    removeProjectMember
}: {
    projects: Project[] | undefined
    getUsers: typeof api.users.getUsers
    addProjectMember: typeof api.projects.addProjectMember
    removeProjectMember: typeof api.projects.removeProjectMember
}) {
    const columns: ColumnDef<Project>[] = [
        {
            id: 'expander',
            header: () => null,
            cell: ({ row }) => {
                return row.getCanExpand() ? (
                    <Button
                        {...{
                            className: 'size-7 shadow-none text-muted-foreground',
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
            cell: ({ row }) => <div>{row.original.projectName}</div>
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
            header: 'Associated Users',
            accessorKey: 'vendorUsers',
            cell: ({ row }) => {
                const members = row.original.members || []
                if (members.length === 0) {
                    return <div>-</div>
                }
                const maxVisible = 5
                const visibleMembers = members.slice(0, maxVisible)
                const overflowCount = members.length - maxVisible
                return (
                    <div className='flex -space-x-2'>
                        {visibleMembers.map((member, index) => (
                            <Avatar key={`${member.email}-${index}`} className='ring-background ring-2 size-6'>
                                <AvatarImage src={member.imageUrl} alt={member.name} />
                                <AvatarFallback className='text-xs'>{member.name?.charAt(0) ?? '?'}</AvatarFallback>
                            </Avatar>
                        ))}
                        {overflowCount > 0 && (
                            <Avatar className='ring-background ring-2 size-6'>
                                <AvatarFallback className='text-xs'>+{overflowCount}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                )
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
                            <Button variant='ghost' size='icon' className='cursor-pointer'>
                                <ExternalLink />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>View Project</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <ProjectUserDialog
                                project={row.original}
                                existingUsers={row.original.members}
                                getUsers={getUsers}
                                addProjectMember={addProjectMember}
                                removeProjectMember={removeProjectMember}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Assoicated Users</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data: projects || [],
        columns: columns as ColumnDef<Project>[],
        getRowCanExpand: row => Boolean(row.original.members),
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
                                                        <TableHead className='text-muted-foreground'>Member Name</TableHead>
                                                        <TableHead className='text-muted-foreground'>Role</TableHead>
                                                        <TableHead className='text-muted-foreground'>Email</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {row.original.members && row.original.members.length > 0 ? (
                                                        row.original.members.map(member => (
                                                            <TableRow key={member.email}>
                                                                <TableCell></TableCell>
                                                                <TableCell>{member.name}</TableCell>
                                                                <TableCell>{member.role}</TableCell>
                                                                <TableCell>{member.email}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className='h-16 text-center text-muted-foreground'>
                                                                No associated users.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
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
