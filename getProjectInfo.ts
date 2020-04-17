export default function (body: string) {
    var project: string, section: string, maxScore: Number;
    maxScore = 0;

    const sections = {};
    Object.keys(require("./data/sections.json")).forEach((key) => {
        sections[key] = 0;
    });

    if (body.includes("simplematrixlib")) sections["sdks"]++;
    if (body.includes("py-matrix-utils")) sections["sdks"]++;
    if (body.includes("matrix-rust-sdk")) sections["sdks"]++;
    if (body.includes("ruma-events")) sections["sdks"]++;
    if (body.includes("ruma-api")) sections["sdks"]++;
    if (body.includes("ruma-client-api")) sections["sdks"]++;
    if (body.includes("libquotient")) sections["sdks"]++;
    if (body.includes("libqmatrixclient")) sections["sdks"]++;
    if (body.includes("library")) sections["sdks"]++;
    if (body.includes("php library")) sections["sdks"]++;
    if (/from.*to.*matrix/.exec(body)) sections["bridges"]++;
    if (body.includes("multi arch synapse docker image")) sections["synapse-deployment"]++;
    if (body.includes("synapse docker")) sections["synapse-deployment"]++;
    if (body.includes("image for synapse")) sections["synapse-deployment"]++;
    if (body.includes("ananace/matrix-synapse")) sections["synapse-deployment"]++;
    if (body.includes("matrix-synapse")) sections["synapse-deployment"]++;
    if (body.includes("mvgorcum/docker-matrix")) sections["synapse-deployment"]++;
    if (body.includes("docker-matrix")) sections["synapse-deployment"]++;
    if (body.includes("helm chart")) sections["ops"]++;
    if (body.includes("dacruz21/matrix-chart")) sections["ops"]++;
    if (body.includes("docker")) sections["ops"]++;
    if (body.includes("synapse")) sections["servers"]++;
    if (body.includes("dendrite")) sections["servers"]++;
    if (body.includes("conduit")) sections["servers"]++;
    if (body.includes("federation")) sections["servers"]++;
    if (body.includes("gomatrixserverlib")) sections["servers"]++;
    if (body.includes("matrixserver")) sections["servers"]++;
    if (body.includes("notepad")) sections["projects"]++;
    if (body.includes("fluffy")) sections["clients"]++;
    if (body.includes("bot")) sections["bots"]++;
    if (body.includes("gsoc")) sections["status"]++;
    if (body.includes("homeserver")) sections["servers"]++;
    if (body.includes("sygnal")) sections["servers"]++;
    if (body.includes("rooms")) sections["rooms"]++;
    if (body.includes("transcript")) sections["news"]++;
    if (body.includes("client")) sections["clients"]++;
    if (body.includes("scrolling")) sections["clients"]++;
    if (body.includes("kubernetes")) sections["ops"]++;
    if (body.includes("nheko")) sections["clients"]++;
    if (body.includes("thumbnail")) sections["clients"]++;
    if (body.includes("appimage")) sections["clients"]++;
    if (body.includes("flatpack")) sections["clients"]++;
    if (body.includes("gomuks")) sections["clients"]++;
    if (body.includes("ios")) sections["clients"]++;
    if (body.includes("riot web")) sections["clients"]++;
    if (body.includes("riot")) sections["clients"]++;
    if (body.includes("riotx")) sections["clients"]++;
    if (body.includes("meetup")) sections["talks"]++;
    if (body.includes("open tech will save us")) sections["status"]++;
    if (body.includes("open-tech-meetup")) sections["status"]++;
    if (body.includes("mautrix-telegram")) sections["bridges"]++;
    if (body.includes("bridge")) sections["bridges"]++;
    if (body.includes("bridging")) sections["bridges"]++;
    if (body.includes("mautrix-whatsapp")) sections["bridges"]++;
    if (body.includes("plumb")) sections["bridges"]++;
    if (body.includes("mx-puppet")) sections["bridges"]++;
    if (body.includes("send webhooks")) sections["bridges"]++;
    if (body.includes("messages to matrix")) sections["bridges"]++;
    if (body.includes("kallithea")) sections["bridges"]++;
    if (body.includes("weekly spec update")) sections["spec"]++;
    if (body.includes("msc")) sections["spec"]++;
    if (body.includes("incubator")) sections["hackathons"]++;
    if (body.includes("hackathon")) sections["hackathons"]++;
    if (body.includes("guide")) sections["guides"]++;
    
    Object.keys(sections).forEach(key => {
        if (sections[key] > maxScore) {
            maxScore = sections[key];
            section = key;
        }
    });

    var projects = require("./data/projects.json")
    Object.keys(projects).forEach(key => {
        if (body.includes(key)) {
            project = key;
            if (projects[key].section) {
                section = projects[key].section;
            }
        }
    });

    Object.keys(sections).forEach(key => {
        if (sections[key] === 0 ) {
            delete sections[key];
        }
    });

    return {
        project: project,
        section: section,
        scores: sections
    }
}