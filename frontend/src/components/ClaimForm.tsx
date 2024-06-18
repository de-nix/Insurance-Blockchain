import { Button, TextField, Typography, Box } from "@mui/material";
import React, { useState } from "react";
import EthereumInput from "./EthereumInput";

interface Props {
    policyId: number | null;
    conversionRate: number;
    onCreateClaim: (policyId: number, description: string, amount: number) => Promise<any> | undefined;
}

const ClaimForm: React.FC<Props> = ({ policyId, conversionRate, onCreateClaim}) => {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (policyId == null) return;
        return onCreateClaim(policyId, description, amount);
            alert("Claim filed successfully!");
            setDescription("");
            setAmount(0);

    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
            }}
        >
            <Typography variant="h5" gutterBottom>
                File a Claim
            </Typography>
            <TextField
                label="Description"
                variant="outlined"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required

            />

            <Box sx={{marginTop: 2}}>
                <EthereumInput
                    label="Claim Amount (ETH)"
                    conversionRate={conversionRate}
                    value={amount}
                    onChange={(value) => setAmount(value)}
                />
            </Box>

            <Button type="submit" variant="contained">
                File Claim
            </Button>
        </Box>
    );
};

export default ClaimForm;
