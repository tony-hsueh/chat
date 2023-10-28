import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'
import { socket } from './socket';
import './Login.css'

const Login = ({ setUser }) => {
  const navigate = useNavigate()
  const usernameRef = useRef()
  const [errorMessage, setErrorMessage] = useState(null)
  const onLogin = () => {
    if (usernameRef.current.value.trim() === '') {
      setErrorMessage('暱稱為必填')
      return;
    }
    // const userInfo = {
    //   id: uuidv4(),
    //   name: usernameRef.current.value,
    // }
    socket.auth = {username: usernameRef.current.value}
    socket.connect()
    setUser(usernameRef.current.value)
    navigate('/lobby')
  }

  useEffect(() => {
    socket.on("connect_error", (err) => {
      if (err.message === 'invalid username') {
        setUser(null)
      }
    })
    return () => {
      socket.off("connect_error")
    }
  }, []) 

  return (
    <div className="login-container">
      <div className="login-form-wrap">
        <h2 className='login-title'>歡迎進入聊天室</h2>
        <input 
          ref={usernameRef}
          type='text' 
          className='login-input'
          placeholder='請輸入暱稱'
        />
        {errorMessage &&
          <p className='input-error'>{errorMessage}</p>
        }
        <button className='login-btn' onClick={onLogin}>進入</button>
      </div>
    </div>
  )
}

export default Login