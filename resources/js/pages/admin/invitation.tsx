import { Head, router, useHttp } from '@inertiajs/react';
import {
    CalendarDays,
    Check,
    ChevronRight,
    Eye,
    Gift,
    Heart,
    Image,
    LayoutTemplate,
    Library,
    Quote,
    Rocket,
    Save,
    BookHeart,
} from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { uploadMedia } from '@/actions/App/Http/Controllers/AdminInvitationController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectGroup,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

function ImagePreview({ src, label }: { src: string; label: string }) {
    const [failed, setFailed] = useState(false);

    return (
        <div className="bg-muted/40 flex aspect-video items-center justify-center overflow-hidden rounded-lg border">
            {src && !failed ? (
                <img
                    src={src}
                    alt={`${label} preview`}
                    className="size-full object-contain"
                    loading="lazy"
                    onError={() => setFailed(true)}
                />
            ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2 p-4 text-center text-sm">
                    <Image className="size-8" aria-hidden="true" />
                    <p>
                        {failed
                            ? 'Image unavailable. Choose another image or check its URL.'
                            : 'Upload an image or choose one from your library.'}
                    </p>
                </div>
            )}
        </div>
    );
}

function ImageAssetField({
    label,
    value,
    onChange,
    media,
    onUpload,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    media: MediaAsset[];
    onUpload: (file: File) => Promise<string>;
}) {
    const id = useId();
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const assets = media.filter(
        (asset) => !asset.archived && asset.mimeType.startsWith('image/'),
    );

    async function uploadImage(file: File): Promise<void> {
        setError(null);
        if (
            !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
            file.size > 10 * 1024 * 1024
        ) {
            setError('Choose a JPG, PNG, or WebP image up to 10 MB.');
            return;
        }
        setUploading(true);
        try {
            onChange(await onUpload(file));
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Upload failed. Please try again.',
            );
        } finally {
            setUploading(false);
        }
    }

    return (
        <FieldGroup className="gap-3 rounded-lg border p-4">
            <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor={id}>{fieldLabel(label)}</FieldLabel>
                <ImagePreview
                    key={value}
                    src={value}
                    label={fieldLabel(label)}
                />
                <Input
                    id={id}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    aria-invalid={Boolean(error)}
                    aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
                    disabled={uploading}
                    onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = '';
                        if (file) void uploadImage(file);
                    }}
                />
                <p id={`${id}-help`} className="text-muted-foreground text-xs">
                    JPG, PNG or WebP · Up to 10 MB · Maximum 8000 × 8000 pixels.
                    Uploaded images are selected automatically.
                </p>
                {uploading && (
                    <p role="status" className="text-muted-foreground text-sm">
                        Uploading and preparing your image…
                    </p>
                )}
                {error && (
                    <p
                        id={`${id}-error`}
                        role="alert"
                        className="text-destructive text-sm"
                    >
                        {error}
                    </p>
                )}
            </Field>
            <Select
                value={assets.some((asset) => asset.url === value) ? value : ''}
                onValueChange={onChange}
                disabled={uploading}
            >
                <SelectTrigger
                    className="w-full"
                    aria-label={`Choose ${fieldLabel(label)} from media library`}
                >
                    <SelectValue placeholder="Or choose from your library" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {assets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.url}>
                                <span className="flex items-center gap-2">
                                    <img
                                        src={asset.url}
                                        alt=""
                                        className="size-8 rounded object-cover"
                                        loading="lazy"
                                    />
                                    {asset.name}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <details className="text-sm">
                <summary className="text-muted-foreground cursor-pointer">
                    Use an image URL
                </summary>
                <div className="pt-3">
                    <TextField
                        label={`${fieldLabel(label)} URL`}
                        value={value}
                        onChange={onChange}
                    />
                </div>
            </details>
            {value && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="self-start"
                    onClick={() => onChange('')}
                >
                    Remove selection
                </Button>
            )}
        </FieldGroup>
    );
}

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

type SectionKey = (typeof navigationSections)[number][0];

