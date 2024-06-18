import React from 'react';
import {AppBar, Toolbar, Typography, Button} from '@mui/material';
import {Link} from "react-router-dom";
interface NavBarProps {
    isAuthenticated: boolean;
    userRole: string;
    logout: () => void;
}
const NavBar: React.FC<NavBarProps> = ({ isAuthenticated, userRole, logout }) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{flexGrow: 1}}>
                    Insurance App
                </Typography>
                <Link to="/"><Button color="inherit">Home</Button></Link>
                <Link to="/claims"><Button color="inherit">Claims</Button></Link>
                <Link to="/policies"><Button color="inherit">Policies</Button></Link>
                {isAuthenticated && userRole === 'insurer' && <Link to="/add-policy"><Button color="inherit">Add Policy</Button></Link>}
                {isAuthenticated ? (
                    <Button color="inherit" onClick={logout}>Logout</Button>
                ) : (
                    <Link to="/login"><Button color="inherit">Login</Button></Link>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
