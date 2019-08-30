// declarations

const express = require("express");
const app = express();

const cors = require("cors");

const fileUpload = require("express-fileupload");
const fileOptions = {}

const {spawn} = require("child_process");

const fs = require("fs");

// middleware

app.use(express.json());
app.use(cors());
app.use(fileUpload(fileOptions));

// endpoints

const handleFile = file => {
    const dir = __dirname + "/uploads" + file.name;

    return new Promise((resolve, reject) => {
        file.mv(dir, error => {
            if(error) reject(error);
            else resolve(dir);
        })
    })
}

app.post("/waveform", async ({files: {file}}, res) => {
    console.log("Recieving data");

    try {
        const path = await handleFile(file);

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
            throw error.toString()
        });    

        shell.on("exit", async code => {
            console.log("Process finished");

            const data = JSON.parse(await fs.promises.readFile("track.json")).data;

            res.json({success: true, data, code})
        })
    } catch(error) {
        console.log(error.toString());

        res.status(500).json({success: false, error});
    }
});

// listen

const port = 5000;
app.listen(5000, () => console.log(`Server started on port ${port}`))