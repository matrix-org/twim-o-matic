import {
    MatrixClient,
    SimpleFsStorageProvider,
} from "matrix-bot-sdk";
import {
    readdirSync,
    readFileSync,
    writeFileSync,
    createWriteStream
} from "fs";
import ping from "./ping";
const axios = require('axios').default;

const homeserverUrl = require("./config/access_token.json").homeserver;
const accessToken = require("./config/access_token.json").accessToken;
const userId = require("./config/access_token.json").userId;
const senders = require("./config/senders.json");
const storage = new SimpleFsStorageProvider("config/twim-o-matic.json");

const client = new MatrixClient(homeserverUrl, accessToken, storage);

//client.start().then(() => console.log("Client started!"));

const twimRoomId = "!xYvNcQPhnkrdUmYczI:matrix.org";

const sections = {
    todo: "TOD UNKNOWN SECTION",
    status: "Dept of *Status of Matrix* 🌡",
    servers: "Dept of Servers 🏢",
    bridges: "Dept of Bridges 🌉",
    services: "Dept of Services 🚀",
    ops: "Dept of Ops 🛠",
    clients: "Dept of Clients 📱",
    bots: "Dept of Bots 🤖",
    thoughts: "Final Thoughts 💭",
    eventvideos: "Dept of Event Videos 📹",
    sdks: "Dept of SDKs and Frameworks 🧰",
    encryption: "Dept of Encryption 🔐",
    blockchain: "Dept of Blockchain 🤷‍",
    spec: "Dept of Spec 📜",
    welcome: "Dept of Welcomes 👐",
    talks: "Dept of Events and Talks 🗣",
    projects: "Dept of Interesting Projects 🛰",
    news: "Matrix in the News 📰",
    build: "Dept of *Built on Matrix* 🏗",
    jobs: "Dept of Jobs 💰"
};

function getSaidBookism() {
    const saidBookisms = ["said", "announced", "told us", "reported", "offered"];
    return saidBookisms[Math.floor(Math.random() * saidBookisms.length)];
}

function generateSignOff() {
    var title:string = "## That's all I know 🏁";
    const messages = [
        "See you next week, and be sure to stop by [#twim:matrix.org] with your updates!",
        "So that's all I have to say to you right now! See you next week, and be sure to stop by [#twim:matrix.org] with your updates!"
    ];
    const urls = `[#TWIM:matrix.org]: https://matrix.to/#/#TWIM:matrix.org`;
    return `${title}\n\n${messages[0]}\n\n${urls}\n`;
}

var output = {};
var pings = "";

async function getEvent(eventId) {
    var event = await client.getEvent(twimRoomId, eventId);
    return event;
}

