import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('message')
    handleMessage(@MessageBody() message: string, @ConnectedSocket() client: Socket): void {
        console.log(`Received message: ${message} from client ${client.id}`);
        this.server.emit('message', message);
    }

    @SubscribeMessage('join')
    handleJoin(@MessageBody() room: string, @ConnectedSocket() client: Socket): void {
        console.log(`Client ${client.id} joined room: ${room}`);
        client.join(room);
        this.server.to(room).emit('message', `User joined room: ${room}`);
    }
}
