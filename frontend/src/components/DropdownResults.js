import React, {useRef, useEffect} from 'react'
import './styles/DropdownResults.css'

const DropdownResults = ({results, onSelect, onClose}) => {
  const dropdownRef = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  if (results.length === 0) return null

  return (
    <div className='dropdown-results' ref={dropdownRef}>
      {results.map(location => (
        <div key={location.locationID} className='dropdown-item' onClick={() => onSelect(location)}>
          <p className='dropdown-text'>{location.locationName}</p>
        </div>
      ))}
    </div>
  )
}

export default DropdownResults
