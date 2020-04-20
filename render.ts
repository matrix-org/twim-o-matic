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
import getSection from "./getSection";
import getProjectInfo from "./getProjectInfo";
const axios = require('axios').default;

const homeserverUrl = require("./config/access_token.json").homeserver;
const accessToken = require("./config/access_token.json").accessToken;
const userId = require("./config/access_token.json").userId;
const senders = require("./data/senders.json");
const sections = require("./data/sections.json");
const projects = require("./data/projects.json");
const storage = new SimpleFsStorageProvider("config/twim-o-matic.json");

const client = new MatrixClient(homeserverUrl, accessToken, storage);
const debug = false;

//client.start().then(() => console.log("Client started!"));

const twimRoomId = "!xYvNcQPhnkrdUmYczI:matrix.org";


function getSaidBookism() {
    const saidBookisms = ["said", "announced", "told us", "reported", "offered"];
    return saidBookisms[Math.floor(Math.random() * saidBookisms.length)];
}

function ds() {
    return (new Date()).toISOString().substring(0, 10);
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
var prevSection = "";
var prevSender = "";
var prevEventId = "";

async function getEvent(eventId) {
    var event = await client.getEvent(twimRoomId, eventId);
    return event;
}

function handleAddition(event) {
    var oldEvent = output[prevSection]
        .find(e => {return e.event_id === prevEventId});
    oldEvent.content += `\nTODO ${event.sender}: ${event.content.body}${debug ? event.event_id : "" }\n`;
}

function handleEvent(event, title, mode) {
    if (mode === "✍️") {
        handleAddition(event);
        return;
    }

    var written = false;

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
    var projectInfo = getProjectInfo(bodyLower);
    if (projectInfo.section) {
        section = projectInfo.section;
    } else {
        //section = getSection(bodyLower, section);
    }
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
    }
    else if (projectInfo.project) {
        title = projectInfo.project;
        titleLine = `### ${title}\n\n`;
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
    body = body.replace(/(^> )(#) (.*)/mg, `$1###$2 $3`);

    // insert missing gapped `>` after quoted headers
    body = body.replace(/(^> #*.*)\n>[^\n]/gm, `$1\n>\n> `);

    // insert matrix.to links for rooms
    const regex = /(#([a-z.-]+):([a-z.-]+)\b)/g;
    const subst = `[$1](https://matrix.to/#/$1)`;
    body = body.replace(regex, subst);

    // trim the lot
    body = body.trim();

    if (["m.video", "m.image"].includes(event.content.msgtype)) {
        if (debug) return;

        titleLine = "### TODO GET IMAGE\n\n";
        var url = "https://matrix.org/_matrix/media/r0/download/" + event.content.url.replace('mxc://', '');
        var filename = body.replace('> ', '').replace(/ /g, "");
        filename = `${ds()}-${event.event_id.substring(1,6)}-${filename}`;
        downloadImage(url, `blog/img/${filename}`);
        body = `![${filename}](blog/img/${filename})`;
        if (prevSender === event.sender) {
            output[prevSection][output[prevSection].length-1].content += `\n${body}\n`;
            written = true;
        }
    } else {
        prevSection = section;
        prevSender = event.sender;
        prevEventId = event.event_id;
    }

    if (written) return;

    if (!output[section]) output[section] = [];

    var debugText = "";
    if (debug) {
        debugText = event.event_id + `\n` + JSON.stringify(projectInfo) + `\n\n`;
    }

    var projectLine:string = "";
    if (projectInfo.summary) {
            projectLine = projectInfo.summary + `\n\n`;
        }
    else if (debug) {
        projectLine = `TODO MISSING SUMMARY LINE\n\n`;
    }

    output[section].push({
        score: score,
        content:`${titleLine}${debugText}${projectLine}${senderLine}${body}\n`,
        event_id: event.event_id
    });
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

function generateHeader() {
    if (debug) return "";

    return `---
date: '${ds()}'
title: 'This Week in Matrix ${ds()}'
categories:
  - This Week in Matrix
author: Ben Parsons
image: TODO
---\n\n`;
}

function outputAll() {
    var result:string = "";
    result += generateHeader();
    result += `## Matrix Live 🎙\n\n`;
    result += generateSection(sections.todo);
    result += generateSection(sections.status);
    result += generateSection(sections.spec);
    result += generateSection(sections.servers);
    result += generateSection(sections["synapse-deployment"]);
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
    result += generateSection(sections.guides);
    result += generateSection(sections.hackathons);
    result += generateSection(sections.jobs);
    result += generateSection(sections.news);
    result += generateSection(sections.rooms);
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
    output[section].sort(( a, b ) => a.score > b.score ? -1 : 1 );
    output[section].forEach(part => {
        result += `${part.content}\n`;
    });
    return result;
}

async function main() {

    var eventsFiles = readdirSync('./events').filter(fn => fn.startsWith(`events-${ds()}`));
    var eventsToHandle = [];
    eventsFiles.forEach(fn => {
        var fileContentsArr = readFileSync(`events/${fn}`, 'utf-8').split('\n');
        eventsToHandle = eventsToHandle.concat(fileContentsArr);
    })
    for(var line of eventsToHandle) {
        if (line.length === 0) continue;

        line = line.split(",");
        try {
            handleEvent(await getEvent(line[0]), "TODO", line[1])
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
