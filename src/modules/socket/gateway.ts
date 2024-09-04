import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ChatMessage {
    text: string;
    from: string;
    time: string;
    characterId: number;
    room: string;  // 방 필드 추가
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})

export class ChatGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() data: { room: string; nickname: string }, @ConnectedSocket() client: Socket): void {
        const { room, nickname } = data;
        client.join(room);
        const joinMessage = {
            text: `${nickname} joined the room.`,
            from: 'System',
            time: new Date().toLocaleTimeString(),
            characterId: 0,
            room: room,
        };
        this.server.to(room).emit('message', joinMessage);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(
      @MessageBody() data: { room: string; nickname: string },
      @ConnectedSocket() client: Socket
    ): void {
        const { room, nickname } = data;
        client.leave(room);
        const leaveMessage: ChatMessage = {
            text:  nickname? `${nickname}`:'a user' + ` left ${room}`,
            from: 'System',
            time: new Date().toLocaleTimeString(),
            characterId: 0,
            room: room,
        };
        this.server.to(room).emit('message', leaveMessage);
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() message: ChatMessage, @ConnectedSocket() client: Socket): void {
        this.server.to(message.room).emit('message', message);
    }
}
