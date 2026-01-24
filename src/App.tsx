import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [messages, setMessage] = useState()
  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:1111");
    ws.onopen = () => {
      console.log("Initial connection made");
        ws.send("hey, this is client");
    }

    ws.onmessage = (event) => {console.log("Received data from server: ", event.data)}



  }, []
);
  return (
    <>

    </>
  )
}

export default App
