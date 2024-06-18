import React, {useEffect, useState} from "react";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import {Typography} from "@mui/material";

interface Props {
    userRole: string;
    conversionRate: number;
    onGetAllClaims: () => Promise<any>;
    onDenyClaim: (policyId: number, claimId: number) => Promise<any>;
    onAcceptClaim: (policyId: number, claimId: number, amount: number) => Promise<any>;
}

const ClaimsTable = ({userRole, conversionRate, onGetAllClaims, onAcceptClaim, onDenyClaim}: Props) => {
    const [claims, setClaims] = useState([]);
    const [needsRefresh, setNeedsRefresh] = useState(true);

    useEffect(() => {
        if (needsRefresh) onGetAllClaims()?.then(claims => setClaims(claims ?? []))
        setNeedsRefresh(false)
    }, [needsRefresh]);


    const columns: GridColDef[] = [
        {field: "id", headerName: "ID", width: 70, valueGetter: params => params.row.policyId.toString()+"-"+params.value.toString()},
        {field: "policyName", headerName: "Policy Name", width: 170},
        {field: "description", headerName: "Description", width: 200},
        {
            field: 'status', headerName: 'Claim Status', width: 180,
            renderCell: (params) => {

                const isAnswered = params.row.isAnswered;
                const isAccepted = params.row.isAccepted;
                const text = !isAnswered ? "Unanswered" : isAccepted ? "Approved" : "Denied";

                return (<div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {!isAnswered && (<PendingActionsIcon/>)}
                        {isAnswered && !isAccepted && (<CancelIcon color='error'/>)}
                        {isAnswered && isAccepted && (<CheckCircleIcon color='success'/>)}

                        <Typography style={{margin: 0, marginTop: '4px', marginLeft: '10px'}}>{text}</Typography>
                    </div>
                )
            }
        },
        {field: "amount", headerName: "Amount", width: 120},
        ...(userRole === "insurer" ? [
            {
                field: "actions",
                headerName: "Actions",
                width: 200,
                renderCell: (params: any) => {
                    const answered = params.row.isAnswered;
                    return (
                        <>
                            {!answered && (
                                <>
                                    <IconButton
                                        onClick={() => onAcceptClaim(params.row.policyId, params.row.id, Number(params.row.amount)).then(_ => setNeedsRefresh(true))}
                                        color="success">
                                        <CheckCircleIcon/>
                                    </IconButton>
                                    <IconButton
                                        onClick={() => onDenyClaim(params.row.policyId, params.row.id).then(_ => setNeedsRefresh(true))}
                                        color="error">
                                        <CancelIcon/>
                                    </IconButton>
                                </>)}
                        </>
                    );
                },
            }] : [])
    ];

    return (
        <div style={{height: 400, width: "100%"}}>
            <DataGrid rows={claims} columns={columns} getRowId={(row) => row.policyId+"-"+ row.id}/>
        </div>
    );
};

export default ClaimsTable;
