import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store , {persistor} from './store/store.js'
import { BrowserRouter } from "react-router-dom"
import { SocketProvider } from './socket/SocketContext.jsx'
import { PersistGate } from "redux-persist/integration/react";
import App from './App.jsx'
import './index.css'


const rootElement = document.getElementById('root')!
createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SocketProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
)
