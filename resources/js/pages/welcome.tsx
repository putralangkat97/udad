import { Form, Head } from '@inertiajs/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import RsvpController from '@/actions/App/Http/Controllers/RsvpController';
import WishController from '@/actions/App/Http/Controllers/WishController';

type CoupleProfile = {
    role: string;
    name: string;
    family: string;
    photo: string;
    frame: string;
};

type EventDetails = {
    name: string;
    date: string;
    time: string;
    venue: string;
    maps: string;
};

type GiftAccount = {
    bank: string;
    number: string;
    holder: string;
};

type GalleryImage = {
    src: string;
    alt: string;
};

type StoryEntry = {
    period: string;
    title: string;
    copy: string;
    ornament: string;
};

type PublishedWish = {
    name: string;
    message: string;
};

type Invitation = {
    title: string;
    audio: string;
    timezone: string;
    eventsFrame: string;
    cover: {
        eyebrow: string;
        title: string;
        names: string;
        date: string;
        guest: string;
        invitation: string;
        image: string;
        footerOrnament: string;
    };
    opening: {
        quote: string;
        reference: string;
        frame: string;
    };
    couple: {
        bride: CoupleProfile;
        groom: CoupleProfile;
    };
    events: EventDetails[];
    countdown: {
        target: string;
        label: string;
        frame: string;
    };
    gifts: {
        intro: string;
        accounts: GiftAccount[];
    };
    gallery: GalleryImage[];
    story: {
        title: string;
        entries: StoryEntry[];
        credit: string;
    };
};

type WelcomeProps = {
    invitation: Invitation;
    wishes: PublishedWish[];
};

type RemainingTime = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

function getRemainingTime(target: string): RemainingTime {
    const distance = Math.max(0, new Date(target).getTime() - Date.now());
    const day = 1000 * 60 * 60 * 24;
    const hour = 1000 * 60 * 60;
    const minute = 1000 * 60;

    return {
        days: Math.floor(distance / day),
        hours: Math.floor((distance % day) / hour),
        minutes: Math.floor((distance % hour) / minute),
        seconds: Math.floor((distance % minute) / 1000),
    };
}

function Reveal({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (!element || !('IntersectionObserver' in window)) {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.12 },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`invitation-reveal ${visible ? 'invitation-reveal--visible' : ''} ${className}`}
        >
            {children}
        </div>
    );
}

function Countdown({ target, timezone }: { target: string; timezone: string }) {
    const [remaining, setRemaining] = useState(() => getRemainingTime(target));

    useEffect(() => {
        const update = () => setRemaining(getRemainingTime(target));
        const timer = window.setInterval(update, 1000);

        update();

        return () => window.clearInterval(timer);
    }, [target]);

    return (
        <div
            className="invitation-countdown-values"
            aria-label={`Countdown to the wedding in ${timezone}`}
        >
            {Object.entries(remaining).map(([label, value]) => (
                <div key={label} className="invitation-countdown-item">
                    <strong>{value}</strong>
                    <span>{label}</span>
                </div>
            ))}
        </div>
    );
}

function ProfileCard({
    profile,
    side,
}: {
    profile: CoupleProfile;
    side: 'bride' | 'groom';
}) {
    return (
        <div className={`invitation-couple-row invitation-couple-row--${side}`}>
            <div className="invitation-couple-copy">
                <span className="invitation-couple-role">{profile.role}</span>
                <h2>{profile.name}</h2>
                <p>{side === 'bride' ? 'putri dari' : 'putra dari'}</p>
                <p>{profile.family}</p>
            </div>
            <div className="invitation-couple-portrait">
                <img
                    src={profile.frame}
                    alt=""
                    className="invitation-portrait-frame"
                />
                <img
                    src={profile.photo}
                    alt={profile.name}
                    className="invitation-portrait-photo"
                />
            </div>
        </div>
    );
}

