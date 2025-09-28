import { useState } from 'react'
import {BrowserRouter as Router,Route,Routes} from "react-router-dom";
import Userprovider from './content/Userprovider';
import Home from './pages/Dashboard/Home';
import Registeration from './pages/Auth/Registration';
import Login from './pages/Auth/Login';
function App() {
  return (
    <div>

        <Userprovider>
          <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/register"element={<Registeration/>}/>
          <Route path="/login" element={<Login/>}/>
          </Routes>
        </Userprovider>
    </div>
  )
}

export default App
