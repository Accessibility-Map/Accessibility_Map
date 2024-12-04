import React, {useState, useEffect} from 'react'
import {MapContainer, TileLayer, Marker} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import {Icon} from 'leaflet'

import SearchBar from './SearchBar'
import MarkerPopup from './MarkerPopup'
import AddMarkerOnClick from './AddMarkerOnClick'
import './styles/MapView.css'
import AvatarButton from './AvatarButton'

const UCCoordinates = [39.1317, -84.515]

// Define customMarkerIcon here
const customMarkerIcon = new Icon({
  iconUrl: '/Icons/Mapmarker.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -40],
})

const filters = ['Ramp', 'Elevator', 'Parking', 'Accessible Bathroom']

const MapView = () => {
  const [openPopupId, setOpenPopupId] = useState(null)
  const [locations, setLocations] = useState([])
  const [features, setFeatures] = useState([])
  const [newMarker, setNewMarker] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState([])
  const [editingLocation, setEditingLocation] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState('')
  const [user, setUser] = useState(null)
  const [userID, setUserID] = useState(null)

  const updateUserAndUserID = (newUser) => {
    setUser(newUser);
    setUserID(newUser.userID);
  }

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}api/locations`)
        setLocations(response.data)
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching location data:', error)
      }
    }
    const fetchFeaturesData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}api/features`)
        setFeatures(response.data)
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching features data:', error)
      }
    }
    fetchFeaturesData()
    fetchLocationData()
  }, [])

  const filteredLocations = locations.filter(location => {
    const matchesSearchTerm = location.locationName.toLowerCase().includes(searchTerm.toLowerCase())
    if (searchTerm && !matchesSearchTerm) return false
    if (selectedFilters.length === 0) return true
    const locationFeatures = features
      .filter(feature => feature.locationID === location.locationID)
      .map(feature => feature.locationFeature)
    return matchesSearchTerm && selectedFilters.every(filter => locationFeatures.includes(filter))
  })
  const handleAddMarker = async location => {
    try {
      const payload = {
        locationName: locationName || 'Default Location Name',
        latitude: location.latitude || 0,
        longitude: location.longitude || 0,
        description: description || '',
      }
      console.log('Payload for POST request:', payload)

      const response = await axios.post(`${process.env.REACT_APP_API_URL}api/locations`, payload)
      const newLocation = response.data

      setLocations(prevLocations => [...prevLocations, newLocation])
      setNewMarker(newLocation)
      setLocationName(newLocation.locationName || '')
      setDescription(newLocation.description || '')
      setOpenPopupId(newLocation.locationID)
    } catch (error) {
      console.error('Error creating new marker:', error)
    }
  }

  const saveEdit = async updatedLocation => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}api/locations/${updatedLocation.locationID}`,
        updatedLocation
      )

      setLocations(prevLocations =>
        prevLocations.map(location =>
          location.locationID === updatedLocation.locationID ? updatedLocation : location
        )
      )

      setEditingLocation(null)
      setIsEditing(false)
      setOpenPopupId(null)
    } catch (error) {
      console.error('Error saving location:', error)
    }
  }

  const deleteMarker = async locationID => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}api/locations/${locationID}`)
      setLocations(locations.filter(location => location.locationID !== locationID))
    } catch (error) {
      console.error('Error deleting location:', error)
    }
  }

  return (
    <div>
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterOptions={filters}
        selectedFilters={selectedFilters}
        toggleFilter={filter =>
          setSelectedFilters(prev =>
            prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
          )
        }
      />
      <AvatarButton UpdateUser={updateUserAndUserID}></AvatarButton>
      <MapContainer center={UCCoordinates} zoom={17} style={{height: '100vh', width: '100%'}}>
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {filteredLocations.map(location => (
          <MarkerPopup
            key={location.locationID}
            location={location}
            isEditing={isEditing}
            editingLocation={editingLocation}
            setEditingLocation={setEditingLocation}
            setIsEditing={setIsEditing}
            locationName={locationName}
            setLocationName={setLocationName}
            saveEdit={saveEdit}
            deleteMarker={deleteMarker}
            openPopupId={openPopupId}
            setOpenPopupId={setOpenPopupId}
            userID={userID}
          />
        ))}
        {newMarker && (
          <Marker position={[newMarker.latitude, newMarker.longitude]} icon={customMarkerIcon}>
            <MarkerPopup
              location={newMarker}
              isEditing={isEditing}
              editingLocation={editingLocation}
              setEditingLocation={setEditingLocation}
              setIsEditing={setIsEditing}
              locationName={locationName}
              setLocationName={setLocationName}
              saveEdit={saveEdit}
              deleteMarker={deleteMarker}
              openPopupId={openPopupId}
              setOpenPopupId={setOpenPopupId}
              userID={userID}
            />
          </Marker>
        )}
        <AddMarkerOnClick onAddMarker={handleAddMarker} />
      </MapContainer>
    </div>
  )
}

export default MapView
