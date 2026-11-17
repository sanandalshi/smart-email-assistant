# Smart Email Assistant

AI-generated email replies with Spring Boot, Spring AI and OpenAI, in three parts:

| Folder        | What it is                                                     |
|---------------|----------------------------------------------------------------|
| `backend/`    | Spring Boot REST API (`POST /api/email/generate`) using Spring AI |
| `frontend/`   | React (Vite) web app: paste an email, pick a tone, copy the reply |
| `extension/`  | Chrome extension (Manifest V3) that adds an **AI Reply** button to Gmail |

```
React app ─┐
           ├─► POST /api/email/generate ─► Spring Boot + Spring AI ─► OpenAI
Extension ─┘
```

## 1. Add your OpenAI API key

Create a key at <https://platform.openai.com/api-keys> (your OpenAI account needs billing set up).
The key lives **only on the server**.

**Option A – environment variable (recommended)**

```bash
export OPENAI_API_KEY=your-key-here      # macOS / Linux
setx OPENAI_API_KEY "your-key-here"      # Windows (open a new terminal afterwards)
```

**Option B – edit** `backend/src/main/resources/application.properties` and replace
`YOUR_OPENAI_API_KEY_HERE`. Don't commit a real key.

Optional: set `OPENAI_MODEL` to pick a different model (default `gpt-4o-mini`, cheap and fast).

## 2. Run the backend (Java 21, Maven)

```bash
cd backend
mvn spring-boot:run
```

Runs on <http://localhost:8080>. Test it:

```bash
curl -X POST http://localhost:8080/api/email/generate \
  -H "Content-Type: application/json" \
  -d '{"emailContent":"Hi, can we move our meeting to Friday?","tone":"Professional"}'
```

Response: `{"reply":"..."}`. Errors come back as JSON with a clear status:
`400` invalid input · `502` AI call failed (e.g. bad key or no credit) · `500` unexpected.

Run the tests with `mvn test`.

## 3. Run the web app (Node 18+)

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. To use a different backend URL, copy `.env.example` to `.env`
and set `VITE_API_URL`.

## 4. Install the Chrome extension

1. Open `chrome://extensions` and switch on **Developer mode**.
2. Click **Load unpacked** and select the `extension/` folder.
3. Open Gmail, open an email and click **Reply**. An **AI Reply** button appears next to **Send**.
4. Click it: it reads the email, shows "Generating…", then inserts the reply into the compose box.

Tone and backend URL can be changed on the extension's **Options** page. If you deploy the
backend somewhere other than `localhost:8080`, add that URL to `host_permissions` in
`extension/manifest.json` and to `app.cors.allowed-origins` in `application.properties`.

> Gmail's HTML class names are obfuscated and change occasionally. If the button stops appearing,
> update the `SELECTORS` object at the top of `extension/content.js`.

## Configuration (`application.properties`)

| Property                          | Purpose                                     |
|-----------------------------------|---------------------------------------------|
| `spring.ai.openai.api-key`        | OpenAI API key (from `OPENAI_API_KEY`)      |
| `spring.ai.openai.chat.options.model` | OpenAI model name                       |
| `app.cors.allowed-origins`        | Browser origins allowed to call the API     |
| `app.email.max-length`            | Maximum accepted email length (characters)  |

## API

`POST /api/email/generate`

```json
{ "emailContent": "string (required)", "tone": "Professional | Casual | Friendly | None (optional)" }
```
