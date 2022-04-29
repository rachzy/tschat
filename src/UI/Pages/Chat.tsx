import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoSendSharp } from "react-icons/io5";

import Axios from "axios";

import MainWrapper from "../Components/MainWrapper/MainWrapper";
import ChatContainer from "../Components/ChatContainer/ChatContainer";
import ChatTopContainer from "../Components/ChatTopContainer/ChatTopContainer";
import ChatBottomContainer from "../Components/ChatBottomContainer/ChatBottomContainer";

import { IState as IProps, IPopupState, colors } from "../../App";
import ChatContent from "../Components/ChatContent/ChatContent";

import { GlobalServerContext } from "../../App";

interface IMessage {
  messages: {
    id: number;
    nick: string;
    color: colors;
    pfp: string;
    content: string;
  }[];
}

export interface IState {
  message: IMessage;
}

interface IProp {
  userData: IProps["userData"];
  setUserData: IProps["setUserData"];
  openPopup: ({
    title,
    description,
    buttonLabel,
    isLoadingWindow,
  }: Omit<IPopupState, "enabled">) => void;
}

const Chat: React.FC<IProp> = ({ userData, setUserData, openPopup }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { serverUrl, serverStatus } = useContext(GlobalServerContext);

  const [roomId, template] = [
    searchParams.get("roomId"),
    searchParams.get("template"),
  ];

  useEffect(() => {
    const checkIfUserCanAccessTheChat = async () => {
      console.log("executed");
      if (!roomId && !template) {
        navigate("/");
        return openPopup({
          title: "Oops",
          description: "No room ID was provided",
          buttonLabel: "OK",
          isLoadingWindow: false,
        });
      }

      if (serverStatus !== 200) return;
      // if (roomId) {
      //   try {
      //     const { data } = await Axios.get(
      //       `${serverUrl}/validateuser/${roomId}`
      //     );

      //     switch (data.queryStatus) {
      //       case 200:
      //         console.log(data.message);
      //         break;
      //       default:
      //         switch (data.errors[0].message) {
      //           case "UNKNOWN_ROOM":
      //             navigate("/");
      //             openPopup({
      //               title: "Oops",
      //               description:
      //                 "I'm sorry, but we couldn't find a room with this ID",
      //               buttonLabel: "OK",
      //               isLoadingWindow: false,
      //             });
      //             break;
      //           case "INVALID_USER":
      //             navigate(`join?id=${roomId}`);
      //             openPopup({
      //               title: "Hold on",
      //               description:
      //                 "It looks like you're not in this room yet, but don't worry, you can still join! We redirected you to the join page",
      //               buttonLabel: "Got it",
      //               isLoadingWindow: false,
      //             });
      //             break;
      //           default:
      //             navigate("/");
      //             openPopup({
      //               title: "Oops",
      //               description: `Sorry, an internal server error occured: ${data.errors[0].message}`,
      //               buttonLabel: "OK",
      //               isLoadingWindow: false,
      //             });
      //         }
      //     }
      //   } catch (err) {
      //     openPopup({
      //       title: "Oops",
      //       description: `Sorry, an internal server error occured. ${err}`,
      //       buttonLabel: "OK",
      //       isLoadingWindow: false,
      //     });
      //   }
      //   return;
      // }

      if (userData?.nick === "" || !userData?.nick) {
        navigate("/");
      }
    };
    checkIfUserCanAccessTheChat();
  }, [
    openPopup,
    roomId,
    template,
    serverStatus,
    serverUrl,
    navigate,
    userData,
  ]);

  const [messageInputValue, setMessageInputValue] = useState("");
  const randomNumber = () => {
    return Math.floor(Math.random() * 999999 - 100000);
  };
  const [messages, setMessages] = useState<IMessage["messages"]>([
    {
      id: randomNumber(),
      nick: "BOT",
      color: "white",
      pfp: "https://static.thenounproject.com/png/415507-200.png",
      content: "I'm the TS Bot, have fun in your chat room!",
    },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMessageInputValue(value);
  };

  const handleSendButtonClick = () => {
    if (messageInputValue === "") return;
    setMessages([
      ...messages,
      {
        id: randomNumber(),
        nick: userData.nick,
        color: userData.color,
        pfp: "https://www.fiscalti.com.br/wp-content/uploads/2021/02/default-user-image.png",
        content: messageInputValue,
      },
    ]);
    setMessageInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    handleSendButtonClick();
  };

  const handleLeaveButtonClick = () => {
    setUserData({
      nick: "",
      color: "white",
    });
    navigate("/");
  };

  return (
    <MainWrapper>
      <ChatContainer>
        <ChatTopContainer>
          <p>
            Room ID: <span style={{ color: "forestgreen" }}>Online</span>
          </p>
          <button onClick={handleLeaveButtonClick}>Leave</button>
        </ChatTopContainer>
        <ChatContent messages={messages} />
        <ChatBottomContainer>
          <input
            onKeyPress={handleKeyPress}
            onChange={handleInputChange}
            value={messageInputValue}
            placeholder="Type your message here..."
          />
          <button onClick={handleSendButtonClick}>
            <IoSendSharp />
          </button>
        </ChatBottomContainer>
      </ChatContainer>
    </MainWrapper>
  );
};

export default Chat;
