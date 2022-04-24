import React, { createContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Axios from "axios";

import "./App.css";

import Popup from "./UI/Elements/Popup/Popup";

import Index from "./UI/Pages/Index";
import Chat from "./UI/Pages/Chat";

export type colors = "red" | "blue" | "green" | "yellow" | "white";

interface IUser {
  nick: string;
  color: colors;
}

export interface IState {
  userData: IUser;
  setUserData: React.Dispatch<React.SetStateAction<IUser>>;
}

export interface IPopupState {
  title: string;
  description: string;
  buttonLabel: string;
  enabled: boolean;
}

export interface IGlobalServerContext {
  serverUrl: string;
  serverStatus: number;
}

export const GlobalServerContext = createContext<IGlobalServerContext>({
  serverUrl: "",
  serverStatus: 404,
});

const App = () => {
  const serverUrl = "http://localhost:8000/api";
  const [serverStatus, setServerStatus] = useState<number>(404);

  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const { status } = await Axios.get(`${serverUrl}`);
        setServerStatus(status);
      } catch (err) {
        setServerStatus(404);
      }
    };
    checkServerConnection();
  }, []);

  const [popupState, setPopupState] = useState<IPopupState>({
    title: "",
    description: "",
    buttonLabel: "",
    enabled: false,
  });

  const [userData, setUserData] = useState<IUser>({
    nick: "",
    color: "white",
  });

  return (
    <GlobalServerContext.Provider
      value={{
        serverUrl: serverUrl,
        serverStatus: serverStatus,
      }}
    >
      <Popup popupState={popupState} setPopupState={setPopupState} />
      <Router>
        <Routes>
          <Route
            index
            element={
              <Index
                userData={userData}
                setUserData={setUserData}
                setPopupState={setPopupState}
              />
            }
          />
          <Route
            path="/chat"
            element={<Chat userData={userData} setUserData={setUserData} />}
          />
        </Routes>
      </Router>
    </GlobalServerContext.Provider>
  );
};

export default App;
