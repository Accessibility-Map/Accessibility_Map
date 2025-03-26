import React, {useState, useEffect} from 'react'
import {AppBar, Toolbar, Typography, Switch, Box, IconButton, Button} from '@mui/material'
import {useLocation} from 'react-router-dom'
import {ThemeProvider, createTheme} from '@mui/material/styles'
import AvatarButton from './AvatarButton.tsx'
import './styles/Header.css'
import SearchIcon from '@mui/icons-material/Search';
import { Icon } from 'lucide-react'

interface HeaderProps {
  toggleSearch: () => void
  UpdateUser: (user: any) => void
}


const Header: React.FC<HeaderProps> = ({toggleSearch, UpdateUser}) => {
  const location = useLocation()
  const isFavoritesPage = location.pathname === '/favorites'

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 620)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 620)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <AppBar
      position='fixed'
      sx={{
        zIndex: 1300,
        height: '60px',
        justifyContent: 'center',
        backgroundColor: '#171717',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: isMobile ? 'space-between' : 'space-between',
          alignItems: 'center',
          paddingX: 2,
        }}
      >
        <Typography variant='h6' sx={{width: "160px"}}>Accessibility Map</Typography>

        {!isFavoritesPage && (
          <>
            {isMobile && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '40px',
                  justifyContent: 'center',
                  marginRight: 'auto',
                  marginLeft: '20px'
                }}
              >
                <Box sx={{display: 'flex', justifyContent: 'center', flex: 1}}>
                  <IconButton onClick={toggleSearch} classes={{root: "search-button"}}>
                      <SearchIcon classes={{root: "search-icon"}} />
                    </IconButton>
                </Box>

              </Box>
            )}
            <AvatarButton UpdateUser={UpdateUser} />
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header
