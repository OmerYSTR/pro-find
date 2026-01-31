import './App.css'
import { useSelector } from 'react-redux'
function App() {
  const userInfo = useSelector(state => state.auth.currentUser)
  return (
  <div>
  <>Hi {userInfo?.name}<br></br></>
  <>You are {userInfo?.age} years old </>
  </div>
)
}

export default App
