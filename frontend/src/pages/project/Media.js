import React, {useState} from "react";

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import FileBrowser from "../../components/FileBrowser";
import Button from "react-bootstrap/Button";
import axios from "axios";

const Media = () => {
    const [track, setTrack] = useState(null);
    const [clips, setClips] = useState(null);
    const [error, setError] = useState(null);
 
    const handleSubmit = async event => {
        event.preventDefault();

        if(track && clips) {
            const formData = new FormData();
            formData.append("track", track);

            for(const clip of clips) {
                formData.append("clips", clip);
            }

            const {data} = await axios.post(
                "http://localhost:5000/create", 
                formData, {
                    headers: {"Content-Type": "multipart/form-data"}
                });
        } else {
            console.log({track, clips});
            setError("Please select files.");
        }
    }

    return (<Container>
        {error && <p className="text-danger">{error}</p>}
        
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label>Upload Music</Form.Label>
                <FileBrowser 
                    onChange={({files: [file]}) => setTrack(file)} 
                    accept="audio/*"/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Upload Videos</Form.Label>
                <FileBrowser 
                    onChange={({files}) => setClips(files)} 
                    multiple 
                    accept="video/*"/>
            </Form.Group>

            <Button type="submit">Upload</Button>
        </Form>
    </Container>)
}

export default Media;