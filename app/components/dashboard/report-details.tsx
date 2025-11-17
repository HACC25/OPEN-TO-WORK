import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Card, CardHeader, CardContent, CardAction, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2Icon, DownloadIcon, ChevronDownIcon, Users, User, Calendar, Clock, CircleAlert, FileIcon, UploadIcon, CheckCircle2Icon, XCircleIcon, PencilIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";

function formatDate(timestamp: number | undefined): string {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(timestamp: number | undefined): string {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr} at ${timeStr}`;
}


export default function ReportDetails({
    reportId
}: {
    reportId: Id<'reports'>
}) {
    const report = useQuery(api.reports.getReportById, { reportId });
    const project = useQuery(api.projects.getProjectById, report ? { projectId: report.projectId } : "skip");
    const reportAuthor = useQuery(api.users.getUserById, report ? { userId: report.authorId } : "skip");
    const findings = useQuery(api.reports.getFindingsByReport, { reportId }) || [];
    const comments = useQuery(api.comments.getCommentsByReport, { reportId }) || [];
    const isAdmin = useQuery(api.users.isAdmin);
    const generateUploadUrl = useMutation(api.reports.generateUploadUrl);
    const updateFinalAttachment = useMutation(api.reports.updateFinalAttachment);
    const toggleReportApproval = useMutation(api.reports.toggleReportApproval);
    const createComment = useMutation(api.comments.createComment);
    const [isUploading, setIsUploading] = useState(false);
    const [isTogglingApproval, setIsTogglingApproval] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [isSendingComment, setIsSendingComment] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleFinalAttachmentUpload = async (file: File) => {
        setIsUploading(true);
        toast.info('Uploading final attachment...');

        try {
            const uploadUrl = await generateUploadUrl();
            if (!uploadUrl) {
                toast.error('Error generating upload url.');
                setIsUploading(false);
                return;
            }

            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            const { storageId } = await result.json();
            if (storageId) {
                await updateFinalAttachment({
                    reportId,
                    finalAttachmentId: storageId,
                });
                toast.success('Final attachment uploaded successfully.');
            } else {
                toast.error('Error uploading attachment.');
            }
        } catch (error) {
            toast.error('Error uploading attachment.');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleToggleApproval = async () => {
        setIsTogglingApproval(true);
        try {
            await toggleReportApproval({ reportId });
            const newStatus = !report?.aproved;
            toast.success(newStatus ? 'Report approved and published successfully.' : 'Report unapproved and unpublished successfully.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error toggling report approval.');
            console.error(error);
        } finally {
            setIsTogglingApproval(false);
        }
    };

    const handleSendComment = async () => {
        if (!commentContent.trim()) {
            return;
        }
        setIsSendingComment(true);
        try {
            await createComment({
                reportId,
                content: commentContent.trim(),
            });
            setCommentContent('');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error sending comment.');
            console.error(error);
        } finally {
            setIsSendingComment(false);
        }
    };

    // Scroll to bottom when comments tab is opened or when new comments are added
    useEffect(() => {
        if (activeTab === 'comments') {
            // Use setTimeout to ensure the DOM is updated
            setTimeout(() => {
                // Try to find the ScrollArea viewport and scroll it
                const scrollArea = scrollAreaRef.current;
                if (scrollArea) {
                    const viewport = scrollArea.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
                    if (viewport) {
                        viewport.scrollTo({
                            top: viewport.scrollHeight,
                            behavior: 'smooth'
                        });
                    }
                } else {
                    // Fallback to scrollIntoView
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }
            }, 150);
        }
    }, [activeTab, comments.length]);

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader className="text-2xl font-bold">
                    {project?.projectName} IV&V Report
                    <Badge
                        variant="outline"
                        className={
                            report?.currentStatus === 'On Track'
                                ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
                                : report?.currentStatus === 'Minor Issues'
                                    ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5'
                                    : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5'
                        }
                    >
                        {report?.currentStatus}
                    </Badge>
                    <CardAction>
                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <Button
                                    variant={report?.aproved ? "outline" : "default"}
                                    className="cursor-pointer"
                                    onClick={handleToggleApproval}
                                    disabled={isTogglingApproval}
                                >
                                    {report?.aproved ? (
                                        <>
                                            <XCircleIcon />
                                            {isTogglingApproval ? 'Unapproving...' : 'Unapprove Report'}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2Icon />
                                            {isTogglingApproval ? 'Approving...' : 'Approve Report'}
                                        </>
                                    )}
                                </Button>
                            )}
                            {!isAdmin && (
                                <Button
                                    variant="default"
                                    className="cursor-pointer"
                                    asChild
                                >
                                    <Link href={`/dashboard/reports/${reportId}/edit`}>
                                        <PencilIcon className="mr-2 size-4" />
                                        Edit Report
                                    </Link>
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <DownloadIcon />
                                            Download
                                        </div>
                                        <ChevronDownIcon className="ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file?id=${report?.attachmentId}`}
                                            target="_blank"
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <DownloadIcon />
                                            Download Original Report
                                        </Link>
                                    </DropdownMenuItem>
                                    {report?.finalAttachmentId && (
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file?id=${report.finalAttachmentId}`}
                                                target="_blank"
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <DownloadIcon />
                                                Download Final Report
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <Card>
                        <CardContent className="grid grid-cols-3 gap-4">
                            <div className="flex flex-row gap-2">
                                <Building2Icon
                                    className="size-5"
                                />
                                <div className="flex flex-col">
                                    <p className="text-xs text-muted-foreground">Agency</p>
                                    <p className="text-sm font-medium">{project?.sponsoringAgency ?? '-'}</p>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <Users
                                    className="size-5"
                                />
                                <div className="flex flex-col">
                                    <p className="text-xs text-muted-foreground">Vendor</p>
                                    <p className="text-sm font-medium">{project?.vendorName ?? '-'}</p>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <Clock
                                    className="size-5"
                                />
                                <div className="flex flex-col">
                                    <p className="text-xs text-muted-foreground">Reporting Period</p>
                                    <p className="text-sm font-medium">{report?.month}/{report?.year ?? '-'}</p>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <User
                                    className="size-5"
                                />
                                <div className="flex flex-col">
                                    <p className="text-xs text-muted-foreground">Submitted by</p>
                                    <p className="text-sm font-medium">{reportAuthor?.name ?? '-'}</p>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <Calendar
                                    className="size-5"
                                />
                                <div className="flex flex-col">
                                    <p className="text-xs text-muted-foreground">Submitted</p>
                                    <p className="text-sm font-medium">{formatDate(report?.updatedAt) ?? '-'}</p>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <CircleAlert
                                    className="size-5"
                                />
                                <div className="flex flex-col">
                                    <p className="text-xs text-muted-foreground">Approval Status</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{report?.aproved ? 'Approved' : 'Pending'}</p>
                                        {report?.aproved && (
                                            <CheckCircle2Icon className="size-4 text-green-600 dark:text-green-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex flex-row gap-2 bg-background rounded-lg border mb-2">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer">Overview</TabsTrigger>
                    <TabsTrigger value="findings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer">Findings & Recommendations</TabsTrigger>
                    <TabsTrigger value="attachments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer">Attachments</TabsTrigger>
                    <TabsTrigger value="comments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer">Comments</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>Project Overview</CardTitle>
                                <CardDescription>
                                    Summary of the IV&V assessment
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                {report?.summary}
                            </CardContent>
                        </Card>
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Status Indicators</CardTitle>
                                <CardDescription>
                                    Key performance metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {report?.currentStatus && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-medium">Overall Status</p>
                                        <Badge
                                            variant="outline"
                                            className={
                                                report.currentStatus === 'On Track'
                                                    ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5 w-fit'
                                                    : report.currentStatus === 'Minor Issues'
                                                        ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5 w-fit'
                                                        : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5 w-fit'
                                            }
                                        >
                                            {report.currentStatus}
                                        </Badge>
                                    </div>
                                )}
                                {report?.teamPerformance && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-medium">Team Performance</p>
                                        <Badge
                                            variant="outline"
                                            className={
                                                report.teamPerformance === 'On Track'
                                                    ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5 w-fit'
                                                    : report.teamPerformance === 'Minor Issues'
                                                        ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5 w-fit'
                                                        : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5 w-fit'
                                            }
                                        >
                                            {report.teamPerformance}
                                        </Badge>
                                    </div>
                                )}
                                {report?.projectManagement && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-medium">Project Management</p>
                                        <Badge
                                            variant="outline"
                                            className={
                                                report.projectManagement === 'On Track'
                                                    ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5 w-fit'
                                                    : report.projectManagement === 'Minor Issues'
                                                        ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5 w-fit'
                                                        : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5 w-fit'
                                            }
                                        >
                                            {report.projectManagement}
                                        </Badge>
                                    </div>
                                )}
                                {report?.technicalReadiness && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-medium">Technical Readiness</p>
                                        <Badge
                                            variant="outline"
                                            className={
                                                report.technicalReadiness === 'On Track'
                                                    ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5 w-fit'
                                                    : report.technicalReadiness === 'Minor Issues'
                                                        ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5 w-fit'
                                                        : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5 w-fit'
                                            }
                                        >
                                            {report.technicalReadiness}
                                        </Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Key Highlights</CardTitle>
                            <CardDescription>
                                Document accomplishments, challenges, and upcoming milestones
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {report?.accomplishments && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-semibold">Key Accomplishments</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.accomplishments}</p>
                                </div>
                            )}
                            {report?.challenges && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-semibold">Challenges and Issues</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.challenges}</p>
                                </div>
                            )}
                            {report?.upcomingMilestones && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-semibold">Upcoming Milestones</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.upcomingMilestones}</p>
                                </div>
                            )}
                            {!report?.accomplishments && !report?.challenges && !report?.upcomingMilestones && (
                                <div className='flex flex-col items-center justify-center p-8 gap-2'>
                                    <CircleAlert className="size-8 text-muted-foreground" />
                                    <p className='text-muted-foreground text-sm'>No key highlights have been added to this report yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Budget & Schedule Status</CardTitle>
                            <CardDescription>
                                Provide current status for budget and schedule
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {report?.budgetStatus && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-semibold">Budget Status</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.budgetStatus}</p>
                                </div>
                            )}
                            {report?.scheduleStatus && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-semibold">Schedule Status</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.scheduleStatus}</p>
                                </div>
                            )}
                            {report?.riskSummary && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-semibold">Key Risks and Mitigation Strategies</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.riskSummary}</p>
                                </div>
                            )}
                            {!report?.budgetStatus && !report?.scheduleStatus && !report?.riskSummary && (
                                <div className='flex flex-col items-center justify-center p-8 gap-2'>
                                    <CircleAlert className="size-8 text-muted-foreground" />
                                    <p className='text-muted-foreground text-sm'>No budget and schedule information has been added to this report yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="findings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Findings & Recommendations</CardTitle>
                            <CardDescription>
                                Key observations and suggested actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {findings.length === 0 ? (
                                <div className='flex flex-col items-center justify-center p-8 gap-2'>
                                    <CircleAlert className="size-8 text-muted-foreground" />
                                    <p className='text-muted-foreground text-sm'>No findings have been added to this report yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {findings.map((finding) => (
                                        <div key={finding._id} className="relative pl-4 border-l-2 border-primary">
                                            <div className="flex flex-col gap-2 mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-lg">
                                                        Finding #{finding.findingNumber}
                                                    </h3>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            finding.findingType === 'Risk'
                                                                ? 'rounded-full border-blue-600 bg-blue-600/10 text-blue-800 focus-visible:ring-blue-600/20 focus-visible:outline-none dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5'
                                                                : 'rounded-full border-orange-600 bg-orange-600/10 text-orange-800 focus-visible:ring-orange-600/20 focus-visible:outline-none dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5'
                                                        }
                                                    >
                                                        {finding.findingType}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            finding.status === 'Closed'
                                                                ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
                                                                : finding.status === 'In Progress'
                                                                    ? 'rounded-full border-blue-600 bg-blue-600/10 text-blue-800 focus-visible:ring-blue-600/20 focus-visible:outline-none dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5'
                                                                    : 'rounded-full border-orange-600 bg-orange-600/10 text-orange-800 focus-visible:ring-orange-600/20 focus-visible:outline-none dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5'
                                                        }
                                                    >
                                                        {finding.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            finding.impactRating === 'Low'
                                                                ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
                                                                : finding.impactRating === 'Medium'
                                                                    ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5'
                                                                    : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5'
                                                        }
                                                    >
                                                        Impact: {finding.impactRating}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            finding.likelihoodRating === 'Low'
                                                                ? 'rounded-full border-green-600 bg-green-600/10 text-green-800 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
                                                                : finding.likelihoodRating === 'Medium'
                                                                    ? 'rounded-full border-yellow-600 bg-yellow-600/10 text-yellow-800 focus-visible:ring-yellow-600/20 focus-visible:outline-none dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5'
                                                                    : 'rounded-full border-red-600 bg-red-600/10 text-red-800 focus-visible:ring-red-600/20 focus-visible:outline-none dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5'
                                                        }
                                                    >
                                                        Likelihood: {finding.likelihoodRating}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground mb-3">
                                                {finding.description}
                                            </p>
                                            <p className="text-sm">
                                                <span className="text-primary">Recommendation: {finding.recommendation}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="attachments">
                    <Card>
                        <CardHeader>
                            <CardTitle>Report Attachments</CardTitle>
                            <CardDescription>
                                View and manage report attachments
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Original Attachment */}
                            <div className="space-y-2">
                                <div>
                                    <h3 className="text-sm font-semibold">Original Attachment</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        The original report file submitted by the vendor
                                    </p>
                                </div>
                                {report?.attachmentId ? (
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex items-center justify-center size-12 rounded-lg bg-background border">
                                                <FileIcon className="size-6 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">Original Report</p>
                                                <p className="text-xs text-muted-foreground truncate">Submitted with the report</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file?id=${report.attachmentId}`}
                                                    target="_blank"
                                                    download
                                                >
                                                    <DownloadIcon className="size-4 mr-2" />
                                                    Download
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
                                        <CircleAlert className="size-10 text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">No original attachment available</p>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t" />

                            {/* Final Attachment */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold">Final Attachment</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Upload the final approved version of the report
                                    </p>
                                </div>

                                {report?.finalAttachmentId ? (
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex items-center justify-center size-12 rounded-lg bg-background border">
                                                <FileIcon className="size-6 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">Final Report</p>
                                                <p className="text-xs text-muted-foreground truncate">Final approved version</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/file?id=${report.finalAttachmentId}`}
                                                    target="_blank"
                                                    download
                                                >
                                                    <DownloadIcon className="size-4 mr-2" />
                                                    Download
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
                                        <UploadIcon className="size-10 text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground mb-4">No final attachment uploaded</p>
                                    </div>
                                )}

                                {/* Upload Section */}
                                <div className="space-y-2">
                                    <Label htmlFor="final-attachment" className="text-sm font-medium">
                                        {report?.finalAttachmentId ? 'Replace Final Attachment' : 'Upload Final Attachment'}
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            id="final-attachment"
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            disabled={isUploading}
                                            className="flex-1"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                handleFinalAttachmentUpload(file);
                                                e.target.value = '';
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Accepted formats: PDF, DOC, DOCX
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="comments">
                    <Card>
                        <CardHeader>
                            <CardTitle>Comments</CardTitle>
                            <CardDescription>
                                Discuss this report with your peers and admins
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <ScrollArea className="h-[200px] pr-4" ref={scrollAreaRef}>
                                <div className="flex min-h-[200px] flex-col space-y-4">
                                    {comments.length === 0 ? (
                                        <div className="flex flex-1 items-center justify-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                                                <CircleAlert className="size-8 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">No comments yet. Start the conversation!</span>
                                            </div>
                                        </div>
                                    ) : (
                                        comments.map((comment) => (
                                            <div key={comment._id} className="flex gap-3">
                                                <Avatar className="size-8">
                                                    <AvatarImage src={comment.author?.imageUrl} alt={comment.author?.name} />
                                                    <AvatarFallback className="text-xs">
                                                        {comment.author?.name?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold">{comment.author?.name || 'Unknown User'}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDateTime(comment._creationTime)}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-foreground whitespace-pre-wrap break-all">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>
                            <div className="pt-4 border-t">
                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder="Type your message..."
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendComment();
                                            }
                                        }}
                                        className="flex-1 min-h-[30px] resize-none"
                                        disabled={isSendingComment}
                                    />
                                    <Button
                                        onClick={handleSendComment}
                                        disabled={!commentContent.trim() || isSendingComment}
                                        className="self-end cursor-pointer"
                                    >
                                        <SendIcon className="size-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Press Enter to send, Shift+Enter for new line
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
