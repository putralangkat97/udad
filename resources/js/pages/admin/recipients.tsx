import { Head, Link, router } from '@inertiajs/react';
import { Archive, Check, Copy, ExternalLink, Pencil, RotateCcw, Users } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useClipboard } from '@/hooks/use-clipboard';

type Recipient = {
    id: number;
    displayName: string;
    link: string;
    message: string;
    archived: boolean;
};

type Props = {
    recipients: Recipient[];
};

export default function Recipients({ recipients }: Props) {
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [copied, copy] = useClipboard();

    function createRecipient(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        router.post(
            '/admin/recipients',
            { display_name: newName },
            {
                preserveScroll: true,
                onSuccess: () => setNewName(''),
            },
        );
    }

    function startEditing(recipient: Recipient): void {
        setEditingId(recipient.id);
        setEditingName(recipient.displayName);
    }

    function updateRecipient(
        event: FormEvent<HTMLFormElement>,
        recipient: Recipient,
    ): void {
        event.preventDefault();

        router.patch(
            `/admin/recipients/${recipient.id}`,
            { display_name: editingName },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingId(null);
                    setEditingName('');
                },
            },
        );
    }

    return (
        <>
            <Head title="Invitation recipients" />

            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Invitation recipients
                            </h1>
                            <Badge variant="secondary">
                                {recipients.length} total
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Create personalized links for the people and groups receiving your invitation.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/admin/invitation">Edit invitation</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Add recipient</CardTitle>
                        <CardDescription>
                            Use the exact name you want to show on the cover.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="flex flex-col gap-3 sm:flex-row"
                            onSubmit={createRecipient}
                        >
                            <Input
                                value={newName}
                                onChange={(event) => setNewName(event.target.value)}
                                placeholder="Mr. and Mrs. Smith"
                                aria-label="Recipient display name"
                                required
                                maxLength={255}
                            />
                            <Button type="submit">Create recipient</Button>
                        </form>
                    </CardContent>
                </Card>

                {recipients.length === 0 ? (
                    <Card>
                        <CardContent className="text-muted-foreground flex flex-col items-center gap-3 p-8 text-center text-sm">
                            <Users className="size-8" aria-hidden="true" />
                            <p>No recipients yet. Add the first personalized link above.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {recipients.map((recipient) => (
                            <Card key={recipient.id}>
                                <CardHeader>
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            {editingId === recipient.id ? (
                                                <form
                                                    className="flex flex-wrap gap-2"
                                                    onSubmit={(event) =>
                                                        updateRecipient(event, recipient)
                                                    }
                                                >
                                                    <Input
                                                        value={editingName}
                                                        onChange={(event) =>
                                                            setEditingName(event.target.value)
                                                        }
                                                        aria-label={`Edit ${recipient.displayName}`}
                                                        required
                                                        maxLength={255}
                                                        autoFocus
                                                    />
                                                    <Button type="submit" size="sm">
                                                        Save
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setEditingId(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </form>
                                            ) : (
                                                <CardTitle>{recipient.displayName}</CardTitle>
                                            )}
                                            <CardDescription>
                                                {recipient.archived
                                                    ? 'Archived recipient'
                                                    : 'Active personalized link'}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant={
                                                recipient.archived
                                                    ? 'outline'
                                                    : 'secondary'
                                            }
                                        >
                                            {recipient.archived ? 'Archived' : 'Active'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                                        <a
                                            className="truncate text-sm underline"
                                            href={recipient.link}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {recipient.link}
                                        </a>
                                        <div className="flex shrink-0 gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => void copy(recipient.link)}
                                            >
                                                {copied === recipient.link ? (
                                                    <Check />
                                                ) : (
                                                    <Copy />
                                                )}
                                                {copied === recipient.link ? 'Copied' : 'Copy link'}
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => void copy(recipient.message)}
                                            >
                                                {copied === recipient.message ? (
                                                    <Check />
                                                ) : (
                                                    <Copy />
                                                )}
                                                {copied === recipient.message
                                                    ? 'Copied'
                                                    : 'Copy message'}
                                            </Button>
                                            <Button asChild type="button" size="sm" variant="ghost">
                                                <a
                                                    href={recipient.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label={`Open ${recipient.displayName} invitation`}
                                                >
                                                    <ExternalLink />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {!recipient.archived && (
                                            <>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => startEditing(recipient)}
                                                >
                                                    <Pencil />
                                                    Edit name
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.post(
                                                            `/admin/recipients/${recipient.id}/rotate`,
                                                            {},
                                                            { preserveScroll: true },
                                                        )
                                                    }
                                                >
                                                    <RotateCcw />
                                                    Rotate link
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        router.post(
                                                            `/admin/recipients/${recipient.id}/archive`,
                                                            {},
                                                            { preserveScroll: true },
                                                        )
                                                    }
                                                >
                                                    <Archive />
                                                    Archive
                                                </Button>
                                            </>
                                        )}
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

Recipients.layout = {
    breadcrumbs: [
        { title: 'Invitation recipients', href: '/admin/recipients' },
    ],
};
