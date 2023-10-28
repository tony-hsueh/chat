import React, { useEffect, useRef, useState } from 'react'
import { FaChevronLeft } from 'react-icons/fa6'
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { socket } from './socket';
import './Privateroom.css'

const Privateroom = ({ user, onlineUsers, setOnlineUsers }) => {
  const { userId, username } = useParams()
  const navigate = useNavigate()
  const chatInput = useRef()
  const chatArea = useRef()
  const sendPrivateMessage = (e) => {
    e.preventDefault()
    if (chatInput.current.value === '') return;
    const time = dayjs().unix()
    const content = chatInput.current.value
    setOnlineUsers(prev => {
      const updatedUsers = JSON.parse(JSON.stringify(prev))
      const index = updatedUsers.findIndex(user => user.userID === userId)
      updatedUsers[index].messages.push({
        fromSelf: true,
        content,
        time,
      })
      return updatedUsers
    })
    socket.emit('send-private-message', {
      to: userId,
      content,
      time,
    })
    chatInput.current.value = ''
  }

  useEffect(() => {
    chatArea.current.scrollBy(0, chatArea.current.scrollHeight)
  }, [onlineUsers])

  useEffect(() => {
    socket.on('private message', ({from, content, time}) => {
      const updatedUsers = JSON.parse(JSON.stringify(onlineUsers))
      for(let i = 0; i < updatedUsers.length; i++) {
        const user = updatedUsers[i]
        if (user.userID === from) {
          user.messages.push({
            fromSelf: false,
            content,
            time
          })

          if (user.userID !== userId) {
            user.hasNewMessages = true
          }
          break;
        }
      }
      setOnlineUsers(updatedUsers)
    })

    socket.on("user disconnect", (logoutUserID) => {
      const updated = JSON.parse(JSON.stringify(onlineUsers))
      const removeIndex = updated.findIndex(user => user.userID === logoutUserID)
      updated.splice(removeIndex, 1)
      setOnlineUsers(updated)
      if(logoutUserID === userId) {
        navigate('/lobby')
      }
    }) 
    return () => {
      socket.off("private message")
      socket.off("user disconnect")
    }
  }, [onlineUsers, userId])
  return (
    <div className='private-chat'>
        <div className='name-bar'>
          <FaChevronLeft 
            style={{marginRight: '.5rem', cursor: 'pointer'}}
            onClick={() => navigate('/lobby')} 
          />
          {username}
        </div>
        <div className='messages-wrap' ref={chatArea}>
            {onlineUsers[onlineUsers.findIndex(user => user.userID === userId)].messages.length > 0 && 
              onlineUsers[onlineUsers.findIndex(user => user.userID === userId)].messages.map((chatInfo,index) => (   
                <div 
                  className='message-wrap' 
                  key={chatInfo.time + index}
                >
                  <div className='profile-photo'></div>
                  <div className='message-info'>
                    <div className='username'>{chatInfo.fromSelf ? '(yourself)' : username} <span>{chatInfo.time}</span></div>
                    <div className='content'>{chatInfo.content}</div>
                  </div>
                </div>
            ))}
          </div>
          <div className='chat-toolbar'>
            <form className='chat-form' onSubmit={sendPrivateMessage}>
              <input
                type='text' 
                placeholder='輸入你想對大家說的話...'
                className='chat-input' 
                ref={chatInput}
              />
              <button className='submit-btn' type='submit'>送出</button>
            </form>
          </div>
    </div>
  )
}

export default Privateroom