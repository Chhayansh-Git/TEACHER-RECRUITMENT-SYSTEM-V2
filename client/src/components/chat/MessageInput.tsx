// client/src/components/chat/MessageInput.tsx
import { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useSocketContext } from '../../context/SocketContext';
import { useAppSelector } from '../../hooks/redux.hooks';
import type { IConversation } from '../../pages/chat/ChatPage';
import { encryptMessage } from '../../utils/encryption';
import api from '../../api';
import toast from 'react-hot-toast';

interface MessageInputProps {
    selectedConversation: IConversation;
}

export const MessageInput = ({ selectedConversation }: MessageInputProps) => {
    const [message, setMessage] = useState('');
    const { socket } = useSocketContext();
    const { userInfo } = useAppSelector(state => state.auth);

    const handleSend = () => {
        if (!message.trim() || !socket || !userInfo) return;
        
        const otherParticipant = selectedConversation.participants.find(p => p._id !== userInfo._id);
        if (!otherParticipant) return;

        const encryptedContent = encryptMessage(message);

        socket.emit('sendMessage', {
            conversationId: selectedConversation._id,
            senderId: userInfo._id,
            recipientId: otherParticipant._id,
            content: encryptedContent,
        });

        setMessage('');
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userInfo) return;

        const otherParticipant = selectedConversation.participants.find(p => p._id !== userInfo._id);
        if (!otherParticipant) return;
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('conversationId', selectedConversation._id);
        formData.append('recipientId', otherParticipant._id);
        formData.append('encryptedContent', encryptMessage(file.name));

        try {
            const token = localStorage.getItem('token');
            await api.post('/chat/messages/file', formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            toast.error('File upload failed.');
        }
    }

    return (
        <Box sx={{ p: 2, backgroundColor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                 <input
                    accept="*"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="raised-button-file">
                    <IconButton component="span">
                        <AttachFileIcon />
                    </IconButton>
                </label>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <IconButton color="primary" onClick={handleSend} sx={{ ml: 1 }}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};