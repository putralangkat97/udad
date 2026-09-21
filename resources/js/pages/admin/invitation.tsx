import { Head, Link, router } from '@inertiajs/react';
import { useId, useMemo, useState } from 'react';

type JsonMap = Record<string, unknown>;

type MediaAsset = {
    id: number;
    name: string;
    url: string;
    mimeType: string;
    size: number;
    uploadedAt?: string;
    archived: boolean;
};

type Props = {
    content: JsonMap;
    hasDraft: boolean;
    publishedBy?: string;
    publishedAt?: string;
    media: MediaAsset[];
};

const sections = [
    ['general', 'General and cover'],
    ['couple', 'Couple and parents'],
    ['events', 'Events and countdown'],
    ['opening', 'Opening quote'],
    ['gifts', 'Gifts'],
    ['gallery', 'Gallery'],
    ['story', 'Love story'],
] as const;

const navigationSections = [
    ...sections,
    ['media', 'Media library'],
    ['publish', 'Publish'],
] as const;

function objectValue(value: unknown): JsonMap {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as JsonMap)
        : {};
}

function stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function cloneContent(content: JsonMap): JsonMap {
    return JSON.parse(JSON.stringify(content)) as JsonMap;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    return `${Math.ceil(bytes / 1024)} KB`;
}

function TextField({
    label,
    value,
    onChange,
    multiline = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
}) {
    const id = useId();

    return (
        <label className="grid gap-1 text-sm" htmlFor={id}>
            <span>{label}</span>
            {multiline ? (
                <textarea
                    id={id}
                    className="min-h-24 rounded-md border bg-transparent p-2"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            ) : (
                <input
                    id={id}
                    className="h-9 rounded-md border bg-transparent px-2"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            )}
        </label>
    );
}

function AssetField({
    label,
    value,
    onChange,
    media,
    kind,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    media: MediaAsset[];
    kind: 'image' | 'audio';
}) {
    const assets = media.filter(
        (asset) =>
            !asset.archived &&
            (kind === 'audio'
                ? asset.mimeType.startsWith('audio/')
                : asset.mimeType.startsWith('image/')),
    );

    return (
        <div className="grid gap-1 text-sm">
            <TextField label={label} value={value} onChange={onChange} />
            <select
                className="h-9 rounded-md border bg-transparent px-2"
                value={assets.some((asset) => asset.url === value) ? value : ''}
                onChange={(event) => {
                    if (event.target.value) {
                        onChange(event.target.value);
                    }
                }}
            >
                <option value="">Choose managed {kind} asset</option>
                {assets.map((asset) => (
                    <option key={asset.id} value={asset.url}>
                        {asset.name} ({asset.mimeType})
                    </option>
                ))}
            </select>
        </div>
    );
}

