# twim-o-matic

Can be used to help produce new editions of <https://matrix.org/twim>.

Install everything from npm and setup needed dirs:

```bash
npm i
mkdir events
mkdir blog
mkdir blog/img
```

To use, create a file at `config/access_token.json` and include three fields:

* accessToken - the accessToken of the account that will used for watching (in the live environment this is @twim-o-matic:bpulse.org)
* homeserver - the homeserver of the watching account
* userId - the userId which we permit to add new 👀

Then build from TypeScript (`sourcemap` used for debugging):

```bash
npx tsc --watch *.ts --sourcemap
```

Run `node watch.js`, then use your nominated mxid to react "👀" on a story to include. This will start logging event IDs.

When you have a collection, run: `node render.js`. This will check the `events` dir and read all files from the current date.

This will write some markdown to `out.md`, which will need some editing to make it presentable.
