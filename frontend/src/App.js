import React from 'react';

import Test from "./components/Test";

import {Switch, Route} from "react-router-dom";

import Create from './pages/project/Create';
import Container from 'react-bootstrap/Container';

const App = props => 
  <Container style={{marginTop: "10px"}}>
    <Switch>
      <Route exact path="/" render={props => <Test/>}/> 
      <Route path="/create" render={props => <Create/>}/>
    </Switch>
  </Container>

export default App;
