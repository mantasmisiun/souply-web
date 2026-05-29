import { useMemo } from 'react';
import { chainBrandColorById } from '@/lib/chainBrand';
import type { ChainLogo } from '@/lib/products';

interface Props {
    chainLogos: ChainLogo[] | string | null | undefined;
    className?: string;
}

function parse(raw: Props['chainLogos']): ChainLogo[] {
    if (!raw) return [];
    if (typeof raw === 'string') {
        try { return JSON.parse(raw) as ChainLogo[]; } catch { return []; }
    }
    return raw;
}

/**
 * Web port of basket-app/components/ChainLogoStrip.tsx. Same overlap
 * + slight rotation on the second tile, same "+N" overflow indicator
 * so a product card visually screams "Maxima + Rimi (+2)" in the
 * same way it does on mobile. Sits absolutely positioned over the
 * product image's top-left corner — the parent owns positioning.
 */
export function ChainLogoStrip({ chainLogos, className }: Props) {
    const logos = useMemo(() => parse(chainLogos), [chainLogos]);
    if (logos.length === 0) return null;

    const shown = logos.slice(0, 2);
    const overflow = logos.length - 2;

    return (
        <div className={className ?? ''}>
            <div className="flex items-center">
                {shown.map(({ chainId, logoUrl }, i) => (
                    <div
                        key={chainId}
                        className={
                            'size-[17px] rounded-[4px] grid place-items-center overflow-hidden ' +
                            (i > 0 ? '-ml-2 rotate-[12deg]' : '')
                        }
                        style={{ backgroundColor: chainBrandColorById(chainId) }}
                    >
                        {logoUrl ? (
                            <img src={logoUrl} alt="" className="size-[13px] object-contain" />
                        ) : (
                            <span className="text-[7px] font-bold text-white leading-none">{chainId}</span>
                        )}
                    </div>
                ))}
                {overflow > 0 && (
                    <span className="ml-0.5 text-[9px] font-bold text-ink">+{overflow}</span>
                )}
            </div>
        </div>
    );
}
