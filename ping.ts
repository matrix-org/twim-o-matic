var request = require('request-promise');
export default async function() {
    const url = `https://maubot.xyz/_matrix/maubot/plugin/pingstat/!TdAwENXmXuMrCrFEFX:maunium.net/stats.json`;
    var result = "";
    await request(url, function (error, response, body) {
        if (error) {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            process.exit(1);
        }
        if (response && response.statusCode !== 200) {
            console.log('statusCode:', response.statusCode);
        }
        result += `## Dept of Ping 🏓\n\n`;
        result += `Here we reveal, rank, and applaud the homeservers with the lowest ping, as measured by [pingbot](https://github.com/maubot/echo), a [maubot](https://github.com/maubot/maubot) that you can host on your own server. Join [#ping:maunium.net](https://matrix.to/#/#ping:maunium.net) to experience the fun live, and to find out how to add YOUR server to the game.\n\n`;
        result += `|Rank|Hostname|Median MS|\n`;
        result += `|:---:|:---:|:---:|\n`;
        const pings = JSON.parse(body).pings;
        Object.keys(pings).slice(0,10).forEach((server, i) => {
            result += `|${i+1}|${server}|${pings[server].median}|\n`;
        });
        result += `\n`;
    });
    return result;
}
