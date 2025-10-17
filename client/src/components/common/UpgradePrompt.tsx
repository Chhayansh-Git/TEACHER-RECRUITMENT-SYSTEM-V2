// src/components/common/UpgradePrompt.tsx

import { Box, Typography, Button, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { Link as RouterLink } from 'react-router-dom';

interface UpgradePromptProps {
    message: string;
    featureName: string;
}

export const UpgradePrompt = ({ message, featureName }: UpgradePromptProps) => {
    return (
        <Paper 
            sx={{ 
                p: 3, 
                textAlign: 'center', 
                mt: 2, 
                border: '2px dashed', 
                borderColor: 'warning.main', 
                backgroundColor: 'rgba(255, 167, 38, 0.1)' 
            }}
        >
            <LockIcon color="warning" sx={{ fontSize: 40 }}/>
            <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>{featureName} Locked</Typography>
            <Typography color="text.secondary" sx={{ my: 1 }}>{message}</Typography>
            <Button variant="contained" color="warning" component={RouterLink} to="/school/subscription">
                Upgrade Your Plan
            </Button>
        </Paper>
    );
};