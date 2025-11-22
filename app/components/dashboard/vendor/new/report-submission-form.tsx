"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, ChevronsUpDownIcon, TrashIcon, SparklesIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { FunctionArgs } from "convex/server";
import type { Id } from "@/convex/_generated/dataModel";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useState, useEffect, useMemo, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReportFindingDialog from "@/components/dashboard/vendor/new/report-finding-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import pdfToText from "react-pdftotext";

const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
]
const years = Array.from({ length: 11 }, (_, i) => ({ label: `${2020 + i}`, value: 2020 + i }));

const DRAFT_STORAGE_KEY = "report-draft";

const FormSchema = z.object({
    projectId: z.custom<Id<"projects">>(val => typeof val === "string" && val.length > 0, { message: "Project ID is required" }),
    draft: z.boolean(),
    attachmentId: z.custom<Id<"_storage">>(val => typeof val === "string" && val.length > 0, { message: "Attachment ID is required" }),
    month: z.number().min(1, { message: "Month is required" }),
    year: z.number().min(1, { message: "Year is required" }),
    currentStatus: z.enum(["On Track", "Minor Issues", "Critical"]),
    teamPerformance: z.enum(["On Track", "Minor Issues", "Critical"]).optional(),
    projectManagement: z.enum(["On Track", "Minor Issues", "Critical"]).optional(),
    technicalReadiness: z.enum(["On Track", "Minor Issues", "Critical"]).optional(),
    summary: z.string().min(1, { message: "Summary is required" }),
    accomplishments: z.string().optional(),
    challenges: z.string().optional(),
    upcomingMilestones: z.string().optional(),
    budgetStatus: z.string().optional(),
    scheduleStatus: z.string().optional(),
    riskSummary: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

const getDefaultFormValues = (): FormValues => ({
    projectId: "" as Id<"projects">,
    draft: false,
    attachmentId: "" as Id<"_storage">,
    month: 0,
    year: 0,
    currentStatus: "On Track",
    teamPerformance: undefined,
    projectManagement: undefined,
    technicalReadiness: undefined,
    summary: "",
    accomplishments: undefined,
    challenges: undefined,
    upcomingMilestones: undefined,
    budgetStatus: undefined,
    scheduleStatus: undefined,
    riskSummary: undefined,
});

export default function ReportSubmissionForm() {
    const projects = useQuery(api.projects.getProjects, {}) || [];
    const createReport = useMutation(api.reports.createReport);
    const generateUploadUrl = useMutation(api.reports.generateUploadUrl);
    type CreateReportArgument = FunctionArgs<typeof api.reports.createReport>

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isAutofilling, setIsAutofilling] = useState(false);
    const getAIGeneratedReportFields = useAction(api.ai.getAIGeneratedReportFields);
    const [findings, setFindings] = useState<NonNullable<CreateReportArgument['findings']>>(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
                if (savedDraft) {
                    const draftData = JSON.parse(savedDraft);
                    if (draftData.findings && Array.isArray(draftData.findings)) {
                        return draftData.findings;
                    }
                }
            } catch (error) {
                console.error('Error loading findings from draft:', error);
            }
        }
        return [];
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: useMemo(() => getDefaultFormValues(), []),
    });
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const router = useRouter();

    useEffect(() => {
        try {
            const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (savedDraft) {
                const draftData = JSON.parse(savedDraft);
                form.reset({
                    ...getDefaultFormValues(),
                    ...draftData,
                });
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }, [form]);

    function saveDraft() {
        try {
            const formValues = form.getValues();
            const draftData = {
                projectId: formValues.projectId,
                month: formValues.month,
                year: formValues.year,
                currentStatus: formValues.currentStatus,
                teamPerformance: formValues.teamPerformance,
                projectManagement: formValues.projectManagement,
                technicalReadiness: formValues.technicalReadiness,
                summary: formValues.summary,
                accomplishments: formValues.accomplishments,
                challenges: formValues.challenges,
                upcomingMilestones: formValues.upcomingMilestones,
                budgetStatus: formValues.budgetStatus,
                scheduleStatus: formValues.scheduleStatus,
                riskSummary: formValues.riskSummary,
                findings: findings,
            };
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
            toast.success('Draft saved successfully.');
            router.push('/dashboard/');
        } catch (error) {
            console.error('Error saving draft:', error);
            toast.error('Error saving draft.');
        }
    }

    function handleReset() {
        form.reset(getDefaultFormValues());
        setFindings([]);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        localStorage.removeItem(DRAFT_STORAGE_KEY);
    }

    async function onSubmit(data: FormValues) {
        setIsLoading(true);
        toast.info('Creating report...');
        try {
            const reportId = await createReport({
                projectId: data.projectId,
                draft: data.draft,
                attachmentId: data.attachmentId,
                month: data.month,
                year: data.year,
                currentStatus: data.currentStatus,
                teamPerformance: data.teamPerformance,
                projectManagement: data.projectManagement,
                technicalReadiness: data.technicalReadiness,
                summary: data.summary,
                accomplishments: data.accomplishments,
                challenges: data.challenges,
                upcomingMilestones: data.upcomingMilestones,
                budgetStatus: data.budgetStatus,
                scheduleStatus: data.scheduleStatus,
                riskSummary: data.riskSummary,
                findings: findings,
            });
            if (reportId) {
                localStorage.removeItem(DRAFT_STORAGE_KEY);
                toast.success('Report created successfully.');
                router.push('/dashboard/');
            } else {
                toast.error('Error creating report.');
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            toast.error('A report with the same month and year already exists for this project. Please try a different month and year.');
        } finally {
            setIsLoading(false);
        }
    }

    async function uploadAttachment(file: File) {
        setIsUploading(true);
        toast.info('Uploading attachment...');
        const uploadUrl = await generateUploadUrl();
        if (!uploadUrl) {
            setIsUploading(false);
            toast.error('Error generating upload url.');
            return;
        }
        const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
        });
        const { storageId } = await result.json();
        if (storageId) {
            form.setValue('attachmentId', storageId);
            toast.success('Attachment uploaded successfully.');
        } else {
            toast.error('Error uploading attachment.');
        }
        setIsUploading(false);
    }

    async function handleAutofill() {
        if (!selectedFile) {
            toast.error('Please select a PDF file first.');
            return;
        }

        setIsAutofilling(true);
        toast.info('Extracting text from PDF...');

        try {
            // Extract text from PDF
            const text = await pdfToText(selectedFile);

            if (!text || text.trim().length === 0) {
                toast.error('Could not extract text from PDF. Please ensure the PDF contains readable text.');
                setIsAutofilling(false);
                return;
            }
            console.log(text)

            toast.info('Generating form fields with AI...');

            // Call AI action to generate form fields
            const aiResult = await getAIGeneratedReportFields({ content: text });

            // Prefill form fields
            if (aiResult.currentStatus) {
                form.setValue('currentStatus', aiResult.currentStatus);
            }
            if (aiResult.teamPerformance) {
                form.setValue('teamPerformance', aiResult.teamPerformance);
            }
            if (aiResult.projectManagement) {
                form.setValue('projectManagement', aiResult.projectManagement);
            }
            if (aiResult.technicalReadiness) {
                form.setValue('technicalReadiness', aiResult.technicalReadiness);
            }
            if (aiResult.summary) {
                form.setValue('summary', aiResult.summary);
            }
            if (aiResult.accomplishments) {
                form.setValue('accomplishments', aiResult.accomplishments);
            }
            if (aiResult.challenges) {
                form.setValue('challenges', aiResult.challenges);
            }
            if (aiResult.upcomingMilestones) {
                form.setValue('upcomingMilestones', aiResult.upcomingMilestones);
            }
            if (aiResult.budgetStatus) {
                form.setValue('budgetStatus', aiResult.budgetStatus);
            }
            if (aiResult.scheduleStatus) {
                form.setValue('scheduleStatus', aiResult.scheduleStatus);
            }
            if (aiResult.riskSummary) {
                form.setValue('riskSummary', aiResult.riskSummary);
            }
            if (aiResult.findings && Array.isArray(aiResult.findings)) {
                setFindings(aiResult.findings);
            }

            toast.success('Form fields autofilled successfully!');
        } catch (error) {
            console.error('Error during autofill:', error);
            toast.error('Error during autofill. Please try again.');
        } finally {
            setIsAutofilling(false);
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit(onSubmit, (errors) => {
                        console.log('Form validation errors:', errors);
                        toast.error('Please fix the form errors before submitting.');
                    })(e);
                }}
                className='flex flex-col gap-6'
            >
                {/* Hidden field for draft to ensure it's tracked by react-hook-form */}
                <FormField
                    control={form.control}
                    name='draft'
                    render={({ field }) => (
                        <input
                            type='hidden'
                            {...field}
                            value={field.value ? 'true' : 'false'}
                            onChange={(e) => field.onChange(e.target.value === 'true')}
                        />
                    )}
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Project & Reporting Period</CardTitle>
                        <CardDescription>Select the project, reporting period, and overall rating</CardDescription>
                    </CardHeader>
                    <CardContent className='grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-6'>
                        {/* Project Selection */}
                        <FormField
                            control={form.control}
                            name='projectId'
                            render={({ field }) => (
                                <FormItem className='sm:col-span-2'>
                                    <FormLabel>Select a project</FormLabel>
                                    <Popover>
                                        <FormControl>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    className='w-full min-w-0 justify-between'
                                                >
                                                    <span className='truncate flex-1 text-left min-w-0'>
                                                        {field.value ? (
                                                            projects.find(project => project._id === field.value)?.projectName
                                                        ) : (
                                                            <span className='text-muted-foreground'>Select a project...</span>
                                                        )}
                                                    </span>
                                                    <ChevronsUpDownIcon className='opacity-50' />
                                                </Button>
                                            </PopoverTrigger>
                                        </FormControl>
                                        <PopoverContent className='w-(--radix-popper-anchor-width) p-0'>
                                            <Command>
                                                <CommandInput placeholder='Search project...' />
                                                <CommandList>
                                                    <CommandEmpty>No project found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {projects.map(project => (
                                                            <CommandItem
                                                                key={project._id}
                                                                value={project.projectName}
                                                                onSelect={() => field.onChange(project._id)}
                                                            >
                                                                {project.projectName}
                                                                <CheckIcon
                                                                    className={cn('ml-auto', field.value === project._id ? 'opacity-100' : 'opacity-0')}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />
                        {/* Month Selection */}
                        <FormField
                            control={form.control}
                            name='month'
                            render={({ field }) => (
                                <FormItem className='sm:col-span-2'>
                                    <FormLabel>Select a month</FormLabel>
                                    <Popover>
                                        <FormControl>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    className='w-full max-w-xs justify-between'
                                                >
                                                    {field.value ? (
                                                        months.find(month => month.value === field.value)?.label
                                                    ) : (
                                                        <span className='text-muted-foreground'>Select a month...</span>
                                                    )}
                                                    <ChevronsUpDownIcon className='opacity-50' />
                                                </Button>
                                            </PopoverTrigger>
                                        </FormControl>
                                        <PopoverContent className='w-(--radix-popper-anchor-width) p-0'>
                                            <Command>
                                                <CommandInput placeholder='Search month...' />
                                                <CommandList>
                                                    <CommandEmpty>No month found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {months.map(month => (
                                                            <CommandItem
                                                                key={month.value}
                                                                value={month.label}
                                                                onSelect={() => field.onChange(month.value)}
                                                            >
                                                                {month.label}
                                                                <CheckIcon
                                                                    className={cn('ml-auto', field.value === month.value ? 'opacity-100' : 'opacity-0')}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />
                        {/* Year Selection */}
                        <FormField
                            control={form.control}
                            name='year'
                            render={({ field }) => (
                                <FormItem className='sm:col-span-2'>
                                    <FormLabel>Select a year</FormLabel>
                                    <Popover>
                                        <FormControl>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    className='w-full max-w-xs justify-between'
                                                >
                                                    {field.value ? (
                                                        years.find(year => year.value === field.value)?.label
                                                    ) : (
                                                        <span className='text-muted-foreground'>Select a year...</span>
                                                    )}
                                                    <ChevronsUpDownIcon className='opacity-50' />
                                                </Button>
                                            </PopoverTrigger>
                                        </FormControl>
                                        <PopoverContent className='w-(--radix-popper-anchor-width) p-0'>
                                            <Command>
                                                <CommandInput placeholder='Search year...' />
                                                <CommandList>
                                                    <CommandEmpty>No year found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {years.map(year => (
                                                            <CommandItem
                                                                key={year.value}
                                                                value={year.label}
                                                                onSelect={() => field.onChange(year.value)}
                                                            >
                                                                {year.label}
                                                                <CheckIcon
                                                                    className={cn('ml-auto', field.value === year.value ? 'opacity-100' : 'opacity-0')}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />
                        {/* Overall Project Status */}
                        <FormField
                            control={form.control}
                            name='currentStatus'
                            render={({ field }) => (
                                <FormItem className='space-y-2 sm:col-span-6'>
                                    <FormLabel>Overall Project Rating</FormLabel>
                                    <FormControl>
                                        <RadioGroup className='w-full gap-2 flex flex-row' onValueChange={field.onChange} value={field.value ?? ""}>
                                            <Label
                                                htmlFor='On Track'
                                                className='cursor-pointer flex justify-center items-center gap-2 border-input has-data-[state=checked]:border-green-600/50 has-data-[state=checked]:bg-green-100/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative w-full rounded-md border p-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]'
                                            >
                                                <RadioGroupItem
                                                    value='On Track'
                                                    id='On Track'
                                                    className='border-green-600 text-green-600 focus-visible:border-green-600 focus-visible:ring-green-600/20 dark:border-green-400 dark:text-green-400 dark:focus-visible:border-green-400 dark:focus-visible:ring-green-400/40 [&_svg]:fill-green-600 dark:[&_svg]:fill-green-400'
                                                />
                                                <span>On Track</span>
                                            </Label>

                                            <Label
                                                htmlFor='Minor Issues'
                                                className='cursor-pointer flex justify-center items-center gap-2 border-input has-data-[state=checked]:border-yellow-600/50 has-data-[state=checked]:bg-yellow-100/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative w-full rounded-md border p-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]'
                                            >
                                                <RadioGroupItem
                                                    value='Minor Issues'
                                                    id='Minor Issues'
                                                    className='border-yellow-600 text-yellow-600 focus-visible:border-yellow-600 focus-visible:ring-yellow-600/20 dark:border-yellow-400 dark:text-yellow-400 dark:focus-visible:border-yellow-400 dark:focus-visible:ring-yellow-400/40 [&_svg]:fill-yellow-600 dark:[&_svg]:fill-yellow-400'
                                                />
                                                <span>Minor Issues</span>
                                            </Label>

                                            <Label
                                                htmlFor='Critical'
                                                className='cursor-pointer flex justify-center items-center gap-2 border-input has-data-[state=checked]:border-red-600/50 has-data-[state=checked]:bg-red-100/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative w-full rounded-md border p-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]'
                                            >
                                                <RadioGroupItem
                                                    value='Critical'
                                                    id='Critical'
                                                    className='border-red-600 text-red-600 focus-visible:border-red-600 focus-visible:ring-red-600/20 dark:border-red-400 dark:text-red-400 dark:focus-visible:border-red-400 dark:focus-visible:ring-red-400/40 [&_svg]:fill-red-600 dark:[&_svg]:fill-red-400'
                                                />
                                                <span>Critical</span>
                                            </Label>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {/* Upload Report */}
                        <FormField
                            control={form.control}
                            name='attachmentId'
                            render={({ field }) => (
                                <FormItem className='space-y-2 sm:col-span-4'>
                                    <FormLabel>Upload Report</FormLabel>
                                    <FormControl>
                                        <div className='flex gap-2'>
                                            <Input
                                                ref={fileInputRef}
                                                type='file'
                                                accept='application/pdf'
                                                className='text-muted-foreground file:border-input file:text-foreground p-0 pr-3 italic file:mr-3 file:h-full file:border-0 file:border-r file:border-solid file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic flex-1'
                                                onChange={async (event) => {
                                                    const file = event.target.files?.[0] ?? null;
                                                    if (file) {
                                                        if (file.type !== 'application/pdf') {
                                                            toast.error('Only PDF files are allowed. Please select a PDF file.');
                                                            if (fileInputRef.current) {
                                                                fileInputRef.current.value = "";
                                                            }
                                                            form.setValue('attachmentId', "" as Id<"_storage">);
                                                            setSelectedFile(null);
                                                            return;
                                                        }
                                                        setSelectedFile(file);
                                                        await uploadAttachment(file);
                                                    } else {
                                                        form.setValue('attachmentId', "" as Id<"_storage">);
                                                        setSelectedFile(null);
                                                    }
                                                }}
                                            />
                                            <Button
                                                type='button'
                                                variant='outline'
                                                onClick={handleAutofill}
                                                disabled={!selectedFile || isAutofilling || isUploading}
                                                className='shrink-0'
                                            >
                                                <SparklesIcon className='mr-2 h-4 w-4' />
                                                {isAutofilling ? 'Autofilling...' : 'Autofill'}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <input type='hidden' value={field.value ?? ""} readOnly />
                                </FormItem>
                            )}
                        />
                        {/* Team Performance */}
                        <FormField
                            control={form.control}
                            name='teamPerformance'
                            render={({ field }) => (
                                <FormItem className='space-y-2 sm:col-span-6'>
                                    <FormLabel>Team Performance</FormLabel>
                                    <FormControl>
                                        <RadioGroup className='w-full gap-2 flex flex-row' onValueChange={field.onChange} value={field.value ?? ""}>
                                            <Label
                                                htmlFor='teamPerformance-On Track'
                                                className='cursor-pointer flex justify-center items-center gap-2 border-input has-data-[state=checked]:border-green-600/50 has-data-[state=checked]:bg-green-100/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative w-full rounded-md border p-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]'
                                            >
                                                <RadioGroupItem
                                                    value='On Track'
                                                    id='teamPerformance-On Track'
                                                    className='border-green-600 text-green-600 focus-visible:border-green-600 focus-visible:ring-green-600/20 dark:border-green-400 dark:text-green-400 dark:focus-visible:border-green-400 dark:focus-visible:ring-green-400/40 [&_svg]:fill-green-600 dark:[&_svg]:fill-green-400'
                                                />
                                                <span>On Track</span>
                                            </Label>

                                            <Label
                                                htmlFor='teamPerformance-Minor Issues'
                                                className='cursor-pointer flex justify-center items-center gap-2 border-input has-data-[state=checked]:border-yellow-600/50 has-data-[state=checked]:bg-yellow-100/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative w-full rounded-md border p-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]'
                                            >
                                                <RadioGroupItem
                                                    value='Minor Issues'
                                                    id='teamPerformance-Minor Issues'
                                                    className='border-yellow-600 text-yellow-600 focus-visible:border-yellow-600 focus-visible:ring-yellow-600/20 dark:border-yellow-400 dark:text-yellow-400 dark:focus-visible:border-yellow-400 dark:focus-visible:ring-yellow-400/40 [&_svg]:fill-yellow-600 dark:[&_svg]:fill-yellow-400'
                                                />
                                                <span>Minor Issues</span>
                                            </Label>

                                            <Label
                                                htmlFor='teamPerformance-Critical'
                                                className='cursor-pointer flex justify-center items-center gap-2 border-input has-data-[state=checked]:border-red-600/50 has-data-[state=checked]:bg-red-100/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative w-full rounded-md border p-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]'
                                            >
                                                <RadioGroupItem
                                                    value='Critical'
                                                    id='teamPerformance-Critical'
                                                    className='border-red-600 text-red-600 focus-visible:border-red-600 focus-visible:ring-red-600/20 dark:border-red-400 dark:text-red-400 dark:focus-visible:border-red-400 dark:focus-visible:ring-red-400/40 [&_svg]:fill-red-600 dark:[&_svg]:fill-red-400'
                                                />
                                                <span>Critical</span>
                                            </Label>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {/* Project Management */}
                        <FormField
                            control={form.control}
                            name='projectManagement'
                            render={({ field }) => (
                                <FormItem className='space-y-2 sm:col-span-6'>
                                    <FormLabel>Project Management</FormLabel>
                                    <FormControl>
                                        <RadioGroup className='w-full gap-2 flex flex-row' onValueChange={field.onChange} value={field.value ?? ""}>
                                            <Label
                                                htmlFor='projectManagement-On Track'
                                                className='cursor-pointer flex justify-center items-center gap-2 border-input has-data-[state=checked]:border-green-600/50 has-data-[state=checked]:bg-green-100/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative w-full rounded-md border p-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]'
                                            >
                                                <RadioGroupItem
                                                    value='On Track'
                                                    id='projectManagement-On Track'
                                                    className='border-green-600 text-green-600 focus-visible:border-green-600 focus-visible:ring-green-600/20 dark:border-green-400 dark:text-green-400 dark:focus-visible:border-green-400 dark:focus-visible:ring-green-400/40 [&_svg]:fill-green-600 dark:[&_svg]:fill-green-400'
                                                />
                                                <span>On Track</span>
                                            </Label>

                                            <Label
                                                htmlFor='projectManagement-Minor Issues'
                                                className='cursor-pointer flex justify-center items-center gap-2 border-input has-data-[state=checked]:border-yellow-600/50 has-data-[state=checked]:bg-yellow-100/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative w-full rounded-md border p-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]'
                                            >
                                                <RadioGroupItem
                                                    value='Minor Issues'
                                                    id='projectManagement-Minor Issues'
                                                    className='border-yellow-600 text-yellow-600 focus-visible:border-yellow-600 focus-visible:ring-yellow-600/20 dark:border-yellow-400 dark:text-yellow-400 dark:focus-visible:border-yellow-400 dark:focus-visible:ring-yellow-400/40 [&_svg]:fill-yellow-600 dark:[&_svg]:fill-yellow-400'
                                                />
                                                <span>Minor Issues</span>
                                            </Label>

                                            <Label
                                                htmlFor='projectManagement-Critical'
                                                className='cursor-pointer flex justify-center items-center gap-2 border-input has-data-[state=checked]:border-red-600/50 has-data-[state=checked]:bg-red-100/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative w-full rounded-md border p-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]'
                                            >
                                                <RadioGroupItem
                                                    value='Critical'
                                                    id='projectManagement-Critical'
                                                    className='border-red-600 text-red-600 focus-visible:border-red-600 focus-visible:ring-red-600/20 dark:border-red-400 dark:text-red-400 dark:focus-visible:border-red-400 dark:focus-visible:ring-red-400/40 [&_svg]:fill-red-600 dark:[&_svg]:fill-red-400'
                                                />
                                                <span>Critical</span>
                                            </Label>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {/* Technical Readiness */}
                        <FormField
                            control={form.control}
                            name='technicalReadiness'
                            render={({ field }) => (
                                <FormItem className='space-y-2 sm:col-span-6'>
                                    <FormLabel>Technical Readiness</FormLabel>
                                    <FormControl>
                                        <RadioGroup className='w-full gap-2 flex flex-row' onValueChange={field.onChange} value={field.value ?? ""}>
                                            <Label
                                                htmlFor='technicalReadiness-On Track'
                                                className='cursor-pointer flex justify-center items-center gap-2 border-input has-data-[state=checked]:border-green-600/50 has-data-[state=checked]:bg-green-100/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative w-full rounded-md border p-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]'
                                            >
                                                <RadioGroupItem
                                                    value='On Track'
                                                    id='technicalReadiness-On Track'
                                                    className='border-green-600 text-green-600 focus-visible:border-green-600 focus-visible:ring-green-600/20 dark:border-green-400 dark:text-green-400 dark:focus-visible:border-green-400 dark:focus-visible:ring-green-400/40 [&_svg]:fill-green-600 dark:[&_svg]:fill-green-400'
                                                />
                                                <span>On Track</span>
                                            </Label>

                                            <Label
                                                htmlFor='technicalReadiness-Minor Issues'
                                                className='cursor-pointer flex justify-center items-center gap-2 border-input has-data-[state=checked]:border-yellow-600/50 has-data-[state=checked]:bg-yellow-100/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative w-full rounded-md border p-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]'
                                            >
                                                <RadioGroupItem
                                                    value='Minor Issues'
                                                    id='technicalReadiness-Minor Issues'
                                                    className='border-yellow-600 text-yellow-600 focus-visible:border-yellow-600 focus-visible:ring-yellow-600/20 dark:border-yellow-400 dark:text-yellow-400 dark:focus-visible:border-yellow-400 dark:focus-visible:ring-yellow-400/40 [&_svg]:fill-yellow-600 dark:[&_svg]:fill-yellow-400'
                                                />
                                                <span>Minor Issues</span>
                                            </Label>

                                            <Label
                                                htmlFor='technicalReadiness-Critical'
                                                className='cursor-pointer flex justify-center items-center gap-2 border-input has-data-[state=checked]:border-red-600/50 has-data-[state=checked]:bg-red-100/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative w-full rounded-md border p-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]'
                                            >
                                                <RadioGroupItem
                                                    value='Critical'
                                                    id='technicalReadiness-Critical'
                                                    className='border-red-600 text-red-600 focus-visible:border-red-600 focus-visible:ring-red-600/20 dark:border-red-400 dark:text-red-400 dark:focus-visible:border-red-400 dark:focus-visible:ring-red-400/40 [&_svg]:fill-red-600 dark:[&_svg]:fill-red-400'
                                                />
                                                <span>Critical</span>
                                            </Label>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Executive Summary</CardTitle>
                        <CardDescription>
                            Provide a comprehensive summary of the month&apos;s activities (max 5,000 characters)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='grid max-w-2xl sm:grid-cols-6'>
                        <FormField
                            control={form.control}
                            name='summary'
                            render={({ field }) => (
                                <FormItem className='sm:col-span-6'>
                                    <FormControl>
                                        <Textarea placeholder='Type your feedback here' value={field.value} maxLength={5000} onChange={field.onChange} className='min-h-[200px]' />
                                    </FormControl>
                                    <p className='text-muted-foreground text-xs'>
                                        <span className='tabular-nums'>{field.value.length} / 5000</span> characters
                                    </p>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Key Highlights</CardTitle>
                        <CardDescription>
                            Document accomplishments, challenges, and upcoming milestones
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='grid max-w-2xl sm:grid-cols-6 gap-6'>
                        <FormField
                            control={form.control}
                            name='accomplishments'
                            render={({ field }) => (
                                <div className='flex flex-col gap-2 sm:col-span-6'>
                                    <Label>Key Accomplishments</Label>
                                    <Textarea
                                        placeholder='Describe the key accomplishments of the month'
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        className='min-h-[150px]'
                                    />
                                </div>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='challenges'
                            render={({ field }) => (
                                <div className='flex flex-col gap-2 sm:col-span-6'>
                                    <Label>Challenges & Issues</Label>
                                    <Textarea
                                        placeholder='Describe the challenges and issues faced during the month'
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        className='min-h-[150px]'
                                    />
                                </div>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='upcomingMilestones'
                            render={({ field }) => (
                                <div className='flex flex-col gap-2 sm:col-span-6'>
                                    <Label>Upcoming Milestones</Label>
                                    <Textarea
                                        placeholder='Describe the upcoming milestones for the next month'
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        className='min-h-[150px]'
                                    />
                                </div>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Budget & Schedule Status</CardTitle>
                        <CardDescription>
                            Provide current status for budget and schedule
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='grid max-w-2xl sm:grid-cols-6 gap-6'>
                        <FormField
                            control={form.control}
                            name='budgetStatus'
                            render={({ field }) => (
                                <div className='flex flex-col gap-2 sm:col-span-6'>
                                    <Label>Budget Status</Label>
                                    <FormDescription>
                                        Current budget utilization and any variances
                                    </FormDescription>
                                    <Textarea
                                        placeholder='Describe the current status of the budget'
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        className='min-h-[100px]'
                                    />
                                </div>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='scheduleStatus'
                            render={({ field }) => (
                                <div className='flex flex-col gap-2 sm:col-span-6'>
                                    <Label>Schedule Status</Label>
                                    <FormDescription>
                                        Current timeline position and any delays
                                    </FormDescription>
                                    <Textarea
                                        placeholder='Describe the current status of the schedule'
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        className='min-h-[100px]'
                                    />
                                </div>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='riskSummary'
                            render={({ field }) => (
                                <div className='flex flex-col gap-2 sm:col-span-6'>
                                    <Label>Risk Summary</Label>
                                    <FormDescription>
                                        Summarize key risks and mitigation strategies
                                    </FormDescription>
                                    <Textarea
                                        placeholder='Describe the current risks and issues'
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        className='min-h-[100px]'
                                    />
                                </div>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Report Findings</CardTitle>
                        <CardDescription>
                            Add risks and issues identified this month
                        </CardDescription>
                        <CardAction>
                            <ReportFindingDialog
                                addFinding={(finding) => setFindings(prev => [...prev, finding])}
                            />
                        </CardAction>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-6'>
                        {
                            findings.length > 0 ? (
                                findings.map((finding, index) => (
                                    <Card key={index} className='px-4 pt-2 pb-3'>
                                        <div className='flex flex-col gap-1'>
                                            <div className='flex flex-row gap-2 justify-between items-center'>
                                                <div className='flex flex-row gap-2'>
                                                    <Badge variant='outline'>{finding.findingNumber}</Badge>
                                                    <Badge variant='outline' className={cn(finding.findingType === 'Risk' ? 'text-yellow-500 bg-yellow-100 border-yellow-500' : 'text-red-500 bg-red-100 border-red-500')}>
                                                        {finding.findingType}
                                                    </Badge>
                                                    <Badge variant='outline'>Risk: {finding.likelihoodRating}</Badge>
                                                    <Badge variant='outline'>{finding.status}</Badge>
                                                </div>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='cursor-pointer text-red-500 hover:text-red-500/80'
                                                    onClick={() => setFindings(prev => prev.filter((_, i) => i !== index))}
                                                >
                                                    <TrashIcon className='size-4' />
                                                </Button>
                                            </div>
                                            <p className='text-sm'>{finding.description}</p>
                                            <p className='text-xs text-muted-foreground'>Recommendation: {finding.recommendation}</p>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className='flex flex-col items-center justify-center p-8'>
                                    <p className='text-muted-foreground text-sm'>No findings added yet.</p>
                                    <p className='text-muted-foreground text-xs'>Click &quot;Add Finding&quot; to document risks and issues.</p>
                                </div>
                            )
                        }
                    </CardContent>
                </Card>

                <div className='sticky bottom-6 z-10 flex gap-4 justify-end'>
                    <Button
                        type='button'
                        variant='outline'
                        size='lg'
                        className='shadow-xl cursor-pointer'
                        onClick={handleReset}
                        disabled={isLoading || isUploading}
                    >
                        Reset
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        size='lg'
                        className='shadow-xl cursor-pointer'
                        onClick={saveDraft}
                        disabled={isLoading || isUploading}
                    >
                        Save Draft
                    </Button>
                    <Button
                        type='submit'
                        size='lg'
                        className='shadow-xl cursor-pointer'
                        disabled={isLoading || isUploading}
                    >
                        Submit
                    </Button>
                </div>
            </form>
        </Form>
    );
}
