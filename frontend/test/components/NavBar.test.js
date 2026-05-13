import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import NavBar from '../../src/components/NavBar'

describe('NavBar', () => {
  it('renders the app title', () => {
    render(<NavBar />)

    expect(screen.getByText('React Test App')).toBeInTheDocument()
  })

  it('applies a coral/red background color', () => {
    const { container } = render(<NavBar />)
    const navbar = container.querySelector('nav')

    expect(navbar).toHaveStyle('background-color: #e05c5c')
  })
})
