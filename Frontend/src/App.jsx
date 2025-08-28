import './App.css'
import Chat from './pages/chat';
import {Routes,Route} from "react-router"

function App() {
  return(
    <Routes>
        <Route path="/" element={<Chat/>}/>
    </Routes>
  )
}

export default App;
