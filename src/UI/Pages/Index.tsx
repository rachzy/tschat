import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import MainWrapper from "../Components/MainWrapper/MainWrapper";
import MainContainer from "../Components/MainContainer/MainContainer";
import MainContainerSection from "../Components/MainContainerSection/MainContainerSection";

import { IState } from "../../App";

const Index: React.FC<IState> = ({ userData, setUserData }) => {
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

  const handleJoinButtonClick = () => {
    if (userData.nick === "") {
      return setErrorValue("This field is required");
    }
    navigate("/chat");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key !== "Enter") return;
    handleJoinButtonClick();
  }

  return (
    <MainWrapper>
      <MainContainer>
        <MainContainerSection>
          <h1>TS Chat</h1>
        </MainContainerSection>
        <MainContainerSection>
          <img src="https://www.fiscalti.com.br/wp-content/uploads/2021/02/default-user-image.png" />
        </MainContainerSection>
        <MainContainerSection>
          <p>Your Nickname:</p>
          <input
            name="nick"
            onKeyPress={handleKeyPress}
            onChange={handleInputChange}
            value={userData.nick}
          />
          <p style={{ color: "red" }}>{errorValue}</p>
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
          <button onClick={handleJoinButtonClick}>Join</button>
        </MainContainerSection>
      </MainContainer>
    </MainWrapper>
  );
};

export default Index;
