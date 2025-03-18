import React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import MapView from './components/MapView.js'

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
