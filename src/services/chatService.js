import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { toast } from 'react-toastify';
import api from './api';

const WS_URL = 'http://localhost:8080/calmistry/ws';

class ChatService {
    constructor() {
        this.stompClient = null;
    }

    connect(onConnectedCallback, onErrorCallback) {
        // Prevent duplicate connections
        if (this.stompClient && this.stompClient.connected) {
            console.log('Already connected to chat');
            if (onConnectedCallback) onConnectedCallback();
            return;
        }

        const socket = new SockJS(WS_URL);
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = () => { };

        this.stompClient.connect({},
            () => {
                if (onConnectedCallback) onConnectedCallback();
            },
            (error) => {
                console.error('WebSocket connection error:', error);
                if (onErrorCallback) onErrorCallback(error);
                toast.error("Lost connection to chat server.");
            }
        );
    }

    subscribeToRoom(roomId, onMessageReceived) {
        if (this.stompClient && this.stompClient.connected) {
            return this.stompClient.subscribe(`/topic/room.${roomId}`, onMessageReceived);
        }
        return null;
    }

    unsubscribe(subscription) {
        if (subscription) {
            subscription.unsubscribe();
        }
    }

    disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
        }
        console.log("Disconnected");
    }

    sendMessage(message) {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(message));
        } else {
            toast.error("Not connected to chat.");
        }
    }

    async getRooms() {
        return api.get('/chat/rooms');
    }

    async getRoomHistory(roomId, page = 0, size = 50) {
        return api.get(`/chat/rooms/${roomId}/messages?page=${page}&size=${size}`);
    }

    async createRoom(roomData) {
        return api.post('/chat/rooms', roomData);
    }

    async addMember(roomId, userId) {
        return api.post(`/chat/rooms/${roomId}/members/${userId}`);
    }

    async removeMember(roomId, userId) {
        return api.delete(`/chat/rooms/${roomId}/members/${userId}`);
    }
}

export default new ChatService();
