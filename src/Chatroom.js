import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { socket } from './socket';
import './Chatroom.css'

const Chatroom = () => {
  const messageInput = useRef()
  const roomIdInput = useRef()
  const [messages, setMessages] = useState([])

  const sendMessage = (e) => {
    e.preventDefault()
    console.log(messageInput.current.value);
    if (messageInput.current.value === '') return;
    const time = dayjs().unix()
    setMessages(prev => {
      const newMessage = JSON.parse(JSON.stringify(prev))
      newMessage.push({
        message: messageInput.current.value, 
        time, 
        from: 'own'
      })
      socket.emit('sendRoommessage', {
        roomId: roomIdInput.current.value,
        message: messageInput.current.value,
        time,
      })
      messageInput.current.value = ''
      return newMessage
    })
   
  }

  const joinRoom = (e) => {
    e.preventDefault()
    console.log(roomIdInput.current.value);
    socket.emit('joinroom', {
      roomId: roomIdInput.current.value,
      time: dayjs().unix(),
    })
  }

  useEffect(() => {
    socket.on('joinSuccess', (data) => {
      console.log(data);
      setMessages(prev => {
        const newMessage = JSON.parse(JSON.stringify(prev))
        newMessage.push({...data, from: 'system'})
        return newMessage
      })
    })

    socket.on('receiveRoommessage', (data) => {
      console.log(data);
      setMessages(prev => {
        const newMessage = JSON.parse(JSON.stringify(prev))
        newMessage.push({...data, from: 'server'})
        return newMessage
      })
    })
  }, [])

  useEffect(() => {
    console.log(messages);
  }, [messages])

  return (
    <>
      <form onSubmit={joinRoom} className='form form--room'>
        <input 
          placeholder='type roomId...'
          className='input'
          ref={roomIdInput}
        />
        <button className='send-btn'>join</button>
      </form>
      <form onSubmit={sendMessage} className='form'>
        <input 
          className='input'
          ref={messageInput}
        />
        <button className='send-btn'>send</button>
      </form>
      <div className='chat-zone'>
        {messages.length > 0 && 
          messages
          .sort((a,b) => a.time - b.time)
          .map(message => {
          if (message.from === 'system') {
            return <div className='join-hint' key={message.time}>{message.message}</div>
          }
          return <div 
              className={`message-box ${message.from === 'own' ? 'right' : 'left'}`}
              key={message.time}
            >
              {message.message}
            </div>
        })}
      </div>
    </>
  )
}

export default Chatroom