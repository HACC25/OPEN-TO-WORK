'use client'

import { useEffect, useState } from 'react'

import type {
    ColumnDef,
    RowData,
    CellContext
} from '@tanstack/react-table'
import {
    flexRender,
    getCoreRowModel,
    useReactTable
} from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Building2, CircleIcon, LoaderCircleIcon, SearchIcon, User, UserCog } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FunctionArgs, FunctionReturnType } from 'convex/server'
import { api } from '@/convex/_generated/api'

// Extend TanStack Table's meta interface
declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface TableMeta<TData extends RowData> {
        updateData: (rowIndex: number, columnId: string, value: string | number | boolean) => void
    }
}

type Users = FunctionReturnType<typeof api.users.getUsers>
type User = Users[number]

const EditableRoleCell = ({ getValue, row: { index }, column: { id }, table }: CellContext<User, unknown>) => {
    const initialValue = getValue() as string

    const handleValueChange = (newValue: string) => {
        table.options.meta?.updateData(index, id, newValue)
    }

    const roles = [
        {
            value: 'admin',
            label: 'Admin',
            icon: UserCog,
        },
        {
            value: 'vendor',
            label: 'Vendor',
            icon: Building2,
        },
        {
            value: 'user',
            label: 'User',
            icon: User,
        },
    ]

    return (
        <div className=''>
            <Select value={initialValue} onValueChange={handleValueChange}>
                <SelectTrigger
                    id={id}
                    className='max-w-sm [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0'
                >
                    <SelectValue placeholder='Select Role' />
                </SelectTrigger>
                <SelectContent className='[&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2'>
                    <SelectGroup>
                        {roles.map(item => (
                            <SelectItem key={item.value} value={item.value}>
                                <div className='flex items-center gap-2'>
                                    <item.icon className='size-4' />
                                    <span className='truncate'>{item.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}

const EditableBooleanCell = ({ getValue, row: { index }, column: { id }, table }: CellContext<User, unknown>) => {
    const initialValue = getValue() ? 'true' : 'false'

    const handleValueChange = (newValue: string) => {
        table.options.meta?.updateData(index, id, newValue === 'true' ? true : false)
    }

    return (
        <Select value={initialValue} onValueChange={handleValueChange}>
            <SelectTrigger
                className='max-w-md [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0'
            >
                <SelectValue placeholder='Select active status' />
            </SelectTrigger>
            <SelectContent className='[&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0'>
                <SelectItem value='true'>
                    <span className='flex items-center gap-2'>
                        <CircleIcon className='size-2 fill-green-500 text-green-500' />
                        <span className='truncate'>Active</span>
                    </span>
                </SelectItem>
                <SelectItem value='false'>
                    <span className='flex items-center gap-2'>
                        <CircleIcon className='size-2 fill-red-500 text-red-500' />
                        <span className='truncate'>Inactive</span>
                    </span>
                </SelectItem>
            </SelectContent>
        </Select>
    )
}

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'name',
        header: 'Full Name',
        cell: ({ row }) => (
            <div className='flex items-center gap-3'>
                <Avatar className='rounded-sm'>
                    <AvatarImage src={row.original.imageUrl} alt={row.original.name} />
                    <AvatarFallback className='text-xs'>{row.original.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='font-medium'>{row.getValue('name')}</div>
            </div>
        )
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
            const d = new Date(row.original._creationTime)

            const date = d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })

            const [time, meridiem] = d
                .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                .split(' ')

            return <span>{`${date} ${time} ${meridiem.toUpperCase()}`}</span>
        }
    },
    {
        accessorKey: 'isActive',
        header: 'Active',
        cell: EditableBooleanCell
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: EditableRoleCell
    },
]

export default function UserTable({
    users,
    updateUserMetadata,
    searchString,
    setSearchString,
}: {
    users: User[] | undefined;
    updateUserMetadata: (
        args: FunctionArgs<typeof api.users.updateUserMetadata>
    ) => Promise<FunctionReturnType<typeof api.users.updateUserMetadata>>;
    searchString: string;
    setSearchString: (searchString: string) => void;
}) {
    const [data, setData] = useState(users || [])
    const refreshData = () => setData(users || [])

    useEffect(() => {
        setData(users || [])
    }, [users])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: {
            updateData: async (rowIndex, columnId, value) => {
                const current = data[rowIndex]
                const nextIsActive = columnId === 'isActive'
                    ? (typeof value === 'boolean' ? value : value === 'true')
                    : current.isActive
                const nextRole = (columnId === 'role' ? value : current.role) as 'user' | 'admin' | 'vendor'

                setData(prev => {
                    const next = [...prev]
                    next[rowIndex] = { ...current, isActive: nextIsActive, role: nextRole }
                    return next
                })

                await updateUserMetadata({
                    _id: current._id,
                    isActive: nextIsActive,
                    role: nextRole
                })
            }
        },
    })

    return (
        <div className='w-full'>
            <div className='border-b'>
                <div className='flex flex-wrap items-center justify-between gap-3 py-4 px-6'>
                    <h1 className='text-lg font-bold'>Registered Users</h1>
                    <div className='w-full max-w-xs space-y-2'>
                        <div className='relative'>
                            <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                                <SearchIcon className='size-4' />
                                <span className='sr-only'>Search users by name or email...</span>
                            </div>
                            <Input
                                type='search'
                                value={searchString}
                                onChange={e => setSearchString(e.target.value)}
                                placeholder='Search...'
                                className='peer px-9 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none'
                            />
                            {!users && (
                                <div className='text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50'>
                                    <LoaderCircleIcon className='size-4 animate-spin' />
                                    <span className='sr-only'>Loading...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id} className='border-t'>
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
                                <TableCell colSpan={columns.length} className='h-24 text-center'>
                                    {searchString === '' ? 'No users found' : 'No results found for ' + searchString}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className='text-muted-foreground flex items-center justify-between py-4 px-6 max-sm:flex-col md:max-lg:flex-col'>
                <div className='text-sm'>{table.getRowModel().rows.length} users total</div>
                <div className='flex items-center space-x-2'>
                    <Button variant='outline' size='sm' className='cursor-pointer' onClick={refreshData}>
                        Refresh Data
                    </Button>
                </div>
            </div>

        </div>
    )
}
