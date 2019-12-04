import React, {useState} from "react";

import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

import Details from "./Details";
import Media from "./Media";

const Create = () => {
    const [key, setKey] = useState("init");

    const padding = {paddingTop: "10px", boxSizing: "border-box"}

    return (
        <Tabs activeKey={key} onSelect={k => setKey(k)}>
            <Tab style={padding} disabled eventKey="init" title="Project Details">
                <Details onNext={() => setKey("upload")}/>
            </Tab>
            <Tab style={padding} disabled eventKey="upload" title="Upload Media">
                <Media/>
            </Tab>
        </Tabs>
    )
}

export default Create;