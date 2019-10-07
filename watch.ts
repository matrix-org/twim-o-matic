import {
    MatrixClient,
    SimpleFsStorageProvider,
} from "matrix-bot-sdk";
import {
    writeFileSync,
    appendFileSync,
} from "fs";
//s207322_14908813_3872_546544_6599_42_3612_90453_16
const homeserverUrl = require("./config/access_token.json").homeserver;
const accessToken = require("./config/access_token.json").accessToken;
const userId = require("./config/access_token.json").userId;
const storage = new SimpleFsStorageProvider("config/twim-o-matic-reader.json");

const client = new MatrixClient(homeserverUrl, accessToken, storage);

client.start().then(() => console.log("Client started!"));

const twimRoomId = "!FPUfgzXYWTKgIrwKxW:matrix.org";
const activeRoom = twimRoomId;
const watchDate = new Date().toISOString();

client.on("room.event", async function(roomId, event) {
    if (roomId !== activeRoom) {
        return;
    }
    if (event.sender !== userId) {
        return
    }
    if (event.type !== "m.reaction") {
        return
    }
    if (! event.content || ! event.content['m.relates_to']) {
        return;
    }
    if (event.content['m.relates_to'].key !== "👀") {
        return;
    }
    console.log("++++\n+++++\n++++++");
    var event_id = event.content['m.relates_to'].event_id;
    
    appendFileSync(`events/events-${watchDate}.txt`, `${event_id}\n`);
});