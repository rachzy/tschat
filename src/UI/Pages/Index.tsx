import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Axios from "axios";

import MainWrapper from "../Components/MainWrapper/MainWrapper";
import MainContainer from "../Components/MainContainer/MainContainer";
import MainContainerSection from "../Components/MainContainerSection/MainContainerSection";

import { IState as IProps, IPopupState } from "../../App";

import { GlobalServerContext } from "../../App";
import { IGlobalServerContext } from "../../App";

interface IProp {
  userData: IProps["userData"];
  setUserData: IProps["setUserData"];
  openPopup: ({
    title,
    description,
    buttonLabel,
    isLoadingWindow,
  }: Omit<IPopupState, "enabled">) => void;
  closePopup: () => void;
}

const Index: React.FC<IProp> = ({
  userData,
  setUserData,
  openPopup,
  closePopup,
}) => {
  const { serverUrl, serverStatus } =
    useContext<IGlobalServerContext>(GlobalServerContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (serverStatus !== 200) return;
    const checkIfUserIsAlreadyInARoom = async () => {
      const { data } = await Axios.get(`${serverUrl}/currentroom`, {
        withCredentials: true,
      });

      if (data.queryStatus !== 200) return;
      navigate(`/chat?id=${data.result.roomId}`);
    };
    checkIfUserIsAlreadyInARoom();
  }, [serverStatus, serverUrl, navigate]);

  const [errorValue, setErrorValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setUserData({
      ...userData,
      nick: value,
    });
  };

  const handleColorClick = (
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
        openPopup({
          title: "Hold on",
          description: "We're creating your room...",
          isLoadingWindow: true,
        });
        const createRoom = async () => {
          try {
            const { data } = await Axios.post(
              `${serverUrl}/createroom`,
              {
                nickname: userData.nick,
                pfp: "default.png",
                color: userData.color,
              },
              {
                withCredentials: true,
              }
            );

            switch (data.queryStatus) {
              case 200:
                const { roomId } = data.result;
                navigate(`/chat?id=${roomId}`);
                closePopup();
                break;
              default:
                const error = data.errors[0];
                switch (error.message) {
                  case "USER_IS_ALREADY_IN_ANOTHER_ROOM":
                    openPopup({
                      title: "Hey",
                      description:
                        "You're already in another room, we're redirecting you to it",
                      isLoadingWindow: false,
                      buttonLabel: "OK",
                    });
                    navigate(`/chat?id=${error.roomId}`);
                    break;
                  default:
                    openPopup({
                      title: "Oops",
                      description: `An error occured while trying to create your room: ${error.message}`,
                      buttonLabel: "OK",
                      isLoadingWindow: false,
                    });
                }
            }
          } catch (err) {
            openPopup({
              title: "Oops",
              description: `Sorry, an internal server error occured: ${err}`,
              buttonLabel: "OK",
              isLoadingWindow: false,
            });
          }
        };
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
              onClick={handleColorClick}
              style={{ backgroundColor: "red" }}
              className="color"
            >
              Red
            </div>
            <div
              id="blue"
              onClick={handleColorClick}
              style={{ backgroundColor: "lightseagreen" }}
              className="color"
            >
              Blue
            </div>
            <div
              id="green"
              onClick={handleColorClick}
              style={{ backgroundColor: "green" }}
              className="color"
            >
              Green
            </div>
            <div
              id="yellow"
              onClick={handleColorClick}
              style={{ backgroundColor: "rgb(185, 185, 15)" }}
              className="color"
            >
              Yellow
            </div>
            <div
              id="white"
              onClick={handleColorClick}
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
