const {guess} = require("web-audio-beat-detector");

const createBuffer = require('audio-buffer-from');

const fs = require("fs");

const {spawn} = require("child_process");

var AudioContext = require("web-audio-api").AudioContext;
var MusicTempo = require("music-tempo");
var fs = require("fs");


const handleFile = file => {
    const dir = __dirname + "/uploads" + file.name;

    return new Promise((resolve, reject) => {
        file.mv(dir, error => {
            if(error) reject(error);
            else resolve(dir);
        })
    })
}

const createSampleJSON = path => new Promise((resolve, reject) => {
    const shell = spawn("audiowaveform", [
        "-i", path, 
        "-o", "track.json", 
        "-b", "8", 
        "--pixels-per-second", "10"
    ]);

    shell.stdout.on("data", data => {
        console.log(data.toString());
    });

    shell.stderr.on("data", error => {
        reject(error.toString())
    });    

    shell.on("exit", async code => {
        console.log("Process finished");

        const data = JSON.parse(
            await fs.promises.readFile("track.json")
        ).data;

        resolve({data, code})
    });
});

var {AudioContext} = require("web-audio-api");
var MusicTempo = require("music-tempo");
var fs = require("fs");
 
const guessTempo = buffer => {
    const audioData = [];
    // Take the average of the two channels
    if (buffer.numberOfChannels == 2) {
        const channel1Data = buffer.getChannelData(0);
        const channel2Data = buffer.getChannelData(1);
        
        let length = +channel1Data.length,
            i = 0;

        while(length--) {
            i++;
            audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
        }
    } else {
        audioData = buffer.getChannelData(0);
    }

    return new MusicTempo(audioData);
}
 
const data = fs.readFileSync("songname.mp3");
 
const context = new AudioContext();
context.decodeAudioData(data, calcTempo);

const createWaveformData = file => {
    try {
        const path = await handleFile(file);

        const buffer = await fs.promises.readFile(path);

        const {tempo, beats} = guessTempo(buffer);


        const {data, error} = await createSampleJSON(path);
        if(error) throw error;

        return {success: true, bpm, data};
    } catch(error) {
        console.log(error.toString());

        return {success: false, error: error.toString()}
    }
}

module.exports = {createWaveformData}