function handleEvent(event, title) {
    // first extract the body content
    var body = event.content.body;
    // remove the various TWIM markers
    body = body.replace("TWIM: ", "");
    body = body.replace("TWIM:", "");
    body = body.replace("@twim:cadair.com: ", "");
    body = body.replace("@twim:cadair.com:", "");
    body = body.replace("@twim:cadair.com", "");
    body = body.replace(/^TWIM /gm, "");
    body = body.replace(/^TWIM\n/gm, "");
    body = body.trim();

    // next determine the section
    var section = 'todo';
    var bodyLower = body.toLowerCase();
    section = getSection(bodyLower, section);
    section = sections[section];
    
    // find the score (sum of all reactions)
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    var reactions = event.unsigned['m.relations']['m.annotation'].chunk;
    const score = reactions.map(r => r.count).reduce(reducer);

    // set the title line
    var titleLine:string = "";
    if (body[0] === '#') {
        const bodyLines = body.split('\n');
        titleLine = `###${bodyLines[0].replace(/\#/g, "")}\n\n`
        bodyLines.shift();
        body = bodyLines.join('\n');
        body = body.trim();
    }
    else if (section === sections.thoughts) {
        titleLine = "";
    } else {
        titleLine = `### ${title} ${score}\n\n`;
    }

    // quoteMode means we give credit and prepend
    var quoteMode = true;
    if (event.sender === userId) {
        quoteMode = false;
    }

    // senderLine depends on the quoteMode
    var senderLine:String = "";
    if (quoteMode) {
        var sender = senders[event.sender];
        if (sender) {
            senderLine = `[${sender.name}]`;
            if (sender.url) {
                senderLine += `(${sender.url})`;
            } else {
                senderLine += `(https://matrix.to/#/${event.sender})`;
            }
        } else {
            senderLine = `TODO MISSING NAME [${event.sender}](https://matrix.to/#/${event.sender})`;
        }
        senderLine += ` ${getSaidBookism()}:\n\n`;
    }

    // massage the body text where needed
    if (quoteMode) {
        // prepend each line with a `>`, no space if it's a blank line
        body = body.replace(/^/gm, `> `);
        body = body.replace(/^> *$/gm, ">");
    }

    // * for lists, not -, get over it
    body = body.replace(/^>( )+-/gm, "> *");

    // fix some missing linebreaks
    body = body.replace(/(^> [^\*](.)+\n)> \*/mg, `$1>\n> *`);

    // add warning to malformed header
    body = body.replace(/(^> #.*)/mg, `$1 TODO FIX MALFORMED HEADER`);

    // insert matrix.to links for rooms
    const regex = /(#([a-z.-]+):([a-z.-]+)\b)/g;
    const subst = `[$1](https://matrix.to/#/$1)`;
    body = body.replace(regex, subst);

    // trim the lot
    body = body.trim();

    if (event.content.msgtype === "m.image") {
        titleLine = "### TODO GET IMAGE\n\n";
        var url = "https://matrix.org/_matrix/media/r0/download/" + event.content.url.replace('mxc://', '');
        var filename = body.replace('> ', '');
        downloadImage(url, `images/${filename}`);
        body = `![image](images/${filename})`;
    }

    if (!output[section]) output[section] = {};
    if (! output[section][event.event_id]) { output[section][event.event_id] = ""; }
    output[section][event.event_id] += `${titleLine}${senderLine}${body}\n`;
}

function getSection(bodyLower: any, section: string) {
    if (bodyLower.includes("ansible") ||
        bodyLower.includes("helm")) {
        section = "ops";
    }
    else if (bodyLower.includes("spec-land") ||
        bodyLower.includes("spec land")) {
        section = "spec";
    }
    else if (bodyLower.includes("new project")) {
        section = "projects";
    }
    else if (bodyLower.includes("synapse") ||
        bodyLower.includes("dendrite") ||
        bodyLower.includes("ruma")) {
        section = "servers";
    }
    else if (bodyLower.includes("fluffychat") ||
        bodyLower.includes("fractal") ||
        bodyLower.includes("riot") ||
        bodyLower.includes("pattle") ||
        bodyLower.includes("miitrix") ||
        bodyLower.includes("nheko") ||
        bodyLower.includes("notepad")) {
        section = "clients";
    }
    else if (bodyLower.includes("bridge") ||
        bodyLower.includes("appservice") ||
        bodyLower.includes("bridging") ||
        bodyLower.includes("mautrix-facebook")) {
        section = "bridges";
    }
    else if (bodyLower.includes("bot")) {
        section = "bots";
    }
    else if (bodyLower.includes("client") ||
        bodyLower.includes("lazy load") ||
        bodyLower.includes("ios") ||
        bodyLower.includes("android")) {
        section = "clients";
    }
    else if (bodyLower.includes("docker") ||
        bodyLower.includes("kubernetes") ||
        bodyLower.includes("k8s") ||
        bodyLower.includes("ma1sd")) {
        section = "ops";
    }
    else if (bodyLower.includes("msc")) {
        section = "spec";
    }
    else if (bodyLower.includes("welcome")) {
        section = "welcome";
    }
    else if (bodyLower.includes("sdk") ||
        bodyLower.includes("library")) {
        section = "sdks";
    }
    else if (bodyLower.includes("talk") ||
        bodyLower.includes("presentation")) {
        section = "talks";
    }
    else if (bodyLower.includes("article") ||
        bodyLower.includes("newspaper")) {
        section = "news";
    }
    else if (bodyLower.includes("github action")) {
        section = "ops";
    }
    else if (bodyLower.includes("hosting")) {
        section = "services";
    }
    else if (bodyLower.includes("matrix-media-repo") ||
        bodyLower.includes("federation")) {
        section = "servers";
    }
    else if (bodyLower.includes("zapier") ||
        bodyLower.includes("zammad") ||
        bodyLower.includes("discord")) {
        section = "bridges";
    }
    else if (bodyLower.includes("work") ||
        bodyLower.includes("full time") ||
        bodyLower.includes("full-time")) {
        section = "jobs";
    }
    return section;
}

async function downloadImage (url, path) {  
    const writer = createWriteStream(path);
  
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
  
    response.data.pipe(writer)
  
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
}

function manualAddEvent(title, text, section) {
    const titleLine = `### ${title}\n\n`;
    const senderLine:String = `TODO ${getSaidBookism()}:\n\n`;
    const body = text.replace(/^/gm, `> `);
    if (!output[section]) output[section] = {};
    output[section][title] = `${titleLine}${senderLine}${body}\n\n`;
    
}

function appendEvent(rootEventId, newEvent, section) {
    output[section][rootEventId] += `> ${newEvent.content.body}  \n`;
}

function outputAll() {
    var result:string = "";
    result += `## Matrix Live 🎙\n\n`;
    result += generateSection(sections.todo);
    result += generateSection(sections.status);
    result += generateSection(sections.spec);
    result += generateSection(sections.servers);
    result += generateSection(sections.bridges);
    result += generateSection(sections.clients);
    result += generateSection(sections.encryption);
    result += generateSection(sections.sdks);
    result += generateSection(sections.ops);
    result += generateSection(sections.services);
    result += generateSection(sections.blockchain);
    result += generateSection(sections.bots);
    result += generateSection(sections.eventvideos);
    result += generateSection(sections.talks);
    result += generateSection(sections.projects);
    result += generateSection(sections.jobs);
    result += generateSection(sections.news);
    result += generateSection(sections.welcome);
    result += generateSection(sections.thoughts);
    result += pings;
    result += generateSignOff();

    // wrap bare urls
    const regex = /([^(])(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*))/mg;
    const subst = `$1<$2>`;
    result = result.replace(regex, subst);
    //console.log(result);
    writeFileSync("out.md", result);
}

function generateSection(section) {
    if (! output[section]) return "";

    var result:string = "";
    result += `## ${section}\n\n`;
    Object.keys(output[section]).forEach(event_id => {
        result += `${output[section][event_id]}\n`;
    });
    return result;
}

async function main() {

    var eventsFiles = readdirSync('./events').filter(fn => fn.startsWith(`events-${(new Date()).toISOString().substring(0, 10)}`));
    var eventsToHandle = [];
    eventsFiles.forEach(fn => {
        var fileContentsArr = readFileSync(`events/${fn}`, 'utf-8').split('\n');
        eventsToHandle = eventsToHandle.concat(fileContentsArr);
    })
    for(var line of eventsToHandle) {
        if (line.length === 0) continue;
        try {
            handleEvent(await getEvent(line), "TODO")
        } catch (ex) {
            console.log(ex.body);
            console.log(line);
        }
    }
    pings = await ping();
    //handleEvent(await getEvent("$15655651651446947hOnwk:matrix.org"), "This Week in Rust", sections.servers);
    //manualAddEvent("Bluepill (Sailfish client) status update", `Users can now download [artifacts from my gitlab account](https://gitlab.com/cy8aer/bluepill/pipelines) since I got an SDK container from CoDerus running, cross compiling to Sailfish-RPMs in the Gitlab-Ci.\nBut my programming progress on \`master\` looks a bit silent because I swap to [https://github.com/poljar/matrix-nio](vector://vector/webapp/matrix-nio).`, sections.clients);
    //appendEvent("$15657737670VyoXM:kittenface.studio", await getEvent("$15657745573qgJxE:kittenface.studio"), sections.ops)
    outputAll();
}

main();





