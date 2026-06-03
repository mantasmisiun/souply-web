/**
 * Privacy policy content, LT + EN. Single source of truth rendered by
 * LegalPage. Kept as structured data (not i18n JSON) because it's long-form
 * legal prose that changes as a block, not per-string. The app links to the
 * hosted web page (souply.lt/legal/privacy) rather than duplicating this.
 *
 * Controller + "last updated" are real values — update `updated` whenever
 * the policy materially changes.
 */
export interface LegalBlock {
    h: string;
    p?: string[];
    ul?: string[];
}

export interface LegalDoc {
    title: string;
    updatedLabel: string;
    updated: string;
    intro: string;
    sections: LegalBlock[];
}

export const privacyPolicy: Record<'lt' | 'en', LegalDoc> = {
    en: {
        title: 'Privacy Policy',
        updatedLabel: 'Last updated',
        updated: '3 June 2026',
        intro:
            'This Privacy Policy explains how Souply ("Souply", "we", "us") collects, uses, and protects your personal data when you use the Souply mobile app and the website at souply.lt (together, the "Service"). It applies to users in the European Union and complies with the EU General Data Protection Regulation (GDPR).',
        sections: [
            {
                h: '1. Who we are (Data Controller)',
                p: [
                    'The data controller responsible for your personal data is Mantas Misiūnas, Gytarių g. 15-4, Šiauliai, LT-78362, Lithuania. Email: support@souply.lt.',
                    'For any questions about this policy or your data, contact us at support@souply.lt.',
                ],
            },
            {
                h: '2. The data we collect',
                p: ['Souply can be browsed anonymously — an account is only needed to save data and publish templates.'],
                ul: [
                    'Account data (if you sign in): when you sign in with Google or Apple we receive your name, email address, and a unique identifier from that provider, plus a public @username and any profile details you set.',
                    'Content you create: receipts you scan (the extracted products, prices, store, and date, and the receipt image), and the baskets, shopping lists, and templates you build. Public templates show their products and your @username. Product votes you submit.',
                    'Location data: with your permission, the app uses your device location (and any "Home"/"Work" places you save) to find the nearest and cheapest stores. Saved places and visit history are stored only on your device; when you calculate a basket, your coordinates are sent to our server solely to compute store prices for that request and are not stored against your account.',
                    'Communications: if you sign up for the beta on our website, we collect your name, email, and chosen platform (iOS/Android) to send you an invite.',
                    'Technical data: standard server logs such as IP address, device/browser type, and timestamps, used to operate and secure the Service.',
                    'Crash and diagnostic data: when the app crashes or hits an error, we collect diagnostic information (device model, operating-system version, and the error or stack trace) so we can find and fix bugs.',
                ],
            },
            {
                h: '3. How we use your data and our legal bases',
                ul: [
                    'Provide accounts and save your receipts, baskets, and lists — performance of a contract.',
                    'Compare prices and find nearby and cheapest stores — performance of a contract, and for location, your consent.',
                    'Send beta invites and service emails — your consent and our legitimate interests.',
                    'Keep the Service secure and prevent abuse — our legitimate interests.',
                    'Diagnose crashes and improve app stability — our legitimate interests.',
                    'Comply with legal obligations — legal obligation.',
                ],
                p: ['Where we rely on consent (e.g. location, beta emails), you can withdraw it at any time.'],
            },
            {
                h: '4. Cookies',
                p: [
                    'The website uses a single essential cookie (souply_session) to keep you signed in. It is strictly necessary and is not used for advertising or analytics. We use no third-party tracking cookies, and the app does not use cookies.',
                ],
            },
            {
                h: '5. Who we share data with',
                p: ['We share data only with the service providers needed to run Souply:'],
                ul: [
                    'Google and Apple — to authenticate your sign-in.',
                    'Resend — to send our emails.',
                    'Cloudflare — DNS, security, and email routing.',
                    'Sentry — to collect crash and error diagnostics so we can fix bugs (data processed in the EU region).',
                    'OpenStreetMap / Nominatim — to convert addresses to map coordinates when you search a location.',
                    'Apple App Store and Google Play — when you install or are invited to the app.',
                ],
                // second paragraph after the list
            },
            {
                h: '',
                p: [
                    'Our databases and uploaded images are hosted on our own infrastructure in the European Union (Lithuania). We never sell or rent your personal data.',
                ],
            },
            {
                h: '6. International transfers',
                p: [
                    'Some providers above (e.g. Google, Apple, Resend, Cloudflare) may process data outside the EU/EEA. Where they do, transfers are protected by appropriate safeguards such as the EU Standard Contractual Clauses and/or the EU–US Data Privacy Framework.',
                ],
            },
            {
                h: '7. How long we keep your data',
                ul: [
                    'Login session: a signed-in session lasts 30 days, after which you are signed out and must sign in again.',
                    'Account and content: kept for as long as your account exists.',
                    'After you delete your account: your account, baskets, and shopping lists are deleted, receipt images are removed, and personal details on your receipts (such as card numbers, loyalty IDs, and raw scan text) are erased. The remaining purchase data (products, prices, dates, store) is anonymised — no longer linked to you — and kept as part of our anonymous price database. Anonymised data is not personal data.',
                    'Beta signups: kept until the beta programme ends or you ask us to delete them.',
                    'Server logs: kept only as long as needed to operate and secure the Service.',
                ],
            },
            {
                h: '8. Your rights',
                p: [
                    'Under the GDPR you have the right to access your data, correct it, delete it, restrict or object to processing, data portability, and to withdraw consent.',
                ],
                ul: [
                    'Delete your account: in the app, go to Profile → Settings → Account → Delete account. This permanently deletes your account and content and anonymises your purchase data as described above. You can also request deletion by emailing support@souply.lt.',
                    'To exercise any other right, email support@souply.lt.',
                ],
            },
            {
                h: '',
                p: [
                    'You also have the right to lodge a complaint with your supervisory authority. In Lithuania this is the State Data Protection Inspectorate (Valstybinė duomenų apsaugos inspekcija, VDAI), vdai.lrv.lt.',
                ],
            },
            {
                h: '9. Data security',
                p: [
                    'We protect your data with encryption in transit (HTTPS/TLS), hashed session tokens, access controls, and EU-based storage. No method of transmission is completely secure, but we take reasonable measures to safeguard your information.',
                ],
            },
            {
                h: '10. Children',
                p: [
                    'Souply is not directed at children under 16, and we do not knowingly collect their data. If you believe a child has provided us personal data, contact us and we will delete it.',
                ],
            },
            {
                h: '11. Changes to this policy',
                p: [
                    'We may update this policy from time to time. We will post the new version here and update the "Last updated" date; we will communicate significant changes where appropriate.',
                ],
            },
            {
                h: '12. Contact',
                p: ['Questions or requests: support@souply.lt'],
            },
        ],
    },
    lt: {
        title: 'Privatumo politika',
        updatedLabel: 'Paskutinį kartą atnaujinta',
        updated: '2026 m. birželio 3 d.',
        intro:
            'Ši privatumo politika paaiškina, kaip „Souply" („Souply", „mes") renka, naudoja ir saugo jūsų asmens duomenis, kai naudojatės „Souply" mobiliąja programėle ir svetaine souply.lt (kartu – „Paslauga"). Ji taikoma Europos Sąjungos naudotojams ir atitinka ES Bendrąjį duomenų apsaugos reglamentą (BDAR).',
        sections: [
            {
                h: '1. Kas mes esame (duomenų valdytojas)',
                p: [
                    'Už jūsų asmens duomenis atsakingas duomenų valdytojas yra Mantas Misiūnas, Gytarių g. 15-4, Šiauliai, LT-78362, Lietuva. El. paštas: support@souply.lt.',
                    'Visais klausimais dėl šios politikos ar savo duomenų rašykite support@souply.lt.',
                ],
            },
            {
                h: '2. Kokius duomenis renkame',
                p: ['„Souply" galima naršyti anonimiškai – paskyra reikalinga tik norint išsaugoti duomenis ir skelbti šablonus.'],
                ul: [
                    'Paskyros duomenys (jei prisijungiate): prisijungę su „Google" arba „Apple", gauname jūsų vardą, el. pašto adresą ir unikalų tiekėjo identifikatorių, taip pat viešą @vardą ir bet kokią profilio informaciją, kurią nurodote.',
                    'Jūsų kuriamas turinys: skenuoti kvitai (atpažinti produktai, kainos, parduotuvė, data ir kvito nuotrauka) bei jūsų kuriami krepšeliai, pirkinių sąrašai ir šablonai. Vieši šablonai rodo savo produktus ir jūsų @vardą. Jūsų pateikti produktų balsavimai.',
                    'Vietos duomenys: gavę jūsų leidimą, programėlė naudoja įrenginio vietą (ir bet kurias jūsų išsaugotas „Namų"/„Darbo" vietas), kad surastų artimiausias ir pigiausias parduotuves. Išsaugotos vietos ir lankymosi istorija saugomos tik jūsų įrenginyje; skaičiuojant krepšelį, jūsų koordinatės siunčiamos į mūsų serverį tik tam, kad tai užklausai būtų apskaičiuotos parduotuvių kainos, ir nesaugomos jūsų paskyroje.',
                    'Susirašinėjimas: jei mūsų svetainėje užsiregistruojate beta versijai, renkame jūsų vardą, el. paštą ir pasirinktą platformą (iOS/Android), kad atsiųstume kvietimą.',
                    'Techniniai duomenys: standartiniai serverio žurnalai, pvz., IP adresas, įrenginio/naršyklės tipas ir laiko žymos, naudojami Paslaugai teikti ir apsaugoti.',
                    'Gedimų ir diagnostikos duomenys: programėlei nulūžus ar įvykus klaidai, renkame diagnostinę informaciją (įrenginio modelį, operacinės sistemos versiją ir klaidos pranešimą arba steką), kad galėtume rasti ir ištaisyti klaidas.',
                ],
            },
            {
                h: '3. Kaip naudojame jūsų duomenis ir teisinis pagrindas',
                ul: [
                    'Teikti paskyras ir saugoti jūsų kvitus, krepšelius ir sąrašus – sutarties vykdymas.',
                    'Lyginti kainas ir rasti artimiausias bei pigiausias parduotuves – sutarties vykdymas, o vietos atveju – jūsų sutikimas.',
                    'Siųsti beta kvietimus ir paslaugos el. laiškus – jūsų sutikimas ir teisėtas interesas.',
                    'Užtikrinti Paslaugos saugumą ir užkirsti kelią piktnaudžiavimui – teisėtas interesas.',
                    'Nustatyti gedimus ir gerinti programėlės stabilumą – teisėtas interesas.',
                    'Vykdyti teisines prievoles – teisinė prievolė.',
                ],
                p: ['Kai remiamės sutikimu (pvz., vieta, beta el. laiškai), galite jį bet kada atšaukti.'],
            },
            {
                h: '4. Slapukai',
                p: [
                    'Svetainė naudoja vieną būtiną slapuką (souply_session), kad išliktumėte prisijungę. Jis yra griežtai būtinas ir nenaudojamas reklamai ar analitikai. Nenaudojame jokių trečiųjų šalių sekimo slapukų, o programėlė slapukų nenaudoja.',
                ],
            },
            {
                h: '5. Su kuo dalijamės duomenimis',
                p: ['Duomenimis dalijamės tik su paslaugų teikėjais, būtinais „Souply" veikimui:'],
                ul: [
                    '„Google" ir „Apple" – jūsų prisijungimui patvirtinti.',
                    '„Resend" – mūsų el. laiškams siųsti.',
                    '„Cloudflare" – DNS, saugumui ir el. pašto nukreipimui.',
                    '„Sentry" – gedimų ir klaidų diagnostikai rinkti, kad galėtume taisyti klaidas (duomenys tvarkomi ES regione).',
                    '„OpenStreetMap" / „Nominatim" – adresams paversti žemėlapio koordinatėmis, kai ieškote vietos.',
                    '„Apple App Store" ir „Google Play" – kai įsidiegiate ar esate pakviečiami į programėlę.',
                ],
            },
            {
                h: '',
                p: [
                    'Mūsų duomenų bazės ir įkeltos nuotraukos talpinamos mūsų pačių infrastruktūroje Europos Sąjungoje (Lietuvoje). Niekada neparduodame ir nenuomojame jūsų asmens duomenų.',
                ],
            },
            {
                h: '6. Tarptautiniai duomenų perdavimai',
                p: [
                    'Kai kurie pirmiau nurodyti teikėjai (pvz., „Google", „Apple", „Resend", „Cloudflare") gali tvarkyti duomenis už ES/EEE ribų. Tokiu atveju perdavimai apsaugoti tinkamomis priemonėmis, pvz., ES standartinėmis sutarčių sąlygomis ir (arba) ES–JAV duomenų privatumo sistema (Data Privacy Framework).',
                ],
            },
            {
                h: '7. Kiek laiko saugome jūsų duomenis',
                ul: [
                    'Prisijungimo sesija: prisijungimo sesija galioja 30 dienų, vėliau esate atjungiami ir turite prisijungti iš naujo.',
                    'Paskyra ir turinys: saugomi tol, kol egzistuoja jūsų paskyra.',
                    'Ištrynus paskyrą: jūsų paskyra, krepšeliai ir pirkinių sąrašai ištrinami, kvitų nuotraukos pašalinamos, o asmeniniai kvitų duomenys (pvz., kortelių numeriai, lojalumo ID ir neapdorotas skenavimo tekstas) panaikinami. Likę pirkinių duomenys (produktai, kainos, datos, parduotuvė) anonimizuojami – nebesusieti su jumis – ir saugomi kaip mūsų anoniminės kainų duomenų bazės dalis. Anoniminiai duomenys nėra asmens duomenys.',
                    'Beta registracijos: saugomos, kol pasibaigs beta programa arba paprašysite jas ištrinti.',
                    'Serverio žurnalai: saugomi tik tiek, kiek reikia Paslaugai teikti ir apsaugoti.',
                ],
            },
            {
                h: '8. Jūsų teisės',
                p: [
                    'Pagal BDAR turite teisę susipažinti su savo duomenimis, juos ištaisyti, ištrinti, apriboti ar nesutikti su tvarkymu, į duomenų perkeliamumą ir atšaukti sutikimą.',
                ],
                ul: [
                    'Ištrinti paskyrą: programėlėje eikite į Profilis → Nustatymai → Paskyra → Ištrinti paskyrą. Tai visam laikui ištrina jūsų paskyrą ir turinį bei anonimizuoja jūsų pirkinių duomenis, kaip aprašyta pirmiau. Taip pat galite paprašyti ištrynimo el. paštu support@souply.lt.',
                    'Norėdami pasinaudoti kita teise, rašykite support@souply.lt.',
                ],
            },
            {
                h: '',
                p: [
                    'Taip pat turite teisę pateikti skundą priežiūros institucijai. Lietuvoje tai Valstybinė duomenų apsaugos inspekcija (VDAI), vdai.lrv.lt.',
                ],
            },
            {
                h: '9. Duomenų saugumas',
                p: [
                    'Jūsų duomenis saugome šifruodami perdavimą (HTTPS/TLS), maišos (hash) sesijų raktais, prieigos kontrole ir saugojimu ES. Joks perdavimo būdas nėra visiškai saugus, tačiau imamės pagrįstų priemonių jūsų informacijai apsaugoti.',
                ],
            },
            {
                h: '10. Vaikai',
                p: [
                    '„Souply" nėra skirta jaunesniems nei 16 metų vaikams, ir mes sąmoningai nerenkame jų duomenų. Jei manote, kad vaikas pateikė mums asmens duomenis, susisiekite su mumis ir mes juos ištrinsime.',
                ],
            },
            {
                h: '11. Politikos pakeitimai',
                p: [
                    'Šią politiką kartkartėmis galime atnaujinti. Naują versiją paskelbsime čia ir atnaujinsime datą „Paskutinį kartą atnaujinta"; apie reikšmingus pakeitimus pranešime, kai tai bus tikslinga.',
                ],
            },
            {
                h: '12. Kontaktai',
                p: ['Klausimai ar prašymai: support@souply.lt'],
            },
        ],
    },
};
