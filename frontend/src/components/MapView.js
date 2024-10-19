import React from 'react'
import {MapContainer, TileLayer, Marker, Popup, useMapEvents} from 'react-leaflet'
import '../styles/MapView.css' // Link to external CSS
import 'leaflet/dist/leaflet.css'
import {useState, useEffect} from 'react'
import axios from 'axios'
import {Button, Container} from 'semantic-ui-react'
import {Icon} from 'leaflet'

// Filter examples, replace with API later
const filterExamples = [
  {
    id: 1,
    locationID: 7,
    feature: 'Elevator',
    notes: 'Located on 1-5 floor, east side of the building',
  },
  {id: 2, locationID: 6, feature: 'Ramp', notes: 'West entrance of the building'},
  {id: 3, locationID: 14, feature: 'Restroom', notes: 'Equipped in every bathroom'},
]

// Available filter options
const filterOptions = ['Ramp', 'Elevator', 'Parking', 'Restroom']

const UCCoordinates = [39.1317, -84.515] // University of Cincinnati coordinates

// Custom Marker Icon
const customMarkerIcon = new Icon({
  iconUrl: '/Icons/Mapmarker.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -40],
})

// AddMarker component to handle adding new markers
const AddMarkerOnClick = ({onAddMarker}) => {
  useMapEvents({
    click(e) {
      const {lat, lng} = e.latlng
      onAddMarker({latitude: lat, longitude: lng})
    },
  })
  return null
}

// SearchBar Component
const SearchBar = ({searchTerm, onChange}) => {
  return (
    <input
      type='text'
      placeholder='Search for accessible places...'
      value={searchTerm}
      onChange={onChange}
      style={styles.searchInput}
    />
  )
}

// FilterButtons Component
const FilterButtons = ({filters, selectedFilters, toggleFilter}) => {
  return (
    <div style={styles.filters}>
      {filters.map(filter => (
        <Button
          key={filter}
          className={`filter-button ${selectedFilters.includes(filter) ? 'selected' : ''}`}
          style={{
            ...styles.filterButton,
            backgroundColor: selectedFilters.includes(filter) ? '#007bff' : '#fff',
            color: selectedFilters.includes(filter) ? '#fff' : '#000',
            transition: 'background-color 0.3s ease',
          }}
          onClick={() => toggleFilter(filter)}>
          {filter}
        </Button>
      ))}
    </div>
  )
}

// Main MapView Component
const MapView = () => {
  const [locations, setLocations] = useState([])
  const [newMarker, setNewMarker] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState([])

  // Fetch locations from the backend API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:5232/api/locations')
        setLocations(response.data)
      } catch (error) {
        console.error('Error fetching locations:', error)
      }
    }
    fetchLocations()
  }, [])

  // Filter matching logic
  const matchesFilters = item => {
    const locationFeatures = filterExamples
      .filter(f => f.locationID === item.locationID)
      .map(f => f.feature)

    if (selectedFilters.length === 0) {
      return true
    }
    return selectedFilters.some(filter => locationFeatures.includes(filter))
  }

  // Handle filter toggle
  const toggleFilter = filter => {
    setSelectedFilters(prevSelected =>
      prevSelected.includes(filter)
        ? prevSelected.filter(f => f !== filter)
        : [...prevSelected, filter]
    )
  }

  // Filtered results based on search term and selected filters
  const filteredResults = locations.filter(item => {
    const matchesSearchTerm = item.locationName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearchTerm && matchesFilters(item)
  })

  const handleAddMarker = location => {
    setNewMarker(location)
  }

  const saveMarker = async () => {
    try {
      if (newMarker) {
        const markerWithDetails = {...newMarker, locationName}
        const response = await axios.post('http://localhost:5232/api/locations', markerWithDetails)
        setLocations([...locations, response.data])
        setNewMarker(null)
        setLocationName('')
      }
    } catch (error) {
      console.error('Error saving marker:', error)
    }
  }

  const deleteMarker = async id => {
    try {
      await axios.delete(`http://localhost:5232/api/locations/${id}`)
      setLocations(locations.filter(location => location.locationID !== id))
    } catch (error) {
      console.error('Error deleting location:', error)
    }
  }

  return (
    <div>
      <Container style={styles.container}>
        <div style={styles.searchBarContainer}>
          <SearchBar searchTerm={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <FilterButtons
            filters={filterOptions}
            selectedFilters={selectedFilters}
            toggleFilter={toggleFilter}
          />
        </div>
      </Container>

      <MapContainer center={UCCoordinates} zoom={17.5} style={{height: '100vh', width: '100%'}}>
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {filteredResults.map(location => (
          <Marker
            key={location.locationID}
            position={[location.latitude, location.longitude]}
            icon={customMarkerIcon}>
            <Popup>
              <div className='popup-content'>
                <div className='popup-header'>{location.locationName}</div>
                <p>id: {location.locationID}</p>
                <p>latitude: {location.latitude}</p>
                <p>longitude: {location.longitude}</p>
                <button className='popup-button' onClick={() => deleteMarker(location.locationID)}>
                  Delete Location
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {newMarker && (
          <Marker position={[newMarker.latitude, newMarker.longitude]} icon={customMarkerIcon}>
            <Popup>
              <div className='popup-content'>
                <div className='popup-header'>New Location</div>
                <form className='popup-form'>
                  <input
                    type='text'
                    placeholder='Location Name'
                    value={locationName}
                    onChange={e => setLocationName(e.target.value)}
                  />
                  <button type='button' className='popup-button' onClick={saveMarker}>
                    Save Location
                  </button>
                </form>
              </div>
            </Popup>
          </Marker>
        )}

        <AddMarkerOnClick onAddMarker={handleAddMarker} />
      </MapContainer>
    </div>
  )
}

// Styles
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

export default MapView
