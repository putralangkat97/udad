import { Form, Head, Link } from '@inertiajs/react';
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

            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-semibold">
                                Wish moderation
                            </h1>
                            <Badge variant="secondary">Pending review</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Review guest messages before they appear publicly.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={home()}>View invitation</Link>
                    </Button>
                </div>

                {wishes.length === 0 ? (
                    <Card>
                        <CardContent className="text-muted-foreground p-6 text-center text-sm">
                            There are no pending wishes.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {wishes.map((wish) => (
                            <Card key={wish.id}>
                                <CardHeader>
                                    <CardTitle>{wish.name}</CardTitle>
                                    <CardDescription>
                                        <span>
                                            {wish.source === 'rsvp'
                                                ? `From RSVP${wish.attendance ? ` · ${wish.attendance.replace('_', ' ')}` : ''}${wish.guestCount ? ` · ${wish.guestCount} guest${wish.guestCount === 1 ? '' : 's'}` : ''}`
                                                : 'Direct wish'}
                                        </span>{' '}
                                        <time dateTime={wish.created_at}>
                                            {new Date(
                                                wish.created_at,
                                            ).toLocaleString()}
                                        </time>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                                        {wish.message}
                                    </p>

                                    <div className="mt-4 flex gap-2">
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
            </div>
        </>
    );
}
