const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

const roomUsers = {}

const addUser = (socketId, username, room) => {
  if (!roomUsers[room]) roomUsers[room] = []
  roomUsers[room] = roomUsers[room].filter(u => u.id !== socketId)
  roomUsers[room].push({ id: socketId, username })
  return roomUsers[room]
}

const removeUser = (socketId) => {
  for (const room in roomUsers) {
    const before = roomUsers[room].length
    roomUsers[room] = roomUsers[room].filter(u => u.id !== socketId)
    if (roomUsers[room].length < before) {
      return { room, users: roomUsers[room] }
    }
  }
  return null
}

const getUser = (socketId) => {
  for (const room in roomUsers) {
    const user = roomUsers[room].find(u => u.id === socketId)
    if (user) return { ...user, room }
  }
  return null
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('join_room', ({ room, username }) => {
    socket.join(room)
    const users = addUser(socket.id, username, room)
    io.to(room).emit('room_users', { room, users })
    socket.to(room).emit('notification', {
      message: `${username} joined the room 👋`,
    })
  })

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data)
  })

  socket.on('typing', (data) => {
    socket.to(data.room).emit('typing', { author: data.author })
  })

  socket.on('leave_room', ({ room, author }) => {
    socket.leave(room)
    if (roomUsers[room]) {
      roomUsers[room] = roomUsers[room].filter(u => u.id !== socket.id)
      io.to(room).emit('room_users', { room, users: roomUsers[room] })
    }
    socket.to(room).emit('notification', {
      message: `${author} left the room`,
    })
  })

  socket.on('disconnect', () => {
    const user = getUser(socket.id)
    const removed = removeUser(socket.id)
    if (removed) {
      io.to(removed.room).emit('room_users', {
        room: removed.room,
        users: removed.users,
      })
      if (user) {
        io.to(removed.room).emit('notification', {
          message: `${user.username} disconnected`,
        })
      }
    }
  })
})

const PORT = 5000
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})