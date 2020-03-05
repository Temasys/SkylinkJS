import React, { Component } from 'react';
import { Container } from 'semantic-ui-react'
import Header from './cmp/Header';
import SkylinkDemo from './cmp/SkylinkDemo';
import 'semantic-ui-css/semantic.min.css';
import './App.css';

class App extends Component {
  render() {
    return (
      <Container fluid>
        <Header />
        <SkylinkDemo />
      </Container>
    );
  }
}

export default App;
