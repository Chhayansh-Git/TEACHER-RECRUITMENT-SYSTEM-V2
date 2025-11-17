// client/src/components/chat/MessageItem.tsx
import { Box, Paper, Typography, Link } from '@mui/material';
import { useAppSelector } from '../../hooks/redux.hooks';
import { decryptMessage } from '../../utils/encryption';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export interface IMessage {
    _id: string;
    sender: { _id: string; name: string; };
    content: string; // Encrypted
    fileUrl?: string;
    fileType?: string;
    createdAt: string;
    conversation: string;
}

const API_BASE_URL = 'http://localhost:5001';

export const MessageItem = ({ message }: { message: IMessage }) => {
    const { userInfo } = useAppSelector(state => state.auth);
    const fromMe = message.sender._id === userInfo?._id;
    const decryptedContent = decryptMessage(message.content);

    const isImage = message.fileType?.startsWith('image/');

    return (
        <Box sx={{ display: 'flex', justifyContent: fromMe ? 'flex-end' : 'flex-start', mb: 2 }}>
            <Paper
                variant="outlined"
                sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    backgroundColor: fromMe ? 'primary.light' : 'background.paper',
                }}
            >
                {message.fileUrl ? (
                    isImage ? (
                        <Box
                            component="img"
                            src={`${API_BASE_URL}${message.fileUrl}`}
                            alt={decryptedContent}
                            sx={{ maxWidth: '100%', height: 'auto', borderRadius: 1 }}
                        />
                    ) : (
                        <Link href={`${API_BASE_URL}${message.fileUrl}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                            <InsertDriveFileIcon sx={{ mr: 1 }} />
                            <Typography>{decryptedContent}</Typography>
                        </Link>
                    )
                ) : (
                    <Typography variant="body1">{decryptedContent}</Typography>
                )}
                 <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
            </Paper>
        </Box>
    );
};