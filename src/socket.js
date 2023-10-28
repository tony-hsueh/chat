import { io } from 'socket.io-client'

const URL = process.env.NODE_ENV === 'develpment' ? 'http://localhost:4001/' : "https://chat-server-4qup.onrender.com/"

export const socket = io(URL, {autoConnect: false})