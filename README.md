# Min rutin (webb)

Interaktiv React/PWA-version av "Min rutin" som hjälper barn att följa vardagliga steg-för-steg-aktiviteter med visuella kort, timers och färgprofiler.

## Teknik

- React 19 + TypeScript
- Vite 7
- PWA-stöd via `vite-plugin-pwa`
- GitHub Pages för produktion

## Kom igång

1. Installera beroenden: `npm install`
2. Utvecklingsläge med HMR: `npm run dev`
3. Produktionsbuild: `npm run build`
4. Förhandsgranska builden lokalt: `npm run preview`

> Tips: För att testa på enheter i samma nätverk kan du köra `npm run dev -- --host 0.0.0.0` eller `npm run preview -- --host 0.0.0.0` och surfa in på datorns IP-adress.

## Testa PWA-uppdateringar

Service workern (och uppdateringsbannern i appen) fungerar bara på `http://localhost` eller över HTTPS. För att testa på t.ex. iPad utan att deploya kan du starta förhandsvisningen med ett lokalt certifikat, t.ex.

```bash
mkcert localhost 192.168.1.153
npm run preview -- --host 0.0.0.0 --https --cert localhost+2.pem --key localhost+2-key.pem
```

Acceptera certifikatet på enheten en gång, och ladda sedan sidan via `https://<datorns-ip>:4173`.

## Deploy till GitHub Pages

1. Öppna **Settings → Pages** och säkerställ att "Build and deployment" står på "GitHub Actions".
2. Pusha till `main` (eller kör workflowet manuellt via **Actions → Deploy to GitHub Pages → Run workflow**). Workflow-filen finns i `.github/workflows/deploy.yml` och:
   - Checkar ut koden.
   - Kör `npm ci && npm run build` på Ubuntu.
   - Packar `dist/` och publicerar till GitHub Pages via `actions/deploy-pages`.
3. När jobbet är klart pekar `https://<org>.github.io/<repo>/` mot den senaste builden. URL:en syns även i Actions-loggen.

Vill du deploya från en annan branch eller med egen domän ändrar du helt enkelt triggren (under `on:`) eller lägger på en CNAME i `public/`.
