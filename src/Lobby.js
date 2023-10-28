import React, { useEffect, useRef, useState } from 'react'
import { json, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { socket } from './socket';
import './Lobby.css'

const Lobby = ({ user, onlineUsers, setOnlineUsers }) => {
  const navigate = useNavigate()
  const chatInput = useRef()
  const chatArea = useRef()
  const [publicMessage, setPublicMessage] = useState([])

  const joinPrivateRoom = (user) => {
    navigate(`/private-room/${user.userID}/${user.username}`)
  }

  const sendLobbyMessage = (e) => {
    e.preventDefault()
    if (chatInput.current.value === '') return;
    const time = dayjs().unix()
    const message = chatInput.current.value
    setPublicMessage(prev => {
      const newMessage = [...prev]
      newMessage.push({
        name: user,
        message,
        time,
      })
      return newMessage
    })
    socket.emit('send-lobby-message', {
      from: user,
      message,
      time,
    })
    chatInput.current.value = ''
  }

  const initUserProperties = (user) => {
    user.messages = []
    user.hasNewMessages = false
  }

  useEffect(() => {
    chatArea.current.scrollBy(0, chatArea.current.scrollHeight)
  }, [publicMessage])

  useEffect(() => {
    // 如果沒登入過直接導回登入頁
    if (!user) {
      navigate('/')
    }

    socket.on("users", (users) => {
      users.forEach(user => {
        user.self = user.userID === socket.id
        initUserProperties(user)
      });
      const sortedUsers = users.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1; 
      })
      setOnlineUsers(sortedUsers)
    })
    // 新上線的人也要新增至在線列表
    socket.on("connect-new-user", (user) => {
      initUserProperties(user)
      setOnlineUsers(prev => {
        const updated = [...prev]
        updated.push(user)
        return updated
      })
    })
    // 渲染 lobby 的廣播
    socket.on('receive-lobby-message', ({ name, message, time }) => {
      setPublicMessage(prev => {
        const newMessage = [...prev]
        newMessage.push({
          name,
          message,
          time,
        })
        return newMessage
      })
    })

    socket.on('private message', ({from, content, time}) => {
      console.log(234);
      const updatedUsers = JSON.parse(JSON.stringify(onlineUsers))
      for(let i = 0; i < updatedUsers.length; i++) {
        const user = updatedUsers[i]
        if (user.userID === from) {
          user.messages.push({
            fromSelf: false,
            content,
            time
          })

          user.hasNewMessages = true
          break;
        }
      }
      console.log(updatedUsers);
      setOnlineUsers(updatedUsers)
    })

    socket.on("user disconnect", (userID) => {
      const updated = JSON.parse(JSON.stringify(onlineUsers))
      const removeIndex = updated.findIndex(user => user.userID === userID)
      updated.splice(removeIndex, 1)
      setOnlineUsers(updated)
    }) 

    return () => {
      socket.off("users")
      socket.off("connect-new-user")
      socket.off("private message")
      socket.off("receive-lobby-message")
      socket.off("user disconnect")
    }
  }, [user, navigate, onlineUsers])
  return (
    <div className='lobby-container'>
      <div className='side-bar'>
        <h3 className='title'>在線列表</h3>
        {onlineUsers.map((onlineUser, index) => (
          <div 
            key={onlineUser.userID}
            className='online-user'
            onClick={() => {
              if (onlineUser.self) return
              // 需要先將 hasMessage 的提示移除
              const updatedUsers = JSON.parse(JSON.stringify(onlineUsers))
              updatedUsers[index].hasNewMessages = false
              setOnlineUsers(updatedUsers)
              joinPrivateRoom(onlineUser)
            }}
          >
            {onlineUser.self ? '[yourself]' : ''}{onlineUser.username}

            {onlineUser.hasNewMessages &&
              <div className='unread-hint'>!</div>
            }
          </div>
        ))}
      </div>
      <div className='main'>
        <h2 className='title'>歡迎來到大廳</h2>
        {/* <div className='room-wrap'>
          <div className='room' onClick={() => {joinRoom('js')}}>
            <div className='room-image'>
              JS
            </div>
            <div className='room-info'>
              <h4>javascript 隨你聊</h4>
              <h4 className='person-count'>房內人數: 444</h4>
            </div>
          </div>
          <div className='room' onClick={() => {joinRoom('backend')}}>
            <div className='room-image'>
              後端
            </div>
            <div className='room-info'>
              <h4>今天來談談 Nodejs</h4>
              <h4 className='person-count'>房內人數: 444</h4>
            </div>
          </div>
        </div> */}
        <div className='lobby-chat'>
          <div className='messages-wrap' ref={chatArea}>
            {publicMessage.length > 0 && 
              publicMessage.map((chatInfo,index) => (   
                <div 
                  className='message-wrap' 
                  key={chatInfo.time + index}
                >
                  <div className='profile-photo'></div>
                  <div className='message-info'>
                    <div className='username'>{chatInfo.name} <span>{chatInfo.time}</span></div>
                    <div className='content'>{chatInfo.message}</div>
                  </div>
                </div>
            ))}
          </div>
          <div className='chat-toolbar'>
            <form className='chat-form' onSubmit={sendLobbyMessage}>
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
      </div>
    </div>
  )
}

export default Lobby