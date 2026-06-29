import React from 'react'
import './message.css'

function Message({ msg, currentUser }) {
  const isOwn = msg.author === currentUser
  const time = msg.time || ''

  return (
    <div className={`message-wrapper ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && (
        <div className="msg-avatar">{msg.author[0].toUpperCase()}</div>
      )}
      <div className="msg-bubble-group">
        {!isOwn && <span className="msg-author">{msg.author}</span>}
        <div className={`msg-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
          <span className="msg-text">{msg.message}</span>
          {time && <span className="msg-time">{time}</span>}
        </div>
      </div>
      {isOwn && (
        <div className="msg-avatar own-avatar">
          {msg.author[0].toUpperCase()}
        </div>
      )}
    </div>
  )
}

export default Message