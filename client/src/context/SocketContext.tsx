// client/src/context/SocketContext.tsx
import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../hooks/redux.hooks';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocketContext must be used within a SocketContextProvider");
    }
    return context;
};

export const SocketContextProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { userInfo } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (userInfo) {
            const newSocket = io("http://localhost:5001", { // Your backend URL
                query: {
                    userId: userInfo._id,
                },
            });

            setSocket(newSocket);

            // Cleanup on component unmount or when user logs out
            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};