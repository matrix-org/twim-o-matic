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

LogService.setLogger(new RichConsoleLogger());
LogService.setLevel(LogLevel.INFO);

//s207322_14908813_3872_546544_6599_42_3612_90453_16
const homeserverUrl = require("./config/access_token.json").homeserver;
const accessToken = require("./config/access_token.json").accessToken;
const userId = require("./config/access_token.json").userId;
const storage = new SimpleFsStorageProvider("config/twim-o-matic-reader.json");
const sections = require("./data/sections.json");

const client = new MatrixClient(homeserverUrl, accessToken, storage);
AutojoinRoomsMixin.setupOnClient(client);
client.start().then(() => console.log("Client started!"));

const twimRoomId = "!xYvNcQPhnkrdUmYczI:matrix.org";
const activeRoom = twimRoomId;
const watchDate = new Date().toISOString();

const watchEmoji = Object.values(sections)
    .filter(function (s: any) { return s.icon !== undefined })
    .map(function (s: any) { return s.icon });
watchEmoji.push("🧹");
watchEmoji.push("👀");
console.log("twim-o-matic is watching for the following emoji:");
console.log(JSON.stringify(watchEmoji));

client.on("room.event", async function (roomId, event) {
    if (roomId !== activeRoom) {
        return;
    }
    if (event.sender !== userId) {
        return
    }
    if (event.type !== "m.reaction") {
        return
    }
    if (!event.content || !event.content['m.relates_to']) {
        return;
    }
    let matchedEmoji = watchEmoji.includes(event.content['m.relates_to'].key);
    console.log(`Reaction event` +
        `\n\tfrom: ${event.sender}` +
        `\n\tkey: ${event.content['m.relates_to'].key}` +
        `\n\tevent: ${event.content['m.relates_to'].event_id}` +
        `\n\tmatched: ${matchedEmoji} (${JSON.stringify(watchEmoji)})`);
    if (!matchedEmoji) {
        return;
    }
    processMatch(
        event.content['m.relates_to'].event_id,
        event.content['m.relates_to'].key
    );
});

async function processMatch(event_id, key) {
    appendFileSync(`events/events-${watchDate}.txt`, `${event_id},${key}\n`);

    let testRoomId = "!UpevrrilOuZdxLWcHj:bpulse.org";
    let events = {events: []};
    try {
        events = await client.getRoomStateEvent(testRoomId, "b.twim", "events");
        if (! events.events.includes(event_id)) {
            events.events.push(event_id);
            client.sendStateEvent(testRoomId, "b.twim", "events", events);
        }
    } catch (ex) {
        console.log(ex.body);
    } 
}