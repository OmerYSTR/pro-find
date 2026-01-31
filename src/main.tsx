import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { SocketProvider } from './socket/SocketContext.jsx'
import App from './App.jsx'
import './index.css'


const rootElement = document.getElementById('root')!
createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <App />
      </SocketProvider>
    </Provider>
  </StrictMode>
)
