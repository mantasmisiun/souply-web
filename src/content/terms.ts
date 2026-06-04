/**
 * Terms of Service content, LT + EN. Same structure + renderer as the
 * privacy policy (see content/privacy.ts). Single source of truth rendered
 * by LegalPage at /legal/terms; the mobile app links here rather than
 * duplicating the text.
 */
import type { LegalDoc } from './privacy';

export const termsOfService: Record<'lt' | 'en', LegalDoc> = {
    en: {
        title: 'Terms of Service',
        updatedLabel: 'Last updated',
        updated: '1 June 2026',
        intro:
            'These Terms of Service ("Terms") govern your use of the Souply mobile app and the website at souply.lt (together, the "Service"), provided by Mantas Misiūnas (Lithuania) ("Souply", "we", "us"). By using the Service, you agree to these Terms. If you do not agree, please do not use the Service.',
        sections: [
            {
                h: '1. The Service',
                p: [
                    'Souply helps you compare grocery prices across Lithuanian stores, scan receipts, and build and share shopping baskets and templates. The Service is currently provided free of charge.',
                    'We may introduce paid or premium features in the future. If we do, they will be clearly identified and offered under separate terms, and you will never be charged without your express consent.',
                ],
            },
            {
                h: '2. Eligibility',
                p: ['You must be at least 16 years old to use the Service. By using it, you confirm that you meet this requirement.'],
            },
            {
                h: '3. Accounts',
                ul: [
                    'You can browse anonymously. Some features (saving data, publishing templates) require an account, created via Google or Apple sign-in.',
                    'You are responsible for activity under your account and for keeping access to your sign-in method secure.',
                    'You may delete your account at any time (in the app: Profile → Settings → Account → Delete account). See our Privacy Policy for what deletion does.',
                ],
            },
            {
                h: '4. Price information — important',
                ul: [
                    'Prices and product information are gathered from publicly available store sources and from receipts submitted by users. They are provided for general information only.',
                    'We do not guarantee that any price, discount, availability, or product detail is accurate, complete, or current. Prices change frequently and may differ in-store.',
                    'Always check the actual price at the store before purchasing. We are not liable for purchasing decisions made based on information in the Service.',
                ],
            },
            {
                h: '5. No affiliation with retailers',
                p: [
                    'Souply is an independent service. Store names, logos, and trademarks (e.g. Maxima, Rimi, IKI, Norfa, Lidl, Barbora) belong to their respective owners. Souply is not affiliated with, endorsed by, or sponsored by any of these retailers.',
                ],
            },
            {
                h: '6. Your content',
                ul: [
                    'You retain ownership of the content you create (receipts, baskets, shopping lists, templates).',
                    'By submitting content, you grant us a non-exclusive, worldwide, royalty-free licence to host, store, display, and process it solely to operate and improve the Service — including, for templates you choose to publish, displaying them publicly together with your @username.',
                    "You are responsible for the content you submit and confirm you have the right to share it. Do not upload content that is unlawful, infringing, or contains other people's personal data without their consent.",
                    'We may remove content that violates these Terms or the law.',
                ],
            },
            {
                h: '7. Acceptable use',
                p: ['You agree not to:'],
                ul: [
                    'use the Service for any unlawful purpose or in breach of these Terms;',
                    'scrape, copy, or harvest data from the Service at scale, or resell it;',
                    'attempt to disrupt, overload, reverse-engineer, or gain unauthorised access to the Service or its infrastructure;',
                    'upload malware, spam, or misleading content, or impersonate others;',
                    'submit fake or manipulated receipts or votes to distort the price data.',
                ],
            },
            {
                h: '8. Intellectual property',
                p: [
                    'The Service itself — including the Souply name, branding, design, and software — is owned by us and protected by law. We grant you a limited, personal, non-transferable right to use the Service. You may not copy, modify, or create derivative works of the Service except as allowed by these Terms or applicable law.',
                ],
            },
            {
                h: '9. Beta',
                p: [
                    'Parts of the Service may be offered as a beta that is still in development. Beta features are provided "as is", may be unstable, and may change or be removed without notice.',
                ],
            },
            {
                h: '10. Availability and changes',
                p: [
                    'We may modify, suspend, or discontinue the Service (or any part of it) at any time. We aim to keep it available but do not guarantee uninterrupted or error-free operation.',
                ],
            },
            {
                h: '11. Disclaimers and limitation of liability',
                ul: [
                    'To the fullest extent permitted by law, the Service is provided "as is" and "as available", without warranties of any kind.',
                    'We are not liable for indirect, incidental, or consequential damages, or for losses arising from inaccurate price information or your reliance on the Service.',
                    'Nothing in these Terms excludes or limits our liability where it cannot be excluded under applicable law — including liability for intent or gross negligence, and your mandatory consumer rights under Lithuanian and EU law, which remain unaffected.',
                ],
            },
            {
                h: '12. Termination',
                p: [
                    'You may stop using the Service and delete your account at any time. We may suspend or terminate your access if you materially breach these Terms or use the Service unlawfully.',
                ],
            },
            {
                h: '13. Privacy',
                p: [
                    'Your use of the Service is also governed by our Privacy Policy (souply.lt/legal/privacy), which explains how we handle your personal data.',
                ],
            },
            {
                h: '14. Changes to these Terms',
                p: [
                    'We may update these Terms from time to time. We will post the updated version here and change the "Last updated" date. Significant changes will be communicated where appropriate. Continued use after changes means you accept the updated Terms.',
                ],
            },
            {
                h: '15. Governing law and disputes',
                ul: [
                    'These Terms are governed by the laws of the Republic of Lithuania. If you are a consumer, you also benefit from any mandatory protections of the country where you live.',
                    'Disputes fall under the jurisdiction of the competent Lithuanian courts, without prejudice to mandatory consumer rules.',
                    'As a consumer, you may also use the EU Online Dispute Resolution platform: ec.europa.eu/consumers/odr.',
                ],
            },
            {
                h: '16. Contact',
                p: ['Questions about these Terms: support@souply.lt'],
            },
        ],
    },
    lt: {
        title: 'Naudojimosi sąlygos',
        updatedLabel: 'Paskutinį kartą atnaujinta',
        updated: '2026 m. birželio 1 d.',
        intro:
            'Šios naudojimosi sąlygos („Sąlygos") reglamentuoja jūsų naudojimąsi „Souply" mobiliąja programėle ir svetaine souply.lt (kartu – „Paslauga"), kurią teikia Mantas Misiūnas (Lietuva) („Souply", „mes"). Naudodamiesi Paslauga, sutinkate su šiomis Sąlygomis. Jei nesutinkate, Paslauga nesinaudokite.',
        sections: [
            {
                h: '1. Paslauga',
                p: [
                    '„Souply" padeda palyginti maisto produktų kainas Lietuvos parduotuvėse, skenuoti kvitus bei kurti ir dalintis pirkinių krepšeliais ir šablonais. Šiuo metu Paslauga teikiama nemokamai.',
                    'Ateityje galime įdiegti mokamų ar papildomų funkcijų. Tokiu atveju jos bus aiškiai pažymėtos ir teikiamos pagal atskiras sąlygas; niekada nebūsite apmokestinti be aiškaus jūsų sutikimo.',
                ],
            },
            {
                h: '2. Tinkamumas',
                p: ['Norėdami naudotis Paslauga, turite būti ne jaunesni nei 16 metų. Naudodamiesi ja, patvirtinate, kad atitinkate šį reikalavimą.'],
            },
            {
                h: '3. Paskyros',
                ul: [
                    'Galite naršyti anonimiškai. Kai kurioms funkcijoms (duomenų išsaugojimui, šablonų skelbimui) reikia paskyros, kuriamos per „Google" arba „Apple" prisijungimą.',
                    'Esate atsakingi už veiksmus savo paskyroje ir už saugų prisijungimo būdo naudojimą.',
                    'Paskyrą galite bet kada ištrinti (programėlėje: Profilis → Nustatymai → Paskyra → Ištrinti paskyrą). Ką reiškia ištrynimas, žiūrėkite privatumo politikoje.',
                ],
            },
            {
                h: '4. Kainų informacija — svarbu',
                ul: [
                    'Kainos ir produktų informacija renkama iš viešai prieinamų parduotuvių šaltinių ir iš naudotojų pateiktų kvitų. Ji teikiama tik bendrai informacijai.',
                    'Negarantuojame, kad kuri nors kaina, nuolaida, prieinamumas ar produkto informacija yra tiksli, išsami ar aktuali. Kainos dažnai keičiasi ir parduotuvėje gali skirtis.',
                    'Prieš pirkdami visada pasitikrinkite tikrąją kainą parduotuvėje. Neatsakome už pirkimo sprendimus, priimtus remiantis Paslaugos informacija.',
                ],
            },
            {
                h: '5. Jokio ryšio su parduotuvėmis',
                p: [
                    '„Souply" yra nepriklausoma paslauga. Parduotuvių pavadinimai, logotipai ir prekės ženklai (pvz., Maxima, Rimi, IKI, Norfa, Lidl, Barbora) priklauso jų savininkams. „Souply" nėra susijusi su šiomis parduotuvėmis, jų neremia ir nėra jų remiama.',
                ],
            },
            {
                h: '6. Jūsų turinys',
                ul: [
                    'Jums priklauso jūsų sukurtas turinys (kvitai, krepšeliai, pirkinių sąrašai, šablonai).',
                    'Pateikdami turinį, suteikiate mums neišimtinę, pasaulinę, neatlygintiną licenciją jį talpinti, saugoti, rodyti ir tvarkyti tik tam, kad galėtume teikti ir tobulinti Paslaugą – įskaitant jūsų pasirinktų skelbti šablonų viešą rodymą kartu su jūsų @vardu.',
                    'Esate atsakingi už pateiktą turinį ir patvirtinate turintys teisę juo dalintis. Neįkelkite neteisėto, teises pažeidžiančio turinio ar kitų asmenų asmens duomenų be jų sutikimo.',
                    'Galime pašalinti turinį, pažeidžiantį šias Sąlygas ar įstatymus.',
                ],
            },
            {
                h: '7. Priimtinas naudojimas',
                p: ['Jums draudžiama:'],
                ul: [
                    'naudoti Paslaugą neteisėtais tikslais ar pažeidžiant šias Sąlygas;',
                    'masiškai rinkti, kopijuoti ar nuskaityti Paslaugos duomenis arba juos perparduoti;',
                    'trikdyti, perkrauti, atlikti atvirkštinę inžineriją ar neteisėtai prieiti prie Paslaugos ar jos infrastruktūros;',
                    'įkelti kenkėjišką programinę įrangą, šlamštą ar klaidinantį turinį arba apsimesti kitais;',
                    'teikti suklastotus ar manipuliuotus kvitus ar balsavimus, iškreipiančius kainų duomenis.',
                ],
            },
            {
                h: '8. Intelektinė nuosavybė',
                p: [
                    'Pati Paslauga – įskaitant „Souply" pavadinimą, prekės ženklą, dizainą ir programinę įrangą – priklauso mums ir yra saugoma įstatymų. Suteikiame jums ribotą, asmeninę, neperleidžiamą teisę naudotis Paslauga. Negalite kopijuoti, keisti ar kurti išvestinių Paslaugos kūrinių, išskyrus atvejus, leidžiamus šių Sąlygų ar taikytinų teisės aktų.',
                ],
            },
            {
                h: '9. Beta versija',
                p: [
                    'Dalis Paslaugos gali būti teikiama kaip dar kuriama beta versija. Beta funkcijos teikiamos „tokios, kokios yra", gali būti nestabilios ir bet kada keistis ar būti pašalintos be įspėjimo.',
                ],
            },
            {
                h: '10. Prieinamumas ir pakeitimai',
                p: [
                    'Galime bet kada keisti, sustabdyti ar nutraukti Paslaugą (ar jos dalį). Siekiame ją išlaikyti prieinamą, tačiau negarantuojame nepertraukiamo ar be klaidų veikimo.',
                ],
            },
            {
                h: '11. Atsakomybės apribojimai',
                ul: [
                    'Kiek leidžia įstatymai, Paslauga teikiama „tokia, kokia yra" ir „kokia prieinama", be jokių garantijų.',
                    'Neatsakome už netiesioginę, atsitiktinę ar pasekminę žalą arba nuostolius, atsiradusius dėl netikslios kainų informacijos ar jūsų pasikliovimo Paslauga.',
                    'Niekas šiose Sąlygose neatmeta ir neapriboja mūsų atsakomybės ten, kur jos negalima atmesti pagal taikytinus teisės aktus – įskaitant atsakomybę už tyčią ar didelį neatsargumą, ir jūsų privalomas vartotojo teises pagal Lietuvos ir ES teisę, kurios lieka nepakitusios.',
                ],
            },
            {
                h: '12. Nutraukimas',
                p: [
                    'Galite bet kada nustoti naudotis Paslauga ir ištrinti paskyrą. Galime sustabdyti ar nutraukti jūsų prieigą, jei iš esmės pažeidžiate šias Sąlygas ar naudojatės Paslauga neteisėtai.',
                ],
            },
            {
                h: '13. Privatumas',
                p: [
                    'Jūsų naudojimuisi Paslauga taip pat taikoma mūsų privatumo politika (souply.lt/legal/privacy), kurioje paaiškinama, kaip tvarkome jūsų asmens duomenis.',
                ],
            },
            {
                h: '14. Sąlygų pakeitimai',
                p: [
                    'Šias Sąlygas kartkartėmis galime atnaujinti. Atnaujintą versiją paskelbsime čia ir pakeisime datą „Paskutinį kartą atnaujinta". Apie reikšmingus pakeitimus pranešime, kai tai bus tikslinga. Tolesnis naudojimasis po pakeitimų reiškia, kad sutinkate su atnaujintomis Sąlygomis.',
                ],
            },
            {
                h: '15. Taikytina teisė ir ginčai',
                ul: [
                    'Šioms Sąlygoms taikoma Lietuvos Respublikos teisė. Jei esate vartotojas, jums taip pat taikomos privalomos jūsų gyvenamosios šalies apsaugos nuostatos.',
                    'Ginčai priklauso kompetentingų Lietuvos teismų jurisdikcijai, nepažeidžiant privalomų vartotojų apsaugos taisyklių.',
                    'Kaip vartotojas, taip pat galite naudotis ES elektroninio ginčų sprendimo platforma: ec.europa.eu/consumers/odr.',
                ],
            },
            {
                h: '16. Kontaktai',
                p: ['Klausimai dėl šių Sąlygų: support@souply.lt'],
            },
        ],
    },
};
