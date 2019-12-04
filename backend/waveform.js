require("dotenv").config();

const fs = require("fs");

const NodeID3 = require("node-id3");

const {spawn} = require("child_process");

var {AudioContext} = require("web-audio-api");
var MusicTempo = require("music-tempo");

Array.prototype.top = function(amount) {
    const indexes = [];

    while(amount--) {
        const max = Math.max(...this);
        const index = this.indexOf(max);
        // remove max
        this.splice(index, 1);
        indexes.push(index);
    }

    return indexes;
}

Array.prototype.chunk = function(indexes) {
    const chunks = [];

    indexes.forEach((value, index) => {
        prev = index > 0 ? index - 1 : 0;
        chunks.push(this.slice(prev, value));
    });

    return chunks;
}

const handleFile = file => {
    const dir = "./uploads/" + file.name;

    return new Promise((resolve, reject) => {
        file.mv(dir, error => {
            if(error) reject(error);
            else resolve(dir);
        })
    })
}

const guessTempo = buffer => {
    let audioData = [];
    // Take the average of the two channels

    if (buffer.numberOfChannels == 2) {
        console.log("Guessing tempo: Stereo")

        var channel1Data = buffer.getChannelData(0);
        var channel2Data = buffer.getChannelData(1);
        var length = channel1Data.length;

        for (var i = 0; i < length; i++) {
        audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
        }
    } else {
        console.log("Guessing tempo: Mono")

        audioData = buffer.getChannelData(0);
    }

    return new MusicTempo(audioData);
}

const getPeakIndexes = async (buffer, data) => {
    console.log("Refining samples");

    console.log("Getting audio context")
    const context = new AudioContext();
    console.log("Decoding audio data")
    const decoded = await new Promise((resolve, reject) => {
        try {
            context.decodeAudioData(buffer, resolve, reject);
        } catch(error) {
            reject(error);
        }
    });

    console.log("Guessing tempo");
    let {tempo, beats} = guessTempo(decoded);

    // array of on-beat indexes
    beats = beats.map(beat => Math.round(beat * process.env.PIXELS_PER_SECOND));

    data = data.chunk(beats);

    // There is something wrong with this function
    // I think it's because its finding indexes relative
    // to chunks

    // array of proportional peak indexes
    let outerIndex = 0;
    const peakIndexes = data.map((chunk) => {
        const top = chunk.top(process.env.PEAKS_PER_CHUNK).map(index => index + outerIndex);

        outerIndex += chunk.length;

        return top;
    });

    return peakIndexes.reduce((a, b) => a.concat(b), []); // back into 1D array
}

const createSampleJSON = path => new Promise((resolve, reject) => {
    console.log("Creating sample JSON");

    const shell = spawn("audiowaveform", [
        "-i", path, 
        "-o", "track.json", 
        "-b", "8", 
        "--pixels-per-second", process.env.PIXELS_PER_SECOND
    ]);

    console.log("Process started")

    shell.stdout.on("data", data => {
        console.log(data.toString());
    });

    shell.stderr.on("data", error => {
        reject(error.toString())
    });    

    shell.on("exit", async code => {
        console.log("Reading file");
        const buffer = NodeID3.removeTagsFromBuffer(fs.readFileSync(path));

        const samples = JSON.parse(fs.readFileSync("./track.json")).data;

        const peakIndexes = await getPeakIndexes(buffer, samples);

        console.log("Process finished");
        console.log(`Code: ${code}`);

        resolve({samples, peakIndexes})
    });
});

const createWaveformData = async file => {
    try {
        const path = await handleFile(file);

        console.log("Creating sample JSON")
        const {samples, peakIndexes, error} = await createSampleJSON(path);

        if(error) throw error;

        console.log("Returning values")
        return {success: true, samples, peakIndexes};
    } catch(error) {
        console.log(error);

        return {success: false, error: error.toString()}
    }
}

module.exports = {createWaveformData}