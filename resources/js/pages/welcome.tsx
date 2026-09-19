import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type Invitation = {
    title: string;
    audio: string;
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
};

type WelcomeProps = {
    invitation: Invitation;
};

export default function Welcome({ invitation }: WelcomeProps) {
    const [isReady, setIsReady] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { cover } = invitation;

    useEffect(() => {
        const readyTimer = window.setTimeout(() => setIsReady(true), 350);

        return () => window.clearTimeout(readyTimer);
    }, []);

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
                            className="invitation-opening"
                            aria-label="Wedding invitation"
                        >
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

                            <section className="invitation-opening-card">
                                <p className="invitation-opening-kicker">
                                    Welcome to our celebration
                                </p>
                                <h1>Latif &amp; Aci</h1>
                                <p>
                                    Thank you for being part of our special day.
                                </p>
                                <img src={cover.footerOrnament} alt="" />
                            </section>
                        </main>
                    )}
                </div>
            </div>
        </>
    );
}
