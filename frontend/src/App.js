import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import MapView from './components/MapView.js'
import Favorites from "./pages/Favorites.tsx";

function App() {
  return (
    <Router>
      <div className='App'>
        <div className='content'>
        <Routes>
          <Route path="/" 
            element={
            <MapView />} 
          />
          <Route path="/map" element={<MapView />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
