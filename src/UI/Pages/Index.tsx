import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import Axios from "axios";

import MainWrapper from "../Components/MainWrapper/MainWrapper";
import MainContainer from "../Components/MainContainer/MainContainer";
import MainContainerSection from "../Components/MainContainerSection/MainContainerSection";

import { IState as IProps } from "../../App";
import { IPopupState } from "../../App";

import { GlobalServerContext } from "../../App";
import { IGlobalServerContext } from "../../App";

interface IProp {
  userData: IProps["userData"],
  setUserData: IProps["setUserData"],
  setPopupState: React.Dispatch<React.SetStateAction<IPopupState>>
}

const Index: React.FC<IProp> = ({ userData, setUserData, setPopupState }) => {
  const { serverUrl, serverStatus } =
    useContext<IGlobalServerContext>(GlobalServerContext);
  const navigate = useNavigate();

  const [errorValue, setErrorValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setUserData({
      ...userData,
      nick: value,
    });
  };

  const handleUserColorChange = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const { id } = e.target as HTMLDivElement;

    if (
      id !== "red" &&
      id !== "green" &&
      id !== "blue" &&
      id !== "yellow" &&
      id !== "white"
    )
      return;

    setUserData({
      ...userData,
      color: id,
    });

    const selectAllColors = document.querySelectorAll(".color");
    selectAllColors.forEach((div) => {
      if (div.id === id) {
        return div.classList.add("clicked");
      }
      div.classList.remove("clicked");
    });
  };

  const handleCreateRoomButtonClick = () => {
    if (userData.nick.length < 4 || userData.nick.length > 20) {
      return setErrorValue("Your nick has to be 4-20 characters length");
    }

    switch (serverStatus) {
      case 200:
        const createRoom = async() => {
          try {
            const { data } = await Axios.post(`${serverUrl}/createroom`, {
              nickname: "",
              pfp: "default.png",
              color: userData.color
            });
  
            switch(data.queryStatus) {
              case 200:
                navigate(`/chat?room=${data.result.roomId}`);
                break;
              default:
                setPopupState({
                  title: "Oops",
                  description: `An error occured while trying to create your room: ${data.errors[0].message} (${data.errors[0].errno})`,
                  buttonLabel: "OK",
                  enabled: true
                });
            }
          } catch(err) {
  
          }
        }
        createRoom();
        break;
      default:
        navigate("/chat?template");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    handleCreateRoomButtonClick();
  };

  return (
    <MainWrapper>
      <MainContainer>
        <MainContainerSection>
          <h1>TS Chat</h1>
        </MainContainerSection>
        <MainContainerSection>
          <img src={require("../../Imgs/default.png")} alt="user-pfp" />
        </MainContainerSection>
        <MainContainerSection>
          <p>Your Nickname:</p>
          <input
            name="nick"
            onKeyPress={handleKeyPress}
            onChange={handleInputChange}
            value={userData.nick}
          />
          <p className="error-message">{errorValue}</p>
        </MainContainerSection>
        <MainContainerSection>
          <p>Your color:</p>
          <div className="color-section">
            <div
              id="red"
              onClick={handleUserColorChange}
              style={{ backgroundColor: "red" }}
              className="color"
            >
              Red
            </div>
            <div
              id="blue"
              onClick={handleUserColorChange}
              style={{ backgroundColor: "lightseagreen" }}
              className="color"
            >
              Blue
            </div>
            <div
              id="green"
              onClick={handleUserColorChange}
              style={{ backgroundColor: "green" }}
              className="color"
            >
              Green
            </div>
            <div
              id="yellow"
              onClick={handleUserColorChange}
              style={{ backgroundColor: "rgb(185, 185, 15)" }}
              className="color"
            >
              Yellow
            </div>
            <div
              id="white"
              onClick={handleUserColorChange}
              style={{ backgroundColor: "white", color: "black" }}
              className="color clicked"
            >
              White
            </div>
          </div>
        </MainContainerSection>
        <MainContainerSection>
          <button onClick={handleCreateRoomButtonClick}>Create Room</button>
        </MainContainerSection>
      </MainContainer>
    </MainWrapper>
  );
};

export default Index;
