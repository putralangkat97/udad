import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type JsonMap = Record<string, unknown>;

type MediaAsset = {
    id: number;
    name: string;
    url: string;
    mimeType: string;
    archived: boolean;
};

type Props = {
    content: JsonMap;
    hasDraft: boolean;
    publishedAt?: string;
    media: MediaAsset[];
};

const sections = [
    ['general', 'General and cover'],
    ['opening', 'Opening quote'],
    ['couple', 'Couple and parents'],
    ['events', 'Events and countdown'],
    ['gifts', 'Gifts'],
    ['gallery', 'Gallery'],
    ['story', 'Love story'],
] as const;

function formatJson(value: unknown): string {
    return JSON.stringify(value ?? {}, null, 2);
}

function sectionValue(content: JsonMap, key: string): unknown {
    if (key === 'general') {
        return {
            title: content.title,
            timezone: content.timezone,
            audio: content.audio,
            cover: content.cover,
        };
    }

    if (key === 'events') {
        return { events: content.events, countdown: content.countdown };
    }

    return content[key];
}

export default function InvitationAdmin({
    content,
    hasDraft,
    publishedAt,
    media,
}: Props) {
    const [values, setValues] = useState<Record<string, string>>(() =>
        Object.fromEntries(
            sections.map(([key]) => [key, formatJson(sectionValue(content, key))]),
        ),
    );
    const [parseError, setParseError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const mediaCount = useMemo(
        () => media.filter((asset) => !asset.archived).length,
        [media],
    );

    function saveDraft(): void {
        try {
            const parsed = Object.fromEntries(
                sections.map(([key]) => [key, JSON.parse(values[key])]),
            ) as Record<string, JsonMap>;
            const next = { ...content, ...parsed };
            const general = parsed.general ?? {};
            const events = parsed.events ?? {};

            router.post('/admin/invitation/draft', {
                content: JSON.stringify({
                    ...next,
                    title: general.title,
                    timezone: general.timezone,
                    audio: general.audio,
                    cover: general.cover,
                    events: events.events,
                    countdown: events.countdown,
                }),
            });
            setParseError(null);
        } catch {
            setParseError('One or more sections contain invalid JSON.');
        }
    }

    function publish(): void {
        router.post('/admin/invitation/publish');
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
                        <h1 className="text-2xl font-semibold">Invitation content</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Edit the draft, preview it, then publish the complete invitation.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link className="rounded-md border px-3 py-2 text-sm" href="/admin/invitation/preview">
                            Preview draft
                        </Link>
                        <button className="bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm" type="button" onClick={publish}>
                            Publish
                        </button>
                    </div>
                </div>

                <div className="rounded-lg border p-4 text-sm">
                    <strong>{hasDraft ? 'Draft ready for review' : 'Editing published content'}</strong>
                    <span className="text-muted-foreground ml-2">
                        {publishedAt ? `Last published ${new Date(publishedAt).toLocaleString()}` : 'Not published yet'}
                    </span>
                </div>

                {parseError && <p className="text-destructive text-sm">{parseError}</p>}

                <div className="space-y-6">
                    {sections.map(([key, label]) => (
                        <section className="space-y-2" key={key}>
                            <h2 className="text-lg font-medium">{label}</h2>
                            <textarea
                                className="min-h-48 w-full rounded-md border bg-transparent p-3 font-mono text-xs"
                                value={values[key]}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        [key]: event.target.value,
                                    }))
                                }
                                spellCheck={false}
                            />
                        </section>
                    ))}
                </div>

                <button className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm" type="button" onClick={saveDraft}>
                    Save draft
                </button>

                <section className="space-y-4 rounded-lg border p-5">
                    <div>
                        <h2 className="text-lg font-medium">Media library</h2>
                        <p className="text-muted-foreground text-sm">{mediaCount} active asset(s).</p>
                    </div>
                    <form className="flex flex-wrap items-center gap-3" onSubmit={upload}>
                        <input name="file" type="file" accept="image/*,audio/*" required />
                        <button className="rounded-md border px-3 py-2 text-sm" disabled={uploading} type="submit">
                            {uploading ? 'Uploading…' : 'Upload media'}
                        </button>
                    </form>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {media.map((asset) => (
                            <div className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm" key={asset.id}>
                                <a className="truncate underline" href={asset.url} target="_blank" rel="noreferrer">{asset.name}</a>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-xs">{asset.archived ? 'Archived' : asset.mimeType}</span>
                                    {!asset.archived && (
                                        <button className="text-xs underline" type="button" onClick={() => router.post(`/admin/invitation/media/${asset.id}/archive`)}>
                                            Archive
                                        </button>
                                    )}
                                    {asset.archived && (
                                        <button className="text-destructive text-xs underline" type="button" onClick={() => router.delete(`/admin/invitation/media/${asset.id}`)}>
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
