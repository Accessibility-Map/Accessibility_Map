import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import MapView from "./components/MapView.js";
import Favorites from "./pages/Favorites.tsx";
import Header from "./components/Header.tsx";
import SearchBar from "./components/SearchBar.js";
import "./components/styles/SearchBar.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const filterOptions = ["Ramp", "Elevator", "Parking", "Accessible Bathroom"];

  const toggleFilter = (filter) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
  };

  return (
    <Router>
      <AppContent
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedFilters={selectedFilters}
        toggleFilter={toggleFilter}
        showSearch={showSearch}
        toggleSearch={toggleSearch}
        filterOptions={filterOptions}
      />
    </Router>
  );
}

function AppContent({ searchTerm, setSearchTerm, selectedFilters, toggleFilter, showSearch, toggleSearch, filterOptions }) {
  const location = useLocation();
  const isMapPage = location.pathname === "/" || location.pathname === "/map";

  return (
    <>
      <Header toggleSearch={toggleSearch} showSearch={showSearch} />

      {/* ✅ Show SearchBar only on map pages */}
      {isMapPage && showSearch && (
        <div className="searchBarContainer show">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterOptions={filterOptions}
            selectedFilters={selectedFilters}
            toggleFilter={toggleFilter}
          />
        </div>
      )}

      <div className="content">
        <Routes>
          <Route path="/" element={<MapView
            showSearch={showSearch}
            searchTerm={searchTerm}
            selectedFilters={selectedFilters} />} />
          <Route path="/map" element={<MapView showSearch={true} searchTerm={searchTerm} selectedFilters={selectedFilters} />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
