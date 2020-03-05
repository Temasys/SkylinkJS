import React, { Component } from 'react';
import { Container } from 'semantic-ui-react'

class Header extends Component {
  render() {
    return (
      <Container fluid className='skylink-header'>
          <p className='text-white'>
            SkylinkJS&nbsp;&nbsp;<span className='text-muted'>ReactJS Client</span>
          </p>
      </Container>
    )
  }
}

export default Header;