import React from "react";
import { AppBar, Toolbar, Typography, Switch} from "@mui/material";
import { useNavigate } from "react-router-dom";
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

  return (
    <ThemeProvider theme={darkTheme}>

    <AppBar position="static" sx={{ padding: "10px" }} color="inherit">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Accessibility Map</Typography>

        <Switch checked={showSearch} onChange={toggleSearch} />

        <Typography
          variant="h6"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/favorites")} 
        >
          ❤️
        </Typography>
      </Toolbar>
    </AppBar>
    </ThemeProvider>
  );
};

export default Header;
