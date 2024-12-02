import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./constants";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { token } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (token) {
      // Initialize socket connection
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: {
          token: token,
        },
      });
      // Cleanup on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [token]); // Empty dependency array means this runs once on mount

  // Return the socket instance
  return socketRef.current;
};
