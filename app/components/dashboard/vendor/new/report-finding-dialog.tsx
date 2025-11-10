import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/convex/_generated/api'
import { useEffect, useId, useState } from 'react'
import { FunctionArgs } from 'convex/server'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormLabel, FormField, FormItem, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectGroup, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const FindingSchema = z.object({
    findingNumber: z.string().min(1, { message: "Finding number is required" }),
    findingType: z.union([z.literal('Risk'), z.literal('Issue')]),
    description: z.string().min(1, { message: "Description is required" }),
    impactRating: z.union([z.literal('Low'), z.literal('Medium'), z.literal('High')]),
    likelihoodRating: z.union([z.literal('Low'), z.literal('Medium'), z.literal('High')]),
    recommendation: z.string().min(1, { message: "Recommendation is required" }).min(10, { message: "Recommendation must be at least 10 characters long" }),
    status: z.union([z.literal('Open'), z.literal('In Progress'), z.literal('Closed')]),
});

const DEFAULT_FINDING = {
    findingNumber: '',
    findingType: 'Issue' as const,
    description: '',
    impactRating: 'Low' as const,
    likelihoodRating: 'Low' as const,
    recommendation: '',
    status: 'Open' as const,
}

export default function ReportFindingDialog({
    addFinding,
}: {
    addFinding: (finding: NonNullable<FunctionArgs<typeof api.reports.createReport>['findings']>[number]) => void
}) {
    const id = useId();
    const [dialogOpen, setDialogOpen] = useState(false)
    const form = useForm<z.infer<typeof FindingSchema>>({
        resolver: zodResolver(FindingSchema),
        defaultValues: DEFAULT_FINDING,
    })

    async function onSubmit(finding: z.infer<typeof FindingSchema>) {
        addFinding(finding)
        setDialogOpen(false)
    }

    useEffect(() => {
        if (dialogOpen) {
            form.reset(DEFAULT_FINDING);
        }
    }, [dialogOpen]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button size='sm' className='cursor-pointer'>
                    <PlusIcon /> Add Finding
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader className='text-center'>
                    <DialogTitle className='text-xl'>Add New Finding</DialogTitle>
                    <DialogDescription>
                        Document a risk or issue identified during this reporting period
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form id={id} onSubmit={form.handleSubmit(onSubmit)} className='grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-6'>
                        <FormField
                            control={form.control}
                            name='findingNumber'
                            render={({ field }) => (
                                <FormItem className='sm:col-span-3'>
                                    <FormLabel>Finding Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder='F-001' {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='findingType'
                            render={({ field }) => (
                                <FormItem className='sm:col-span-3'>
                                    <FormLabel>Type</FormLabel>
                                    <FormControl>
                                        <Select defaultValue='Issue' onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select a type' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value='Issue'>Issue</SelectItem>
                                                    <SelectItem value='Risk'>Risk</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                                <FormItem className='sm:col-span-6'>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder='Describe the finding' {...field} className='min-h-[75px]' />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='impactRating'
                            render={({ field }) => (
                                <FormItem className='sm:col-span-3'>
                                    <FormLabel>Impact (1-3)</FormLabel>
                                    <FormControl>
                                        <Select defaultValue='Low' onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select an impact rating' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value='Low'>1 - Low</SelectItem>
                                                    <SelectItem value='Medium'>2 - Medium</SelectItem>
                                                    <SelectItem value='High'>3 - High</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='likelihoodRating'
                            render={({ field }) => (
                                <FormItem className='sm:col-span-3'>
                                    <FormLabel>Likelihood (1-3)</FormLabel>
                                    <FormControl>
                                        <Select defaultValue='Low' onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select a likelihood rating' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value='Low'>1 - Low</SelectItem>
                                                    <SelectItem value='Medium'>2 - Medium</SelectItem>
                                                    <SelectItem value='High'>3 - High</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='recommendation'
                            render={({ field }) => (
                                <FormItem className='sm:col-span-6'>
                                    <FormLabel>Recommendation</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder='Provide a recommendation for the finding' {...field} className='min-h-[75px]' />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='status'
                            render={({ field }) => (
                                <FormItem className='sm:col-span-2'>
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                        <Select defaultValue='Open' onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select a status' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value='Open'>Open</SelectItem>
                                                    <SelectItem value='In Progress'>In Progress</SelectItem>
                                                    <SelectItem value='Closed'>Closed</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <Button type='button' variant='outline' className='cursor-pointer' onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button type='submit' form={id} className='cursor-pointer'>
                        <PlusIcon /> Add Finding
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
