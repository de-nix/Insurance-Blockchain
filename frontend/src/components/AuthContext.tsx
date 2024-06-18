import React, {createContext, useContext, useEffect, useState} from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: string | null;
    username: string | null;
    address: string | null;
    login: (user:{ role: string, username: string, address: string , privateKey: string }, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider: React.FC = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [address, setAddress] = useState<string | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setIsAuthenticated(true);
            setUserRole(user.role);
            setUsername(user.username);
            setAddress(user.address);
        }
    }, []);

    const login = (user: { role: string, username: string, address: string, privateKey: string }, token:string) => {
        setIsAuthenticated(true);
        setUserRole(user.role);
        setUsername(user.username);
        setAddress(user.address);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserRole(null);
        setUsername(null);
        setAddress(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, username, address, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
