# E2EE Chat System - Utviklingsplan

## 🎯 Prosjektmål
Bygge et fullstendig end-to-end kryptert chat-system med moderne kryptografi, sikker nøkkelhåndtering og en brukervennlig interface.

## 🛠️ Tekniske Avgjørelser som Trenger Bekreftelse

### 1. Teknologi Stack
**Frontend:**
- [ ] React + TypeScript + Vite (anbefalt for moderne utvikling)
- [ ] Vanilla JavaScript + HTML/CSS (enklere, men mindre skalerbart)

**Backend:**
- [ ] Node.js + Express + Socket.IO (anbefalt for real-time chat)
- [ ] Python + FastAPI + WebSockets (alternativ med god performance)

**Database:**
- [ ] SQLite (enkelt for utvikling, bra for demo)
- [ ] PostgreSQL (produksjonsklar, mer skalerbart)

**Kryptografi:**
- [ ] Web Crypto API (nettleser-native, anbefalt)
- [ ] libsodium.js (kraftig bibliotek, mer komplekst)

### 2. Arkitektur Beslutninger
**Nøkkelhåndtering:**
- [ ] Diffie-Hellman nøkkelutveksling + AES-256-GCM
- [ ] Signal Protocol (mer avansert, som WhatsApp/Signal bruker)

**Autentisering:**
- [ ] JWT tokens med refresh tokens
- [ ] Session-based authentication

## 📋 Utviklingsfaser

### Fase 1: Grunnleggende Oppsett (Nå)
- [ ] Prosjektstruktur
- [ ] Grunnleggende frontend og backend
- [ ] Database oppsett
- [ ] Grunnleggende UI/UX design

### Fase 2: Kryptografi (Uke 1)
- [ ] Implementere key generation
- [ ] Diffie-Hellman nøkkelutveksling
- [ ] Message encryption/decryption
- [ ] Testing av krypto-funksjoner

### Fase 3: Chat Funksjonalitet (Uke 2)
- [ ] Real-time messaging
- [ ] User registration/authentication
- [ ] Message persistence
- [ ] Basic UI for chat

### Fase 4: Avanserte Funksjoner (Uke 3)
- [ ] Group chats
- [ ] File sharing (kryptert)
- [ ] Message deletion/editing
- [ ] Typing indicators
- [ ] Online status

### Fase 5: Sikkerhet & Polering (Uke 4)
- [ ] Security audit
- [ ] Rate limiting
- [ ] Input validation
- [ ] Error handling
- [ ] UI/UX polering

### Fase 6: Testing & Deployment (Uke 5)
- [ ] Comprehensive testing
- [ ] Documentation
- [ ] Deployment setup
- [ ] Performance optimization

## 🔧 Teknisk Implementering

### Core Components Som Må Bygges:
1. **CryptoManager** - Håndterer all kryptografi
2. **KeyManager** - Nøkkel generering og håndtering  
3. **MessageHandler** - Kryptering/dekryptering av meldinger
4. **ChatClient** - Frontend chat interface
5. **ChatServer** - Backend server og API
6. **DatabaseManager** - Data persistence
7. **AuthManager** - Bruker autentisering

## 📁 Ønsket Mappestruktur
```
e2ee-chat-system/
├── client/                 # Frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Backend
│   ├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── package.json
├── shared/                 # Delt kode (typer, konstanter)
├── docs/                   # Dokumentasjon
└── tests/                  # Testing
```

## ⚡ Neste Steg
1. **Bekreft tekniske valg** (se avgjørelser over)
2. **Sett opp prosjektstruktur**
3. **Implementer grunnleggende kryptografi**
4. **Bygg minimal chat prototype**

---
*Oppdatert: August 30, 2025*
