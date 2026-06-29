import React, {useState} from 'react'
import Join from './Components/join'
import Chat from './Components/chat'
import {socket} from './Socket'

function App() {
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [showChat, setShowChat] = useState(false)

  const joinRoom = () => {
    if (name.trim() && room.trim()) {
      socket.emit('join_room', {room: room.trim(), username: name.trim()})
      setShowChat(true)
    }
  }

  const leaveRoom = () => {
    socket.emit('leave_room', {room, author: name})
    setShowChat(false)
    setName('')
    setRoom('')
  }

  return (
    <div>
      {!showChat ? (
        <Join setName={setName} setRoom={setRoom} joinRoom={joinRoom} />
      ) : (
        <Chat socket={socket} name={name} room={room} onLeave={leaveRoom} />
      )}
    </div>
  )
}

export default App
