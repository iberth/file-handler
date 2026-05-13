import React from 'react'
import { Navbar, Container } from 'react-bootstrap'

const NavBar = () => {
  return (
    <Navbar style={{ backgroundColor: '#e05c5c' }} variant="dark">
      <Container>
        <Navbar.Brand>React Test App</Navbar.Brand>
      </Container>
    </Navbar>
  )
}

export default NavBar
