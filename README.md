# 🚀 AuraCast (Platforma Livestreamingowa)

> **Maksimum wolności. Minimum ograniczeń. Społeczność tworzy platformę.**

AuraCast to nowoczesna platforma livestreamingowa open-source, zaprojektowana z myślą o pełnej niezależności twórców. Charakteryzuje się brakiem światopoglądowej cenzury, modelem finansowania BYOM (Bring Your Own Monetization) oraz algorytmem równych szans, który realnie wspiera mniejszych streamerów.

## ✨ Główne funkcje

- 🎥 **Nowoczesny Interfejs:** Szybki, responsywny layout napisany w React i stylizowany najnowszym Tailwind CSS v4 w e-sportowych, niebieskich barwach.
- 💬 **Czat na Żywo (WebSockets):** Błyskawiczna komunikacja z widzami bez opóźnień, z dynamicznymi pokojami per kanał (Socket.io).
- 🛡️ **Wolność Słowa:** Jasny, prosty regulamin. Moderacja reaguje tylko na bezpośrednie łamanie prawa.
- 💸 **BYOM (Niezależna Monetyzacja):** 100% zysków trafia bezpośrednio do twórców z ich własnych linków (Ko-fi, Patreon, itp.), bez pobierania haraczu przez platformę.

## 🏗️ Stack Technologiczny

**Frontend (Klient):**
- React + TypeScript
- Vite
- Tailwind CSS v4
- React Router DOM (Dynamiczny routing)
- Socket.io-client
- Lucide React (Ikony)

**Backend (API & Serwer):**
- Node.js + Express
- TypeScript (`tsx`)
- Socket.io (Serwer WebSocket)
- MySQL2 (Relacyjna baza danych)
- JSON Web Tokens (JWT) & bcrypt (Bezpieczeństwo)

## 🚀 Uruchomienie lokalne (Development)

Aby odpalić projekt na swoim komputerze, potrzebujesz zainstalowanego Node.js oraz bazy MySQL.

### 1. Klonowanie repozytorium
```bash
git clone https://github.com/Kafelek69/AuraCast.git
cd AuraCast
```

### 2. Uruchomienie Backendu
```bash
cd backend
npm install
npm run dev
```
*API wystartuje na porcie 4000.*

### 3. Uruchomienie Frontendu
W nowym oknie terminala:
```bash
cd frontend
npm install
npm run dev
```
*Aplikacja webowa otworzy się na porcie 5173 (domyślnie dla Vite).*

## 📜 Licencja

Projekt dystrybuowany na licencji CC BY-NC 4.0 (Attribution-NonCommercial). Licencja ta pozwala na swobodne korzystanie, modyfikację i dystrybucję kodu, jednak wyłącznie do celów niekomercyjnych. Zabrania się wykorzystywania projektu i jego pochodnych do czerpania korzyści majątkowych.
