// declarations
require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");

const fileUpload = require("express-fileupload");
const fileOptions = {}

const {getTrackPeaks} = require("./audio");
const {createCompositeVideo} = require("./video");

const randomstring = require("randomstring");

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, {mimetype}, cb) => {
        const projectID = randomstring.generate(12);

        if(mimetype.includes("audio")) {
            cb(null, `/projects/${projectID}`)
        } else if(mimetype.includes("video")) {
            cb(null, `/projects/${projectID}/clips/raw`)
        } else {
            cb(new Error("Invalid file type."));
        }
    },
    filename: (req, {originalname}, cb) =>
        cb(null, `${randomstring.generate(12)}.${originalname.split(".").slice(-1)}`)
})
const upload = multer({storage});

// middleware
app.use(express.json());
app.use(cors());

const {createWaveformData} = require("./waveform");

app.post("/waveform", async ({files}, res) => {
    if((typeof files !== undefined) && files.file) 
        res.json(await createWaveformData(files.file));
});

app.post("/create", async (req, res) => {
    
});

app.post("/upload", 
    upload.fields([
        { name: "track", maxCount: 1 }, 
        { name: "clips", maxCount: process.env.MAX_CLIPS }
    ]), 
    async ({files: {track: [track], clips}, body: {options}}, res) => {
    // Array of peak times
    try {
        console.log("track", JSON.stringify(track));

        const trackPeaks = await getTrackPeaks(track.path);

        const compositeVideo = await createCompositeVideo({trackPeaks, clips, options});

        res.status(200).json({
            success: true,
            video: compositeVideo
        });
    } catch(error) {
        console.error(error.toString());

        res.status(500).json({
            success: false,
            error
        })
    }
});

// listen

app.listen(process.env.SERVER_PORT, () => console.log(`Server started on port ${process.env.SERVER_PORT}`))