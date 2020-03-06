export default function (body: string) {
    var project: string, section: string, maxScore: Number;
    maxScore = 0;

    const sections = {};
    Object.keys(require("./data/sections.json")).forEach((key) => {
        sections[key] = 0;
    });

    if (body.includes("simplematrixlib")) sections["sdks"]++;
    if (body.includes("py-matrix-utils")) sections["sdks"]++;
    
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
        }
    });

    return {
        project: project,
        section: section
    }
}