import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    Check,
    ChevronLeft,
    ChevronRight,
    Copy,
    ExternalLink,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Users,
    UserPlus,
    X,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { archive as archiveRecipient } from '@/routes/admin/recipients';
import { index as recipientsIndex } from '@/routes/admin/recipients';
import { rotate as rotateRecipient } from '@/routes/admin/recipients';
import { store as storeRecipient } from '@/routes/admin/recipients';
import { update as updateRecipient } from '@/routes/admin/recipients';
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
import { Spinner } from '@/components/ui/spinner';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useClipboard } from '@/hooks/use-clipboard';

type Recipient = {
    id: number;
    displayName: string;
    link: string;
    message: string;
    archived: boolean;
};

type RecipientStatus = 'all' | 'active' | 'archived';

type RecipientPagination = {
    data: Recipient[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    recipients: RecipientPagination;
    filters: {
        search: string;
        status: RecipientStatus;
    };
};

export default function Recipients({ recipients, filters }: Props) {
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [status, setStatus] = useState<RecipientStatus>(filters.status);
    const [copied, copy] = useClipboard();

    useEffect(() => {
        setSearchTerm(filters.search);
        setStatus(filters.status);
    }, [filters.search, filters.status]);

    const hasActiveFilters = searchTerm.trim() !== '' || status !== 'all';

    function queryForPage(page: number): Record<string, string | number> {
        const query: Record<string, string | number> = {};
        const normalizedSearch = searchTerm.trim();

        if (normalizedSearch !== '') {
            query.search = normalizedSearch;
        }

        if (status !== 'all') {
            query.status = status;
        }

        if (page > 1) {
            query.page = page;
        }

        return query;
    }

    function visitRecipients(page: number): void {
        router.get(recipientsIndex.url(), queryForPage(page), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    function submitFilters(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        visitRecipients(1);
    }

    function clearFilters(): void {
        setSearchTerm('');
        setStatus('all');
        router.get(
            recipientsIndex.url(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    }

    function createRecipient(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        setCreating(true);

        router.post(
            storeRecipient.url({ query: queryForPage(1) }),
            { display_name: newName },
            {
                preserveScroll: true,
                onSuccess: () => setNewName(''),
                onFinish: () => setCreating(false),
            },
        );
    }

    function startEditing(recipient: Recipient): void {
        setEditingId(recipient.id);
        setEditingName(recipient.displayName);
    }

    function updateRecipientName(
        event: FormEvent<HTMLFormElement>,
        recipient: Recipient,
    ): void {
        event.preventDefault();

        router.patch(
            updateRecipient.url(recipient, { query: queryForPage(1) }),
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

            <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:px-6 sm:py-10 lg:px-8">
                <header className="border-border/80 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Invitation recipients
                            </h1>
                            <Badge variant="secondary">
                                {recipients.total}{' '}
                                {hasActiveFilters ? 'matching' : 'total'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Create personalized links for the people and groups
                            receiving your invitation.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/admin/invitation">Edit invitation</Link>
                    </Button>
                </header>

                <div className="flex flex-col gap-3">
                    <section
                        aria-label="Create recipient"
                        className="bg-card rounded-lg border p-1.5 shadow-sm"
                    >
                        <form
                            className="flex min-w-0 items-center gap-2"
                            onSubmit={createRecipient}
                        >
                            <InputGroup className="min-w-0 flex-1 border-0 shadow-none">
                                <InputGroupInput
                                    className="text-base sm:text-sm"
                                    value={newName}
                                    onChange={(event) =>
                                        setNewName(event.target.value)
                                    }
                                    placeholder="e.g. Mr. & Mrs. Smith"
                                    aria-label="Recipient display name"
                                    required
                                    maxLength={255}
                                />
                                <InputGroupAddon className="order-first">
                                    <UserPlus aria-hidden="true" />
                                </InputGroupAddon>
                            </InputGroup>
                            <Button
                                type="submit"
                                className="h-9 shrink-0 px-3 sm:px-4"
                                disabled={creating}
                            >
                                {creating ? (
                                    <Spinner data-icon="inline-start" />
                                ) : (
                                    <Plus data-icon="inline-start" />
                                )}
                                <span className="hidden sm:inline">
                                    {creating ? 'Adding…' : 'Add recipient'}
                                </span>
                                <span className="sm:hidden">
                                    {creating ? 'Adding…' : 'Add'}
                                </span>
                            </Button>
                        </form>
                    </section>

                    <form
                        className="flex flex-wrap items-center gap-2"
                        onSubmit={submitFilters}
                    >
                        <div className="w-full min-w-0 sm:w-96 sm:max-w-sm sm:flex-1">
                            <label
                                htmlFor="recipient-search"
                                className="sr-only"
                            >
                                Search recipients
                            </label>
                            <InputGroup className="h-9 min-w-0">
                                <InputGroupInput
                                    id="recipient-search"
                                    className="text-base sm:text-sm"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    placeholder="Search recipients..."
                                    aria-label="Search recipient names"
                                    maxLength={255}
                                />
                                <InputGroupAddon className="order-first">
                                    <Search aria-hidden="true" />
                                </InputGroupAddon>
                            </InputGroup>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="recipient-status"
                                className="sr-only"
                            >
                                Status
                            </label>
                            <Select
                                value={status}
                                onValueChange={(value) =>
                                    setStatus(value as RecipientStatus)
                                }
                            >
                                <SelectTrigger
                                    id="recipient-status"
                                    className="h-9 w-[140px] shrink-0"
                                    aria-label="Filter recipients by status"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All recipients
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Active only
                                    </SelectItem>
                                    <SelectItem value="archived">
                                        Archived only
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Button
                                type="submit"
                                variant="outline"
                                className="h-9 text-xs"
                            >
                                Apply
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 text-xs"
                                disabled={!hasActiveFilters}
                                onClick={clearFilters}
                            >
                                <X aria-hidden="true" /> Reset
                            </Button>
                        </div>
                    </form>
                </div>

                {recipients.total > 0 && (
                    <p className="text-muted-foreground text-sm">
                        Showing {recipients.from}–{recipients.to} of{' '}
                        {recipients.total} recipients
                    </p>
                )}

                {recipients.data.length === 0 ? (
                    <Card>
                        <CardContent className="text-muted-foreground flex flex-col items-center gap-3 p-8 text-center text-sm">
                            <Users className="size-8" aria-hidden="true" />
                            <p>
                                {hasActiveFilters
                                    ? 'No recipients match these filters.'
                                    : 'No recipients yet. Add the first personalized link above.'}
                            </p>
                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                >
                                    Clear filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                            {recipients.data.map((recipient) => (
                                <Card
                                    key={recipient.id}
                                    className="h-full min-w-0 gap-4 rounded-xl py-5 shadow-sm"
                                >
                                    <CardHeader className="px-5">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1 space-y-1">
                                                {editingId === recipient.id ? (
                                                    <form
                                                        className="flex flex-wrap gap-2"
                                                        onSubmit={(event) =>
                                                            updateRecipientName(
                                                                event,
                                                                recipient,
                                                            )
                                                        }
                                                    >
                                                        <Input
                                                            value={editingName}
                                                            onChange={(event) =>
                                                                setEditingName(
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            aria-label={`Edit ${recipient.displayName}`}
                                                            required
                                                            maxLength={255}
                                                            autoFocus
                                                        />
                                                        <Button
                                                            type="submit"
                                                            size="sm"
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                setEditingId(
                                                                    null,
                                                                )
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </form>
                                                ) : (
                                                    <CardTitle className="text-base break-words">
                                                        {recipient.displayName}
                                                    </CardTitle>
                                                )}
                                                <CardDescription className="text-xs">
                                                    {recipient.archived
                                                        ? 'Archived recipient'
                                                        : 'Active personalized link'}
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                className={
                                                    recipient.archived
                                                        ? 'shrink-0 rounded-full'
                                                        : 'shrink-0 rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                }
                                                variant={
                                                    recipient.archived
                                                        ? 'outline'
                                                        : 'secondary'
                                                }
                                            >
                                                {!recipient.archived && (
                                                    <span
                                                        className="size-1.5 rounded-full bg-emerald-500"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                {recipient.archived
                                                    ? 'Archived'
                                                    : 'Active'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex min-w-0 flex-1 flex-col gap-3 px-5">
                                        <div className="bg-muted/30 flex min-w-0 items-center gap-2 rounded-lg border p-2.5">
                                            <a
                                                className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs"
                                                title={recipient.link}
                                                href={recipient.link}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {recipient.link}
                                            </a>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-6 shrink-0"
                                                aria-label={`Copy link for ${recipient.displayName}`}
                                                onClick={() =>
                                                    void copy(recipient.link)
                                                }
                                            >
                                                {copied === recipient.link ? (
                                                    <Check />
                                                ) : (
                                                    <Copy />
                                                )}
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-3 [&_a]:text-xs [&_button]:px-2 [&_button]:text-xs [&_svg]:size-3.5">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    void copy(recipient.link)
                                                }
                                            >
                                                {copied === recipient.link ? (
                                                    <Check />
                                                ) : (
                                                    <Copy />
                                                )}
                                                {copied === recipient.link
                                                    ? 'Copied'
                                                    : 'Copy link'}
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    void copy(recipient.message)
                                                }
                                            >
                                                {copied ===
                                                recipient.message ? (
                                                    <Check />
                                                ) : (
                                                    <Copy />
                                                )}
                                                {copied === recipient.message
                                                    ? 'Copied'
                                                    : 'Copy message'}
                                            </Button>
                                            <Button
                                                asChild
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                            >
                                                <a
                                                    href={recipient.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label={`Open ${recipient.displayName} invitation`}
                                                >
                                                    <ExternalLink />
                                                    Open
                                                </a>
                                            </Button>
                                        </div>
                                        <div className="text-muted-foreground mt-2 flex flex-wrap items-center justify-between gap-1 border-t pt-3 empty:hidden [&_button]:h-9 [&_button]:px-0 [&_button]:text-xs [&_svg]:size-3.5">
                                            {!recipient.archived && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            startEditing(
                                                                recipient,
                                                            )
                                                        }
                                                    >
                                                        <Pencil />
                                                        Edit name
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            router.post(
                                                                rotateRecipient.url(
                                                                    recipient,
                                                                    {
                                                                        query: queryForPage(
                                                                            1,
                                                                        ),
                                                                    },
                                                                ),
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
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
                                                                archiveRecipient.url(
                                                                    recipient,
                                                                    {
                                                                        query: queryForPage(
                                                                            1,
                                                                        ),
                                                                    },
                                                                ),
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
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

                        {recipients.last_page > 1 && (
                            <nav
                                aria-label="Recipients pagination"
                                className="flex flex-wrap items-center justify-between gap-3"
                            >
                                {recipients.current_page > 1 ? (
                                    <Button asChild variant="outline" size="sm">
                                        <Link
                                            href={recipientsIndex.url({
                                                query: queryForPage(
                                                    recipients.current_page - 1,
                                                ),
                                            })}
                                            preserveScroll
                                            preserveState
                                        >
                                            <ChevronLeft data-icon="inline-start" />
                                            Previous
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled
                                    >
                                        <ChevronLeft data-icon="inline-start" />
                                        Previous
                                    </Button>
                                )}
                                <span className="text-muted-foreground text-sm">
                                    Page {recipients.current_page} of{' '}
                                    {recipients.last_page}
                                </span>
                                {recipients.current_page <
                                recipients.last_page ? (
                                    <Button asChild variant="outline" size="sm">
                                        <Link
                                            href={recipientsIndex.url({
                                                query: queryForPage(
                                                    recipients.current_page + 1,
                                                ),
                                            })}
                                            preserveScroll
                                            preserveState
                                        >
                                            Next
                                            <ChevronRight data-icon="inline-end" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled
                                    >
                                        Next
                                        <ChevronRight data-icon="inline-end" />
                                    </Button>
                                )}
                            </nav>
                        )}
                    </>
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
