var request = require('request-promise');
export default async function(url: string, alias: string) {
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
        result += `### [${alias}](https://matrix.to/#/${alias})\n`
        result += `Join [${alias}](https://matrix.to/#/${alias}) to experience the fun live, and to find out how to add YOUR server to the game.\n\n`
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