const sectionDetails = {
    general: {
        icon: LayoutTemplate,
        description:
            'Set the first impression with your cover, invitation wording, and music.',
    },
    couple: {
        icon: Heart,
        description:
            'Introduce the couple and the families celebrating alongside them.',
    },
    events: {
        icon: CalendarDays,
        description:
            'Help guests plan their visit with event details and locations.',
    },
    opening: {
        icon: Quote,
        description: 'Welcome your guests with a meaningful quote or blessing.',
    },
    gifts: {
        icon: Gift,
        description:
            'Add a personal introduction and the accounts guests can send gifts to.',
    },
    gallery: {
        icon: Image,
        description:
            'Choose the photographs that tell your story, in the order you want them seen.',
    },
    story: {
        icon: BookHeart,
        description: 'Share the moments that brought you here.',
    },
    media: {
        icon: Library,
        description:
            'Upload and manage the images and music used throughout your invitation.',
    },
    publish: {
        icon: Rocket,
        description:
            'Save your changes, review the draft, then share it with your guests.',
    },
};

function fieldLabel(label: string): string {
    const labels: Record<string, string> = {
        footerOrnament: 'Footer decoration',
        maps: 'Google Maps link',
        family: 'Parents and family',
        src: 'Image URL',
        alt: 'Image description',
        copy: 'Story',
        number: 'Account number',
        holder: 'Account holder',
        target: 'Countdown date and time',
    };
    return labels[label] ?? label.charAt(0).toUpperCase() + label.slice(1);
}

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
        <Field>
            <FieldLabel htmlFor={id}>{fieldLabel(label)}</FieldLabel>
            {multiline ? (
                <Textarea
                    id={id}
                    className="min-h-24"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            ) : (
                <Input
                    id={id}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            )}
        </Field>
    );
}

