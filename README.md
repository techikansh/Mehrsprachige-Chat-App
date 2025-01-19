# Mehrsprachige-Chat-App

## Beschreibung
Eine Chat-Anwendung, die Nachrichten automatisch übersetzt und dem Empfänger in seiner bevorzugten Sprache zustellt – unabhängig davon, in welcher Sprache die Nachricht gesendet wurde.

### Hauptfunktionen
- **Einzelchats**: Nachrichten werden direkt in die bevorzugte Sprache des Empfängers übersetzt.
- **Gruppenchats**: Jede Gruppe hat eine festgelegte Sprache. Nachrichten werden in dieser Sprache empfangen, unabhängig von der Sprache, in der sie gesendet wurden.

## Installation & Setup

### Voraussetzungen
- Node.js (v18 oder höher)
- MongoDB
- npm oder yarn
- Google Gemini API Key
- DeepL API Key
- Firebase Account (für Speicher)

### Server-Setup

1. In das Server-Verzeichnis wechseln:
   ```bash
   cd server
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

3. `.env` Datei im Server-Verzeichnis erstellen:
   ```env
   PORT=8081
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. `apiKeys.js` Datei im Server-Verzeichnis erstellen:
   ```javascript
   export const DEEPL_API_KEY = "your_deepl_api_key";
   export const GROQ_API_KEY = "your_groq_api_key";
   ```

5. Server starten:
   ```bash
   npm run dev
   ```

### Client-Setup

1. In das Client-Verzeichnis wechseln:
   ```bash
   cd client
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

3. `.env` Datei im Client-Verzeichnis mit Firebase-Konfiguration erstellen:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

Die Anwendung läuft dann unter:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8081`

## Features

✨ **Kernfunktionen**
- Echtzeit-Chat mit automatischer Nachrichtenübersetzung
- Einzel- und Gruppenchats
- Nachrichtenübersetzung mit drei APIs:
  - Google Gemini API
  - DeepL API
  - Groq API
- Datei- und Avatar-Upload via Firebase Storage
- Benutzer-Status-Tracking (online/offline)
- Vorschau der Originalnachricht beim Hover

## Evaluierung

Das Projekt enthält ein umfassendes Evaluierungssystem zum Vergleich verschiedener Übersetzungsdienste (DeepL, Google Gemini und Groq) unter Verwendung paralleler Korpus-Datensätze.

### Einrichtung

1. Erforderliche Abhängigkeiten installieren:
```bash
pip install -r evaluation/requirements.txt
```

2. Erstellen Sie eine `.env` Datei im Evaluierungsverzeichnis mit Ihren API-Schlüsseln:
```env
DEEPL_API_KEY=ihr_deepl_key
GEMINI_API_KEY=ihr_gemini_key
GROQ_API_KEY=ihr_groq_key
```

### Datensatzstruktur

Die Evaluierung verwendet parallele Korpus-Datensätze im JSON-Format mit folgenden Elementen:
- `id`: Eindeutige Kennung für jedes Übersetzungspaar
- `text`: Ausgangstext für die Übersetzung
- `target_language`: Zielsprachcode (ES für Spanisch, DE für Deutsch)
- `reference`: Referenzübersetzung zum Vergleich

### Durchführung der Evaluierung

1. Evaluierungsdatensätze generieren:
```bash
python evaluation/dataset_extraction_script.py
```

2. Evaluierung durchführen:
```bash
python evaluation/evaluation_script.py
```

3. Ergebnisse in R anzeigen:
```bash
Rscript evaluation/analysis_script.R
```

### Metriken

Die Evaluierung misst:
- **BLEU-Score**: Misst die Übersetzungsqualität durch Vergleich von N-Gramm-Übereinstimmungen
- **METEOR-Score**: Bewertet die Übersetzungsqualität unter Berücksichtigung von Synonymen und Paraphrasen
- **Übersetzungszeit**: Erfasst die Dauer für jeden Übersetzungsdienst

### Ausgabe

Die Evaluierung erzeugt:
- CSV-Datei mit detaillierten Ergebnissen
- Vergleichende Visualisierungen:
  - `bleu_comparison.png`
  - `meteor_comparison.png`
  - `time_comparison.png`
  - `combined_comparison.png`

### Batch-Verarbeitung

Das Evaluierungsskript verarbeitet Übersetzungen in Batches, um API-Ratenlimits und Ressourcennutzung zu verwalten. Die Batch-Größe und Verzögerung zwischen den Batches können in den Konstanten des Evaluierungsskripts angepasst werden.