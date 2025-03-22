import React from 'react'
import './styles/DropdownResults.css'

const DropdownResults = ({results, onSelect}) => {
  if (results.length === 0) return null

  return (
    <div className='dropdown-results'>
      {results.map(location => (
        <div key={location.locationID} className='dropdown-item' onClick={() => onSelect(location)}>
          {location.locationName}
        </div>
      ))}
    </div>
  )
}

export default DropdownResults
