# nigol.ee

Rait Nigol’s website, music and physical media collection. Built with Next.js App Router and hosted on Vercel.

## Local development

Use Node.js 22 and npm. Run `npm ci` and `npm run dev`. Copy `.env.example` to `.env.local` to configure integrations. Run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` before opening a pull request.

## Managing records

Open the [private Record Room](https://pohhuy-record-room.nixol.chatgpt.site/manage) and sign in with the owner's ChatGPT account. Search for an artist, album, barcode or catalogue number, choose the edition, enter the details of your copy and publish it.

The public site reads the published collection at `/physical-media`. The management interface, drafts, acquisition details, private notes and write operations stay in the Record Room. The public reader uses fixed upstream paths for the published feed and its uploaded cover art. It never forwards browser credentials. The public feed is refreshed after at most 60 seconds on the next server request. New requests for uploaded artwork check current publication before serving the image.

## Vercel environments

Set `RECORD_ROOM_READ_TOKEN` as a server-side sensitive environment variable. Its value is the private Record Room's Sites service-access bearer, obtained by the owner through the Sites connection. Supply the raw value without a Bearer prefix. The Record Room consumes this credential at the hosting boundary. Record management requires separate owner authorization. Keep all management credentials on the private Site.

Start with the trusted feature branch’s **Preview** environment, then redeploy that preview. Configure **Production** when the integration is approved for rollout. Leave the value out of Git, PRs, browser code and untrusted preview builds. A deployment without the variable displays the public migration snapshot. Once configured, a feed failure displays a retry message. A valid empty feed displays an empty shelf.

The homepage player and listening charts use the existing `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` and `SPOTIFY_REFRESH_TOKEN` server variables. Album links and click-to-load players work independently of the personal listening API.

The collection listening room also displays the owner's Spotify session through a read-only Plinth gramophone. See [Plinth integration](docs/plinth.md) for its loading behaviour and the source update workflow.

## Review and deployment

Feature branches receive a Vercel preview through the repository's Git integration. Review the preview before merging the pull request into the production branch.