function RsvpSection() {
    const [attendance, setAttendance] = useState('attending');

    return (
        <Reveal>
            <section
                className="invitation-rsvp-section"
                aria-labelledby="rsvp-heading"
            >
                <p className="invitation-section-kicker">
                    We would love to hear from you
                </p>
                <h2 id="rsvp-heading">RSVP</h2>
                <p className="invitation-rsvp-intro">
                    Please let us know if you can join our celebration.
                </p>

                <Form
                    {...RsvpController.store.form()}
                    resetOnSuccess={['name', 'guest_count', 'message']}
                    disableWhileProcessing
                    className="invitation-rsvp-form"
                >
                    {({ processing, errors, wasSuccessful }) => (
                        <>
                            {wasSuccessful && (
                                <p
                                    className="invitation-form-success"
                                    role="status"
                                >
                                    Thank you! Your RSVP has been received.
                                </p>
                            )}

                            <label
                                className="invitation-form-field"
                                htmlFor="rsvp-name"
                            >
                                <span>Your name</span>
                                <input
                                    id="rsvp-name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Full name"
                                    required
                                    aria-invalid={Boolean(errors.name)}
                                    aria-describedby={
                                        errors.name
                                            ? 'rsvp-name-error'
                                            : undefined
                                    }
                                />
                                {errors.name && (
                                    <small
                                        id="rsvp-name-error"
                                        className="invitation-form-error"
                                    >
                                        {errors.name}
                                    </small>
                                )}
                            </label>

                            <label
                                className="invitation-form-field"
                                htmlFor="rsvp-attendance"
                            >
                                <span>Will you attend?</span>
                                <select
                                    id="rsvp-attendance"
                                    name="attendance"
                                    value={attendance}
                                    onChange={(event) =>
                                        setAttendance(event.target.value)
                                    }
                                    required
                                    aria-invalid={Boolean(errors.attendance)}
                                    aria-describedby={
                                        errors.attendance
                                            ? 'rsvp-attendance-error'
                                            : undefined
                                    }
                                >
                                    <option value="attending">
                                        Yes, I will attend
                                    </option>
                                    <option value="not_attending">
                                        Sorry, I cannot attend
                                    </option>
                                    <option value="maybe">
                                        I am not sure yet
                                    </option>
                                </select>
                                {errors.attendance && (
                                    <small
                                        id="rsvp-attendance-error"
                                        className="invitation-form-error"
                                    >
                                        {errors.attendance}
                                    </small>
                                )}
                            </label>

                            {attendance === 'attending' && (
                                <label
                                    className="invitation-form-field"
                                    htmlFor="rsvp-guest-count"
                                >
                                    <span>Number of guests</span>
                                    <input
                                        id="rsvp-guest-count"
                                        name="guest_count"
                                        type="number"
                                        inputMode="numeric"
                                        min="1"
                                        placeholder="1"
                                        required
                                        aria-invalid={Boolean(
                                            errors.guest_count,
                                        )}
                                        aria-describedby={
                                            errors.guest_count
                                                ? 'rsvp-guest-count-error'
                                                : undefined
                                        }
                                    />
                                    {errors.guest_count && (
                                        <small
                                            id="rsvp-guest-count-error"
                                            className="invitation-form-error"
                                        >
                                            {errors.guest_count}
                                        </small>
                                    )}
                                </label>
                            )}

                            <label
                                className="invitation-form-field"
                                htmlFor="rsvp-message"
                            >
                                <span>
                                    Message <em>(optional)</em>
                                </span>
                                <textarea
                                    id="rsvp-message"
                                    name="message"
                                    rows={3}
                                    maxLength={2000}
                                    placeholder="Leave a message for the couple"
                                    aria-invalid={Boolean(errors.message)}
                                    aria-describedby={
                                        errors.message
                                            ? 'rsvp-message-error'
                                            : undefined
                                    }
                                />
                                {errors.message && (
                                    <small
                                        id="rsvp-message-error"
                                        className="invitation-form-error"
                                    >
                                        {errors.message}
                                    </small>
                                )}
                            </label>

                            <button
                                type="submit"
                                className="invitation-rsvp-submit"
                                disabled={processing}
                            >
                                {processing ? 'Sending...' : 'Send RSVP'}
                            </button>
                        </>
                    )}
                </Form>
            </section>
        </Reveal>
    );
}

