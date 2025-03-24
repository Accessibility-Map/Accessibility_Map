import React, {useState, useEffect} from 'react'
import DropdownResults from './DropdownResults.js'
import './styles/SearchBar.css'

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  filterOptions,
  selectedFilters,
  toggleFilter,
  filteredLocations,
  onSelectLocation,
  showSearch, // ✅ add this
}) => {
  const [showDropdown, setShowDropdown] = useState(false)

  const isMobile = window.innerWidth <= 480
  useEffect(() => {
    // Auto-hide when search is empty
    if (searchTerm.trim() === '') {
      setShowDropdown(false)
    } else {
      setShowDropdown(true)
    }
  }, [searchTerm])

  if (isMobile && !showSearch) {
    return null // ✅ Hide search bar on mobile if toggle is off
  }

  return (
    <div className='container'>
      <div className='searchBarContainer'>
        <input
          type='text'
          placeholder='Search for accessible places...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onClick={() => setShowDropdown(true)}
          className='searchInput'
        />
        {showDropdown && searchTerm.trim() !== '' && (
          <DropdownResults
            results={filteredLocations}
            onSelect={onSelectLocation}
            onClose={() => setShowDropdown(false)}
            searchTerm={searchTerm}
          />
        )}
        <div className='filters'>
          {filterOptions.map(filter => (
            <button
              key={filter}
              className={`filter-button ${selectedFilters.includes(filter) ? 'selected' : ''}`}
              style={{
                backgroundColor: selectedFilters.includes(filter) ? '#007bff' : '#fff',
                color: selectedFilters.includes(filter) ? '#fff' : '#000',
              }}
              onClick={() => toggleFilter(filter)}>
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchBar
