// client/src/components/chat/MessageWindow.tsx
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSocketContext } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import type { IConversation } from '../../pages/chat/ChatPage';
import { MessageInput } from './MessageInput';
import { MessageItem } from './MessageItem';
import type { IMessage } from './MessageItem';
import { Box, Typography, AppBar, Toolbar, Avatar, CircularProgress, Alert } from '@mui/material';
import api from '../../api';
import { useAppSelector } from '../../hooks/redux.hooks';

const fetchMessages = async (conversationId: string): Promise<IMessage[]> => {
    const token = localStorage.getItem('token');
    const { data } = await api.get(`/chat/messages/${conversationId}`, { headers: { Authorization: `Bearer ${token}` } });
    return data;
};

interface MessageWindowProps {
    selectedConversation: IConversation | null;
}

export const MessageWindow = ({ selectedConversation }: MessageWindowProps) => {
    const { socket } = useSocketContext();
    const { userInfo } = useAppSelector(state => state.auth);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, isError } = useQuery<IMessage[]>({
        queryKey: ['messages', selectedConversation?._id],
        queryFn: () => fetchMessages(selectedConversation!._id),
        enabled: !!selectedConversation,
    });

    useEffect(() => {
        if (data) setMessages(data);
    }, [data]);
    
    useEffect(() => {
        socket?.on("newMessage", (newMessage: IMessage) => {
            // Check if the message belongs to the currently selected conversation
            if (selectedConversation?._id === newMessage.conversation) {
                setMessages(prev => [...prev, newMessage]);
            }
            // Show toast notification regardless
            toast(`New message from ${newMessage.sender.name}`);
        });

        return () => {
            socket?.off("newMessage");
        };
    }, [socket, selectedConversation]);

    useEffect(() => {
        // Scroll to the bottom on new message
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!selectedConversation) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h6" color="text.secondary">Select a conversation to start chatting</Typography>
            </Box>
        );
    }
    
    const otherParticipant = selectedConversation.participants.find(p => p._id !== userInfo?._id);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar>
                    <Avatar sx={{ mr: 2 }} src={otherParticipant?.profilePictureUrl} />
                    <Typography variant="h6">{otherParticipant?.name}</Typography>
                </Toolbar>
            </AppBar>
            
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, backgroundColor: '#f5f5f5' }}>
                {isLoading && <CircularProgress />}
                {isError && <Alert severity="error">Could not load messages.</Alert>}
                {!isLoading && messages.map(msg => (
                    <MessageItem key={msg._id} message={msg} />
                ))}
                <div ref={lastMessageRef} />
            </Box>

            <MessageInput selectedConversation={selectedConversation} />
        </Box>
    );
};