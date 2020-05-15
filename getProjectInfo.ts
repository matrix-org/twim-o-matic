export default function (body: string) {
    var project: string, section: string, maxScore: Number, summary: string;
    maxScore = 0;
    var hintsFound = [];

    const sectionsData = require("./data/sections.json");
    const sections = {};
    Object.keys(sectionsData).forEach((key) => {
        sections[key] = 0;
        if (!sectionsData[key].hints) return;
        sectionsData[key].hints.forEach(hint => {
            if (body.includes(hint)) {
                sections[key]++;
                hintsFound.push(hint);
            }
        })
    });

    if (/from.*to.*matrix/.exec(body)) sections["bridges"]++;
    
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
    if (body.includes("client-sdk")) sections["sdks"]++;
    if (body.includes("matrix-spring-boot-sdk")) sections["sdks"]++;


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
    if (body.includes("bot")) sections["bots"]++;
    if (body.includes("covbot")) sections["bots"]++;
    if (body.includes("gsoc")) sections["status"]++;
    if (body.includes("homeserver")) sections["servers"]++;
    if (body.includes("worker")) sections["servers"]++;
    if (body.includes("replication")) sections["servers"]++;
    if (body.includes("construct")) sections["servers"]++;
    if (body.includes("sygnal")) sections["servers"]++;
    if (body.includes("rooms")) sections["rooms"]++;
    if (body.includes("transcript")) sections["news"]++;
    if (body.includes("kubernetes")) sections["ops"]++;
    if (body.includes("matrix-docker-ansible-deploy")) sections["ops"]++;
    if (body.includes("meetup")) sections["talks"]++;
    if (body.includes("open tech will save us")) sections["status"]++;
    if (body.includes("open-tech-meetup")) sections["status"]++;
    if (body.includes("french government")) sections["status"]++;
    if (body.includes("weekly spec update")) sections["spec"]++;
    if (body.includes("msc")) sections["spec"]++;
    if (body.includes("incubator")) sections["hackathons"]++;
    if (body.includes("hackathon")) sections["hackathons"]++;
    if (body.includes("guide")) sections["guides"]++;
    if (body.includes("tutorial")) sections["guides"]++;
    if (body.includes("wrote")) sections["guides"]++;
    if (body.includes("setting up")) sections["guides"]++;
    if (body.includes("run-through")) sections["guides"]++;
    if (body.includes("watchalongs")) sections["projects"]++;
    if (body.includes("tweeting along")) sections["projects"]++;
    if (body.includes("doctor-who-watchalong:abolivier.bzh")) sections["projects"]++;
    
    Object.keys(sections).forEach(key => {
        if (sections[key] > maxScore) {
            maxScore = sections[key];
            section = key;
        }
    });

    var projects = require("./data/projects.json")
    Object.keys(projects).forEach(key => {
        if (body.includes(key)) {
            project = projects[key].title ? projects[key].title : key;
            if (projects[key].section) {
                section = projects[key].section;
            }
            if (projects[key].summary) {
                summary = projects[key].summary;
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
        scores: sections,
        summary: summary,
        hintsFound: hintsFound
    }
}