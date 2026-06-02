import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, X } from 'lucide-react';
import { checkUsernameAvailable, setUsername as apiSetUsername, type UsernameRejectReason } from '@/lib/username';

/**
 * Required first-sign-in username picker. Shown after a creator signs in
 * (Google) when the account has no @handle yet. Not dismissible — a creator
 * needs a username for their public profile + share links. Mirrors the app's
 * CreateUsernameModal so both surfaces behave identically.
 */
export function CreateUsernameModal({ open, onDone }: { open: boolean; onDone: (username: string) => void }) {
    const { t } = useTranslation();
    const [candidate, setCandidate] = useState('');
    const [busy, setBusy] = useState(false);
    const [state, setState] = useState<{ available?: boolean; reason?: UsernameRejectReason; checking?: boolean }>({});
    const debounceRef = useRef<number | null>(null);

    useEffect(() => {
        if (!open) return;
        const trimmed = candidate.trim();
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        if (trimmed.length < 3) { setState({}); return; }
        setState((p) => ({ ...p, checking: true }));
        debounceRef.current = window.setTimeout(async () => {
            const out = await checkUsernameAvailable(trimmed);
            setState({ available: out.available, reason: out.reason, checking: false });
        }, 300);
        return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
    }, [candidate, open]);

    const submit = async () => {
        const trimmed = candidate.trim();
        if (!trimmed || busy) return;
        setBusy(true);
        const out = await apiSetUsername(trimmed);
        setBusy(false);
        if (!out.ok) { setState({ available: false, reason: out.reason }); return; }
        onDone(out.username);
    };

    const reasonText = (r?: UsernameRejectReason): string => {
        switch (r) {
            case 'taken': return t('username.taken');
            case 'reserved': return t('username.reserved');
            case 'too-short': return t('username.tooShort');
            case 'too-long': return t('username.tooLong');
            case 'rate-limited': return t('username.rateLimited');
            case 'bad-format': return t('username.invalid');
            default: return '';
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-6">
            <div className="w-full max-w-sm rounded-3xl bg-surface text-ink p-7 shadow-card">
                <h2 className="text-xl font-bold">{t('username.title')}</h2>
                <p className="text-sm text-ink-soft mt-2 mb-5 leading-relaxed">{t('username.body')}</p>

                <div className="flex items-center gap-2 rounded-xl ring-1 ring-edge focus-within:ring-2 focus-within:ring-souply-beet/60 px-3 py-2.5">
                    <span className="text-ink-soft font-bold">@</span>
                    <input
                        type="text"
                        value={candidate}
                        onChange={(e) => setCandidate(e.target.value.toLowerCase())}
                        autoCapitalize="none"
                        autoCorrect="off"
                        placeholder={t('username.placeholder')}
                        className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink-soft"
                        onKeyDown={(e) => { if (e.key === 'Enter' && state.available && !busy) submit(); }}
                    />
                    {state.checking && <Loader2 size={16} className="animate-spin text-souply-beet" />}
                    {!state.checking && state.available === true && <Check size={16} className="text-souply-beet" />}
                    {!state.checking && state.available === false && <X size={16} className="text-red-500" />}
                </div>
                {state.reason && <p className="text-xs text-red-500 mt-2">{reasonText(state.reason)}</p>}

                <button
                    type="button"
                    onClick={submit}
                    disabled={!state.available || busy}
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-souply-beet text-white text-sm font-semibold shadow-card hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : t('username.confirm')}
                </button>
            </div>
        </div>
    );
}
