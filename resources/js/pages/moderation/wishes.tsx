import { Form, Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Check, Clock3, X } from 'lucide-react';
import WishModerationController from '@/actions/App/Http/Controllers/WishModerationController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

type PendingWish = {
    id: number;
    name: string;
    message: string;
    created_at: string;
    source: 'direct' | 'rsvp';
    attendance?: string | null;
    guestCount?: number | null;
};

export default function Wishes({ wishes }: { wishes: PendingWish[] }) {
    return (
        <>
            <Head title="Wish moderation" />

            <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Pending wishes
                            </h1>
                            <Badge
                                variant={
                                    wishes.length > 0 ? 'secondary' : 'outline'
                                }
                            >
                                {wishes.length} pending
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Review guest messages before they appear publicly.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={home()}>
                            View invitation
                            <ArrowUpRight />
                        </Link>
                    </Button>
                </header>

                {wishes.length === 0 ? (
                    <Card>
                        <CardContent className="flex min-h-40 flex-col items-center justify-center gap-2 p-8 text-center">
                            <Check
                                className="text-primary size-8"
                                aria-hidden="true"
                            />
                            <p className="font-medium">All caught up</p>
                            <p className="text-muted-foreground text-sm">
                                There are no pending wishes to review.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 xl:grid-cols-2">
                        {wishes.map((wish) => (
                            <Card key={wish.id} className="h-full">
                                <CardHeader className="gap-3">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">
                                                {wish.name}
                                            </CardTitle>
                                            <CardDescription>
                                                {wish.source === 'rsvp'
                                                    ? `From RSVP${wish.attendance ? ` · ${wish.attendance.replace('_', ' ')}` : ''}${wish.guestCount ? ` · ${wish.guestCount} guest${wish.guestCount === 1 ? '' : 's'}` : ''}`
                                                    : 'Direct wish'}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline">Pending</Badge>
                                    </div>
                                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                        <Clock3
                                            className="size-3.5"
                                            aria-hidden="true"
                                        />
                                        <time dateTime={wish.created_at}>
                                            {new Date(
                                                wish.created_at,
                                            ).toLocaleString()}
                                        </time>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-1 flex-col gap-4">
                                    <blockquote className="bg-muted/30 min-h-24 rounded-lg border p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                        {wish.message}
                                    </blockquote>

                                    <div className="mt-auto flex flex-wrap gap-2">
                                        <Form
                                            {...WishModerationController.publish.form(
                                                wish,
                                            )}
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    <Check data-icon="inline-start" />
                                                    {processing
                                                        ? 'Publishing...'
                                                        : 'Publish'}
                                                </Button>
                                            )}
                                        </Form>
                                        <Form
                                            {...WishModerationController.reject.form(
                                                wish,
                                            )}
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    type="submit"
                                                    variant="outline"
                                                    disabled={processing}
                                                >
                                                    <X data-icon="inline-start" />
                                                    {processing
                                                        ? 'Rejecting...'
                                                        : 'Reject'}
                                                </Button>
                                            )}
                                        </Form>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}

Wishes.layout = {
    breadcrumbs: [{ title: 'Wish moderation', href: '/moderation/wishes' }],
};
