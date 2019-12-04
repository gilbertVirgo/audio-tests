import React, {useState} from "react";

import Form from "react-bootstrap/Form";

const FileBrowser = props => {
    const defaultLabel = props.multiple ? "Choose files" : "Choose file";

    const label = files => 
        files.map((file, index) => 
            file.name + (index === (files.length - 1) ? "" : ", "));

    const [files, setFiles] = useState(null);

    const handleChange = ({target: {files}}) => {
        const array = [];

        for(const file of files) {
            array.push(file);
        }

        setFiles(array);

        props.onChange({files});
    }

    return (<Form.Group className="custom-file">
        <Form.Control {...props} onChange={handleChange} type="file" className="custom-file-input"/>
        <Form.Label style={{textOverflow: "ellipsis", whiteSpace: "overflow", overflow: "hidden"}} className="custom-file-label">{files ? label(files) : defaultLabel}</Form.Label>
    </Form.Group>);
}

export default FileBrowser;