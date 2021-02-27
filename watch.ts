import {
    MatrixClient,
    SimpleFsStorageProvider,
    LogLevel,
    AutojoinRoomsMixin,
    LogService,
    RichConsoleLogger
} from "matrix-bot-sdk";
import {
    writeFileSync,
    appendFileSync,
} from "fs";

const {program} = require('commander');
program
    .option('-c, --clear', 'clear the stored events')
program.parse(process.argv);

LogService.setLogger(new RichConsoleLogger());
LogService.setLevel(LogLevel.WARN);

//s207322_14908813_3872_546544_6599_42_3612_90453_16
const config = require("./config/access_token.json")
const homeserverUrl = config.homeserver;
const accessToken = config.accessToken;
const userId = config.userId;
const adminRoomId = config.adminRoomId;
const storage = new SimpleFsStorageProvider("config/twim-o-matic-reader.json");
const sections = require("./data/sections.json");

const client = new MatrixClient(homeserverUrl, accessToken, storage);

if (program.clear) {
    clear();
}


AutojoinRoomsMixin.setupOnClient(client);
client.start().then(() => console.log("Client started!"));

const twimRoomId = "!xYvNcQPhnkrdUmYczI:matrix.org";
const activeRoom = twimRoomId;
const watchDate = new Date().toISOString();

const watchEmoji = Object.values(sections)
    .filter(function (s: any) {
        return s.icon !== undefined
    })
    .map(function (s: any) {
        return s.icon
    });
watchEmoji.push("🧹");
watchEmoji.push("👀");
console.log("twim-o-matic is watching for the following emoji:");
console.log(JSON.stringify(watchEmoji));

client.on("room.event", async function (roomId, event) {
    if (roomId === adminRoomId) {
        handleAdminCommand(event);
        return;
    }

    if (roomId !== activeRoom) {
        return;
    }
    if (event.sender !== userId) {
        return
    }
    if (event.type == "m.reaction") {
        if (!event.content || !event.content['m.relates_to']) {
            return;
        }
        let matchedEmoji = watchEmoji.includes(event.content['m.relates_to'].key);
        let reactionLog = `Reaction event` +
            `\n\tfrom: ${event.sender}` +
            `\n\tkey: ${event.content['m.relates_to'].key}` +
            `\n\tevent: ${event.content['m.relates_to'].event_id}` +
            `\n\tmatched: ${matchedEmoji}`;
        if (!matchedEmoji) {
            reactionLog += ` (${JSON.stringify(watchEmoji)})`;
        }
        console.log(reactionLog);
        if (!matchedEmoji) {
            return;
        }
        processMatch(
            event.content['m.relates_to'].event_id,
            event.content['m.relates_to'].key,
            event.event_id
        );
    } else if (event.type == "m.room.redaction") {
        if (!event.redacts) {
            return;
        }
        let entries = {entries: []};
        try {
            entries = await client.getRoomStateEvent(adminRoomId, "b.twim", "entries");
            for (const entry of entries.entries) {
                for (let i = 0; i < entry.events.length ; i++) {
                    if (entry.events[i].reaction_event == event.redacts) {
                        console.log(`RedactionEvent found that redacts ${event.redacts}`);
                        entry.events.splice(i, 1);
                    }
                }
            }
            client.sendStateEvent(adminRoomId, "b.twim", "entries", entries);
        } catch (ex) {
            console.log(ex.body);
        }
    } else {
        return;
    }
});

function handleAdminCommand(event) {
    if (!event.content || !event.content.body || !(event.content.body[0] === "!")) {
        return;
    }
    let command = event.content.body;
    console.log("Command: " + command);
    if (command === "!clear") {
        clear();
    }
}

async function processMatch(event_id, key, reaction_event_id) {
    appendFileSync(`events/events-${watchDate}.txt`, `${event_id},${key}\n`);
    let entries = {entries: []};
    try {
        entries = await client.getRoomStateEvent(adminRoomId, "b.twim", "entries");
        if (!entries.entries.includes(event_id)) {
            entries.entries.push({
                events: [{
                    event: event_id,
                    reaction_event: reaction_event_id
                }],
                key: key,
                notes: [],
                transforms: []
            });
            client.sendStateEvent(adminRoomId, "b.twim", "entries", entries);
        }
    } catch (ex) {
        console.log(ex.body);
    }
}

function clear() {
    if (client.sendStateEvent(adminRoomId, "b.twim", "entries", {entries: []})) {
        let clearSuccess = "Events cleared";
        console.log(clearSuccess);
        client.sendText(adminRoomId, clearSuccess);
    } else {
        let clearFailed = "Events not cleared, error"
        console.log(clearFailed);
        client.sendText(adminRoomId, clearFailed);
    }
}
