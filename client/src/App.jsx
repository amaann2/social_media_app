import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<h1>hello login page</h1>} />
        <Route path='/signup' element={<h1>hello signup page</h1>} />
      </Routes>
    </>
  )
}

export default App