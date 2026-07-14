# 🏗️ Architektura Systemu AuraCast

Poniższy dokument opisuje logikę i budowę platformy AuraCast od strony technicznej.

## 1. Komunikacja Klient-Serwer

Platforma działa w modelu hybrydowym:
*   **API RESTful:** Wykorzystywane do standardowych operacji takich jak logowanie, rejestracja, pobieranie profili kanałów i list kategorii. Żądania HTTP wysyłane są do endpointów `/api/*`.
*   **WebSockets (Socket.io):** Utrzymują stałe, dwukierunkowe połączenie między przeglądarką widza a serwerem. Używane wyłącznie do obsługi czatu na żywo (wymiana danych w czasie rzędu milisekund). Pokoje czatu (rooms) są przypisane dynamicznie na podstawie nazwy kanału (z URL).

## 2. Baza Danych (MySQL)

Relacyjna struktura została wybrana ze względu na sztywne powiązania między użytkownikami, kanałami i uprawnieniami.
*   `users`: Przechowuje dane kont, zaszyfrowane hasła (bcrypt) i globalne role.
*   `channels`: Połączone relacją `1:1` z użytkownikiem. Przechowuje unikalny, bezpiecznie generowany `stream_key` (UUID) do konfiguracji oprogramowania OBS Studio.

## 3. Bezpieczeństwo i Autoryzacja

*   **Hasła:** Nigdy nie są przechowywane otwartym tekstem. Serwer hashuje je solą kryptograficzną przed zapisem.
*   **Sesje:** Oparte na tokenach **JWT (JSON Web Token)**. Middleware na backendzie dekoduje nagłówek `Authorization: Bearer <token>`, weryfikując uprawnienia przed pozwoleniem na np. odczyt klucza strumienia lub wygenerowanie nowego kanału.

## 4. Frontend (Vite + React)

Aplikacja kliencka używa dynamicznego routingu (`react-router-dom`). Layout główny zawierający pasek nawigacji i sidebar renderowany jest raz, co zapobiega miganiu interfejsu, podczas gdy zawartość strony (np. odtwarzacz wideo lub panel ustawień) wstrzykiwana jest dynamicznie przez komponent `<Outlet />`.