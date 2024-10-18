import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import MapView from './components/MapView';
import StarRating from './components/StarRating.tsx';

function App() {
  return (
    <Router>
      <div className='App'>
        {/* <SearchBar /> */}
        <div className='content'>
          <StarRating />
          {/* <MapView /> */}
        </div>
      </div>
    </Router>
  );
}

export default App;
