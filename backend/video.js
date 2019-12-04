const util = require('util');
const exec = util.promisify(require('child_process').exec);

const hhmmss = seconds => {
    const hh = Math.floor(seconds / 3600);
    const mm = Math.floor((seconds - (hh * 3600)) / 60);
    const ss = seconds - (hh * 3600) - (mm * 60);

    if (hh < 10) hh = "0" + hh;
    if (mm < 10) mm = "0" + mm;
    if (ss < 10) ss = "0" + ss;

    return [hh, mm, ss].join(":");
}

String.prototype.toTime = function () {
    const seconds = parseInt(this, 10); // don't forget the second param

    return hhmmss(seconds);
}

Number.prototype.toTime = function() {
    return hhmmss(this);
}

const path = ({root, name}) => 
    `${root}/${name}`;

const createCompositeVideo = async ({trackPeaks, clips, options}) => {
    /*
        File structure:
        /clips
            /{videoID}
                /raw
                /edited
    */

    const videoID = Date.now();

    const rawClips = await arrangeClips({videoID, trackPeaks, clips});

    let cumulativeLength = 0;

    // Instead of this, loop through directory files?
    // I deleted arrangeClips function. It was of no
    // use to me.
    for(const filePath of rawClips) {
        const timecode = filePath.split("/").slice(-1);

        const clipLength = timecode - cumulativeLength;

        outputPath = path({
            root: `./clips/${videoID}/edited/`,
            name: timecode
        })

        const {stdout, stderr} = 
            await exec(`ffmpeg -i ${filePath} -ss 00:00:00 -to ${clipLength.toTime()} -c:v copy -c:a copy ${outputPath}`);

        console.log({stdout, stderr});

        cumulativeLength += timecode;
    }
}

module.exports = {createCompositeVideo}