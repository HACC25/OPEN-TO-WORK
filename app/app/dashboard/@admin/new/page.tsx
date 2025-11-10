"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
    projectName: z.string().min(1, { message: "Project name is required" }),
    agency: z.string().min(1, { message: "Sponsoring agency is required" }),
    description: z
        .string()
        .min(1, { message: "Please provide a description of the project" }),
    contractAmount: z.preprocess(
        (val) => {
            if (val === "") return NaN;
            return Number(val);
        },
        z.number({ error: "Enter a valid amount" }).min(0, { message: "Amount must be positive" })
    ),

    totalPaid: z.preprocess(
        (val) => {
            if (val === "") return NaN;
            return Number(val);
        },
        z.number({ error: "Enter a valid amount" }).min(0, { message: "Amount must be positive" })
    ),
    startDate: z.coerce
        .number({ error: "Enter a valid date" })
        .min(0, { message: "Date must be positive" }),
    plannedEndDate: z.coerce
        .number({ error: "Enter a valid date" })
        .min(0, { message: "Date must be positive" }),
    currentProjectedEndDate: z.coerce
        .number({ error: "Enter a valid date" })
        .min(0, { message: "Date must be positive" }),
    currentStatus: z.enum(["On Track", "At Risk", "Critical"]),
    active: z.boolean(),
    vendorName: z.string().trim().optional(),
});

export default function Page() {
    const form = useForm<z.input<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            projectName: "",
            agency: "",
            description: "",
            contractAmount: "",
            totalPaid: "",
            startDate: "",
            plannedEndDate: "",
            currentProjectedEndDate: "",
            currentStatus: "On Track",
            active: true,
            vendorName: "",
        }
    });

    const router = useRouter();
    const createProject = useMutation(api.projects.createProject);

    async function onSubmit() {
        const projectId = await createProject({
            projectName: form.getValues('projectName'),
            projectDescription: form.getValues('description'),
            sponsoringAgency: form.getValues('agency'),
            originalContractAmount: Number(form.getValues('contractAmount')),
            totalPaidToDate: Number(form.getValues('totalPaid')),
            startDate: Number(form.getValues('startDate')),
            plannedEndDate: Number(form.getValues('plannedEndDate')),
            currentProjectedEndDate: Number(form.getValues('currentProjectedEndDate')),
            currentStatus: form.getValues('currentStatus'),
            active: form.getValues('active'),
            vendorName: form.getValues('vendorName') ?? undefined,
        });
        if (projectId) {
            toast.success('Project saved successfully.');
            router.push('/dashboard');
        } else {
            toast.error('Error saving project.');
        }
    }

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-col items-start'>
                <h2 className='text-2xl font-semibold'>Project Information</h2>
                <p className='text-muted-foreground'>Enter the details for the new project record</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-6'>
                    <FormField
                        control={form.control}
                        name='projectName'
                        render={({ field }) => (
                            <FormItem className='sm:col-span-3'>
                                <FormLabel>Project Name</FormLabel>
                                <FormControl>
                                    <Input placeholder='Student Information System' {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='agency'
                        render={({ field }) => (
                            <FormItem className='sm:col-span-3'>
                                <FormLabel>Sponsoring Agency</FormLabel>
                                <FormControl>
                                    <Input placeholder='Department of Education' {...field} />
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
                                    <Textarea placeholder='Describe the project scope, objectives, and key details' {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='contractAmount'
                        render={({ field }) => (
                            <FormItem className='sm:col-span-3'>
                                <FormLabel>Original Contract Amount</FormLabel>
                                <FormControl>
                                    <div className='relative w-full'>
                                        <Input type='number' step='0.01' placeholder='XXXXX.XX' className='font-mono pl-6' {...field} value={(field.value as string) ?? ""} />
                                        <span className='pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-sm peer-disabled:opacity-50'>
                                            $
                                        </span>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='totalPaid'
                        render={({ field }) => (
                            <FormItem className='sm:col-span-3'>
                                <FormLabel>Total Paid to Date</FormLabel>
                                <FormControl>
                                    <div className='relative w-full'>
                                        <Input type='number' step='0.01' placeholder='XXXXX.XX' className='font-mono pl-6' {...field} value={(field.value as string) ?? ""} />
                                        <span className='pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-sm peer-disabled:opacity-50'>
                                            $
                                        </span>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='startDate'
                        render={({ field }) => (
                            <FormItem className='sm:col-span-2'>
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                            >
                                                {field.value ? format(field.value as Date, 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value as Date}
                                            onSelect={field.onChange}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='plannedEndDate'
                        render={({ field }) => (
                            <FormItem className='sm:col-span-2'>
                                <FormLabel>Planned End Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                            >
                                                {field.value ? format(field.value as Date, 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value as Date}
                                            onSelect={field.onChange}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='currentProjectedEndDate'
                        render={({ field }) => (
                            <FormItem className='sm:col-span-2'>
                                <FormLabel>Current Projected End Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                            >
                                                {field.value ? format(field.value as Date, 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value as Date}
                                            onSelect={field.onChange}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='currentStatus'
                        render={({ field }) => (
                            <FormItem className='space-y-2 sm:col-span-6'>
                                <FormLabel>Overall Project Status</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem
                                                value='On Track'
                                                id='On Track'
                                                className='cursor-pointer border-green-600 text-green-600 focus-visible:border-green-600 focus-visible:ring-green-600/20 dark:border-green-400 dark:text-green-400 dark:focus-visible:border-green-400 dark:focus-visible:ring-green-400/40 [&_svg]:fill-green-600 dark:[&_svg]:fill-green-400'
                                            />
                                            <FormLabel htmlFor='On Track' className='font-normal'>
                                                On Track
                                            </FormLabel>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem
                                                value='At Risk'
                                                id='At Risk'
                                                className='cursor-pointer border-yellow-600 text-yellow-600 focus-visible:border-yellow-600 focus-visible:ring-yellow-600/20 dark:border-yellow-400 dark:text-yellow-400 dark:focus-visible:border-yellow-400 dark:focus-visible:ring-yellow-400/40 [&_svg]:fill-yellow-600 dark:[&_svg]:fill-yellow-400'
                                            />
                                            <FormLabel htmlFor='At Risk' className='font-normal'>
                                                At Risk
                                            </FormLabel>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem
                                                value='Critical'
                                                id='Critical'
                                                className='cursor-pointer border-red-600 text-red-600 focus-visible:border-red-600 focus-visible:ring-red-600/20 dark:border-red-400 dark:text-red-400 dark:focus-visible:border-red-400 dark:focus-visible:ring-red-400/40 [&_svg]:fill-red-600 dark:[&_svg]:fill-red-400'
                                            />
                                            <FormLabel htmlFor='Critical' className='font-normal'>
                                                Critical
                                            </FormLabel>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='active'
                        render={({ field }) => (
                            <FormItem className='sm:col-span-6'>
                                <FormLabel>Active Project</FormLabel>
                                <FormControl>
                                    <div className='flex items-center space-x-2'>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        <FormDescription>
                                            Enable this to mark the project as currently active
                                        </FormDescription>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='vendorName'
                        render={({ field }) => (
                            <FormItem className='sm:col-span-4'>
                                <FormLabel>IV&V Vendor Name</FormLabel>
                                <FormControl>
                                    <Input placeholder='Vendor Name' {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <div className='flex justify-end gap-2 sm:col-span-6'>
                        <Link href='/dashboard'>
                            <Button type='button' variant='outline' className='cursor-pointer'>
                                Cancel
                            </Button>
                        </Link>
                        <Button type='submit' className='cursor-pointer'>
                            Save Project
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
