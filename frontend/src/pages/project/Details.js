import React, {useState} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import axios from "axios";

const Details = ({onNext}) => {
    const [title, setTitle] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async event => {
        event.preventDefault();

        // API call
        const {error} = await axios.post("/create", {title});

        if(error) setError(error);
        else if(onNext) onNext();
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label>Project Title</Form.Label>
                <Form.Control 
                    type="text" 
                    value={title}
                    onChange={({target: {value}}) => setTitle(value)}/>
            </Form.Group>
            <h5>Advanced Details</h5>
            <hr/>
            <Form.Group>
                <Form.Label>Framerate (fps)</Form.Label>
                <Form.Control as="select" defaultValue="25">
                    <option>15</option>
                    <option>20</option>
                    <option>25</option>
                    <option>30</option>
                    <option>50</option>
                    <option>60</option>
                </Form.Control>
            </Form.Group>
            <hr/>
            <Form.Group>
                <Button type="submit">Create Project</Button>
            </Form.Group>

            {error && <p className="text-danger">{error}</p>}
        </Form>
    )
}

export default Details;