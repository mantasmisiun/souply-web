import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ease } from '@/lib/motion';
import { updateProfile, uploadAvatar } from '@/lib/auth';

interface Props {
    open: boolean;
    onClose: () => void;
    currentFirstName: string;
    currentLastName: string;
    /** Displayed name, used to seed the fields when first/last are both
     *  empty (e.g. an OAuth account that only ever set displayName). */
    currentName?: string;
    currentAvatarUrl: string | null;
    initials: string;
    /** Called with the saved values so the parent can update the session user
     *  directly (no /me round-trip — which 401s on the dev bypass). */
    onSaved: (u: { firstName: string; lastName: string; avatarUrl: string | null }) => void;
}

/** Downscale a picked image to a 512×512 JPEG and return the bare base64
 *  (no `data:` prefix) — keeps the upload small; the API re-compresses too. */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('read-failed'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('decode-failed'));
            img.onload = () => {
                const size = 512;
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('no-ctx'));
                // cover-crop to a square
                const scale = Math.max(size / img.width, size / img.height);
                const w = img.width * scale, h = img.height * scale;
                ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.85).replace(/^data:image\/\w+;base64,/, ''));
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    });
}

export function ProfileEditDialog({ open, onClose, currentFirstName, currentLastName, currentName, currentAvatarUrl, initials, onSaved }: Props) {
    const { t } = useTranslation();
    const [firstName, setFirstName] = useState(currentFirstName);
    const [lastName, setLastName] = useState(currentLastName);
    const [preview, setPreview] = useState<string | null>(null);
    const [base64, setBase64] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // Re-seed the fields each time the dialog opens. `useState` only runs its
    // initializer on first mount, but this dialog stays mounted (toggled via
    // `open`) so the session may not have hydrated when it first rendered.
    // When first/last are both empty, fall back to splitting the displayed
    // name so the user never faces blank inputs while a name is clearly set.
    useEffect(() => {
        if (!open) return;
        setPreview(null);
        setBase64(null);
        setError(false);
        if (!currentFirstName && !currentLastName) {
            const parts = (currentName ?? '').trim().split(/\s+/).filter(Boolean);
            setFirstName(parts[0] ?? '');
            setLastName(parts.slice(1).join(' '));
        } else {
            setFirstName(currentFirstName);
            setLastName(currentLastName);
        }
    }, [open, currentFirstName, currentLastName, currentName]);

    const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        try {
            const b64 = await fileToBase64(file);
            setBase64(b64);
            setPreview(`data:image/jpeg;base64,${b64}`);
        } catch { setError(true); }
    };

    const save = async () => {
        if (saving) return;
        setSaving(true);
        setError(false);
        try {
            let avatarUrl = currentAvatarUrl;
            if (base64) {
                const r = await uploadAvatar(base64);
                avatarUrl = r.avatarUrl;
            }
            const fn = firstName.trim(), ln = lastName.trim();
            if (fn !== currentFirstName || ln !== currentLastName) {
                await updateProfile({ firstName: fn, lastName: ln });
            }
            onSaved({ firstName: fn, lastName: ln, avatarUrl });
            onClose();
        } catch {
            setError(true);
        } finally {
            setSaving(false);
        }
    };

    const shownAvatar = preview ?? currentAvatarUrl;

    return (
        <AnimatePresence>
            {open && (
                <motion.div key="pe-root" className="fixed inset-0 grid place-items-center px-6" style={{ zIndex: 60 }}>
                    <motion.div
                        key="pe-backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        key="pe-dialog"
                        role="dialog"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97, transition: { duration: 0.14 } }}
                        transition={{ duration: 0.24, ease: ease.soft }}
                        className="relative w-full max-w-sm rounded-3xl bg-surface text-ink ring-1 ring-edge shadow-pop p-6"
                    >
                        <button
                            type="button" onClick={onClose} aria-label="Close"
                            className="absolute right-3 top-3 size-8 grid place-items-center rounded-full bg-surface-muted hover:bg-edge text-ink-soft transition"
                        >
                            <X size={16} />
                        </button>
                        <h2 className="text-base font-bold mb-4">{t('dashboard.editProfile.title')}</h2>

                        <div className="flex flex-col items-center gap-3 mb-5">
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="relative size-20 rounded-full overflow-hidden grid place-items-center bg-souply-beet text-white font-bold text-2xl"
                            >
                                {shownAvatar
                                    ? <img src={shownAvatar} alt="" className="size-full object-cover" />
                                    : <span>{initials}</span>}
                                <span className="absolute inset-x-0 bottom-0 h-7 grid place-items-center bg-black/45">
                                    <Camera size={14} className="text-white" />
                                </span>
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />
                        </div>

                        <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                            {t('dashboard.editProfile.firstNameLabel')}
                        </label>
                        <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            maxLength={100}
                            className="w-full rounded-xl bg-surface-muted ring-1 ring-edge px-3 py-2.5 text-sm text-ink outline-none focus:ring-souply-beet"
                        />
                        <label className="block text-xs font-semibold text-ink-soft mb-1.5 mt-3">
                            {t('dashboard.editProfile.lastNameLabel')}
                        </label>
                        <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            maxLength={100}
                            className="w-full rounded-xl bg-surface-muted ring-1 ring-edge px-3 py-2.5 text-sm text-ink outline-none focus:ring-souply-beet"
                        />

                        {error && (
                            <div className="mt-3 text-[13px] text-red-400">{t('dashboard.editProfile.failed')}</div>
                        )}

                        <div className="mt-5 flex gap-2 justify-end">
                            <button
                                type="button" onClick={onClose}
                                className="px-4 py-2 rounded-xl text-ink-soft hover:bg-white/5 text-sm font-medium transition"
                            >
                                {t('dashboard.editProfile.cancel')}
                            </button>
                            <button
                                type="button" onClick={save} disabled={saving}
                                className="px-4 py-2 rounded-xl bg-souply-beet text-white text-sm font-semibold disabled:opacity-60 transition"
                            >
                                {saving ? t('dashboard.editProfile.saving') : t('dashboard.editProfile.save')}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
