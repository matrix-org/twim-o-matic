# twim-o-matic

Can be used to help produce new editions of <https://matrix.org/twim>.

Install everything from npm and setup needed dirs:

```bash
npm i
mkdir events
mkdir config
```

To use, create a file at `config/access_token.json` and include three fields:

* accessToken
* homeserver
* userId

Then build from TypeScript (`sourcemap` used for debugging):

```bash
npx tsc --watch *.ts --sourcemap
```

Run `node watch.js`, then use your nominated mxid to react "👀" on a story to include. This will start logging event IDs.

When you have a collection, edit `eventsFile` in render.ts, then run the resulting js: `node render.js`.

This will write some markdown to `out.md`, which will need some editing to make it presentable.
