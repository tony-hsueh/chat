
import { RouterProvider, createBrowserRouter, BrowserRouter, Routes, Router } from 'react-router-dom'
import Chatroom from './Chatroom';
import Login from './Login';
import Lobby from './Lobby';
import Privateroom from './Privateroom';
import './App.css';
import { useState } from 'react';

function App() { 
  const [user, setUser] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Login setUser={setUser}/>
    },
    {
      path: '/lobby',
      element: <Lobby 
                user={user} 
                setOnlineUsers={setOnlineUsers} 
                onlineUsers={onlineUsers}
              />
    },
    {
      path: '/room',
      element: <Chatroom />,
    },
    {
      path: '/private-room/:userId/:username',
      element: <Privateroom 
                user={user} 
                onlineUsers={onlineUsers}
                setOnlineUsers={setOnlineUsers}  
                />,
    }
  ])

  return (
    <div className="App">
      <RouterProvider router={router} />
      {/* <BrowserRouter>
        <Routes>
          <Router />
        </Routes>
      </BrowserRouter> */}
    </div>
  );
}

export default App;
