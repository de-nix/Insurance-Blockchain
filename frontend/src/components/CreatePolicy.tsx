import React, {useEffect, useState} from 'react';
import {
    Button,
    TextField,
    Container,
    Typography,
    Box,
    Rating,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import EthereumInput from "./EthereumInput";

interface Props {
    onCreatePolicy: (policyName: string, coverageAmount: number, premium: number, duration: number, period: number, insuredAddress: string) => void;
    conversionRate: number;
}

const CreatePolicy: React.FC<Props> = ({onCreatePolicy, conversionRate}) => {
    const [policyName, setPolicyName] = useState<string>('');
    const [coverageAmount, setCoverageAmount] = useState<number>(0);
    const [premium, setPremium] = useState<number>(0);
    const [period, setPeriod] = useState<number>(30);
    const [duration, setDuration] = useState<number>(365);
    const [insuredAddress, setInsuredAddress] = useState<string>('');
    const [risk, setRisk] = useState(1); // new state variable for risk
    const [insuredUsers, setInsuredUsers] = useState<any[]>([]);
    useEffect(() => {
        fetch('http://localhost:3001/users') // Replace with your actual API endpoint
            .then(response => response.json())
            .then(users => {
                // @ts-ignore
                const insuredUsers = users.filter(user => user.role === 'insured');
                setInsuredUsers(insuredUsers);
            });
    }, []);

    useEffect(() => {
        let noPremiums = duration / period;
        const premiumFactor = period === 30 ? 1.1 : period === 90 ? 1.07 : period === 180 ? 1.05 : 1;
        const durationFactor = duration === 365 ? 1.04 : duration === 730 ? 1.06 : duration === 1825 ? 1.01 : duration === 3650 ? 1.25 : duration === 7300 ? 1.4 : 1.65;
        const riskFactor = (100 + Math.log2(risk+1)*Math.log2(risk+1))/100

        let basicPremium = 1.1 * coverageAmount * premiumFactor * durationFactor * riskFactor  / noPremiums;

        setPremium(Number(basicPremium.toFixed(3)));
    }, [coverageAmount, risk, period, duration]);
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onCreatePolicy(
            policyName,
            coverageAmount,
            premium,
            duration*24*60*60,
            period*24*60*60,
            insuredAddress
        );
        setPolicyName('');
        setCoverageAmount(0);
        setPremium(0);
        setDuration(365);
        setInsuredAddress('');
        setPeriod(30);
    };

    const periods = [0.0005,30, 90, 180, 365];
    const durations = [0.003,365, 730, 1825, 3650, 7300, 10950];

    return (
        <Container maxWidth="sm">
            <Box sx={{marginTop: 4}}>
                <Typography variant="h4">Create Policy</Typography>
            </Box>
            <form onSubmit={handleSubmit}>
                <Box sx={{marginTop: 2}}>
                    <TextField
                        fullWidth
                        label="Policy Name"
                        variant="outlined"
                        value={policyName}
                        onChange={(e) => setPolicyName(e.target.value)}
                    />
                </Box>
                <FormControl fullWidth sx={{marginTop: 2}}>
                    <InputLabel id="insured-address-label">Insured Address</InputLabel>
                    <Select
                        labelId="insured-address-label"
                        label="Insured Address"
                        value={insuredAddress}
                        onChange={(e) => setInsuredAddress(e.target.value)}
                    >
                        {insuredUsers.map(user => (
                            <MenuItem value={user.address}>{user.username}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box sx={{marginTop: 2}}>
                    <Typography>Risk</Typography>
                    <Rating
                        name="risk-level"
                        value={risk}
                        max={10}
                        onChange={(event, newValue) => {
                            setRisk(newValue !== null ? newValue : 1);
                        }}
                    />
                </Box>

                <Box sx={{marginTop: 2}}>
                    <EthereumInput
                        label="Coverage Amount (ETH)"
                        conversionRate={conversionRate}
                        value={coverageAmount}
                        onChange={(value) => setCoverageAmount(value)}
                    />
                </Box>


                <FormControl fullWidth sx={{m: 1, minWidth: 120, marginLeft: 0, marginTop: "16px"}}>
                    <InputLabel id="period-label">Period</InputLabel>
                    <Select

                        labelId="period-label"
                        label="Period"
                        value={period}
                        onChange={(e) => setPeriod(Number(e.target.value))}
                    >
                        {periods.map((p) => (
                            <MenuItem value={p}>{p > 1 ? (p / 30).toFixed(0)+'month(s)':'Test period'}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{m: 1, minWidth: 120, marginLeft: 0}} fullWidth>

                    <InputLabel id="duration-label">Duration</InputLabel>
                    <Select
                        labelId="duration-label"
                        label="Duration"
                        value={duration}

                        onChange={(e) => setDuration(Number(e.target.value))}
                    >
                        {durations.map((d) => (
                            <MenuItem value={d}>{d > 1 ? (d / 365).toFixed(0)+'year(s)':'Test duration'}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box sx={{marginTop: 2}}>
                    <Typography>Premium: {premium} ETH (
                        ${(conversionRate * premium).toFixed(0)} )</Typography>
                </Box>


                <Box sx={{marginTop: 2}}>
                    <Button fullWidth type="submit" variant="contained">
                        Create
                    </Button>
                </Box>
            </form>
        </Container>
    );
};

export default CreatePolicy;
