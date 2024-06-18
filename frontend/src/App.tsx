import React, {useState, useEffect, useCallback} from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ClaimsTable from "./components/ClaimsTable";
import {useAuth} from "./components/AuthContext";
import NavBar from './components/NavBar';
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import PoliciesTable from "./components/PoliciesTable";
import CreatePolicy from "./components/CreatePolicy";
import api from "./components/API";
import {Contract, ethers} from "ethers";
import {
    acceptAndPayClaim,
    acceptPolicy,
    createPolicy, denyClaim,
    denyPolicy,
    fileClaim,
    getAllClaims,
    getAllPolicies,
    payPremium
} from "./utils";

const {InsurancePolicy__factory} = require('./typechain/factories/InsurancePolicy__factory');

const contractAddress = '0x660407ECD0Ab486E9899AEC80c7d4f6C55be3a12'

function Home() {
    return null;
}

function App() {
    const [contract, setContract] = useState<Contract>();

    const {isAuthenticated, userRole, username, address} = useAuth();
    const {login, logout} = useAuth();

    const [conversionRate, setConversionRate] = useState(0);
    useEffect(() => {
        const fetchConversionRate = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
                const data = await response.json();
                setConversionRate(data.ethereum.usd);
            } catch (error) {
                console.error('Error fetching conversion rate:', error);
                setConversionRate(0);
            }
        };
        fetchConversionRate();
    }, []);

    useEffect(() => {
        if (!isAuthenticated || address === null) return;

        // Get provider and setup initial contract
        // @ts-ignore
        const provider = new ethers.BrowserProvider(window.ethereum);
        provider.send("eth_requestAccounts", []).then(
            _ => provider.getSigner(address).then(signer =>
                setContract(new ethers.Contract(contractAddress, InsurancePolicy__factory.abi, signer)))
        ).catch(err => {
            console.error('Failed to request accounts:', err);
        });

        // Handler for account changes
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                console.error('Please connect to MetaMask.');
            } else if (accounts[0] !== address) {
                provider.getSigner(accounts[0]).then(signer =>
                    setContract(new ethers.Contract(contractAddress, InsurancePolicy__factory.abi, signer))
                );
            }
        };

        // Subscribe to accounts change
        // @ts-ignore
        window.ethereum.on('accountsChanged', handleAccountsChanged);

        // Clean up function
        return () => {
            // Unsubscribe from accounts change
            // @ts-ignore
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };

    }, [isAuthenticated, address]);

    // useEffect(() => {
    //     if (!isAuthenticated || address === null) return;
    //     // @ts-ignore
    //     const provider = new ethers.BrowserProvider(window.ethereum);
    //     provider.send("eth_requestAccounts", []).then(
    //         _ => provider.getSigner(address).then(signer =>
    //             setContract(new ethers.Contract(contractAddress, InsurancePolicy__factory.abi, signer)))
    //     ).catch(err => {
    //         console.error('Failed to request accounts:', err);
    //     });
    // }, [isAuthenticated, address])

    // @ts-ignore
    // window.ethereum.on('accountsChanged', function (accounts) {
    //     // Time to reload your interface with accounts[0]!
    // });
    const handleLogin = async (username: string, password: string) => {
        try {
            const response = await api.post('/auth/login', {username, password});
            if (response.data && response.data.token) {
                login(response.data.user, response.data.token);  // Store the user's information in the Aut // Store the user's information in local storage
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const handleRegister = async (username: string, password: string, role: string, address: string) => {
        try {
            const response = await api.post('/auth/register', {username, password, role, address});
            if (response.data && response.data.message === 'User registered successfully') {
                console.log('Register:', response.data.message);
                await handleLogin(username, password)
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    const createPolicyCallback = useCallback(
        (policyName: string, coverageAmount: number, premium: number, duration: number, period: number, insuredAddress: string) =>
            createPolicy(contract, policyName, insuredAddress, period, coverageAmount, premium, duration), [contract]);
    const getPoliciesCallback = useCallback(() => getAllPolicies(contract), [contract])
    const denyPolicyCallback = useCallback((policyId: number) => denyPolicy(contract, policyId), [contract])
    const denyClaimCallback = useCallback((policyId: number, claimId: number) => denyClaim(contract, policyId, claimId), [contract])
    const createClaimCallback = useCallback((policyId: number, description: string, amount: number) =>
        fileClaim(contract, policyId, description, amount), [contract]);
    const getAllClaimsCallback = useCallback(() => getAllClaims(contract), [contract]);
    const acceptPolicyCallback = useCallback((policyId: number, premiumValue: number) =>
        acceptPolicy(contract, policyId, premiumValue), [contract])
    const acceptClaimCallback = useCallback((policyId: number, claimId: number, claimValue: number) =>
        acceptAndPayClaim(contract, policyId, claimId, claimValue), [contract])
    const payPremiumCallback = useCallback((policyId: number, premiumValue: number) =>
        payPremium(contract, policyId, premiumValue), [contract])

    return (
        <Router>
            <div className="App">
                {isAuthenticated &&
                    <NavBar isAuthenticated={isAuthenticated} userRole={userRole ?? ""} logout={logout}/>}
                <Routes>
                    <Route path="/login"
                           element={!isAuthenticated ? <LoginForm onLogin={handleLogin}/> : <Navigate to="/"/>}/>
                    <Route path="/register" element={!isAuthenticated ? <RegisterForm onRegister={handleRegister}/> :
                        <Navigate to="/"/>}/>
                    <Route path="/" element={isAuthenticated ? <Home/> : <Navigate to="/login"/>}/>
                    <Route path="/claims"
                           element={isAuthenticated && userRole !== null ?
                               <ClaimsTable userRole={userRole}
                                            conversionRate={conversionRate}
                                            onGetAllClaims={getAllClaimsCallback}
                                            onAcceptClaim={acceptClaimCallback}
                                            onDenyClaim={denyClaimCallback}
                               />
                               : <Navigate to="/login"/>}/>
                    <Route path="/policies" element={isAuthenticated && contract !== null
                        ? <PoliciesTable userRole={userRole ?? ""}
                                         conversionRate={conversionRate}
                                         onGetPolicies={getPoliciesCallback}
                                         onDenyPolicy={denyPolicyCallback}
                                         onCreateClaim={createClaimCallback}
                                         onAcceptPolicy={acceptPolicyCallback}
                                         onPayPremium={payPremiumCallback}
                        />
                        : <Navigate to="/login"/>}/>
                    <Route path="/add-policy" element={isAuthenticated && contract !== null && userRole === 'insurer' ?
                        <CreatePolicy
                            onCreatePolicy={createPolicyCallback}
                            conversionRate={conversionRate}/> : <Navigate to="/login"/>}/>
                </Routes>
            </div>
        </Router>
    );
}

interface Details {
    insurer: string;
    insured: string;
    premium: string;
    coverageAmount: string;
    isActive: boolean;
}

export default App;
