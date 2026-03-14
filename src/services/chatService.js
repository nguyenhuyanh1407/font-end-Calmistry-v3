import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-toastify';
import api from './api';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/calmistry/ws';

class ChatService {
    constructor() {
        this.client = null;
        this.onConnected = null;
        this.onDisconnected = null;
        this.subscriptions = new Map();
    }

    connect(onConnectedCallback, onErrorCallback) {
        if (this.client && this.client.active) {
            if (onConnectedCallback) onConnectedCallback();
            return;
        }

        this.onConnected = onConnectedCallback;

        this.client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                console.log('STOMP: ' + str);
            },
            onConnect: (frame) => {
                console.log('Connected to STOMP');
                if (this.onConnected) this.onConnected();
            },
            onStompError: (frame) => {
                console.error('STOMP error', frame.headers['message']);
                if (onErrorCallback) onErrorCallback(frame);
                toast.error("Lỗi kết nối máy chủ chat.");
            },
            onWebSocketClose: () => {
                console.log('WebSocket closed');
                if (this.onDisconnected) this.onDisconnected();
            }
        });

        this.client.activate();
    }

    subscribeToRoom(roomId, onMessageReceived) {
        if (!this.client || !this.client.connected) {
            console.warn('STOMP client not connected, cannot subscribe');
            return null;
        }

        const topic = `/topic/room.${roomId}`;
        const subscription = this.client.subscribe(topic, (message) => {
            if (onMessageReceived) {
                onMessageReceived(message);
            }
        });

        this.subscriptions.set(topic, subscription);
        return subscription;
    }

    unsubscribe(subscription) {
        if (subscription && typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe();
        }
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
        this.subscriptions.clear();
        console.log("Disconnected from chat");
    }

    sendMessage(message) {
        if (this.client && this.client.connected) {
            this.client.publish({
                destination: "/app/chat.sendMessage",
                body: JSON.stringify(message)
            });
        } else {
            toast.error("Chưa kết nối đến máy chủ chat.");
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

const chatServiceInstance = new ChatService();
export default chatServiceInstance;
