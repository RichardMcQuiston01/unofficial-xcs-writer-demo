import { useCallback, useState } from 'react';

const STORAGE_KEY = 'donate-card-dismissed';
const DEFAULT_DONATE_URL = 'https://donate.stripe.com/00w5kD3Gj1Xo9v7gVOcs800';
const DEFAULT_QR_SRC = '/donate.svg';

export interface DonateCardProps {
  /** Stripe payment link the card sends people to. */
  readonly donateUrl?: string;
  /** Path to the generated QR SVG, relative to the served root. */
  readonly qrSrc?: string;
  /** Set false to make the card non-dismissible (not recommended). */
  readonly dismissible?: boolean;
}

export function DonateCard({
  donateUrl = DEFAULT_DONATE_URL,
  qrSrc = DEFAULT_QR_SRC,
  dismissible = true,
}: DonateCardProps) {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const handleDismiss = useCallback((): void => {
    setIsVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* Non-fatal. */
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <aside className="donate-card" id="donateCard" aria-labelledby="donateCardTitle">
      {dismissible ? (
        <button
          className="donate-card__dismiss"
          type="button"
          aria-label="Dismiss support message"
          onClick={handleDismiss}
        >
          &times;
        </button>
      ) : null}

      <h2 className="donate-card__title" id="donateCardTitle">
        <span className="donate-card__heart" aria-hidden="true">
          &#9829;
        </span>
        Support this project
      </h2>

      <p className="donate-card__body">
        If this app, code, or repository has helped you or someone you know, please consider
        donating. I appreciate any help to offset the costs of development and/or AI Credits.
      </p>

      <div className="donate-card__qr">
        <img
          src={qrSrc}
          alt="QR code linking to the Stripe donation page"
          width={180}
          height={180}
        />
      </div>

      <a
        className="donate-card__link"
        href={donateUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Donate via Stripe, opens in a new tab"
      >
        Donate via Stripe <span aria-hidden="true">&rarr;</span>
      </a>
    </aside>
  );
}
