const fs = require("fs");
const path = require("path");

// create project folder etc.

/*
    /projects
        /{name}
            /clips
                /raw
                /edited
            /track
*/

const create = async projectName => {
    projectName += `-${Date.now()}`;

    const root = path.join(__dirname, "projects", projectName);

    await fs.promises.mkdir(root);
    
    const folders = ["clips", "clips/raw", "clips/edited", "track"];

    for(const folder of folders) {
        await fs.promises.mkdir(folder);
    }
}

const populate = async (projectDir, {clips, track}) => {
    const raw = path.join(projectDir, "clips/raw");
    const track = path.join(projectDir, "track");

    await 
}

module.exports = {create};