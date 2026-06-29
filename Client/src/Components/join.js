import React from 'react'
import './join.css'

function Join({setName, setRoom, joinRoom}) {
  const handleKeyDown = e => {
    if (e.key === 'Enter') joinRoom()
  }

  return (
    <div className='join-container'>
      <div className='join-card'>
        <div className='join-icon'>💬</div>
        <h1 className='join-title'>Welcome to Chat-room</h1>
        <p className='join-subtitle'>Join a room to start chatting!</p>

        <div className='join-form'>
          <div className='input-group'>
            <label>Username</label>
            <input
              className='join-input'
              placeholder='Enter your username'
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className='input-group'>
            <label>Room</label>
            <input
              className='join-input'
              placeholder='Enter room name'
              onChange={e => setRoom(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button className='join-btn' onClick={joinRoom}>
            Join Room
          </button>
        </div>
      </div>
    </div>
  )
}

export default Join
