import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
      <Header toggleSearch={toggleSearch} showSearch={showSearch} />

      {/* ✅ Show search bar only when toggled on */}
      {showSearch && (
        <div className={`searchBarContainer ${showSearch ? "show" : ""}`}>
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={(value) => {
              console.log("Typing:", value);  // ✅ Debug input
              setSearchTerm(value);
            }}
            filterOptions={filterOptions}
            selectedFilters={selectedFilters}
            toggleFilter={toggleFilter}
          />

        </div>
      )}

      <div className="content">
        <Routes>
          {/* ✅ Pass showSearch to MapView */}
          <Route path="/" element={<MapView showSearch={showSearch}
            searchTerm={searchTerm}
            selectedFilters={selectedFilters} />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
