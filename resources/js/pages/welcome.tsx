import { Form, Head } from '@inertiajs/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import RsvpController from '@/actions/App/Http/Controllers/RsvpController';

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
        frame: string;
        ornament: string;
        bridePhoto: string;
        groomPhoto: string;
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
};

type WelcomeProps = {
    invitation: Invitation;
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
                                />
                                {errors.name && (
                                    <small className="invitation-form-error">
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
                                    <small className="invitation-form-error">
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
                                    />
                                    {errors.guest_count && (
                                        <small className="invitation-form-error">
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
                                />
                                {errors.message && (
                                    <small className="invitation-form-error">
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

export default function Welcome({ invitation }: WelcomeProps) {
    const [isReady, setIsReady] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(
        null,
    );
    const audioRef = useRef<HTMLAudioElement>(null);
    const { cover } = invitation;

    useEffect(() => {
        const readyTimer = window.setTimeout(() => setIsReady(true), 350);

        return () => window.clearTimeout(readyTimer);
    }, []);

    useEffect(() => {
        if (!selectedImage) {
            return;
        }

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelectedImage(null);
            }
        };

        document.addEventListener('keydown', closeOnEscape);

        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [selectedImage]);

    function openInvitation() {
        setIsOpen(true);

        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        audio.volume = 0.35;
        void audio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
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

        void audio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
    }

    async function copyAccountNumber(number: string) {
        try {
            await navigator.clipboard.writeText(number);
            setCopiedNumber(number);
            window.setTimeout(() => setCopiedNumber(null), 1600);
        } catch {
            setCopiedNumber(null);
        }
    }

    return (
        <>
            <Head title={invitation.title} />

            <div className="invitation-viewport">
                <div className="invitation-canvas">
                    <audio
                        ref={audioRef}
                        preload="metadata"
                        src={invitation.audio}
                    />

                    <button
                        type="button"
                        className={`invitation-cover ${isOpen ? 'invitation-cover--hidden' : ''}`}
                        aria-label="Open wedding invitation"
                        onClick={openInvitation}
                    >
                        <span
                            className={`invitation-cover-card ${isReady ? 'invitation-cover-card--ready' : ''}`}
                            style={{ backgroundImage: `url("${cover.frame}")` }}
                        >
                            <span className="invitation-cover-content">
                                <span className="invitation-eyebrow">
                                    {cover.eyebrow}
                                </span>
                                <span className="invitation-cover-title">
                                    {cover.title}
                                </span>

                                <span className="invitation-cover-portraits">
                                    <img
                                        src={cover.ornament}
                                        alt=""
                                        className="invitation-cover-ornament"
                                    />
                                    <img
                                        src={cover.bridePhoto}
                                        alt=""
                                        className="invitation-cover-photo invitation-cover-photo--bride"
                                    />
                                    <img
                                        src={cover.groomPhoto}
                                        alt=""
                                        className="invitation-cover-photo invitation-cover-photo--groom"
                                    />
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

                            <img
                                src={cover.footerOrnament}
                                alt=""
                                className="invitation-cover-footer"
                            />
                        </span>
                    </button>

                    {isOpen && (
                        <main
                            className="invitation-opening invitation-content"
                            aria-label="Wedding invitation"
                        >
                            <div className="invitation-music-bar">
                                <button
                                    type="button"
                                    className="invitation-music-control"
                                    aria-label={
                                        isPlaying ? 'Pause music' : 'Play music'
                                    }
                                    aria-pressed={isPlaying}
                                    onClick={toggleMusic}
                                >
                                    <span aria-hidden="true">
                                        {isPlaying ? '♫' : '♪'}
                                    </span>
                                    {isPlaying ? 'Music on' : 'Play music'}
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
                                                onClick={() =>
                                                    setSelectedImage(image)
                                                }
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

                            <footer className="invitation-footer">
                                <img src={cover.footerOrnament} alt="" />
                                <p>Thank you for celebrating with us.</p>
                            </footer>
                        </main>
                    )}

                    {selectedImage && (
                        <div
                            className="invitation-lightbox"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Gallery image"
                            onClick={() => setSelectedImage(null)}
                        >
                            <div
                                className="invitation-lightbox-content"
                                onClick={(event) => event.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    className="invitation-lightbox-close"
                                    aria-label="Close gallery image"
                                    onClick={() => setSelectedImage(null)}
                                >
                                    ×
                                </button>
                                <img
                                    src={selectedImage.src}
                                    alt={selectedImage.alt}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
