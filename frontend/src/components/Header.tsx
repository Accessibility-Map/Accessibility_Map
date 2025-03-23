import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Switch, Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import AvatarButton from "./AvatarButton.tsx"; 

interface HeaderProps {
  toggleSearch: () => void;
  showSearch: boolean;
  UpdateUser: (user: any) => void; 
}


const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
  },
});

const Header: React.FC<HeaderProps> = ({ toggleSearch, showSearch, UpdateUser }) => {
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
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1300,
          height: "60px",
          justifyContent: "center",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: isMobile ? "space-between" : "space-between",
            alignItems: "center",
            paddingX: 2,
          }}
        >
          <Typography variant="h6">Accessibility Map</Typography>

          {!isFavoritesPage && (
            <>
              {isMobile ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ flex: 1 }} /> 
                  <Box sx={{ display: "flex", justifyContent: "center", flex: 1 }}>
                    <Switch
                      checked={showSearch}
                      onChange={toggleSearch}
                      sx={{ "&:focus": { outline: "none" } }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                    <AvatarButton UpdateUser={UpdateUser} />
                  </Box>
                </Box>
              ) : (
                <AvatarButton UpdateUser={UpdateUser} />
              )}
            </>
          )}
        </Toolbar>

      </AppBar>
    </ThemeProvider>
  );
};

export default Header;
