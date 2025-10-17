// src/components/common/BlurredOverlay.tsx
import { Box } from '@mui/material';
import { UpgradePrompt } from './UpgradePrompt';

interface BlurredOverlayProps {
    message: string;
    featureName: string;
}

export const BlurredOverlay = ({ message, featureName }: BlurredOverlayProps) => {
    return (
        <Box sx={{
            position: 'relative',
            height: '100%',
        }}>
            <Box sx={{
                filter: 'blur(8px)',
                opacity: 0.6,
                height: '100%',
                // You can place a screenshot of the feature here as a background image
                // backgroundImage: `url('/path/to/feature-screenshot.png')`,
                // backgroundSize: 'cover'
            }}>
                {/* This box is just for the blur effect. The content is empty. */}
            </Box>
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <UpgradePrompt message={message} featureName={featureName} />
            </Box>
        </Box>
    );
};