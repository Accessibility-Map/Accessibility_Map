import React from 'react'
import DropdownResults from './DropdownResults.js' // import new dropdown
import './styles/SearchBar.css'

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  filterOptions,
  selectedFilters,
  toggleFilter,
  filteredLocations, // pass filtered list here
  onSelectLocation, // for dropdown click
}) => {
  return (
    <div className='container'>
      <div className='searchBarContainer'>
        {/* <div style={{position: 'relative', width: '400px'}}> */}
        <input
          type='text'
          placeholder='Search for accessible places...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='searchInput'
        />
        {searchTerm.trim() !== '' && (
          <DropdownResults
            results={filteredLocations}
            onSelect={onSelectLocation}
            searchTerm={searchTerm}
          />
        )}
        {/* </div> */}
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

const styles = {
  container: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    zIndex: 1000,
  },
  searchBarContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '1000px',
  },
  searchInput: {
    borderRadius: '30px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    backgroundColor: '#fff',
    fontSize: '15px',
    padding: '15px 25px',
    border: 'none',
    outline: 'none',
    width: '400px',
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginLeft: '20px',
  },
  filterButton: {
    borderRadius: '20px',
    border: 'none',
    padding: '10px 15px',
    fontSize: '15px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    cursor: 'pointer',
  },
}

export default SearchBar