function WishesSection({ wishes }: { wishes: PublishedWish[] }) {
    return (
        <Reveal>
            <section
                className="invitation-wishes-section"
                aria-labelledby="wishes-heading"
            >
                <p className="invitation-section-kicker">From our loved ones</p>
                <h2 id="wishes-heading">Wishes</h2>

                <div className="invitation-wishes-list" aria-live="polite">
                    {wishes.length === 0 ? (
                        <p className="invitation-wishes-empty">
                            Be the first to leave a wish for the couple.
                        </p>
                    ) : (
                        wishes.map((wish, index) => (
                            <article
                                key={`${wish.name}-${index}`}
                                className="invitation-wish-card"
                            >
                                <p>{wish.message}</p>
                                <span>— {wish.name}</span>
                            </article>
                        ))
                    )}
                </div>

                <Form
                    {...WishController.store.form()}
                    resetOnSuccess={['name', 'message']}
                    disableWhileProcessing
                    className="invitation-wish-form"
                >
                    {({ processing, errors, wasSuccessful }) => (
                        <>
                            {wasSuccessful && (
                                <p
                                    className="invitation-form-success"
                                    role="status"
                                >
                                    Thank you! Your wish is waiting for
                                    approval.
                                </p>
                            )}

                            <label
                                className="invitation-form-field"
                                htmlFor="wish-name"
                            >
                                <span>Your name</span>
                                <input
                                    id="wish-name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Full name"
                                    required
                                    aria-invalid={Boolean(errors.name)}
                                    aria-describedby={
                                        errors.name
                                            ? 'wish-name-error'
                                            : undefined
                                    }
                                />
                                {errors.name && (
                                    <small
                                        id="wish-name-error"
                                        className="invitation-form-error"
                                    >
                                        {errors.name}
                                    </small>
                                )}
                            </label>

                            <label
                                className="invitation-form-field"
                                htmlFor="wish-message"
                            >
                                <span>Your wish</span>
                                <textarea
                                    id="wish-message"
                                    name="message"
                                    rows={3}
                                    maxLength={2000}
                                    placeholder="Write a message for the couple"
                                    required
                                    aria-invalid={Boolean(errors.message)}
                                    aria-describedby={
                                        errors.message
                                            ? 'wish-message-error'
                                            : undefined
                                    }
                                />
                                {errors.message && (
                                    <small
                                        id="wish-message-error"
                                        className="invitation-form-error"
                                    >
                                        {errors.message}
                                    </small>
                                )}
                            </label>

                            <button
                                type="submit"
                                className="invitation-rsvp-submit"
                                disabled={processing}
                            >
                                {processing ? 'Sending...' : 'Send Wish'}
                            </button>
                        </>
                    )}
                </Form>
            </section>
        </Reveal>
    );
}

export default function Welcome({ invitation, wishes }: WelcomeProps) {
    const [isReady, setIsReady] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpening, setIsOpening] = useState(false);
    const [isCoverFading, setIsCoverFading] = useState(false);
    const [isContentRevealing, setIsContentRevealing] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUnavailable, setAudioUnavailable] = useState(false);
    const [audioPlaybackFailed, setAudioPlaybackFailed] = useState(false);
    const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const [copyFailed, setCopyFailed] = useState(false);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(
        null,
    );
    const audioRef = useRef<HTMLAudioElement>(null);
    const galleryTriggerRef = useRef<HTMLButtonElement>(null);
    const lightboxCloseRef = useRef<HTMLButtonElement>(null);
    const lightboxRef = useRef<HTMLDialogElement>(null);
    const mainRef = useRef<HTMLElement>(null);
    const musicControlRef = useRef<HTMLButtonElement>(null);
    const { cover } = invitation;

    useEffect(() => {
        const sources = [cover.image, cover.footerOrnament];
        const images = sources.map(() => new window.Image());
        let pending = sources.length;
        let cancelled = false;

        setIsReady(false);

        const markReady = () => {
            pending -= 1;

            if (pending <= 0 && !cancelled) {
                setIsReady(true);
            }
        };

        images.forEach((image, index) => {
            image.onload = markReady;
            image.onerror = markReady;
            image.src = sources[index];
        });

        const fallbackTimer = window.setTimeout(() => {
            if (!cancelled) {
                setIsReady(true);
            }
        }, 1200);

        return () => {
            cancelled = true;
            window.clearTimeout(fallbackTimer);
            images.forEach((image) => {
                image.onload = null;
                image.onerror = null;
            });
        };
    }, [cover.footerOrnament, cover.image]);

    useEffect(() => {
        if (!selectedImage) {
            return;
        }

        const dialog = lightboxRef.current;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        dialog?.showModal();

        const focusFrame = window.requestAnimationFrame(() => {
            lightboxCloseRef.current?.focus();
        });

        return () => {
            window.cancelAnimationFrame(focusFrame);
            if (dialog?.open) {
                dialog.close();
            }
            document.body.style.overflow = originalOverflow;
            galleryTriggerRef.current?.focus();
        };
    }, [selectedImage]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const focusFrame = window.requestAnimationFrame(() => {
            (audioUnavailable
                ? mainRef.current
                : musicControlRef.current
            )?.focus();
        });

        return () => window.cancelAnimationFrame(focusFrame);
    }, [audioUnavailable, isOpen]);

    function playMusic() {
        const audio = audioRef.current;

        if (!audio) {
            setAudioUnavailable(true);
            return;
        }

        void audio
            .play()
            .then(() => {
                setIsPlaying(true);
                setAudioPlaybackFailed(false);
            })
            .catch(() => {
                setIsPlaying(false);
                setAudioPlaybackFailed(true);
            });
    }

    function fadeMusicIn() {
        const audio = audioRef.current;

        if (!audio) {
            setAudioUnavailable(true);
            return;
        }

        audio.volume = 0;

        void audio
            .play()
            .then(() => {
                setIsPlaying(true);
                setAudioPlaybackFailed(false);

                const startedAt = performance.now();
                const fade = (now: number) => {
                    const progress = Math.min(1, (now - startedAt) / 2000);
                    audio.volume = 0.35 * progress;

                    if (progress < 1) {
                        window.requestAnimationFrame(fade);
                    }
                };

                window.requestAnimationFrame(fade);
            })
            .catch(() => {
                setIsPlaying(false);
                setAudioPlaybackFailed(true);
            });
    }

    function openInvitation() {
        if (isOpening || isOpen) {
            return;
        }

        setIsOpening(true);
        setIsCoverFading(false);
        setIsContentRevealing(false);
        setHasOpened(true);

        const audio = audioRef.current;

        if (!audio) {
            setAudioUnavailable(true);
        }

        window.setTimeout(() => {
            setIsCoverFading(true);
            setIsContentRevealing(true);
            fadeMusicIn();
        }, 350);
        window.setTimeout(() => {
            setIsOpening(false);
            setIsOpen(true);
        }, 2600);
    }

    function toggleMusic() {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            return;
        }

        playMusic();
    }

    async function copyAccountNumber(number: string) {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(number);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = number;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                let copied = false;

                try {
                    textarea.select();
                    copied = document.execCommand('copy');
                } finally {
                    textarea.remove();
                }

                if (!copied) {
                    throw new Error('Clipboard copy failed');
                }
            }

            setCopiedNumber(number);
            setCopyFeedback('Account number copied.');
            setCopyFailed(false);
            window.setTimeout(() => setCopiedNumber(null), 1600);
        } catch {
            setCopiedNumber(null);
            setCopyFailed(true);
            setCopyFeedback(
                'Copy is unavailable. Please select the account number manually.',
            );
        }
    }

    function closeLightbox() {
        setSelectedImage(null);
    }

    return (
        <>
            <Head title={invitation.title} />

            <div className="invitation-viewport">
                {hasOpened && (
                    <Confetti
                        recycle
                        numberOfPieces={isOpening ? 180 : 55}
                        gravity={0.16}
                        wind={0.01}
                        initialVelocityY={{ min: 8, max: 18 }}
                        colors={['#984a3d', '#c47b58', '#d9a96f', '#fff9ec']}
                        style={{
                            pointerEvents: 'none',
                            position: 'fixed',
                            zIndex: 20,
                        }}
                    />
                )}
                <div className="invitation-canvas">
                    <audio
                        ref={audioRef}
                        preload="metadata"
                        src={invitation.audio}
                        onEnded={() => setIsPlaying(false)}
                        onError={() => {
                            setAudioUnavailable(true);
                            setAudioPlaybackFailed(false);
                            setIsPlaying(false);
                        }}
                    />

                    <div
                        className={`invitation-cover ${isCoverFading || isOpen ? 'invitation-cover--hidden' : ''}`}
                        aria-hidden={isOpening || isOpen}
                    >
                        {!isReady && (
                            <span className="invitation-loading" role="status">
                                Loading invitation…
                            </span>
                        )}
                        <span
                            className={`invitation-cover-card ${isReady ? 'invitation-cover-card--ready' : ''}`}
                        >
                            <img
                                src={cover.image}
                                alt="Anggit and Rahmadani"
                                className="invitation-cover-art"
                            />
                            <span className="invitation-cover-content">
                                <span className="invitation-eyebrow">
                                    {cover.eyebrow}
                                </span>
                                <span className="invitation-cover-title">
                                    {cover.title}
                                </span>

                                <span className="invitation-names">
                                    {cover.names}
                                </span>
                                <span className="invitation-date">
                                    {cover.date}
                                </span>
                                <span className="invitation-guest">
                                    <span>{cover.guest.split(',')[0]},</span>{' '}
                                    {cover.guest.split(',')[1]}
                                </span>
                                <span className="invitation-invitation">
                                    {cover.invitation}
                                </span>
                            </span>
                        </span>
                        <button
                            type="button"
                            className="invitation-open-button"
                            aria-label="Open wedding invitation"
                            onClick={openInvitation}
                            disabled={isOpening || isOpen}
                            tabIndex={isOpening || isOpen ? -1 : 0}
                        >
                            <img src={cover.footerOrnament} alt="" />
                        </button>
                    </div>

                    {(isOpening || isOpen) && (
                        <main
                            ref={mainRef}
                            className={`invitation-opening invitation-content ${isContentRevealing ? 'invitation-opening--visible' : 'invitation-opening--hidden'}`}
                            aria-label="Wedding invitation"
                            tabIndex={-1}
                        >
                            <div className="invitation-music-bar">
                                <button
                                    ref={musicControlRef}
                                    type="button"
                                    className="invitation-music-control"
                                    aria-label={
                                        audioUnavailable
                                            ? 'Music unavailable'
                                            : audioPlaybackFailed
                                              ? 'Try music again'
                                              : isPlaying
                                                ? 'Pause music'
                                                : 'Play music'
                                    }
                                    aria-pressed={isPlaying}
                                    disabled={audioUnavailable}
                                    onClick={toggleMusic}
                                >
                                    {!audioUnavailable &&
                                        !audioPlaybackFailed && (
                                            <span aria-hidden="true">
                                                {isPlaying ? '♫' : '♪'}
                                            </span>
                                        )}
                                    {audioUnavailable
                                        ? 'Music unavailable'
                                        : audioPlaybackFailed
                                          ? 'Try music again'
                                          : isPlaying
                                            ? 'Music on'
                                            : 'Play music'}
                                </button>
                            </div>

                            <Reveal>
                                <section
                                    className="invitation-quote-card"
                                    style={{
                                        backgroundImage: `url("${invitation.opening.frame}")`,
                                    }}
                                    aria-label="Wedding blessing"
                                >
                                    <p>{invitation.opening.quote}</p>
                                    <span>{invitation.opening.reference}</span>
                                </section>
                            </Reveal>

                            <Reveal>
                                <section
                                    className="invitation-couple-section"
                                    aria-label="The couple"
                                >
                                    <ProfileCard
                                        profile={invitation.couple.bride}
                                        side="bride"
                                    />
                                    <ProfileCard
                                        profile={invitation.couple.groom}
                                        side="groom"
                                    />
                                </section>
                            </Reveal>

                            <Reveal>
                                <section
                                    className="invitation-event-board"
                                    style={{
                                        backgroundImage: `url("${invitation.eventsFrame}")`,
                                    }}
                                    aria-labelledby="event-heading"
                                >
                                    <h2 id="event-heading" className="sr-only">
                                        Wedding events
                                    </h2>
                                    {invitation.events.map((event) => (
                                        <article
                                            key={event.name}
                                            className="invitation-event-card"
                                        >
                                            <h3>{event.name}</h3>
                                            <p>{event.date}</p>
                                            <p>{event.time}</p>
                                            <p>{event.venue}</p>
                                            <a
                                                href={event.maps}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={`Open map for ${event.name}`}
                                            >
                                                Location
                                            </a>
                                        </article>
                                    ))}
                                </section>
                            </Reveal>

                            <Reveal>
                                <section
                                    className="invitation-countdown-section"
                                    aria-labelledby="countdown-heading"
                                >
                                    <p
                                        id="countdown-heading"
                                        className="invitation-section-label"
                                    >
                                        <span aria-hidden="true">❧</span>{' '}
                                        {invitation.countdown.label}{' '}
                                        <span aria-hidden="true">❧</span>
                                    </p>
                                    <div
                                        className="invitation-countdown-board"
                                        style={{
                                            backgroundImage: `url("${invitation.countdown.frame}")`,
                                        }}
                                    >
                                        <Countdown
                                            target={invitation.countdown.target}
                                            timezone={invitation.timezone}
                                        />
                                    </div>
                                </section>
                            </Reveal>

                            <RsvpSection />

                            <WishesSection wishes={wishes} />

                            <Reveal>
                                <section
                                    className="invitation-gifts-section"
                                    aria-labelledby="gifts-heading"
                                >
                                    <p className="invitation-section-kicker">
                                        A little something
                                    </p>
                                    <h2 id="gifts-heading">Send Gifts</h2>
                                    <p className="invitation-gifts-intro">
                                        {invitation.gifts.intro}
                                    </p>
                                    <div className="invitation-gift-list">
                                        {invitation.gifts.accounts.map(
                                            (account) => (
                                                <article
                                                    key={account.number}
                                                    className="invitation-gift-card"
                                                >
                                                    <span>{account.bank}</span>
                                                    <strong>
                                                        {account.number}
                                                    </strong>
                                                    <small>
                                                        {account.holder}
                                                    </small>
                                                    <button
                                                        type="button"
                                                        aria-label={
                                                            copiedNumber ===
                                                            account.number
                                                                ? `Copied ${account.bank} account number`
                                                                : `Copy ${account.bank} account number`
                                                        }
                                                        onClick={() =>
                                                            void copyAccountNumber(
                                                                account.number,
                                                            )
                                                        }
                                                    >
                                                        {copiedNumber ===
                                                        account.number
                                                            ? 'Copied'
                                                            : 'Copy'}
                                                    </button>
                                                </article>
                                            ),
                                        )}
                                    </div>
                                    {copyFeedback && (
                                        <p
                                            className={
                                                copyFailed
                                                    ? 'invitation-form-copy-error'
                                                    : 'invitation-form-success'
                                            }
                                            role="status"
                                        >
                                            {copyFeedback}
                                        </p>
                                    )}
                                </section>
                            </Reveal>

                            <Reveal>
                                <section
                                    className="invitation-gallery-section"
                                    aria-labelledby="gallery-heading"
                                >
                                    <p className="invitation-section-kicker">
                                        Our memories
                                    </p>
                                    <h2 id="gallery-heading">Gallery</h2>
                                    <div className="invitation-gallery-grid">
                                        {invitation.gallery.map((image) => (
                                            <button
                                                type="button"
                                                key={image.src}
                                                className="invitation-gallery-item"
                                                onClick={(event) => {
                                                    galleryTriggerRef.current =
                                                        event.currentTarget;
                                                    setSelectedImage(image);
                                                }}
                                            >
                                                <img
                                                    src={image.src}
                                                    alt={image.alt}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </Reveal>

                            <Reveal>
                                <section
                                    className="invitation-story-section"
                                    aria-labelledby="story-heading"
                                >
                                    <h2 id="story-heading">
                                        <span aria-hidden="true">〰</span>{' '}
                                        {invitation.story.title}{' '}
                                        <span aria-hidden="true">〰</span>
                                    </h2>
                                    <div className="invitation-story-list">
                                        {invitation.story.entries.map(
                                            (entry, index) => (
                                                <article
                                                    key={entry.period}
                                                    className={`invitation-story-entry invitation-story-entry--${index % 2 === 0 ? 'art-first' : 'text-first'}`}
                                                >
                                                    <img
                                                        src={entry.ornament}
                                                        alt=""
                                                    />
                                                    <div>
                                                        <p className="invitation-story-period">
                                                            {entry.title}
                                                            <br />
                                                            {entry.period}
                                                        </p>
                                                        <p>{entry.copy}</p>
                                                    </div>
                                                </article>
                                            ),
                                        )}
                                    </div>
                                    <p className="invitation-story-credit">
                                        {invitation.story.credit}
                                    </p>
                                </section>
                            </Reveal>

                            <footer className="invitation-footer">
                                <img src={cover.footerOrnament} alt="" />
                                <p>Thank you for celebrating with us.</p>
                            </footer>
                        </main>
                    )}

                    {selectedImage && (
                        <dialog
                            ref={lightboxRef}
                            className="invitation-lightbox"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Gallery image viewer"
                            onCancel={(event) => {
                                event.preventDefault();
                                closeLightbox();
                            }}
                            onClick={(event) => {
                                if (event.target === event.currentTarget) {
                                    closeLightbox();
                                }
                            }}
                        >
                            <div className="invitation-lightbox-content">
                                <button
                                    ref={lightboxCloseRef}
                                    type="button"
                                    className="invitation-lightbox-close"
                                    aria-label="Close gallery image"
                                    onClick={closeLightbox}
                                >
                                    ×
                                </button>
                                <img
                                    src={selectedImage.src}
                                    alt={selectedImage.alt}
                                />
                            </div>
                        </dialog>
                    )}
                </div>
            </div>
        </>
    );
}
