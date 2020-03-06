export default function (body: string) {
    const sections = {};
    Object.keys(require("./data/sections.json")).forEach((key) => {
        sections[key] = 0;
    });
    var project: string, section: string, maxScore: Number;
    maxScore = 0;

    if (body.includes("simplematrixlib")) sections["sdks"]++;
    if (body.includes("py-matrix-utils")) sections["sdks"]++;
    
    Object.keys(sections).forEach(key => {
        if (sections[key] > maxScore) {
            maxScore = sections[key];
            section = key;
        }
    })

    return {
        project: project,
        section: section
    }
}