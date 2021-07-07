# twim-o-matic

Can be used to help produce new editions of <https://matrix.org/twim>.

## Setup

Install everything from npm (Node 12 minimum needed) and setup needed dirs:

```bash
npm i
mkdir events
mkdir blog
mkdir blog/img
```

To use, create a file at `config/access_token.json` and include three fields:

* `accessToken` - the accessToken of the account that will used for watching (in the live environment this is @twim-o-matic:bpulse.org)
* `homeserver` - the homeserver of the watching account
* `userId` - the userId which we permit to add new emoji

Then build from TypeScript (`sourcemap` used for debugging):

```bash
npx tsc --watch *.ts --sourcemap
```

Run `node watch.js`, then use your nominated mxid to react with one of the emoji below on a story to include. This will start logging event IDs.

To clear the stored list, use `node watch.js -c`. Do this for each new post or you will include previous entries.

When you have a collection, run: `node render.js`. This will read from the test room state list, and render the entries by writing some markdown to `out.md`, which will need some editing to make it presentable.

If an entry is from the `userId` nominated in the config, that entry will not be prefixed with `>`, since we don't consider it to be quoted.

Note the options for `render` in the section below. In general, to produce a final output you will use `render -mp`, `-m` to process media, and `-p` to process results from `#ping:maunium.net`.

## Deploy

`render` will produce a file, `out.md`. Make any final fixes needed to this markdown, then copy it to the relevent
location at `https://github.com/matrix-org/matrix.org/tree/master/gatsby/content/blog`, making sure to use a `*.mdx` extension.

## node watch --help

```
% node watch --help
Usage: watch [options]

Options:
  -c, --clear  clear the stored events
  -h, --help   display help for command
```

## node render --help

```
% node render --help
Usage: render [options]

Options:
  -d, --debug    output all the json blocks, suppress header
  -s, --summary  highlight missing summary blocks
  -m, --media    download and process media
  -p, --pings    get ping-room data
  -w, --web      start a server to render the result
  -h, --help     display help for command
```

## Emoji-Section map

* 🌡️: Dept of *Status of Matrix* 🌡️
* 📜: Dept of Spec 📜
* 🎓️: Dept of GSoC 🎓️
* 👥: Dept of P2P 👥
* 🏢: Dept of Servers 🏢
* 📥️: Homeserver Deployment 📥️
* 🌉: Dept of Bridges 🌉
* 📱: Dept of Clients 📱
* 🔐: Dept of Encryption 🔐
* 🧰: Dept of SDKs and Frameworks 🧰
* 🛠️: Dept of Ops 🛠
* 🚀: Dept of Services 🚀
* 🤷: Dept of Blockchain 🤷‍
* 💡: Dept of Internet of Things 💡
* 🤖: Dept of Bots 🤖
* 📹: Dept of Event Videos 📹
* 🗣️: Dept of Events and Talks 🗣️
* 🛰️: Dept of Interesting Projects 🛰️
* 🏗: Dept of *Built on Matrix* 🏗
* 🧭: Dept of Guides 🧭
* 🍕: Dept of Hackathons 🍕
* 💰️: Dept of Jobs 💰️
* 📰: Matrix in the News 📰
* 🏟: New Public Rooms 🏟
* 👐: Dept of Welcomes 👐
* 💭: Final Thoughts 💭
