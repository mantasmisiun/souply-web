import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { firstImageUrl, type ProductRow as ProductRowData } from '@/lib/products';
import { formatBrowseAmount } from '@/lib/formatAmount';
import { resolveDisplayUnit } from '@/lib/canonicalStep';
import { QuantityControl } from './QuantityControl';
import { ChainLogoStrip } from './ChainLogoStrip';

interface Props {
    product: ProductRowData;
    /** Quantity currently in the draft template. 0 = not added.
     *  Card flips to a +/− stepper for non-zero values, matching the
     *  mobile basket-app BasketProductCard behaviour. */
    quantity: number;
    onAdd: () => void;
    onDecrement: () => void;
    onIncrement: () => void;
}

/**
 * Vertical product card — direct port of basket-app's BasketProductCard.
 * Layout from top: square image area (with placeholder when no URL),
 * up-to-three-line name, optional amount/brand line, then the bottom
 * slot which is either the "Į šabloną" CTA (quantity=0) or the
 * QuantityControl stepper (quantity>0).
 *
 * Sized for a 4-column grid on the web create-template surface (mobile
 * uses 2). Same component name (ProductRow) kept for diff clarity even
 * though it's now a card; the file gets renamed in a follow-up sweep.
 */
export function ProductRow({ product, quantity, onAdd, onDecrement, onIncrement }: Props) {
    const { t } = useTranslation();
    const img = firstImageUrl(product.imageUrls);

    // Match the mobile BasketProductCard's "amountText" line —
    // ranges like "500 g - 1 kg" when min ≠ max, single value
    // otherwise. We deliberately don't append "(sveriamas)" here:
    // on the browse card a weighable product still has a single
    // canonical amount line, and the AmountPickerModal is where the
    // "sold by weight" framing belongs.
    const amountText = formatBrowseAmount(product);
    const stepperUnit = resolveDisplayUnit(product) || null;

    return (
        <motion.div
            /* `layout` removed deliberately: with 200+ cards in a grid
             * its per-item layout measurement was the single biggest
             * cost on L2 change (could freeze the main thread for
             * 30+ s on slower laptops). We don't need layout animation
             * here — the parent CSS card-enter handles the entrance. */
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            className="group h-full flex flex-col bg-surface rounded-xl ring-1 ring-edge-subtle shadow-card hover:shadow-pop transition-shadow p-3"
        >
            {/* Image */}
            <button
                type="button"
                onClick={onAdd}
                className="relative w-full aspect-square mb-2 rounded-lg bg-surface-muted overflow-hidden grid place-items-center"
                aria-label={product.name}
            >
                {img ? (
                    <img
                        src={img}
                        alt=""
                        className="w-full h-full object-contain"
                        loading="lazy"
                    />
                ) : (
                    /* Matches basket-app's ProductImage placeholder so a
                     * missing photo reads the same on web as on the
                     * phone — beetroot 🫜, the project mascot. */
                    <span className="text-4xl opacity-40 select-none">🫜</span>
                )}
                {/* Chain-logo badge — same position the mobile BasketProductCard
                    puts it (top-left of the image). Shows up to 2 logos with a
                    "+N" overflow indicator. */}
                <ChainLogoStrip
                    chainLogos={product.chainLogos}
                    className="absolute top-1.5 left-1.5 pointer-events-none"
                />
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0 mb-2.5">
                <div className="text-[13px] font-medium text-ink leading-[1.3] line-clamp-3">
                    {product.name}
                </div>
                {amountText && (
                    <div className="text-[11px] text-ink-soft mt-0.5 truncate">
                        {amountText}
                    </div>
                )}
            </div>

            {/* Bottom slot — CTA or stepper, sharing the same slot
                height so the card doesn't reflow on add. */}
            {quantity === 0 ? (
                <button
                    type="button"
                    onClick={onAdd}
                    className="w-full py-2 rounded-lg bg-souply-beet text-white text-[13px] font-semibold hover:bg-souply-beetDeep transition-colors"
                >
                    {t('browse.include')}
                </button>
            ) : (
                <QuantityControl
                    quantity={quantity}
                    onDecrement={onDecrement}
                    onIncrement={onIncrement}
                    unit={stepperUnit}
                />
            )}
        </motion.div>
    );
}
