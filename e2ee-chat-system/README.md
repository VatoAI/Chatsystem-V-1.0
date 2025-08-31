# 🔒 SecureChat - End-to-End Encrypted Chat System

En moderne, sikker chat-applikasjon med end-to-end kryptering, bygget med React, TypeScript, Supabase og Web Crypto API.

## ✨ Funksjoner

- 🔐 **End-to-End Kryptering**: Alle meldinger krypteres lokalt før de sendes
- 🌙 **Moderne UI**: Glassmorfisme-design med Tailwind CSS og Framer Motion
- 📱 **Responsiv**: Fungerer perfekt på mobil og desktop
- ⚡ **Sanntid**: Øyeblikkelig meldingsutveksling via Supabase Realtime
- 🧪 **Integrert Testing**: Innebygd test-suite for å verifisere E2EE-funksjonalitet
- 🚀 **Cloud-basert**: Bruker Supabase som backend-infrastruktur

## 🛠 Teknologi Stack

### Frontend
- **React 18** - UI-rammeverk
- **TypeScript** - Type-sikkerhet
- **Vite** - Utviklingsserver og building
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animasjoner
- **Headless UI** - Tilgjengelige komponenter
- **Heroicons** - Moderne ikoner

### Backend
- **Supabase** - Database og sanntid API
- **PostgreSQL** - Database
- **Row Level Security** - Sikkerhetspolicies

### Sikkerhet
- **Web Crypto API** - Browser-nativ kryptering
- **RSA-OAEP** - Asymmetrisk kryptering
- **SHA-256** - Hash-algoritme

## 📋 Forutsetninger

- Node.js (v18 eller nyere)
- npm eller yarn
- Supabase-konto

## 🚀 Installasjon og Oppsett

### 1. Klon repositoriet
```bash
git clone <repository-url>
cd e2ee-chat-system
```

### 2. Installer avhengigheter
```bash
cd client
npm install
```

### 3. Supabase-oppsett

1. Opprett et nytt prosjekt på [Supabase](https://supabase.com)
2. Kjør SQL-skriptet fra `supabase-setup.sql` i Supabase SQL Editor
3. Kopier API URL og anon key fra prosjektinnstillingene

### 4. Konfigurer miljøvariabler

Oppdater `src/lib/supabase.ts` med dine Supabase-detaljer:

```typescript
const supabaseUrl = 'your-supabase-url'
const supabaseAnonKey = 'your-supabase-anon-key'
```

### 5. Start utviklingsserveren
```bash
npm run dev
```

Applikasjonen vil være tilgjengelig på `http://localhost:5173/`

## 🧪 Testing

Applikasjonen inkluderer en innebygd test-suite som verifiserer:
- Krypteringsalgoritmer
- Nøkkelgenerering og -eksport
- Supabase-tilkobling
- End-to-end meldingsflyt

For å kjøre testene:
1. Klikk på "Test E2EE System" knappen på login-skjermen
2. Se resultater i nettleser-konsollen

Du kan også kjøre testene programmatisk:
```typescript
import { runFullIntegrationTest } from './src/lib/integrationTests'
runFullIntegrationTest()
```

## 🔐 Sikkerhetsfunksjoner

### End-to-End Kryptering
- Hver bruker genererer et unikt RSA-nøkkelpar ved innlogging
- Meldinger krypteres med mottakerens offentlige nøkkel
- Kun mottakeren kan dekryptere meldinger med sin private nøkkel
- Private nøkler lagres aldri på serveren

### Sikkerhetslag
1. **Klient-side kryptering**: Meldinger krypteres lokalt
2. **HTTPS**: All kommunikasjon er TLS-kryptert
3. **Row Level Security**: Database-policies beskytter data
4. **Key isolation**: Hver sesjon har unike nøkler

## 📱 Bruk

### 1. Innlogging
- Skriv inn ønsket brukernavn
- Systemet genererer automatisk krypteringsnøkler

### 2. Chat
- Velg en bruker fra sidepanelet
- Skriv meldinger i tekstfeltet
- Meldinger krypteres automatisk før sending

### 3. Mobile-visning
- Sidepanelet kan åpnes/lukkes med hamburger-menyen
- Responsiv design tilpasser seg skjermstørrelse

## 🏗 Arkitektur

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │    │     Supabase     │    │  PostgreSQL DB  │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Web Crypto  │ │◄──►│ │ Realtime API │ │◄──►│ │   Tables    │ │
│ │     API     │ │    │ │              │ │    │ │ - users     │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ │ - messages  │ │
│                 │    │                  │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │                 │
│ │  UI/UX      │ │    │ │ Row Level    │ │    │                 │
│ │ Components  │ │    │ │ Security     │ │    │                 │
│ └─────────────┘ │    │ └──────────────┘ │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📂 Prosjektstruktur

```
client/
├── src/
│   ├── components/
│   │   ├── LoginForm.tsx      # Innlogging og test-knapp
│   │   └── ChatInterface.tsx  # Hovedchat-grensesnitt
│   ├── lib/
│   │   ├── supabase.ts        # Supabase-konfigurasjon
│   │   ├── chatService.ts     # Chat-logikk og API
│   │   └── integrationTests.ts # Test-suite
│   ├── shared/
│   │   ├── types.ts           # TypeScript-typer
│   │   ├── crypto.ts          # Krypteringslogikk
│   │   └── cryptoUtils.ts     # Krypterings-utilities
│   └── assets/
├── public/
└── package.json
```

## 🚀 Deploy

### Bygging for produksjon
```bash
npm run build
```

### Deploy til Vercel/Netlify
1. Bygg applikasjonen: `npm run build`
2. Upload `dist/`-mappen til din hosting-tjeneste
3. Konfigurer environment variabler for produksjon

## 🐛 Feilsøking

### Vanlige problemer

**Krypteringsfeil:**
- Sjekk at Web Crypto API er støttet (krever HTTPS i produksjon)
- Verifiser at nøklene genereres korrekt

**Tilkoblingsproblemer:**
- Kontroller Supabase URL og API-nøkkel
- Sjekk at tabeller og policies er opprettet riktig

**UI-problemer:**
- Verifiser at alle CSS-klasser er tilgjengelige
- Sjekk konsollen for JavaScript-feil

### Debug-modus
Aktiver detaljert logging ved å sette:
```typescript
// I src/lib/chatService.ts
const DEBUG = true
```

## 🤝 Bidrag

1. Fork prosjektet
2. Lag en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit endringene (`git commit -m 'Add some AmazingFeature'`)
4. Push til branch (`git push origin feature/AmazingFeature`)
5. Åpne en Pull Request

## 📄 Lisens

Dette prosjektet er lisensiert under MIT License.

## 🙏 Takk til

- Supabase team for fantastisk backend-infrastruktur
- Tailwind CSS for elegant styling
- Framer Motion for smooth animasjoner
- Web Crypto API for sikker kryptering

---

**Sikkerhetsmerknad**: Denne applikasjonen er utviklet for demonstrasjons- og læringsformål. For produksjonsbruk, vennligst gjennomfør en grundig sikkerhetsgjennomgang.

## Legacy Components

Contributions are welcome! If you would like to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your forked repository.
5. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.