function AssetField({
    label,
    value,
    onChange,
    media,
    kind,
    onUpload,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    media: MediaAsset[];
    kind: 'image' | 'audio';
    onUpload: (file: File) => Promise<string>;
}) {
    if (kind === 'image') {
        return (
            <ImageAssetField
                label={label}
                value={value}
                onChange={onChange}
                media={media}
                onUpload={onUpload}
            />
        );
    }
    const assets = media.filter(
        (asset) =>
            !asset.archived &&
            (kind === 'audio'
                ? asset.mimeType.startsWith('audio/')
                : asset.mimeType.startsWith('image/')),
    );

    return (
        <div className="grid gap-2 text-sm">
            <TextField label={label} value={value} onChange={onChange} />
            <Select
                value={assets.some((asset) => asset.url === value) ? value : ''}
                onValueChange={(nextValue) => {
                    if (nextValue) {
                        onChange(nextValue);
                    }
                }}
            >
                <SelectTrigger
                    aria-label={`Choose ${fieldLabel(label)} from media library`}
                    className="w-full"
                >
                    <SelectValue placeholder={`Choose managed ${kind} asset`} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {assets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.url}>
                                {asset.name} ({asset.mimeType})
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
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
    const [uploadedImages, setUploadedImages] = useState<MediaAsset[]>([]);
    const imageUpload = useHttp<
        { file: File | null; kind: string },
        MediaAsset
    >({ file: null, kind: 'image' });
    const availableMedia = [
        ...uploadedImages.filter(
            (image) => !media.some((asset) => asset.id === image.id),
        ),
        ...media,
    ];

    async function uploadImage(file: File): Promise<string> {
        imageUpload.transform(() => ({ file, kind: 'image' }));
        let message = 'The image could not be uploaded. Please try again.';
        try {
            const asset = await imageUpload.post(uploadMedia.url(), {
                onError: (errors) => {
                    message = String(errors.file ?? message);
                },
                onHttpException: () => false,
                onNetworkError: () => false,
            });
            setUploadedImages((current) => [asset, ...current]);
            return asset.url;
        } catch {
            throw new Error(message);
        }
    }
    const [activeSection, setActiveSection] = useState<SectionKey>('general');
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [savedContent, setSavedContent] = useState(() =>
        JSON.stringify(content),
    );
    const dirty = JSON.stringify(draft) !== savedContent;
    const activeLabel = navigationSections.find(
        ([key]) => key === activeSection,
    )?.[1];

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
        setSaving(true);
        const snapshot = JSON.stringify(draft);
        router.post(
            '/admin/invitation/draft',
            { content: snapshot },
            {
                onError: (errors) => {
                    setServerError(
                        errors.content ?? 'Unable to save the draft.',
                    );
                },
                onSuccess: () => {
                    setServerError(null);
                    setSavedContent(snapshot);
                },
                onFinish: () => setSaving(false),
                preserveScroll: true,
            },
        );
    }

    function publish(): void {
        setPublishing(true);
        router.post('/admin/invitation/publish', undefined, {
            onError: (errors) => {
                setValidationErrors(Object.values(errors));
            },
            onSuccess: () => setValidationErrors([]),
            onFinish: () => setPublishing(false),
            preserveScroll: true,
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

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-28">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Invitation studio
                            </h1>
                            <Badge variant="secondary">
                                {hasDraft ? 'Draft' : 'Published content'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            A little personal. A little magical. Make every
                            detail yours.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setActiveSection('publish')}
                    >
                        <Rocket data-icon="inline-start" /> Review & publish
                    </Button>
                </header>
                <div className="grid items-start gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
                    <aside className="flex flex-col gap-5 lg:sticky lg:top-6">
                        <div className="hidden lg:block">
                            <p className="text-muted-foreground mb-3 px-3 text-xs font-medium tracking-wider uppercase">
                                Your invitation
                            </p>
                            <nav
                                aria-label="Invitation content sections"
                                className="bg-card flex flex-col gap-1 rounded-xl border p-2 shadow-sm"
                            >
                                {navigationSections.map(([key, label]) => {
                                    const Icon = sectionDetails[key].icon;
                                    return (
                                        <Button
                                            key={key}
                                            variant={
                                                activeSection === key
                                                    ? 'secondary'
                                                    : 'ghost'
                                            }
                                            className="h-10 w-full justify-start gap-3"
                                            aria-current={
                                                activeSection === key
                                                    ? 'page'
                                                    : undefined
                                            }
                                            onClick={() =>
                                                setActiveSection(key)
                                            }
                                        >
                                            <Icon data-icon="inline-start" />
                                            {label}
                                            {activeSection === key && (
                                                <ChevronRight
                                                    data-icon="inline-end"
                                                    className="ml-auto"
                                                />
                                            )}
                                        </Button>
                                    );
                                })}
                            </nav>
                        </div>
                        <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:hidden">
                            <nav
                                aria-label="Invitation content sections"
                                className="flex w-max gap-2 pb-1"
                            >
                                {navigationSections.map(([key, label]) => {
                                    const Icon = sectionDetails[key].icon;
                                    return (
                                        <Button
                                            key={key}
                                            variant={
                                                activeSection === key
                                                    ? 'secondary'
                                                    : 'outline'
                                            }
                                            className="h-9 shrink-0 gap-2"
                                            aria-current={
                                                activeSection === key
                                                    ? 'page'
                                                    : undefined
                                            }
                                            onClick={() =>
                                                setActiveSection(key)
                                            }
                                        >
                                            <Icon data-icon="inline-start" />
                                            {label}
                                        </Button>
                                    );
                                })}
                            </nav>
                        </div>
                        <p className="text-muted-foreground hidden px-3 text-xs leading-relaxed lg:block">
                            Work at your own pace. Changes only appear on your
                            invitation after you save and publish.
                        </p>
                    </aside>
                    <main className="flex min-w-0 flex-col gap-4">
                        {serverError && (
                            <Alert variant="destructive">
                                <AlertTitle>Unable to save draft</AlertTitle>
                                <AlertDescription>
                                    {serverError}
                                </AlertDescription>
                            </Alert>
                        )}

                        {validationErrors.length > 0 && (
                            <Alert variant="destructive">
                                <AlertTitle>Publish is blocked</AlertTitle>
                                <AlertDescription>
                                    Fix these fields:
                                    <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
                                        {validationErrors.map(
                                            (error, index) => (
                                                <li key={`${error}-${index}`}>
                                                    {error}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        <Card>
                            <CardHeader>
                                <div className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                                    Invitation editor
                                </div>
                                <CardTitle>
                                    <h2 className="text-xl">{activeLabel}</h2>
                                </CardTitle>
                                <CardDescription>
                                    {sectionDetails[activeSection].description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <fieldset
                                    disabled={
                                        imageUpload.processing ||
                                        saving ||
                                        publishing
                                    }
                                    className="min-w-0"
                                >
                                    <div className="flex flex-col gap-6">
                                        <section
                                            id="general"
                                            hidden={activeSection !== 'general'}
                                            className={cn(
                                                'flex flex-col gap-6',
                                                activeSection !== 'general' &&
                                                    'hidden',
                                            )}
                                        >
                                            <h3 className="text-base font-semibold">
                                                General and cover
                                            </h3>
                                            <FieldGroup className="grid gap-4 sm:grid-cols-2">
                                                <TextField
                                                    label="Title"
                                                    value={stringValue(
                                                        draft.title,
                                                    )}
                                                    onChange={(value) =>
                                                        updatePath(
                                                            ['title'],
                                                            value,
                                                        )
                                                    }
                                                />
                                                <TextField
                                                    label="Timezone"
                                                    value={stringValue(
                                                        draft.timezone,
                                                    )}
                                                    onChange={(value) =>
                                                        updatePath(
                                                            ['timezone'],
                                                            value,
                                                        )
                                                    }
                                                />
                                                <AssetField
                                                    label="Audio"
                                                    value={stringValue(
                                                        draft.audio,
                                                    )}
                                                    onChange={(value) =>
                                                        updatePath(
                                                            ['audio'],
                                                            value,
                                                        )
                                                    }
                                                    media={availableMedia}
                                                    onUpload={uploadImage}
                                                    kind="audio"
                                                />
                                            </FieldGroup>
                                            <FieldGroup className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                                                <h3 className="font-medium sm:col-span-2">
                                                    Cover
                                                </h3>
                                                {[
                                                    'eyebrow',
                                                    'title',
                                                    'names',
                                                    'date',
                                                    'invitation',
                                                ].map((key) => (
                                                    <TextField
                                                        key={key}
                                                        label={key}
                                                        value={stringValue(
                                                            cover[key],
                                                        )}
                                                        onChange={(value) =>
                                                            updatePath(
                                                                ['cover', key],
                                                                value,
                                                            )
                                                        }
                                                    />
                                                ))}
                                                <AssetField
                                                    label="image"
                                                    value={stringValue(
                                                        cover.image,
                                                    )}
                                                    onChange={(value) =>
                                                        updatePath(
                                                            ['cover', 'image'],
                                                            value,
                                                        )
                                                    }
                                                    media={availableMedia}
                                                    onUpload={uploadImage}
                                                    kind="image"
                                                />
                                                <AssetField
                                                    label="footerOrnament"
                                                    value={stringValue(
                                                        cover.footerOrnament,
                                                    )}
                                                    onChange={(value) =>
                                                        updatePath(
                                                            [
                                                                'cover',
                                                                'footerOrnament',
                                                            ],
                                                            value,
                                                        )
                                                    }
                                                    media={availableMedia}
                                                    onUpload={uploadImage}
                                                    kind="image"
                                                />
                                            </FieldGroup>
                                        </section>

                                        <section
                                            id="couple"
                                            hidden={activeSection !== 'couple'}
                                            className={cn(
                                                'flex flex-col gap-6',
                                                activeSection !== 'couple' &&
                                                    'hidden',
                                            )}
                                        >
                                            <h3 className="text-base font-semibold">
                                                Couple and parents
                                            </h3>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {profiles.map(
                                                    ({
                                                        label,
                                                        profile,
                                                        key,
                                                    }) => (
                                                        <div
                                                            className="flex flex-col gap-3 rounded-lg border p-4"
                                                            key={key}
                                                        >
                                                            <h3 className="font-medium">
                                                                {label}
                                                            </h3>
                                                            {[
                                                                'role',
                                                                'name',
                                                                'family',
                                                            ].map((field) => (
                                                                <TextField
                                                                    key={field}
                                                                    label={
                                                                        field
                                                                    }
                                                                    value={stringValue(
                                                                        profile[
                                                                            field
                                                                        ],
                                                                    )}
                                                                    onChange={(
                                                                        value,
                                                                    ) =>
                                                                        updatePath(
                                                                            [
                                                                                'couple',
                                                                                key,
                                                                                field,
                                                                            ],
                                                                            value,
                                                                        )
                                                                    }
                                                                />
                                                            ))}
                                                            <AssetField
                                                                label="photo"
                                                                value={stringValue(
                                                                    profile.photo,
                                                                )}
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    updatePath(
                                                                        [
                                                                            'couple',
                                                                            key,
                                                                            'photo',
                                                                        ],
                                                                        value,
                                                                    )
                                                                }
                                                                media={
                                                                    availableMedia
                                                                }
                                                                onUpload={
                                                                    uploadImage
                                                                }
                                                                kind="image"
                                                            />
                                                            <AssetField
                                                                label="frame"
                                                                value={stringValue(
                                                                    profile.frame,
                                                                )}
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    updatePath(
                                                                        [
                                                                            'couple',
                                                                            key,
                                                                            'frame',
                                                                        ],
                                                                        value,
                                                                    )
                                                                }
                                                                media={
                                                                    availableMedia
                                                                }
                                                                onUpload={
                                                                    uploadImage
                                                                }
                                                                kind="image"
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </section>

                                        <section
                                            id="events"
                                            hidden={activeSection !== 'events'}
                                            className={cn(
                                                'flex flex-col gap-6',
                                                activeSection !== 'events' &&
                                                    'hidden',
                                            )}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <h3 className="text-base font-semibold">
                                                    Events and countdown
                                                </h3>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    type="button"
                                                    onClick={addEvent}
                                                >
                                                    Add event
                                                </Button>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                {events.map((event, index) => (
                                                    <div
                                                        className="flex flex-col gap-3 rounded-lg border p-4"
                                                        key={index}
                                                    >
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <h3 className="font-medium">
                                                                Event{' '}
                                                                {index + 1}
                                                            </h3>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        moveEvent(
                                                                            index,
                                                                            -1,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        index ===
                                                                        0
                                                                    }
                                                                >
                                                                    Up
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        moveEvent(
                                                                            index,
                                                                            1,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        index ===
                                                                        events.length -
                                                                            1
                                                                    }
                                                                >
                                                                    Down
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeEvent(
                                                                            index,
                                                                        )
                                                                    }
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <FieldGroup className="grid gap-4 sm:grid-cols-2">
                                                            {[
                                                                'name',
                                                                'date',
                                                                'time',
                                                                'venue',
                                                                'maps',
                                                            ].map((field) => (
                                                                <TextField
                                                                    key={field}
                                                                    label={
                                                                        field
                                                                    }
                                                                    value={stringValue(
                                                                        event[
                                                                            field
                                                                        ],
                                                                    )}
                                                                    onChange={(
                                                                        value,
                                                                    ) =>
                                                                        updateEvent(
                                                                            index,
                                                                            field,
                                                                            value,
                                                                        )
                                                                    }
                                                                />
                                                            ))}
                                                        </FieldGroup>
                                                    </div>
                                                ))}
                                            </div>
                                            <FieldGroup className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                                                <h3 className="font-medium sm:col-span-2">
                                                    Countdown
                                                </h3>
                                                <TextField
                                                    label="Target"
                                                    value={stringValue(
                                                        countdown.target,
                                                    )}
                                                    onChange={(value) =>
                                                        updatePath(
                                                            [
                                                                'countdown',
                                                                'target',
                                                            ],
                                                            value,
                                                        )
                                                    }
                                                />
                                                <TextField
                                                    label="Label"
                                                    value={stringValue(
                                                        countdown.label,
                                                    )}
                                                    onChange={(value) =>
                                                        updatePath(
                                                            [
                                                                'countdown',
                                                                'label',
                                                            ],
                                                            value,
                                                        )
                                                    }
                                                />
                                                <AssetField
                                                    label="Frame"
                                                    value={stringValue(
                                                        countdown.frame,
                                                    )}
                                                    onChange={(value) =>
                                                        updatePath(
                                                            [
                                                                'countdown',
                                                                'frame',
                                                            ],
                                                            value,
                                                        )
                                                    }
                                                    media={availableMedia}
                                                    onUpload={uploadImage}
                                                    kind="image"
                                                />
                                            </FieldGroup>
                                        </section>

                                        <section
                                            id="opening"
                                            hidden={activeSection !== 'opening'}
                                            className={cn(
                                                'flex flex-col gap-6',
                                                activeSection !== 'opening' &&
                                                    'hidden',
                                            )}
                                        >
                                            <h3 className="text-base font-semibold">
                                                Opening quote
                                            </h3>
                                            <TextField
                                                label="Quote"
                                                multiline
                                                value={stringValue(
                                                    opening.quote,
                                                )}
                                                onChange={(value) =>
                                                    updatePath(
                                                        ['opening', 'quote'],
                                                        value,
                                                    )
                                                }
                                            />
                                            <FieldGroup className="grid gap-4 sm:grid-cols-2">
                                                <TextField
                                                    label="Reference"
                                                    value={stringValue(
                                                        opening.reference,
                                                    )}
                                                    onChange={(value) =>
                                                        updatePath(
                                                            [
                                                                'opening',
                                                                'reference',
                                                            ],
                                                            value,
                                                        )
                                                    }
                                                />
                                                <AssetField
                                                    label="Frame"
                                                    value={stringValue(
                                                        opening.frame,
                                                    )}
                                                    onChange={(value) =>
                                                        updatePath(
                                                            [
                                                                'opening',
                                                                'frame',
                                                            ],
                                                            value,
                                                        )
                                                    }
                                                    media={availableMedia}
                                                    onUpload={uploadImage}
                                                    kind="image"
                                                />
                                            </FieldGroup>
                                        </section>

                                        <section
                                            id="gifts"
                                            hidden={activeSection !== 'gifts'}
                                            className={cn(
                                                'flex flex-col gap-6',
                                                activeSection !== 'gifts' &&
                                                    'hidden',
                                            )}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <h3 className="text-base font-semibold">
                                                    Gifts
                                                </h3>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    type="button"
                                                    onClick={() =>
                                                        addListItem(
                                                            'gifts.accounts',
                                                        )
                                                    }
                                                >
                                                    Add account
                                                </Button>
                                            </div>
                                            <TextField
                                                label="Introduction"
                                                multiline
                                                value={stringValue(gifts.intro)}
                                                onChange={(value) =>
                                                    updatePath(
                                                        ['gifts', 'intro'],
                                                        value,
                                                    )
                                                }
                                            />
                                            {giftAccounts.map(
                                                (account, index) => (
                                                    <div
                                                        className="flex flex-col gap-3 rounded-lg border p-4"
                                                        key={index}
                                                    >
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <h3 className="font-medium">
                                                                Account{' '}
                                                                {index + 1}
                                                            </h3>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        moveListItem(
                                                                            'gifts.accounts',
                                                                            index,
                                                                            -1,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        index ===
                                                                        0
                                                                    }
                                                                >
                                                                    Up
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
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
                                                                        giftAccounts.length -
                                                                            1
                                                                    }
                                                                >
                                                                    Down
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeListItem(
                                                                            'gifts.accounts',
                                                                            index,
                                                                        )
                                                                    }
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <FieldGroup className="grid gap-4 sm:grid-cols-2">
                                                            {[
                                                                'bank',
                                                                'number',
                                                                'holder',
                                                            ].map((field) => (
                                                                <TextField
                                                                    key={field}
                                                                    label={
                                                                        field
                                                                    }
                                                                    value={stringValue(
                                                                        account[
                                                                            field
                                                                        ],
                                                                    )}
                                                                    onChange={(
                                                                        value,
                                                                    ) =>
                                                                        updateListItem(
                                                                            'gifts.accounts',
                                                                            index,
                                                                            field,
                                                                            value,
                                                                        )
                                                                    }
                                                                />
                                                            ))}
                                                        </FieldGroup>
                                                    </div>
                                                ),
                                            )}
                                        </section>

                                        <section
                                            id="gallery"
                                            hidden={activeSection !== 'gallery'}
                                            className={cn(
                                                'flex flex-col gap-6',
                                                activeSection !== 'gallery' &&
                                                    'hidden',
                                            )}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <h3 className="text-base font-semibold">
                                                    Gallery
                                                </h3>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    type="button"
                                                    onClick={() =>
                                                        addListItem('gallery')
                                                    }
                                                >
                                                    Add image
                                                </Button>
                                            </div>
                                            {gallery.map((image, index) => (
                                                <div
                                                    className="flex flex-col gap-3 rounded-lg border p-4"
                                                    key={index}
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <h3 className="font-medium">
                                                            Image {index + 1}
                                                        </h3>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() =>
                                                                    moveListItem(
                                                                        'gallery',
                                                                        index,
                                                                        -1,
                                                                    )
                                                                }
                                                                disabled={
                                                                    index === 0
                                                                }
                                                            >
                                                                Up
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() =>
                                                                    moveListItem(
                                                                        'gallery',
                                                                        index,
                                                                        1,
                                                                    )
                                                                }
                                                                disabled={
                                                                    index ===
                                                                    gallery.length -
                                                                        1
                                                                }
                                                            >
                                                                Down
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() =>
                                                                    removeListItem(
                                                                        'gallery',
                                                                        index,
                                                                    )
                                                                }
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <AssetField
                                                        label="Image"
                                                        value={stringValue(
                                                            image.src,
                                                        )}
                                                        onChange={(value) =>
                                                            updateListItem(
                                                                'gallery',
                                                                index,
                                                                'src',
                                                                value,
                                                            )
                                                        }
                                                        media={availableMedia}
                                                        onUpload={uploadImage}
                                                        kind="image"
                                                    />
                                                    <TextField
                                                        label="Alt text"
                                                        value={stringValue(
                                                            image.alt,
                                                        )}
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

                                        <section
                                            id="story"
                                            hidden={activeSection !== 'story'}
                                            className={cn(
                                                'flex flex-col gap-6',
                                                activeSection !== 'story' &&
                                                    'hidden',
                                            )}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <h3 className="text-base font-semibold">
                                                    Love story
                                                </h3>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    type="button"
                                                    onClick={() =>
                                                        addListItem(
                                                            'story.entries',
                                                        )
                                                    }
                                                >
                                                    Add entry
                                                </Button>
                                            </div>
                                            {storyEntries.map(
                                                (entry, index) => (
                                                    <div
                                                        className="flex flex-col gap-3 rounded-lg border p-4"
                                                        key={index}
                                                    >
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <h3 className="font-medium">
                                                                Entry{' '}
                                                                {index + 1}
                                                            </h3>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        moveListItem(
                                                                            'story.entries',
                                                                            index,
                                                                            -1,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        index ===
                                                                        0
                                                                    }
                                                                >
                                                                    Up
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
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
                                                                        storyEntries.length -
                                                                            1
                                                                    }
                                                                >
                                                                    Down
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeListItem(
                                                                            'story.entries',
                                                                            index,
                                                                        )
                                                                    }
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <FieldGroup className="grid gap-4 sm:grid-cols-2">
                                                            <TextField
                                                                label="Period"
                                                                value={stringValue(
                                                                    entry.period,
                                                                )}
                                                                onChange={(
                                                                    value,
                                                                ) =>
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
                                                                value={stringValue(
                                                                    entry.title,
                                                                )}
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    updateListItem(
                                                                        'story.entries',
                                                                        index,
                                                                        'title',
                                                                        value,
                                                                    )
                                                                }
                                                            />
                                                        </FieldGroup>
                                                        <TextField
                                                            label="Copy"
                                                            multiline
                                                            value={stringValue(
                                                                entry.copy,
                                                            )}
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
                                                            value={stringValue(
                                                                entry.ornament,
                                                            )}
                                                            onChange={(value) =>
                                                                updateListItem(
                                                                    'story.entries',
                                                                    index,
                                                                    'ornament',
                                                                    value,
                                                                )
                                                            }
                                                            media={
                                                                availableMedia
                                                            }
                                                            onUpload={
                                                                uploadImage
                                                            }
                                                            kind="image"
                                                        />
                                                    </div>
                                                ),
                                            )}
                                        </section>
                                    </div>

                                    <section
                                        id="media"
                                        hidden={activeSection !== 'media'}
                                        className={cn(
                                            'flex flex-col gap-6',
                                            activeSection !== 'media' &&
                                                'hidden',
                                        )}
                                    >
                                        <div>
                                            <h3 className="text-base font-semibold">
                                                Media library
                                            </h3>
                                            <p className="text-muted-foreground text-sm">
                                                {mediaCount +
                                                    uploadedImages.filter(
                                                        (image) =>
                                                            !media.some(
                                                                (asset) =>
                                                                    asset.id ===
                                                                    image.id,
                                                            ),
                                                    ).length}{' '}
                                                active asset(s).
                                            </p>
                                        </div>
                                        <form
                                            className="flex flex-wrap items-center gap-3"
                                            onSubmit={upload}
                                        >
                                            <Input
                                                aria-label="Upload image or audio file"
                                                name="file"
                                                type="file"
                                                accept="image/*,audio/*"
                                                required
                                            />
                                            <Button
                                                disabled={uploading}
                                                type="submit"
                                            >
                                                {uploading
                                                    ? 'Uploading…'
                                                    : 'Upload media'}
                                            </Button>
                                        </form>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {availableMedia.map((asset) => (
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
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() =>
                                                                    router.post(
                                                                        `/admin/invitation/media/${asset.id}/archive`,
                                                                    )
                                                                }
                                                            >
                                                                Archive
                                                            </Button>
                                                        )}
                                                        {asset.archived && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() =>
                                                                    router.delete(
                                                                        `/admin/invitation/media/${asset.id}`,
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section
                                        hidden={activeSection !== 'publish'}
                                        className={cn(
                                            'flex flex-col gap-6',
                                            activeSection !== 'publish' &&
                                                'hidden',
                                        )}
                                    >
                                        <Alert>
                                            <Check />
                                            <AlertTitle>
                                                {hasDraft
                                                    ? 'Your saved draft is ready to review'
                                                    : 'Start by saving a draft'}
                                            </AlertTitle>
                                            <AlertDescription>
                                                {publishedAt
                                                    ? `Last published${publishedBy ? ` by ${publishedBy}` : ''} on ${new Date(publishedAt).toLocaleString()}`
                                                    : 'Your invitation has not been published yet.'}
                                            </AlertDescription>
                                        </Alert>
                                        <ol className="flex list-decimal flex-col gap-4 pl-5 text-sm leading-relaxed">
                                            <li>
                                                Save your changes using the
                                                button below.
                                            </li>
                                            <li>
                                                Preview your saved draft to
                                                check the wording, photos, and
                                                event details.
                                            </li>
                                            <li>
                                                Publish when everything looks
                                                right. Your saved draft will
                                                become the live invitation.
                                            </li>
                                        </ol>
                                        {dirty && (
                                            <p className="text-muted-foreground text-sm">
                                                You have unsaved changes. Save
                                                them before publishing.
                                            </p>
                                        )}
                                        <Button
                                            className="self-start"
                                            disabled={
                                                dirty ||
                                                saving ||
                                                publishing ||
                                                !hasDraft
                                            }
                                            onClick={publish}
                                        >
                                            <Rocket data-icon="inline-start" />
                                            {publishing
                                                ? 'Publishing…'
                                                : 'Publish invitation'}
                                        </Button>
                                    </section>
                                </fieldset>
                            </CardContent>
                        </Card>
                    </main>
                </div>
                <div className="bg-background/95 sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 shadow-lg backdrop-blur">
                    <p
                        role="status"
                        className="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                        {dirty ? (
                            <span className="bg-primary size-2 rounded-full" />
                        ) : (
                            <Check className="size-4" />
                        )}
                        {saving
                            ? 'Saving your draft…'
                            : dirty
                              ? 'Unsaved changes'
                              : 'All changes saved'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <a
                                href="/admin/invitation/preview"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Eye data-icon="inline-start" />
                                Preview saved draft
                            </a>
                        </Button>
                        <Button
                            type="button"
                            onClick={saveDraft}
                            disabled={
                                saving || publishing || imageUpload.processing
                            }
                        >
                            <Save data-icon="inline-start" />
                            {saving ? 'Saving…' : 'Save draft'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

InvitationAdmin.layout = {
    breadcrumbs: [{ title: 'Invitation content', href: '/admin/invitation' }],
};
