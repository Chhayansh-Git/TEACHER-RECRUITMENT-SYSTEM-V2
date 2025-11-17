// client/src/components/chat/ConversationList.tsx
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { useAppSelector } from '../../hooks/redux.hooks';
import type { IConversation } from '../../pages/chat/ChatPage'; // CORRECTED: type-only import
import {
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';

const fetchConversations = async (): Promise<IConversation[]> => {
    const token = localStorage.getItem('token');
    const { data } = await api.get('/chat/conversations', { headers: { Authorization: `Bearer ${token}` } });
    return data;
};

interface ConversationListProps {
    selectedConversation: IConversation | null;
    setSelectedConversation: (conversation: IConversation) => void;
}

export const ConversationList = ({ selectedConversation, setSelectedConversation }: ConversationListProps) => {
    const { userInfo } = useAppSelector(state => state.auth);
    const { data: conversations, isLoading, isError } = useQuery<IConversation[]>({
        queryKey: ['conversations'],
        queryFn: fetchConversations,
    });

    return (
        <Box sx={{ height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6" p={2} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                Conversations
            </Typography>
            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
            {isError && <Alert severity="error">Could not load conversations.</Alert>}
            <List>
                {conversations?.map((conv) => {
                    const otherParticipant = conv.participants.find(p => p._id !== userInfo?._id);
                    if (!otherParticipant) return null;

                    return (
                        <ListItem key={conv._id} disablePadding>
                            <ListItemButton
                                selected={selectedConversation?._id === conv._id}
                                onClick={() => setSelectedConversation(conv)}
                            >
                                <ListItemAvatar>
                                    <Avatar src={otherParticipant.profilePictureUrl} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={otherParticipant.name}
                                    secondary={conv.lastMessage ? "Last message..." : "No messages yet"}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};