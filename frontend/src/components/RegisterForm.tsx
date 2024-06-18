import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Grid, Container, InputLabel, Select, MenuItem } from '@mui/material';
import { Link } from "react-router-dom";
interface RegisterFormProps {
    onRegister: (username: string, password: string, role: string, address: string) => Promise<any>;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister }) => {
    const [username, setUsername] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        onRegister(username,password,role,address);
    };

    return (
        <Container maxWidth="sm">
            <Box mt={4}>
                <Typography variant="h4" gutterBottom align="center">
                    Register
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <TextField
                                label="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item>
                            <InputLabel id="role-label">Role</InputLabel>
                            <Select
                                labelId="role-label"
                                value={role}
                                onChange={(e) => setRole(e.target.value as string)}
                                required
                                fullWidth
                            >
                                <MenuItem value={'insured'}>Insured</MenuItem>
                                <MenuItem value={'insurer'}>Insurer</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item>
                            <TextField
                                label="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item>
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                Register
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button component={Link} to="/login" variant="outlined" color="primary" fullWidth>
                                Login
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Container>
    );
};

export default RegisterForm;
