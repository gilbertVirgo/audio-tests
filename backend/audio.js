require("dotenv").config()
const fs = require("fs")
const NodeID3 = require("node-id3")
const {spawn} = require("child_process")
const {AudioContext} = require("web-audio-api")
const MusicTempo = require("music-tempo")

// Gets top `n` items
Array.prototype.top = function(amount) {
    const indexes = []

    while(amount--) {
        const max = Math.max(...this)
        const index = this.indexOf(max)
        // remove max
        this.splice(index, 1)
        indexes.push(index)
    }

    return indexes
}

Array.prototype.chunk = function(indexes) {
    const chunks = []

    indexes.forEach((value, index) => {
        prev = index > 0 ? index - 1 : 0
        chunks.push(this.slice(prev, value))
    })

    return chunks
}

Array.prototype.flat = function() {
    return this.reduce((accumulator, currentValue) =>
        accumulator.concat(currentValue), []
    );
}

const guessTrackTempo = buffer => {
    let audioData = []
    // Take the average of the two channels

    if (buffer.numberOfChannels == 2) {
        console.log("Track is stereo")

        const channel1Data = buffer.getChannelData(0)
        const channel2Data = buffer.getChannelData(1)
        const length = channel1Data.length

        for (let i = 0; i < length; i++) {
            audioData[i] = (channel1Data[i] + channel2Data[i]) / 2
        }
    } else {
        console.log("Track is mono")

        audioData = buffer.getChannelData(0)
    }

    return new MusicTempo(audioData)
}

const getTrackData = path => new Promise((resolve, reject) => {
    console.log("Getting track data")

    const shell = spawn("audiowaveform", [
        "-i", path,         // input
        "-o", "track.json", // output
        "-b", "8",          // bit rate (?)
        "--pixels-per-second", process.env.PIXELS_PER_SECOND
    ]);

    shell.stdout.on("data", data => {
        // Progress
        console.log(data.toString())
    })

    shell.stderr.on("data", error => {
        // Failure
        console.log('Shell error');
        reject(error.toString())
    })    

    shell.on("exit", async code => {
        // Remove useless ID3 meta tags
        // NodeID3.removeTagsFromBuffer()

        // Array of amplitudes (?) from each sample
        const {data} = JSON.parse(await fs.promises.readFile("./track.json"));

        resolve(data);
    })
})

const getTrackBeats = async path => {
    let buffer = await fs.promises.readFile(path)
    buffer = NodeID3.removeTagsFromBuffer(buffer);

    const context = new AudioContext()

    const decoded = await new Promise((resolve, reject) => {
        try {
            context.decodeAudioData(buffer, resolve, reject)
        } catch(error) {
            reject(error)
        }
    })

    const {beats} = guessTrackTempo(decoded);

    return beats
}

const getTrackPeaks = async ({trackPath}) => {
    const data = await getTrackData(trackPath);
    const beats = await getTrackBeats(trackPath);

    // Beat indexes
    const beatIndexes = beats.map(beat => 
        Math.round(beat * process.env.PIXELS_PER_SECOND));

    // Grouped beat indexes (4/4)
    let bars = data.chunk(beatIndexes.map((beat, index) => 
        index % 4 === 0));
    
    // Split bars into 16th notes (semiquavers)
    bars = bars.map(bar => {
        // Compress array of beats (length `n`) to length 16 

        const semiquavers = [];
        const multiplier = bar.length / 16;

        let delta = 0;
        while(delta < bar.length) {
            let index = bar[Math.round(delta)],
                amplitude = beats[index];

            semiquavers.push(amplitude);
            delta += multiplier;
        }

        // Thin array down to louder than average peaks

        const min = Math.min(...semiquavers);
        const max = Math.max(...semiquavers);

        // Use index to make this an array of times (seconds)
        const peaks = semiquavers.filter((beatIndex, index) => 
            sample > (max - min) / 2);

        return peaks.map(beatIndex => beats[beatIndex]);
    });

    return bars.flat();
}

module.exports = {getTrackPeaks}