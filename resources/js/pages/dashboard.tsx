import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    FilePenLine,
    MessageSquare,
    Settings2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

export default function Dashboard() {
    const { isAdmin } = usePage<{ isAdmin: boolean }>().props;

    return (
        <>
            <Head title="Dashboard" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Admin dashboard
                            </h1>
                            <Badge variant="secondary">Overview</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Manage your invitation and keep guest activity
                            moving.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/invitation">
                            Edit invitation
                            <ArrowUpRight />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {isAdmin && (
                        <Card>
                            <CardHeader>
                                <div className="bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-lg">
                                    <FilePenLine className="size-5" />
                                </div>
                                <CardTitle>Invitation content</CardTitle>
                                <CardDescription>
                                    Update the event details, gallery, story,
                                    and gifts.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link href="/admin/invitation">
                                        Open editor
                                        <ArrowUpRight />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <div className="bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-lg">
                                <MessageSquare className="size-5" />
                            </div>
                            <CardTitle>Wish moderation</CardTitle>
                            <CardDescription>
                                Review guest messages before they appear on the
                                invitation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <Link href="/moderation/wishes">
                                    Review wishes
                                    <ArrowUpRight />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-lg">
                                <Settings2 className="size-5" />
                            </div>
                            <CardTitle>Account settings</CardTitle>
                            <CardDescription>
                                Manage your profile, appearance, security, and
                                passkeys.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <Link href="/settings/profile">
                                    Open settings
                                    <ArrowUpRight />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick start</CardTitle>
                        <CardDescription>
                            Keep these next steps handy while preparing your
                            invitation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
                        <div className="rounded-lg border p-4">
                            <p className="font-medium">
                                1. Complete your content
                            </p>
                            <p className="text-muted-foreground mt-1">
                                Add your event information and photos.
                            </p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <p className="font-medium">2. Preview the result</p>
                            <p className="text-muted-foreground mt-1">
                                Check the invitation on mobile and desktop.
                            </p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <p className="font-medium">3. Moderate wishes</p>
                            <p className="text-muted-foreground mt-1">
                                Approve guest messages before publishing them.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
