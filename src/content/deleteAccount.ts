/**
 * Account & data deletion instructions, LT + EN. Rendered by LegalPage at
 * /legal/delete-account. This is the public, no-login URL Google Play's Data
 * Safety form requires: it must explain how a user requests deletion of their
 * account and associated data, what is removed, and what (if anything) is kept.
 */
import type { LegalDoc } from './privacy';

export const deleteAccount: Record<'lt' | 'en', LegalDoc> = {
    en: {
        title: 'Delete Your Account & Data',
        updatedLabel: 'Last updated',
        updated: '4 June 2026',
        intro:
            'You can delete your Souply account and the personal data associated with it at any time. This page explains how to do it from within the app, how to request it if you can no longer access the app, what gets deleted, and how long it takes.',
        sections: [
            {
                h: '1. Delete from within the app',
                p: [
                    'Open Souply and go to the Profile tab, then Settings, and tap “Delete account”. You will be asked to confirm. Once confirmed, your account and associated personal data are removed.',
                ],
            },
            {
                h: '2. Request deletion by email',
                p: [
                    'If you have uninstalled the app or cannot sign in, email support@souply.lt from the address linked to your account (or include enough detail to identify it) with the subject “Account deletion”. We will verify the request and delete your data.',
                ],
            },
            {
                h: '3. What gets deleted',
                ul: [
                    'Your account and profile (name, email address, avatar, and @handle)',
                    'Templates and shopping lists you created',
                    'Scanned receipts and the purchase history derived from them',
                    'Saved baskets and in-app activity used for personalisation',
                    'The account/device identifier that links this data to you',
                ],
            },
            {
                h: '4. What we may keep',
                p: [
                    'We delete data that identifies you. Anonymous, aggregated statistics that can no longer be linked to you (for example, overall product price trends) may be retained. We may also retain limited records where the law requires it, for no longer than required, after which they are deleted.',
                ],
            },
            {
                h: '5. How long it takes',
                p: [
                    'In-app deletion takes effect immediately. Email requests are processed within 30 days. For any questions, contact support@souply.lt.',
                ],
            },
        ],
    },
    lt: {
        title: 'Paskyros ir duomenų ištrynimas',
        updatedLabel: 'Atnaujinta',
        updated: '2026 m. birželio 4 d.',
        intro:
            'Savo Souply paskyrą ir su ja susijusius asmens duomenis gali ištrinti bet kada. Šiame puslapyje paaiškinta, kaip tai padaryti programėlėje, kaip pateikti prašymą, jei nebegali prisijungti, kokie duomenys ištrinami ir per kiek laiko.',
        sections: [
            {
                h: '1. Ištrynimas programėlėje',
                p: [
                    'Atidaryk Souply, eik į skiltį „Profilis“, tuomet „Nustatymai“ ir paspausk „Ištrinti paskyrą“. Būsi paprašyta (-as) patvirtinti. Patvirtinus, tavo paskyra ir su ja susiję asmens duomenys pašalinami.',
                ],
            },
            {
                h: '2. Prašymas el. paštu',
                p: [
                    'Jei pašalinai programėlę arba negali prisijungti, parašyk adresu support@souply.lt iš su paskyra susieto el. pašto (arba nurodyk pakankamai informacijos jai identifikuoti) su tema „Paskyros ištrynimas“. Patikrinsime prašymą ir ištrinsime tavo duomenis.',
                ],
            },
            {
                h: '3. Kokie duomenys ištrinami',
                ul: [
                    'Tavo paskyra ir profilis (vardas, el. paštas, nuotrauka ir @vardas)',
                    'Tavo sukurti šablonai ir pirkinių sąrašai',
                    'Nuskenuoti kvitai ir iš jų gauta pirkimų istorija',
                    'Išsaugoti krepšeliai ir personalizavimui naudoti veiksmai programėlėje',
                    'Paskyros / įrenginio identifikatorius, siejantis šiuos duomenis su tavimi',
                ],
            },
            {
                h: '4. Ką galime išsaugoti',
                p: [
                    'Ištriname tave identifikuojančius duomenis. Anoniminė, apibendrinta statistika, kurios nebegalima susieti su tavimi (pavyzdžiui, bendros prekių kainų tendencijos), gali būti saugoma. Taip pat galime saugoti ribotus įrašus, jei to reikalauja įstatymai, ne ilgiau nei būtina; vėliau jie ištrinami.',
                ],
            },
            {
                h: '5. Per kiek laiko',
                p: [
                    'Ištrynimas programėlėje įsigalioja iš karto. Prašymai el. paštu apdorojami per 30 dienų. Kilus klausimams, rašyk support@souply.lt.',
                ],
            },
        ],
    },
};
