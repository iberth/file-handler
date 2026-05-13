import React from 'react'
import NavBar from './components/NavBar'
import FilesPage from './pages/FilesPage'

const App = () => {
  return (
    <>
      <NavBar />
      <div className="container mt-4">
        <FilesPage />
      </div>
    </>
  )
}

export default App
