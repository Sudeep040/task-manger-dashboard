// @ts-nocheck
// Placeholder socket hook. Install socket.io-client when ready.
import { useEffect, useRef } from 'react';

export default function useSocket() {
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize socket when socket.io-client is added.
    return () => {
      if (socketRef.current?.disconnect) socketRef.current.disconnect();
    };
  }, []);

  return socketRef;
}
