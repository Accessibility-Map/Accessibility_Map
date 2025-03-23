import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Switch } from "@mui/material";
import { useLocation } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

interface HeaderProps {
  toggleSearch: () => void;
  showSearch: boolean;
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
  },
});

const Header: React.FC<HeaderProps> = ({ toggleSearch, showSearch }) => {
  const location = useLocation();
  const isFavoritesPage = location.pathname === "/favorites";

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="static" sx={{ padding: "10px" }} color="inherit">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Accessibility Map</Typography>

          {/* ✅ Only show switch if on mobile and not on favorites page */}
          {!isFavoritesPage && isMobile && (
            <Switch
              checked={showSearch}
              onChange={toggleSearch}
              sx={{
                mx: "auto",
                "&:focus": { outline: "none" },
              }}
            />
          )}
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};

export default Header;
