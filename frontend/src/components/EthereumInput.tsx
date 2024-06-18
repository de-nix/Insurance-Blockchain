import React, {useEffect, useState} from 'react';
import { TextField, Typography, InputAdornment } from '@mui/material';

const EthereumInput = ({ label, value, onChange, conversionRate }: {label:string, value:number, onChange: (x:number) => void,conversionRate:number, }) => {
    return (
        <div>
            <TextField
                label={label}
                variant="outlined"
                fullWidth
                type="number"
                InputProps={{
                    startAdornment: (
                        <>
                        <InputAdornment position="start">
                            ${(value*conversionRate).toFixed(0)}
                            <div style={{borderLeft: '1px solid gray', height: '20px', margin: '0 5px'}} />
                        </InputAdornment>
                        </>
                    ),
                }}
                inputProps={{
                    step: '0.01',
                    min: '0',
                }}
                value={value}
                onChange={(event) => onChange(parseFloat(event.target.value))}
                required
            />
        </div>
    );
};

export default EthereumInput;