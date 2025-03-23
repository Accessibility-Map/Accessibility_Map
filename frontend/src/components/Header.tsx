import React from "react";
import { AppBar, Toolbar, Typography, Switch } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';

interface HeaderProps {
  toggleSearch: () => void;
  showSearch: boolean;
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
  },
});

const Header: React.FC<HeaderProps> = ({ toggleSearch, showSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isFavoritesPage = location.pathname === "/favorites";

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="static" sx={{ padding: "10px" }} color="inherit">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Accessibility Map</Typography>

          {!isFavoritesPage && (
            <Switch
              checked={showSearch}
              onChange={toggleSearch}
              sx={{
                mx: "auto",
                "&:focus": { outline: "none" }, 
              }}
            />
          )}

          <Typography
            variant="h6"
            sx={{ cursor: "pointer" }}
            onClick={() => {navigate("/favorites")}}
          >
            ❤️
          </Typography>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};

export default Header;