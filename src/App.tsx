import React, {useState} from 'react';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom"

import './App.css';

import Index from './UI/Pages/Index';
import Chat from './UI/Pages/Chat';

export type colors = "red" | "blue" | "green" | "yellow" | "white";

interface IUser {
  nick: string;
  color: colors;
}

export interface IState {
    userData: IUser,
    setUserData: React.Dispatch<React.SetStateAction<IUser>>
}

function App() {
  const [userData, setUserData] = useState<IUser>({
    nick: "",
    color: "white",
  });
  return (
    <Router>
      <Routes>
        <Route index element={<Index userData={userData} setUserData={setUserData} />} />
        <Route path="/chat" element={<Chat userData={userData} setUserData={setUserData} />} />
      </Routes>
    </Router>
  );
}

export default App;
