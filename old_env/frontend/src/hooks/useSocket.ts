import { useEffect, useState } from 'react';
import { getSocket, initializeSocket, disconnectSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const sock = initializeSocket();
    setSocket(sock);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    sock.on('connect', handleConnect);
    sock.on('disconnect', handleDisconnect);

    if (sock.connected) {
      setIsConnected(true);
    }

    return () => {
      sock.off('connect', handleConnect);
      sock.off('disconnect', handleDisconnect);
    };
  }, []);

  return { socket, isConnected };
};

export const useSocketEvent = (event: string, callback: (...args: any[]) => void) => {
  const sock = getSocket();

  useEffect(() => {
    if (!sock) return;

    sock.on(event, callback);

    return () => {
      sock.off(event, callback);
    };
  }, [sock, event, callback]);
};

export const useSocketEmit = () => {
  const sock = getSocket();

  return (event: string, data?: any) => {
    if (!sock) {
      console.warn('Socket not connected');
      return;
    }
    sock.emit(event, data);
  };
};