export default function InvitationAdmin({
    content,
    hasDraft,
    publishedBy,
    publishedAt,
    media,
}: Props) {
    const [draft, setDraft] = useState<JsonMap>(() => cloneContent(content));
    const [serverError, setServerError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const mediaCount = useMemo(
        () => media.filter((asset) => !asset.archived).length,
        [media],
    );

    const cover = objectValue(draft.cover);
    const couple = objectValue(draft.couple);
    const bride = objectValue(couple.bride);
    const groom = objectValue(couple.groom);
    const opening = objectValue(draft.opening);
    const countdown = objectValue(draft.countdown);
    const gallery = Array.isArray(draft.gallery)
        ? draft.gallery.map((image) => objectValue(image))
        : [];
    const story = objectValue(draft.story);
    const storyEntries = Array.isArray(story.entries)
        ? story.entries.map((entry) => objectValue(entry))
        : [];
    const gifts = objectValue(draft.gifts);
    const giftAccounts = Array.isArray(gifts.accounts)
        ? gifts.accounts.map((account) => objectValue(account))
        : [];
    const profiles = [
        { label: 'Bride', profile: bride, key: 'bride' },
        { label: 'Groom', profile: groom, key: 'groom' },
    ] as const;
    const events = Array.isArray(draft.events)
        ? draft.events.map((event) => objectValue(event))
        : [];

    function updatePath(path: string[], value: string): void {
        setDraft((current) => {
            const next = { ...current };
            let target = next;

            path.slice(0, -1).forEach((key) => {
                const child = { ...objectValue(target[key]) };
                target[key] = child;
                target = child;
            });

            target[path[path.length - 1]] = value;
            return next;
        });
    }

    function updateEvent(index: number, key: string, value: string): void {
        const nextEvents = events.map((event) => ({ ...event }));
        nextEvents[index] = { ...nextEvents[index], [key]: value };
        setDraft((current) => ({ ...current, events: nextEvents }));
    }

    function addEvent(): void {
        setDraft((current) => ({
            ...current,
            events: [
                ...(Array.isArray(current.events) ? current.events : []),
                { name: '', date: '', time: '', venue: '', maps: '' },
            ],
        }));
    }

    function moveEvent(index: number, direction: -1 | 1): void {
        const nextIndex = index + direction;

        if (nextIndex < 0 || nextIndex >= events.length) {
            return;
        }

        const nextEvents = events.map((event) => ({ ...event }));
        [nextEvents[index], nextEvents[nextIndex]] = [
            nextEvents[nextIndex],
            nextEvents[index],
        ];
        setDraft((current) => ({ ...current, events: nextEvents }));
    }

    function removeEvent(index: number): void {
        setDraft((current) => ({
            ...current,
            events: events.filter((_, eventIndex) => eventIndex !== index),
        }));
    }

    function updateListItem(
        key: 'gifts.accounts' | 'gallery' | 'story.entries',
        index: number,
        field: string,
        value: string,
    ): void {
        const [root, nested] = key.split('.');
        const currentItems = nested
            ? root === 'gifts'
                ? giftAccounts
                : storyEntries
            : gallery;
        const nextItems = currentItems.map((item) => ({ ...item }));
        nextItems[index] = { ...nextItems[index], [field]: value };

        setDraft((current) =>
            nested
                ? {
                      ...current,
                      [root]: {
                          ...objectValue(current[root]),
                          entries: nextItems,
                      },
                  }
                : { ...current, [root]: nextItems },
        );
    }

    function addListItem(
        key: 'gifts.accounts' | 'gallery' | 'story.entries',
    ): void {
        const [root, nested] = key.split('.');
        const items = nested
            ? root === 'gifts'
                ? giftAccounts
                : storyEntries
            : gallery;
        const emptyItem = nested
            ? root === 'gifts'
                ? { bank: '', number: '', holder: '' }
                : { period: '', title: '', copy: '', ornament: '' }
            : { src: '', alt: '' };

        setDraft((current) =>
            nested
                ? {
                      ...current,
                      [root]: {
                          ...objectValue(current[root]),
                          entries: [...items, emptyItem],
                      },
                  }
                : { ...current, [root]: [...items, emptyItem] },
        );
    }

    function removeListItem(
        key: 'gifts.accounts' | 'gallery' | 'story.entries',
        index: number,
    ): void {
        const [root, nested] = key.split('.');
        const sourceItems = nested
            ? root === 'gifts'
                ? giftAccounts
                : storyEntries
            : gallery;
        const items = sourceItems.filter((_, itemIndex) => itemIndex !== index);

        setDraft((current) =>
            nested
                ? {
                      ...current,
                      [root]: { ...objectValue(current[root]), entries: items },
                  }
                : { ...current, [root]: items },
        );
    }

    function moveListItem(
        key: 'gifts.accounts' | 'gallery' | 'story.entries',
        index: number,
        direction: -1 | 1,
    ): void {
        const [root, nested] = key.split('.');
        const sourceItems = nested
            ? root === 'gifts'
                ? giftAccounts
                : storyEntries
            : gallery;
        const nextIndex = index + direction;

        if (nextIndex < 0 || nextIndex >= sourceItems.length) {
            return;
        }

        const items = sourceItems.map((item) => ({ ...item }));
        [items[index], items[nextIndex]] = [items[nextIndex], items[index]];

        setDraft((current) =>
            nested
                ? {
                      ...current,
                      [root]: {
                          ...objectValue(current[root]),
                          [nested]: items,
                      },
                  }
                : { ...current, [root]: items },
        );
    }

    function saveDraft(): void {
        router.post(
            '/admin/invitation/draft',
            { content: JSON.stringify(draft) },
            {
                onError: (errors) => {
                    setServerError(
                        errors.content ?? 'Unable to save the draft.',
                    );
                },
                onSuccess: () => setServerError(null),
            },
        );
    }

    function publish(): void {
        router.post('/admin/invitation/publish', undefined, {
            onError: (errors) => {
                setValidationErrors(Object.values(errors));
            },
            onSuccess: () => setValidationErrors([]),
        });
    }

    function upload(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setUploading(true);
        router.post('/admin/invitation/media', form, {
            onFinish: () => setUploading(false),
        });
    }

    return (
        <>
            <Head title="Invitation content" />

            <div className="space-y-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Invitation content
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Edit the draft, preview it, then publish the
                            complete invitation.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            className="rounded-md border px-3 py-2 text-sm"
                            href="/admin/invitation/preview"
                        >
                            Preview draft
                        </Link>
                        <button
                            className="bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm"
                            type="button"
                            onClick={publish}
                        >
                            Publish
                        </button>
                    </div>
                </div>

                <nav
                    className="flex flex-wrap gap-2 rounded-lg border p-3 text-sm"
                    aria-label="Invitation content sections"
                >
                    {navigationSections.map(([key, label]) => (
                        <a
                            className="hover:bg-muted rounded-md px-3 py-2 underline-offset-4 hover:underline"
                            href={`#${key}`}
                            key={key}
                        >
                            {label}
                        </a>
                    ))}
                </nav>

                <div id="publish" className="rounded-lg border p-4 text-sm">
                    <strong>
                        {hasDraft
                            ? 'Draft ready for review'
                            : 'Editing published content'}
                    </strong>
                    <span className="text-muted-foreground ml-2">
                        {publishedAt
                            ? `Last published${publishedBy ? ` by ${publishedBy}` : ''} ${new Date(publishedAt).toLocaleString()}`
                            : 'Not published yet'}
                    </span>
                </div>

                {serverError && (
                    <p className="text-destructive text-sm">{serverError}</p>
                )}

                {validationErrors.length > 0 && (
                    <div
                        className="text-destructive rounded-lg border p-4 text-sm"
                        role="alert"
                    >
                        <strong>Publish is blocked. Fix these fields:</strong>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                            {validationErrors.map((error, index) => (
                                <li key={`${error}-${index}`}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="space-y-6">
                    <section id="general" className="scroll-mt-6 space-y-4">
                        <h2 className="text-lg font-medium">
                            General and cover
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <TextField
                                label="Title"
                                value={stringValue(draft.title)}
                                onChange={(value) =>
                                    updatePath(['title'], value)
                                }
                            />
                            <TextField
                                label="Timezone"
                                value={stringValue(draft.timezone)}
                                onChange={(value) =>
                                    updatePath(['timezone'], value)
                                }
                            />
                            <AssetField
                                label="Audio"
                                value={stringValue(draft.audio)}
                                onChange={(value) =>
                                    updatePath(['audio'], value)
                                }
                                media={media}
                                kind="audio"
                            />
                        </div>
                        <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                            <h3 className="font-medium sm:col-span-2">Cover</h3>
                            {[
                                'eyebrow',
                                'title',
                                'names',
                                'date',
                                'guest',
                                'invitation',
                            ].map((key) => (
                                <TextField
                                    key={key}
                                    label={key}
                                    value={stringValue(cover[key])}
                                    onChange={(value) =>
                                        updatePath(['cover', key], value)
                                    }
                                />
                            ))}
                            <AssetField
                                label="image"
                                value={stringValue(cover.image)}
                                onChange={(value) =>
                                    updatePath(['cover', 'image'], value)
                                }
                                media={media}
                                kind="image"
                            />
                            <AssetField
                                label="footerOrnament"
                                value={stringValue(cover.footerOrnament)}
                                onChange={(value) =>
                                    updatePath(
                                        ['cover', 'footerOrnament'],
                                        value,
                                    )
                                }
                                media={media}
                                kind="image"
                            />
                        </div>
                    </section>

                    <section id="couple" className="scroll-mt-6 space-y-4">
                        <h2 className="text-lg font-medium">
                            Couple and parents
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {profiles.map(({ label, profile, key }) => (
                                <div
                                    className="space-y-3 rounded-lg border p-4"
                                    key={key}
                                >
                                    <h3 className="font-medium">{label}</h3>
                                    {['role', 'name', 'family'].map((field) => (
                                        <TextField
                                            key={field}
                                            label={field}
                                            value={stringValue(profile[field])}
                                            onChange={(value) =>
                                                updatePath(
                                                    ['couple', key, field],
                                                    value,
                                                )
                                            }
                                        />
                                    ))}
                                    <AssetField
                                        label="photo"
                                        value={stringValue(profile.photo)}
                                        onChange={(value) =>
                                            updatePath(
                                                ['couple', key, 'photo'],
                                                value,
                                            )
                                        }
                                        media={media}
                                        kind="image"
                                    />
                                    <AssetField
                                        label="frame"
                                        value={stringValue(profile.frame)}
                                        onChange={(value) =>
                                            updatePath(
                                                ['couple', key, 'frame'],
                                                value,
                                            )
                                        }
                                        media={media}
                                        kind="image"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="events" className="scroll-mt-6 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-medium">
                                Events and countdown
                            </h2>
                            <button
                                className="rounded-md border px-3 py-2 text-sm"
                                type="button"
                                onClick={addEvent}
                            >
                                Add event
                            </button>
                        </div>
                        <div className="space-y-4">
                            {events.map((event, index) => (
                                <div
                                    className="space-y-3 rounded-lg border p-4"
                                    key={index}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="font-medium">
                                            Event {index + 1}
                                        </h3>
                                        <div className="flex gap-2">
                                            <button
                                                className="rounded-md border px-2 py-1 text-xs"
                                                type="button"
                                                onClick={() =>
                                                    moveEvent(index, -1)
                                                }
                                                disabled={index === 0}
                                            >
                                                Up
                                            </button>
                                            <button
                                                className="rounded-md border px-2 py-1 text-xs"
                                                type="button"
                                                onClick={() =>
                                                    moveEvent(index, 1)
                                                }
                                                disabled={
                                                    index === events.length - 1
                                                }
                                            >
                                                Down
                                            </button>
                                            <button
                                                className="text-destructive rounded-md border px-2 py-1 text-xs"
                                                type="button"
                                                onClick={() =>
                                                    removeEvent(index)
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {[
                                            'name',
                                            'date',
                                            'time',
                                            'venue',
                                            'maps',
                                        ].map((field) => (
                                            <TextField
                                                key={field}
                                                label={field}
                                                value={stringValue(
                                                    event[field],
                                                )}
                                                onChange={(value) =>
                                                    updateEvent(
                                                        index,
                                                        field,
                                                        value,
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                            <h3 className="font-medium sm:col-span-2">
                                Countdown
                            </h3>
                            <TextField
                                label="Target"
                                value={stringValue(countdown.target)}
                                onChange={(value) =>
                                    updatePath(['countdown', 'target'], value)
                                }
                            />
                            <TextField
                                label="Label"
                                value={stringValue(countdown.label)}
                                onChange={(value) =>
                                    updatePath(['countdown', 'label'], value)
                                }
                            />
                            <AssetField
                                label="Frame"
                                value={stringValue(countdown.frame)}
                                onChange={(value) =>
                                    updatePath(['countdown', 'frame'], value)
                                }
                                media={media}
                                kind="image"
                            />
                        </div>
                    </section>

                    <section id="opening" className="scroll-mt-6 space-y-4">
                        <h2 className="text-lg font-medium">Opening quote</h2>
                        <TextField
                            label="Quote"
                            multiline
                            value={stringValue(opening.quote)}
                            onChange={(value) =>
                                updatePath(['opening', 'quote'], value)
                            }
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <TextField
                                label="Reference"
                                value={stringValue(opening.reference)}
                                onChange={(value) =>
                                    updatePath(['opening', 'reference'], value)
                                }
                            />
                            <AssetField
                                label="Frame"
                                value={stringValue(opening.frame)}
                                onChange={(value) =>
                                    updatePath(['opening', 'frame'], value)
                                }
                                media={media}
                                kind="image"
                            />
                        </div>
                    </section>

                    <section id="gifts" className="scroll-mt-6 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-medium">Gifts</h2>
                            <button
                                className="rounded-md border px-3 py-2 text-sm"
                                type="button"
                                onClick={() => addListItem('gifts.accounts')}
                            >
                                Add account
                            </button>
                        </div>
                        <TextField
                            label="Introduction"
                            multiline
                            value={stringValue(gifts.intro)}
                            onChange={(value) =>
                                updatePath(['gifts', 'intro'], value)
                            }
                        />
                        {giftAccounts.map((account, index) => (
                            <div
                                className="space-y-3 rounded-lg border p-4"
                                key={index}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="font-medium">
                                        Account {index + 1}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            className="rounded-md border px-2 py-1 text-xs"
                                            type="button"
                                            onClick={() =>
                                                moveListItem(
                                                    'gifts.accounts',
                                                    index,
                                                    -1,
                                                )
                                            }
                                            disabled={index === 0}
                                        >
                                            Up
                                        </button>
                                        <button
                                            className="rounded-md border px-2 py-1 text-xs"
                                            type="button"
                                            onClick={() =>
                                                moveListItem(
                                                    'gifts.accounts',
                                                    index,
                                                    1,
                                                )
                                            }
                                            disabled={
                                                index ===
                                                giftAccounts.length - 1
                                            }
                                        >
                                            Down
                                        </button>
                                        <button
                                            className="text-destructive rounded-md border px-2 py-1 text-xs"
                                            type="button"
                                            onClick={() =>
                                                removeListItem(
                                                    'gifts.accounts',
                                                    index,
                                                )
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {['bank', 'number', 'holder'].map(
                                        (field) => (
                                            <TextField
                                                key={field}
                                                label={field}
                                                value={stringValue(
                                                    account[field],
                                                )}
                                                onChange={(value) =>
                                                    updateListItem(
                                                        'gifts.accounts',
                                                        index,
                                                        field,
                                                        value,
                                                    )
                                                }
                                            />
                                        ),
                                    )}
                                </div>
                            </div>
                        ))}
                    </section>

                    <section id="gallery" className="scroll-mt-6 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-medium">Gallery</h2>
                            <button
                                className="rounded-md border px-3 py-2 text-sm"
                                type="button"
                                onClick={() => addListItem('gallery')}
                            >
                                Add image
                            </button>
                        </div>
                        {gallery.map((image, index) => (
                            <div
                                className="space-y-3 rounded-lg border p-4"
                                key={index}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="font-medium">
                                        Image {index + 1}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            className="rounded-md border px-2 py-1 text-xs"
                                            type="button"
                                            onClick={() =>
                                                moveListItem(
                                                    'gallery',
                                                    index,
                                                    -1,
                                                )
                                            }
                                            disabled={index === 0}
                                        >
                                            Up
                                        </button>
                                        <button
                                            className="rounded-md border px-2 py-1 text-xs"
                                            type="button"
                                            onClick={() =>
                                                moveListItem(
                                                    'gallery',
                                                    index,
                                                    1,
                                                )
                                            }
                                            disabled={
                                                index === gallery.length - 1
                                            }
                                        >
                                            Down
                                        </button>
                                        <button
                                            className="text-destructive rounded-md border px-2 py-1 text-xs"
                                            type="button"
                                            onClick={() =>
                                                removeListItem('gallery', index)
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <AssetField
                                    label="Image"
                                    value={stringValue(image.src)}
                                    onChange={(value) =>
                                        updateListItem(
                                            'gallery',
                                            index,
                                            'src',
                                            value,
                                        )
                                    }
                                    media={media}
                                    kind="image"
                                />
                                <TextField
                                    label="Alt text"
                                    value={stringValue(image.alt)}
                                    onChange={(value) =>
                                        updateListItem(
                                            'gallery',
                                            index,
                                            'alt',
                                            value,
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </section>

                    <section id="story" className="scroll-mt-6 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-medium">Love story</h2>
                            <button
                                className="rounded-md border px-3 py-2 text-sm"
                                type="button"
                                onClick={() => addListItem('story.entries')}
                            >
                                Add entry
                            </button>
                        </div>
                        {storyEntries.map((entry, index) => (
                            <div
                                className="space-y-3 rounded-lg border p-4"
                                key={index}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="font-medium">
                                        Entry {index + 1}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            className="rounded-md border px-2 py-1 text-xs"
                                            type="button"
                                            onClick={() =>
                                                moveListItem(
                                                    'story.entries',
                                                    index,
                                                    -1,
                                                )
                                            }
                                            disabled={index === 0}
                                        >
                                            Up
                                        </button>
                                        <button
                                            className="rounded-md border px-2 py-1 text-xs"
                                            type="button"
                                            onClick={() =>
                                                moveListItem(
                                                    'story.entries',
                                                    index,
                                                    1,
                                                )
                                            }
                                            disabled={
                                                index ===
                                                storyEntries.length - 1
                                            }
                                        >
                                            Down
                                        </button>
                                        <button
                                            className="text-destructive rounded-md border px-2 py-1 text-xs"
                                            type="button"
                                            onClick={() =>
                                                removeListItem(
                                                    'story.entries',
                                                    index,
                                                )
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <TextField
                                        label="Period"
                                        value={stringValue(entry.period)}
                                        onChange={(value) =>
                                            updateListItem(
                                                'story.entries',
                                                index,
                                                'period',
                                                value,
                                            )
                                        }
                                    />
                                    <TextField
                                        label="Title"
                                        value={stringValue(entry.title)}
                                        onChange={(value) =>
                                            updateListItem(
                                                'story.entries',
                                                index,
                                                'title',
                                                value,
                                            )
                                        }
                                    />
                                </div>
                                <TextField
                                    label="Copy"
                                    multiline
                                    value={stringValue(entry.copy)}
                                    onChange={(value) =>
                                        updateListItem(
                                            'story.entries',
                                            index,
                                            'copy',
                                            value,
                                        )
                                    }
                                />
                                <AssetField
                                    label="Ornament"
                                    value={stringValue(entry.ornament)}
                                    onChange={(value) =>
                                        updateListItem(
                                            'story.entries',
                                            index,
                                            'ornament',
                                            value,
                                        )
                                    }
                                    media={media}
                                    kind="image"
                                />
                            </div>
                        ))}
                    </section>
                </div>

                <button
                    className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm"
                    type="button"
                    onClick={saveDraft}
                >
                    Save draft
                </button>

                <section
                    id="media"
                    className="scroll-mt-6 space-y-4 rounded-lg border p-5"
                >
                    <div>
                        <h2 className="text-lg font-medium">Media library</h2>
                        <p className="text-muted-foreground text-sm">
                            {mediaCount} active asset(s).
                        </p>
                    </div>
                    <form
                        className="flex flex-wrap items-center gap-3"
                        onSubmit={upload}
                    >
                        <input
                            name="file"
                            type="file"
                            accept="image/*,audio/*"
                            required
                        />
                        <button
                            className="rounded-md border px-3 py-2 text-sm"
                            disabled={uploading}
                            type="submit"
                        >
                            {uploading ? 'Uploading…' : 'Upload media'}
                        </button>
                    </form>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {media.map((asset) => (
                            <div
                                className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                                key={asset.id}
                            >
                                <a
                                    className="truncate underline"
                                    href={asset.url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {asset.name}
                                </a>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-xs">
                                        {asset.archived
                                            ? 'Archived'
                                            : `${asset.mimeType} · ${formatBytes(asset.size)}`}
                                    </span>
                                    {!asset.archived && (
                                        <button
                                            className="text-xs underline"
                                            type="button"
                                            onClick={() =>
                                                router.post(
                                                    `/admin/invitation/media/${asset.id}/archive`,
                                                )
                                            }
                                        >
                                            Archive
                                        </button>
                                    )}
                                    {asset.archived && (
                                        <button
                                            className="text-destructive text-xs underline"
                                            type="button"
                                            onClick={() =>
                                                router.delete(
                                                    `/admin/invitation/media/${asset.id}`,
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}

InvitationAdmin.layout = {
    breadcrumbs: [{ title: 'Invitation content', href: '/admin/invitation' }],
};
