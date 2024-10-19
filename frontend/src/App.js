import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import MapView from './components/MapView'

function App() {
  return (
    <Router>
      <div className='App'>
        <div className='content'>
          <MapView />
        </div>
      </div>
    </Router>
  )
}

export default App
