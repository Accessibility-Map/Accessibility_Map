import React, {useRef, useEffect, useState} from 'react'
import {Marker, Popup, useMap} from 'react-leaflet'
import {useMapEvents} from 'react-leaflet'

import {Icon} from 'leaflet'
import StarRating from './StarRating.tsx'
import ImageScroller from './ImageScroller.tsx'
import AddFeatureButton from './AddFeatureButton.tsx'
import EditLocationPopup from './EditLocationPopup.js'
import './styles/MarkerPopup.css'
import axios from 'axios'
import FeatureService from './services/FeatureService.ts'
import CommentList from './CommentList.tsx'
import FeaturesList from './FeaturesList.tsx'
import RatingService from './services/RatingService.ts'
import MarkerPopupContent from './MarkerPopupContent.js'

import {
  AppBar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Toolbar,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import {set} from 'react-hook-form'

const customMarkerIcon = new Icon({
  iconUrl: '/Icons/Mapmarker.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -40],
})

const MarkerPopup = ({
  location,
  deleteMarker,
  userID,
  openPopupId,
  setOpenPopupId,
  saveEditLocally,
  user,
  triggerOpenMobileDialog,
}) => {
  const markerRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [screenWidth, setScreenWidth] = React.useState(window.innerWidth)
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false)
  const map = useMap()
  const popupRef = useRef(null)

  useEffect(() => {
    if (popupRef.current) {
      // Attach event listener to the Leaflet Popup object
      popupRef.current.on('remove', () => {
        handleClosePopup();
      });
    }
  }, []);

  useMapEvents({
    click(e) {
      // Only close if user clicks map and popup is open
      if (openPopupId && e.originalEvent.target.closest('.leaflet-popup') === null) {
        setOpenPopupId(null)
      }
    },
  })
  useEffect(() => {
    const handleResizeWindow = () => setScreenWidth(window.innerWidth)
    // subscribe to window resize event "onComponentDidMount"
    window.addEventListener('resize', handleResizeWindow)
    return () => {
      // unsubscribe "onComponentDestroy"
      window.removeEventListener('resize', handleResizeWindow)
    }
  }, [])

  const handleClosePopup = () => {
    setOpenPopupId(null)
    document.querySelector('.leaflet-popup-close-button').click()
    setMobileDialogOpen(false)
  }

  const handleMarkerClick = locationID => {
    // If not using mobile view set the map view
    if (screenWidth > 620) {
      const zoom17Diff = 0.003824112114102718;
      map.setView([location.latitude + zoom17Diff, location.longitude], 17);
    }
    else {
      // Center the map on the marker
      map.setView([location.latitude, location.longitude], 17);
    }

    setClicked(true)
    setOpenPopupId(locationID)
    setMobileDialogOpen(true)
  }
  
  useEffect(() => {
    console.log("markerRef in MarkerPopup:", markerRef)
    if (openPopupId === location.locationID && markerRef.current) {
      markerRef.current.openPopup() // ✅ opens Leaflet popup
    }
  }, [openPopupId])

  useEffect(() => {
    if (triggerOpenMobileDialog) {
      setMobileDialogOpen(true)
    }
  }, [triggerOpenMobileDialog])

  return (
    <Marker
      ref={markerRef}
      position={[location.latitude, location.longitude]}
      icon={customMarkerIcon}
      eventHandlers={{
        click: () => handleMarkerClick(location.locationID),
      }}>
      <Popup
        autoPan={false}
        closeOnClick={false}
        ref={popupRef}
        maxWidth={700}
        className={`leaflet-popup ${isEditing ? 'edit-mode' : ''} ${screenWidth <= 620 ? 'mobile-popup' : ''}`}>
        {screenWidth <= 620 ? (
          <Dialog open={mobileDialogOpen} fullScreen sx={{ overflowX: 'hidden' }}>
            <AppBar sx={{position: 'relative'}}>
              <Toolbar>
                <IconButton onClick={handleClosePopup}>
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
            <DialogContent sx={{ overflowX: 'hidden', paddingTop: 0, paddingBottom: 0 }}>
              <MarkerPopupContent
                location={location}
                deleteMarker={deleteMarker}
                userID={userID}
                openPopupId={openPopupId}
                setOpenPopupId={setOpenPopupId}
                saveEditLocally={saveEditLocally}
                user={user}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                clicked={clicked}
                setClicked={setClicked}
                markerRef={markerRef}
                isMobile={true}></MarkerPopupContent>
            </DialogContent>
          </Dialog>
        ) : (
          <MarkerPopupContent
            location={location}
            deleteMarker={deleteMarker}
            userID={userID}
            openPopupId={openPopupId}
            setOpenPopupId={setOpenPopupId}
            saveEditLocally={saveEditLocally}
            user={user}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            clicked={clicked}
            setClicked={setClicked}
            markerRef={markerRef}
            isMobile={false}>
          </MarkerPopupContent>
        )}
      </Popup>
    </Marker>
  )
}

export default MarkerPopup
