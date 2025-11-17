// client/src/pages/chat/ChatPage.tsx
import { useState } from 'react';
import { Grid, Paper } from '@mui/material';
import { ConversationList } from '../../components/chat/ConversationList';
import { MessageWindow } from '../../components/chat/MessageWindow';

// Define types for conversations and messages here for reusability
export interface IParticipant {
    _id: string;
    name: string;
    profilePictureUrl?: string;
}
export interface IConversation {
    _id: string;
    participants: IParticipant[];
    lastMessage?: { content: string; createdAt: string; };
}

export const ChatPage = () => {
    const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

    return (
        <Paper sx={{ height: 'calc(100vh - 120px)', display: 'flex', overflow: 'hidden' }}>
            <Grid container>
                <Grid item xs={12} sm={4} md={3} sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
                    <ConversationList
                        selectedConversation={selectedConversation}
                        setSelectedConversation={setSelectedConversation}
                    />
                </Grid>
                <Grid item xs={12} sm={8} md={9}>
                    <MessageWindow selectedConversation={selectedConversation} />
                </Grid>
            </Grid>
        </Paper>
    );
};