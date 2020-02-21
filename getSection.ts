export default function (bodyLower: any, section: string) {
    if (bodyLower.includes("ansible") ||
        bodyLower.includes("helm")) {
        section = "ops";
    }
    else if (bodyLower.includes("spec-land") ||
        bodyLower.includes("spec land")) {
        section = "spec";
    }
    else if (bodyLower.includes("new project")) {
        section = "projects";
    }
    else if (bodyLower.includes("synapse") ||
        bodyLower.includes("dendrite")) {
        section = "servers";
    }
    else if (bodyLower.includes("sdk") ||
        bodyLower.includes("library") ||
        bodyLower.includes("ruma")) {
        section = "sdks";
    }
    else if (bodyLower.includes("fluffychat") ||
        bodyLower.includes("fractal") ||
        bodyLower.includes("riot") ||
        bodyLower.includes("pattle") ||
        bodyLower.includes("miitrix") ||
        bodyLower.includes("nheko") ||
        bodyLower.includes("notepad") ||
        bodyLower.includes("gomuks")) {
        section = "clients";
    }
    else if (bodyLower.includes("bridge") ||
        bodyLower.includes("appservice") ||
        bodyLower.includes("bridging") ||
        bodyLower.includes("mautrix-facebook")) {
        section = "bridges";
    }
    else if (bodyLower.includes("bot")) {
        section = "bots";
    }
    else if (bodyLower.includes("client") ||
        bodyLower.includes("lazy load") ||
        bodyLower.includes("ios") ||
        bodyLower.includes("android")) {
        section = "clients";
    }
    else if (bodyLower.includes("docker") ||
        bodyLower.includes("kubernetes") ||
        bodyLower.includes("k8s") ||
        bodyLower.includes("ma1sd")) {
        section = "ops";
    }
    else if (bodyLower.includes("msc")) {
        section = "spec";
    }
    else if (bodyLower.includes("welcome")) {
        section = "welcome";
    }
    else if (bodyLower.includes("talk") ||
        bodyLower.includes("presentation")) {
        section = "talks";
    }
    else if (bodyLower.includes("article") ||
        bodyLower.includes("newspaper")) {
        section = "news";
    }
    else if (bodyLower.includes("github action")) {
        section = "ops";
    }
    else if (bodyLower.includes("hosting")) {
        section = "services";
    }
    else if (bodyLower.includes("matrix-media-repo") ||
        bodyLower.includes("federation")) {
        section = "servers";
    }
    else if (bodyLower.includes("zapier") ||
        bodyLower.includes("zammad") ||
        bodyLower.includes("discord")) {
        section = "bridges";
    }
    else if (bodyLower.includes("work") ||
        bodyLower.includes("full time") ||
        bodyLower.includes("full-time")) {
        section = "jobs";
    }
    return section;
}