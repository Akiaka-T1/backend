import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ChatMessage {
    text: string;
    from: string;
    time: string;
    characterId: number;
    room: string;
    team: 'red' | 'blue';
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userMap = new Map<string, { nickname: string; team: 'red' | 'blue'; room: string }>();
    private redTeamMembers: string[] = [];
    private blueTeamMembers: string[] = [];
    private roomName: string | null = null;
    private redTeamTopic: string | null = null;
    private blueTeamTopic: string | null = null;

    @SubscribeMessage('updateRoomInfo')
    handleUpdateRoomInfo(
        @MessageBody() data: { roomName: string; redTeamTopic: string; blueTeamTopic: string; admin: boolean },
        @ConnectedSocket() client: Socket,
    ): void {
        if (!data.admin) {
            client.emit('error', { message: 'Unauthorized: Only admin can update the room info.' });
            return;
        }

        this.roomName = data.roomName;
        this.redTeamTopic = data.redTeamTopic;
        this.blueTeamTopic = data.blueTeamTopic;

        this.server.emit('roomInfoUpdated', {
            roomName: this.roomName,
            redTeamTopic: this.redTeamTopic,
            blueTeamTopic: this.blueTeamTopic,
        });
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @MessageBody() data: { room: string; nickname: string; team: 'red' | 'blue' },
        @ConnectedSocket() client: Socket,
    ): void {
        const { room, nickname, team } = data;

        if (!this.roomName) {
            client.emit('error', { message: 'Room does not exist yet.' });
            return;
        }

        this.userMap.set(client.id, { nickname, team, room });

        if (team === 'red') {
            this.redTeamMembers.push(nickname);
        } else {
            this.blueTeamMembers.push(nickname);
        }

        client.join(room);

        this.server.to(room).emit('updateTeamMembers', {
            redTeam: this.redTeamMembers,
            blueTeam: this.blueTeamMembers,
        });

        const joinMessage: ChatMessage = {
            text: `${nickname} joined the room.`,
            from: 'System',
            time: new Date().toLocaleTimeString(),
            characterId: 0,
            room: room,
            team: team,
        };

        this.server.to(room).emit('message', joinMessage);
    }

    @SubscribeMessage('joinTeam')
    handleJoinTeam(
        @MessageBody() data: { team: 'red' | 'blue'; nickname: string },
        @ConnectedSocket() client: Socket,
    ): void {
        const user = this.userMap.get(client.id);
        if (user) {
            const { nickname, team, room } = user;
            console.log(user);

            if (team === 'red') {
                this.redTeamMembers = this.redTeamMembers.filter(name => name !== nickname);
            } else {
                this.blueTeamMembers = this.blueTeamMembers.filter(name => name !== nickname);
            }

            this.userMap.set(client.id, { ...user, team: data.team });
            if (data.team === 'red') {
                this.redTeamMembers.push(data.nickname);
            } else {
                this.blueTeamMembers.push(data.nickname);
            }

            this.server.to(room).emit('updateTeamMembers', {
                redTeam: this.redTeamMembers,
                blueTeam: this.blueTeamMembers,
            });

            const teamSwitchMessage: ChatMessage = {
                text: `${data.nickname} switched to the ${data.team === 'red' ? 'Red' : 'Blue'} Team.`,
                from: 'System',
                time: new Date().toLocaleTimeString(),
                characterId: 0,
                room: room,
                team: data.team,
            };
            this.server.to(room).emit('message', teamSwitchMessage);

            this.server.to(client.id).emit('roomInfoUpdated', {
                roomName: this.roomName,
                redTeamTopic: this.redTeamTopic,
                blueTeamTopic: this.blueTeamTopic,
            });
        }
    }


    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket): void {
        const user = this.userMap.get(client.id);

        if (user) {
            const { nickname, team, room } = user;

            if (team === 'red') {
                this.redTeamMembers = this.redTeamMembers.filter((name) => name !== nickname);
            } else {
                this.blueTeamMembers = this.blueTeamMembers.filter((name) => name !== nickname);
            }

            client.leave(room);

            this.server.to(room).emit('updateTeamMembers', {
                redTeam: this.redTeamMembers,
                blueTeam: this.blueTeamMembers,
            });

            const leaveMessage: ChatMessage = {
                text: `${nickname} left the room.`,
                from: 'System',
                time: new Date().toLocaleTimeString(),
                characterId: 0,
                room: room,
                team: team,
            };

            this.server.to(room).emit('message', leaveMessage);
            this.userMap.delete(client.id);
        }
    }

    handleDisconnect(@ConnectedSocket() client: Socket): void {
        const user = this.userMap.get(client.id);

        if (user) {
            const { nickname, team, room } = user;

            if (team === 'red') {
                this.redTeamMembers = this.redTeamMembers.filter((name) => name !== nickname);
            } else {
                this.blueTeamMembers = this.blueTeamMembers.filter((name) => name !== nickname);
            }

            this.server.to(room).emit('updateTeamMembers', {
                redTeam: this.redTeamMembers,
                blueTeam: this.blueTeamMembers,
            });

            const disconnectMessage: ChatMessage = {
                text: `${nickname} disconnected.`,
                from: 'System',
                time: new Date().toLocaleTimeString(),
                characterId: 0,
                room: room,
                team: team,
            };

            this.server.to(room).emit('message', disconnectMessage);
            this.userMap.delete(client.id);
        }
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() message: ChatMessage, @ConnectedSocket() client: Socket): void {
        console.log(`[${new Date().toLocaleTimeString()}] Message from ${message.from} in room ${message.room}: ${message.text}`);
        this.server.to(message.room).emit('message', message);
    }
}
