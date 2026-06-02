import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { privacyPolicy, type LegalDoc } from '@/content/privacy';
import { termsOfService } from '@/content/terms';

/**
 * Renders the full GDPR privacy policy or the terms of service from
 * `content/privacy.ts` / `content/terms.ts` (LT/EN, picked by the active
 * UI language). The mobile app links here rather than duplicating the
 * text, so these pages are the single source of truth.
 */
export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
    const { t, i18n } = useTranslation();
    const en = i18n.language?.startsWith('en');
    const source = kind === 'privacy' ? privacyPolicy : termsOfService;
    const doc: LegalDoc = en ? source.en : source.lt;

    return (
        <div className="min-h-screen bg-surface text-ink px-6 py-16">
            <div className="max-w-2xl mx-auto">
                <Link to="/" className="text-sm font-semibold text-souply-beet hover:underline">
                    ← {t('brand.name')}
                </Link>
                <h1 className="text-2xl font-bold mt-4 mb-1">{doc.title}</h1>
                <p className="text-xs text-ink-faint mb-8">{doc.updatedLabel}: {doc.updated}</p>

                <p className="text-sm text-ink-soft leading-relaxed mb-8">{doc.intro}</p>

                {doc.sections.map((s, i) => (
                    <section key={i} className="mb-6">
                        {s.h && <h2 className="text-base font-semibold text-ink mb-2">{s.h}</h2>}
                        {s.p?.map((para, j) => (
                            <p key={j} className="text-sm text-ink-soft leading-relaxed mb-2">{para}</p>
                        ))}
                        {s.ul && (
                            <ul className="list-disc pl-5 flex flex-col gap-1.5 mb-2">
                                {s.ul.map((li, j) => (
                                    <li key={j} className="text-sm text-ink-soft leading-relaxed">{li}</li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
}
