import React, {useEffect, useRef, useState} from "react";

import axios from "axios";

const WIDTH = 1000;
const HEIGHT = 300;

const Test = () => {
    const [loaded, setLoaded] = useState(false);
    const [track, setTrack] = useState(null);

    let canvas = useRef(null);

    useEffect(() => {
        setLoaded(true);
    }, []);

    const simplifyData = data => {
        const interval = data.length / WIDTH;
        let delta = 0;
        
        const samples = [];

        while(delta < WIDTH) {
            samples.push(
                Math.abs(
                    data[Math.round(delta * interval)]
                )
            );

            delta++;
        }

        return samples;
    }

    const drawWaveform = () => {
        const samples = simplifyData(track.samples);

        const context = canvas.current.getContext("2d");
        context.imageSmoothingEnabled = false;

        context.clearRect(0, 0, WIDTH, HEIGHT);

        context.save();

        context.translate(0, HEIGHT / 2);

        // Amplitude
        context.strokeStyle = "black";
        samples.forEach((sample, index) => {
            context.beginPath();
            context.moveTo(index, -sample)
            context.lineTo(index, sample);

            context.stroke();
            context.closePath();
        });

        // Axis
        context.strokeStyle = "red";
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(WIDTH, 0);
        context.stroke();
        context.closePath();
        context.restore();

        // Peaks
        const multiplier = (WIDTH) / track.samples.length;

        context.save();
        context.globalAlpha = 0.5;
        context.strokeStyle = "rgba(100, 230, 100)";
        context.lineWidth = 1;
        track.peakIndexes.forEach(index => {
            context.beginPath();
            context.moveTo(index * multiplier, 0);
            context.lineTo(index * multiplier, HEIGHT);
            context.stroke();
            context.closePath();
        });
        context.restore();
    }

    const handleFileChange = async ({target: {files: [file]}}) => {
        const formData = new FormData();
        formData.append("file", file);

        const {data: {samples, peakIndexes}} = await axios.post("http://localhost:5000/waveform", formData, {
            headers: {"Content-Type": "multipart/form-data"}
        });

        console.log({samples, peakIndexes});

        setTrack({samples, peakIndexes});
    }

    useEffect(() => {
        if(track) drawWaveform();
    }, [track]);

    return (<section>
        {loaded ? <>
            <input type="file" name="file" onChange={handleFileChange}/>
            <hr/>
        </> : "Loading..."}
        <canvas 
            ref={canvas} 
            width={WIDTH} 
            height={HEIGHT} 
            style={{
                width: WIDTH / 2,
                height: HEIGHT / 2}}/>
    </section>);
}

export default Test;