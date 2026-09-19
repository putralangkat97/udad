import { Form, Head, Link } from '@inertiajs/react';
import WishModerationController from '@/actions/App/Http/Controllers/WishModerationController';
import { home } from '@/routes';

type PendingWish = {
    id: number;
    name: string;
    message: string;
    created_at: string;
};

export default function Wishes({ wishes }: { wishes: PendingWish[] }) {
    return (
        <>
            <Head title="Wish moderation" />

            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold">
                            Wish moderation
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Review guest messages before they appear publicly.
                        </p>
                    </div>
                    <Link
                        href={home()}
                        className="text-sm underline underline-offset-4"
                    >
                        View invitation
                    </Link>
                </div>

                {wishes.length === 0 ? (
                    <p className="text-muted-foreground rounded-lg border p-6 text-center text-sm">
                        There are no pending wishes.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {wishes.map((wish) => (
                            <article
                                key={wish.id}
                                className="rounded-lg border p-5"
                            >
                                <div className="space-y-2">
                                    <h2 className="font-medium">{wish.name}</h2>
                                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                                        {wish.message}
                                    </p>
                                    <time
                                        className="text-muted-foreground block text-xs"
                                        dateTime={wish.created_at}
                                    >
                                        {new Date(
                                            wish.created_at,
                                        ).toLocaleString()}
                                    </time>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Form
                                        {...WishModerationController.publish.form(
                                            wish,
                                        )}
                                    >
                                        {({ processing }) => (
                                            <button
                                                type="submit"
                                                className="bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? 'Publishing...'
                                                    : 'Publish'}
                                            </button>
                                        )}
                                    </Form>
                                    <Form
                                        {...WishModerationController.reject.form(
                                            wish,
                                        )}
                                    >
                                        {({ processing }) => (
                                            <button
                                                type="submit"
                                                className="rounded-md border px-3 py-2 text-sm"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? 'Rejecting...'
                                                    : 'Reject'}
                                            </button>
                                        )}
                                    </Form>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
