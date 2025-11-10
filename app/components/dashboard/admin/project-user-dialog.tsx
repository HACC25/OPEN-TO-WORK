import { CheckIcon, ChevronsUpDownIcon, UserMinusIcon, Users } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { api } from '@/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Id } from '@/convex/_generated/dataModel'

export default function ProjectUserDialog({
    projectId,
}: {
    projectId: Id<'projects'>
}) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [popoverOpen, setPopoverOpen] = useState(false)

    const projectMembers = useQuery(api.projects.getProjectMembers, dialogOpen ? { projectId: projectId } : "skip") || [];
    const vendors = useQuery(api.users.getUsers, dialogOpen ? { searchString: '', excludeRole: 'user' } : "skip") || [];
    const addProjectMemberMutation = useMutation(api.projects.addProjectMember);
    const removeProjectMemberMutation = useMutation(api.projects.removeProjectMember);

    const [selectedVendorId, setSelectedVendorId] = useState<Id<'users'> | null>(null)
    const selectedVendor = vendors.find(vendor => vendor._id === selectedVendorId) || null;
    
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant='ghost' size='icon' className='cursor-pointer'>
                    <Users />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader className='text-center'>
                    <DialogTitle className='text-xl'>Add users to project </DialogTitle>
                </DialogHeader>
                <div className='w-full max-w-xs space-y-2'>
                    <Label>Select an user</Label>
                    <div className='flex items-center justify-between gap-2'>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button variant='outline' role='combobox' aria-expanded={dialogOpen} className='w-full justify-between'>
                                    {selectedVendor ? (
                                        <span className='flex gap-2'>
                                            <Avatar className='size-6'>
                                                <AvatarImage src={selectedVendor.imageUrl} alt={selectedVendor.name} />
                                                <AvatarFallback>{selectedVendor.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className='font-medium'>{selectedVendor.name}</span>
                                        </span>
                                    ) : (
                                        <span className='text-muted-foreground'>Select user</span>
                                    )}
                                    <ChevronsUpDownIcon size={16} className='text-muted-foreground/80 shrink-0' aria-hidden='true' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-[300px] p-0'>
                                <Command>
                                    <CommandInput placeholder='Search user...' />
                                    <CommandList>
                                        <CommandEmpty>No users found.</CommandEmpty>
                                        <CommandGroup>
                                            {vendors.map(user => (
                                                <CommandItem
                                                    key={user._id}
                                                    value={user._id}
                                                    onSelect={currentValue => {
                                                        setSelectedVendorId(currentValue === selectedVendorId ? null : user._id)
                                                        setPopoverOpen(false)
                                                    }}
                                                >
                                                    <span className='flex items-center gap-2'>
                                                        <Avatar className='size-7'>
                                                            <AvatarImage src={user.imageUrl} alt={user.name} />
                                                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span className='flex flex-col'>
                                                            <span className='font-medium'>{user.name}</span>
                                                            <span className='text-muted-foreground text-sm'>{user.email}</span>
                                                        </span>
                                                    </span>
                                                    {selectedVendorId === user._id && <CheckIcon size={16} className='ml-auto' />}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <Button
                            size='sm'
                            className='px-4 cursor-pointer'
                            disabled={!selectedVendorId}
                            onClick={() => addProjectMemberMutation({ projectId: projectId, userId: selectedVendorId! })}
                        >
                            Add User
                        </Button>
                    </div>
                </div>
                <div className='space-y-4'>
                    {projectMembers.map((user, index) => (
                        <div key={index} className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <Avatar className='size-8'>
                                    <AvatarImage src={user.imageUrl} alt={user.name} />
                                    <AvatarFallback className='text-xs'>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className='flex flex-col'>
                                    <span className='font-xs'>{user.name}</span>
                                    <span className='text-muted-foreground truncate text-xs'>{user.email}</span>
                                </div>
                            </div>
                            <Button
                                size='sm'
                                variant='destructive'
                                className='cursor-pointer'
                                onClick={() => removeProjectMemberMutation({ projectId: projectId, userId: user._id })}
                            >
                                <UserMinusIcon />
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>

        </Dialog>
    )
}
