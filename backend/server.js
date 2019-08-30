// declarations

const express = require("express");
const app = express();

const cors = require("cors");

const fileUpload = require("express-fileupload");
const fileOptions = {}

// middleware

app.use(express.json());
app.use(cors());
app.use(fileUpload(fileOptions));

const {createWaveformData} = require("./waveform");

app.post("/waveform", async ({files: {file}}, res) => {
    res.json(await createWaveformData(file));
});

// listen

const port = 5000;
app.listen(5000, () => console.log(`Server started on port ${port}`))