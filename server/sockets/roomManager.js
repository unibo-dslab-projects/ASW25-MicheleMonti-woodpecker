class RoomManager {
    constructor() {
        this.activeRooms = new Map();
    }

    joinRoom(socket, roomId, puzzleId) {
        console.log(`${socket.id} joining room: ${roomId} (puzzle: ${puzzleId})`);
        
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                socket.leave(room);
            }
        });
        
        socket.join(roomId);
        
        if (!this.activeRooms.has(roomId)) {
            this.activeRooms.set(roomId, {
                puzzleId: parseInt(puzzleId),
                users: new Set([socket.id])
            });
            console.log(`Created new room: ${roomId}`);
        } else {
            const room = this.activeRooms.get(roomId);
            room.users.add(socket.id);
            console.log(`${socket.id} joined existing room ${roomId}. Total users: ${room.users.size}`);
            
            socket.to(roomId).emit('user-joined', socket.id);
        }
        
        socket.emit('room-joined', { 
            roomId, 
            puzzleId: parseInt(puzzleId),
            usersCount: this.activeRooms.get(roomId).users.size
        });
        
        const currentUsers = Array.from(this.activeRooms.get(roomId).users);
        socket.emit('room-users', currentUsers.filter(id => id !== socket.id));
    }

    leaveRoom(socket, roomId) {
        console.log(`${socket.id} leaving room: ${roomId}`);
        
        socket.leave(roomId);
        
        if (this.activeRooms.has(roomId)) {
            const room = this.activeRooms.get(roomId);
            room.users.delete(socket.id);
            
            socket.to(roomId).emit('user-left', socket.id);
            
            if (room.users.size === 0) {
                this.activeRooms.delete(roomId);
                console.log(`Room ${roomId} destroyed (no users left)`);
            }
        }
    }

    disconnectUser(socket) {
        console.log(`Socket disconnected: ${socket.id}`);
        
        this.activeRooms.forEach((room, roomId) => {
            if (room.users.has(socket.id)) {
                room.users.delete(socket.id);
                
                socket.to(roomId).emit('user-left', socket.id);
                
                if (room.users.size === 0) {
                    this.activeRooms.delete(roomId);
                    console.log(`Room ${roomId} destroyed (no users left)`);
                } else {
                    console.log(`User ${socket.id} left room ${roomId}. Remaining users: ${room.users.size}`);
                }
            }
        });
    }

    getRoom(roomId) {
        return this.activeRooms.get(roomId);
    }
}

module.exports = RoomManager;