import { TemplateBrowsePanel } from './TemplateBrowsePanel';

/**
 * Pink-area surface during the create-template flow. The coloured cover
 * bar is now rendered at PAGE level by App (so it extends behind the
 * left band's rounded-corner cutout, matching the Atverti view). This
 * surface just hosts the shared TemplateBrowsePanel below that bar —
 * the `pt-16` offset clears the 64px page-level bar.
 */
export function CreateTemplateView() {
    return (
        <div className="h-full flex flex-col pt-16">
            <div className="flex-1 min-h-0">
                <TemplateBrowsePanel />
            </div>
        </div>
    );
}
