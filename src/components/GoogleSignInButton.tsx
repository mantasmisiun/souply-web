import { useEffect, useRef } from 'react';

/**
 * Google Identity Services button. Loads the GIS script once, renders
 * Google's own (policy-required) button, and hands the returned ID-token
 * credential up via `onCredential`. The parent exchanges it at
 * /api/auth/oauth.
 *
 * Renders nothing if `VITE_GOOGLE_CLIENT_ID` isn't set (e.g. a build
 * without OAuth configured) — the dev-auth bypass still covers sign-in
 * in that case.
 */
const GIS_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        google?: any;
    }
}

let gisPromise: Promise<void> | null = null;
function loadGis(): Promise<void> {
    if (gisPromise) return gisPromise;
    gisPromise = new Promise<void>((resolve, reject) => {
        if (window.google?.accounts?.id) return resolve();
        const s = document.createElement('script');
        s.src = GIS_SRC;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('GIS failed to load'));
        document.head.appendChild(s);
    });
    return gisPromise;
}

export function GoogleSignInButton({
    onCredential,
    disabled = false,
}: {
    onCredential: (idToken: string) => void;
    disabled?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    // Hold the latest callback in a ref so the init effect can run ONCE
    // (empty deps) without going stale — re-running it would call
    // google.accounts.id.initialize() repeatedly (GIS warns + only keeps
    // the last instance).
    const cbRef = useRef(onCredential);
    cbRef.current = onCredential;

    useEffect(() => {
        if (!CLIENT_ID) return;
        let cancelled = false;
        loadGis()
            .then(() => {
                if (cancelled || !ref.current || !window.google?.accounts?.id) return;
                window.google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    callback: (resp: any) => {
                        if (resp?.credential) cbRef.current(resp.credential);
                    },
                });
                // Match the panel width (GIS caps at 400) so the button
                // fills the row like the Apple button instead of a fixed
                // 320px white box centred in a wider container.
                const width = Math.min(Math.round(ref.current.offsetWidth) || 320, 400);
                window.google.accounts.id.renderButton(ref.current, {
                    theme: 'filled_black',     // dark pill — matches the Apple button + dark panel
                    size: 'large',
                    type: 'standard',
                    text: 'continue_with',
                    shape: 'pill',
                    logo_alignment: 'left',
                    width,
                });
            })
            .catch(() => { /* offline / blocked — dev bypass remains available */ });
        return () => { cancelled = true; };
    }, []);

    if (!CLIENT_ID) return null;
    return (
        <div
            ref={ref}
            aria-disabled={disabled}
            style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
        />
    );
}
