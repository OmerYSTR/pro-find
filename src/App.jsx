import './App.css'
import { useSelector } from 'react-redux'
function App() {
  const userInfo = useSelector(state => state.auth.userInfo)
  return <>Hi {userInfo}</>
}

export default App
