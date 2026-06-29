import React, {useState, useEffect, useRef} from 'react'
import Message from './Message'
import './chat.css'

function Chat({socket, name, room, onLeave}) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [typing, setTyping] = useState('')
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // All socket listeners
  useEffect(() => {
    const handleReceive = data => {
      setMessages(prev => [...prev, data])
    }

    const handleRoomUsers = data => {
      setUsers(data.users || [])
    }

    const handleTyping = data => {
      if (data.author !== name) {
        setTyping(`${data.author} is typing...`)
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setTyping(''), 2000)
      }
    }

    const handleNotification = data => {
      setMessages(prev => [...prev, {...data, isNotification: true}])
    }

    socket.on('receive_message', handleReceive)
    socket.on('room_users', handleRoomUsers)
    socket.on('typing', handleTyping)
    socket.on('notification', handleNotification)

    return () => {
      socket.off('receive_message', handleReceive)
      socket.off('room_users', handleRoomUsers)
      socket.off('typing', handleTyping)
      socket.off('notification', handleNotification)
    }
  }, [socket, name])

  const sendMessage = () => {
    if (message.trim() !== '') {
      const now = new Date()
      const time = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      const data = {room, author: name, message: message.trim(), time}
      socket.emit('send_message', data)
      setMessages(prev => [...prev, data])
      setMessage('')
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      sendMessage()
    } else {
      socket.emit('typing', {room, author: name})
    }
  }

  return (
    <div className='chat-container'>
      {/* HEADER */}
      <div className='chat-header'>
        <div className='header-left'>
          <span className='header-icon'>💬</span>
          <h1 className='header-title'>Chat Room</h1>
        </div>
        <button className='leave-btn' onClick={onLeave}>
          Leave Room
        </button>
      </div>

      {/* BODY */}
      <div className='chat-body'>
        {/* SIDEBAR */}
        <div className='chat-sidebar'>
          <div className='sidebar-section'>
            <p className='sidebar-label'>ROOM</p>
            <div className='room-name-box'>{room}</div>
          </div>

          <div className='sidebar-section'>
            <p className='sidebar-label'>ONLINE USERS ({users.length})</p>
            <ul className='users-list'>
              {users.map((u, i) => (
                <li
                  key={i}
                  className={`user-item ${
                    u.username === name ? 'current-user' : ''
                  }`}
                >
                  <span className='user-dot'></span>
                  {u.username}
                  {u.username === name && <span className='you-tag'>you</span>}
                </li>
              ))}
              {users.length === 0 && (
                <li className='user-item empty'>No users yet</li>
              )}
            </ul>
          </div>
        </div>

        {/* MESSAGES */}
        <div className='messages-panel'>
          <div className='messages-scroll'>
            {messages.length === 0 && (
              <div className='empty-chat'>
                <span>👋</span>
                <p>No messages yet. Say hello!</p>
              </div>
            )}
            {messages.map((msg, index) =>
              msg.isNotification ? (
                <div key={index} className='notification-msg'>
                  {msg.message}
                </div>
              ) : (
                <Message key={index} msg={msg} currentUser={name} />
              ),
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* TYPING INDICATOR */}
          {typing && (
            <div className='typing-indicator'>
              <span className='typing-dots'>
                <span></span>
                <span></span>
                <span></span>
              </span>
              {typing}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className='chat-footer'>
        <input
          className='msg-input'
          value={message}
          placeholder='Type a message...'
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className='send-btn'
          onClick={sendMessage}
          disabled={!message.trim()}
        >
          ➤ Send
        </button>
      </div>
    </div>
  )
}

export default Chat
