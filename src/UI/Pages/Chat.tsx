import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainWrapper from "../Components/MainWrapper/MainWrapper";
import ChatContainer from "../Components/ChatContainer/ChatContainer";
import ChatTopContainer from "../Components/ChatTopContainer/ChatTopContainer";
import ChatBottomContainer from "../Components/ChatBottomContainer/ChatBottomContainer";

import { IState as IProp, colors } from "../../App";
import ChatContent from "../Components/ChatContent/ChatContent";

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

const Chat: React.FC<IProp> = ({ userData, setUserData }) => {
  const navigate = useNavigate();

  useEffect(() => {
      if (userData?.nick === "" || !userData?.nick) {
        navigate("/");
      }
  }, [navigate, userData])

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
            Status: <span style={{ color: "forestgreen" }}>Online</span>
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
          <button onClick={handleSendButtonClick}>Send</button>
        </ChatBottomContainer>
      </ChatContainer>
    </MainWrapper>
  );
};

export default Chat;
