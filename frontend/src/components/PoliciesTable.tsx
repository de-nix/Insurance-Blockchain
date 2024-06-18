import React, {useEffect, useState} from 'react';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentIcon from '@mui/icons-material/Payment';
import ClaimIcon from '@mui/icons-material/AssignmentTurnedIn';
import Dialog from '@mui/material/Dialog';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import ClaimForm from "./ClaimForm";
import {Typography} from "@mui/material";
import {getNumber} from "ethers";


interface PolicyTableProps {
    userRole: string;
    conversionRate: number;
    onGetPolicies: () => Promise<any>;
    onPayPremium: (policyId: number, premiumValue: number) => Promise<any>;
    onAcceptPolicy: (policyId: number, premiumValue: number) => Promise<any>;
    onDenyPolicy: (policyId: number) => Promise<any>;
    onCreateClaim: (policyId: number, description: string, amount: number) => Promise<any>;
}


const PoliciesTable = ({
                           userRole,
                           conversionRate,
                           onGetPolicies,
                           onAcceptPolicy,
                           onDenyPolicy,
                           onCreateClaim,
                           onPayPremium
                       }: PolicyTableProps) => {
    const [policies, setPolicies] = useState<any[]>([]);
    const [openClaimForm, setOpenClaimForm] = useState(false);
    const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);
    const [needsRefresh, setNeedsRefresh] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    useEffect(() => {
        fetch('http://localhost:3001/users') // Replace with your actual API endpoint
            .then(response => response.json())
            .then(fetchedUsers => setUsers(fetchedUsers))
    }, []);
    useEffect(() => {
        if (needsRefresh) onGetPolicies()?.then(policies => setPolicies(policies));
        setNeedsRefresh(false)
    }, [needsRefresh]);

    const handleOpenClaimForm = (policyId: number) => {
        setSelectedPolicyId(policyId);
        setOpenClaimForm(true);
    };

    const handleCloseClaimForm = () => {
        setSelectedPolicyId(null);
        setOpenClaimForm(false);
    };


    const columns: GridColDef[] = [
        {field: 'id', headerName: 'ID', width: 50},
        {field: 'policyName', headerName: 'Policy Name', width: 150},
        {
            field: 'status', headerName: 'Policy Status', width: 150,
            renderCell: (params) => {
                const isAnswered = params.row.isAnswered;
                const isAccepted = params.row.isAccepted;

                const isActive = (Date.now() / 1000) < params.row.premiumDueDate;
                const isExpired = (Date.now() / 1000) > params.row.creationTime+ params.row.duration;

                const text = isExpired ? "Expired" : !isAnswered ? "Unanswered" : !isAccepted ? "Denied" : isActive ? "Active" : "Unpaid";

                return (<div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {isExpired && (<CancelIcon color='error'/>)}
                        {!isAnswered && !isExpired && (<PendingActionsIcon/>)}
                        {isAnswered && !isAccepted && !isExpired && (<CancelIcon color='error'/>)}
                        {isAnswered && isAccepted && isActive && !isExpired && (<CheckCircleIcon color='success'/>)}
                        {isAnswered && isAccepted && !isActive && !isExpired && (<CheckCircleOutlineIcon color='warning'/>)}

                        <Typography style={{margin: 0, marginTop: '4px', marginLeft: '10px'}}>{text}</Typography>
                    </div>
                )
            }
        },
        {field: 'coverageAmount', headerName: 'Coverage Amount (ETH)', width: 100},
        {field: 'premium', headerName: 'Premium (ETH)', width: 120},
        ...(userRole === "insured"
            ? [{field: 'insurer', headerName: 'Insurer', width: 150, valueGetter: (params:any) => users.find(user => user.address === params.value)?.username}]
            : [{field: 'insured', headerName: 'Insured', width: 150, valueGetter: (params:any) => users.find(user => user.address === params.value)?.username}]),
        {
            field: 'premiumDueDate', headerName: 'Premium Due Date', width: 170,
            renderCell: (params) => {
                return <Typography>{(new Date(params.value * 1000)).toDateString()}</Typography>
            }
        },
        {
            field: 'creationTime', headerName: 'Creation Date', width: 170,
            renderCell: (params) => {
                return <Typography>{(new Date(params.value * 1000)).toDateString()}</Typography>
            }
        },
        {
            field: 'expiryDate', headerName: 'Expiry Date', width: 170,
            renderCell: (params) => {
                return <Typography>{(new Date((params.row.creationTime + params.row.duration) * 1000)).toDateString()}</Typography>
            }
        },
        ...(userRole === "insured" ? [
            {
                field: 'actions',
                headerName: 'Actions',
                width: 100,
                renderCell: (params: any) => {
                    const isAnswered = params.row.isAnswered;
                    const isAccepted = params.row.isAccepted;

                    const isActive = (Date.now() / 1000) < params.row.premiumDueDate;
                    const isExpired = (Date.now() / 1000) > params.row.creationTime+ params.row.duration;

                    return (
                        <>
                            {userRole === 'insured' && (
                                <>
                                    {!isAnswered && !isExpired && (
                                        <>
                                            <IconButton sx={{padding:1}}
                                                onClick={() => onAcceptPolicy(params.row.id, Number(params.row.premium))?.then(_ => setNeedsRefresh(true))}
                                                color='success'>
                                                <CheckCircleIcon/>
                                            </IconButton>
                                            <IconButton
                                                onClick={() => onDenyPolicy(params.row.id)?.then(_ => setNeedsRefresh(true))}
                                                color='error'>
                                                <CancelIcon/>
                                            </IconButton>
                                        </>
                                    )}
                                    {!isActive && isAnswered && isAccepted && !isExpired && (
                                        <IconButton
                                            onClick={() => onPayPremium(params.row.id, Number(params.row.premium))?.then(_ => setNeedsRefresh(true))}
                                            color='primary'>
                                            <PaymentIcon/>
                                        </IconButton>
                                    )}
                                    {isActive && isAnswered && isAccepted && !isExpired && (
                                        <IconButton onClick={() => handleOpenClaimForm(params.row.id)}
                                                    color='secondary'>
                                            <ClaimIcon/>
                                        </IconButton>
                                    )}
                                </>
                            )}
                        </>
                    );
                }
            }] : [])
    ];

    return (
        <div style={{height: 400, width: '100%'}}>
            <DataGrid rows={policies} columns={columns} getRowId={(row) => row.id}/>
            <Dialog open={openClaimForm} onClose={handleCloseClaimForm} onSubmit={handleCloseClaimForm}>
                <DialogTitle>File a New Claim</DialogTitle>
                <DialogContent>
                    <ClaimForm policyId={selectedPolicyId} conversionRate={conversionRate}
                               onCreateClaim={onCreateClaim}/>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PoliciesTable;
