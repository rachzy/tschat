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
  const [searchParams] = useSearchParams(window.location.search);

  const [isLoaded, setIsLoaded] = useState(false);

  const { serverUrl, serverStatus } = useContext(GlobalServerContext);

  const [roomId, template] = [
    searchParams.get("id"),
    searchParams.get("template"),
  ];

  useEffect(() => {
    if (!isLoaded || serverStatus === 0) return;
    const checkIfUserCanAccessTheChat = async () => {
      if (!roomId && !template) {
        console.log("No params");
        navigate("/");
        return openPopup({
          title: "Oops",
          description: "No room ID was provided",
          buttonLabel: "OK",
          isLoadingWindow: false,
        });
      }

      if (roomId) {
        if (serverStatus !== 200) return navigate("/chat?template");

        try {
          const { data } = await Axios.get(
            `${serverUrl}/validateuser/${roomId}`,
            { withCredentials: true }
          );

          if (data.queryStatus !== 200) {
            switch (data.errors[0].message) {
              case "UNKNOWN_ROOM":
                navigate("/");
                openPopup({
                  title: "Oops",
                  description:
                    "I'm sorry, but we couldn't find a room with this ID",
                  buttonLabel: "OK",
                  isLoadingWindow: false,
                });
                break;
              case "INVALID_USER":
                navigate(`/join?id=${roomId}`);
                openPopup({
                  title: "Hold on",
                  description:
                    "It looks like you're not in this room yet, but don't worry, you can still join! We redirected you to the join page",
                  buttonLabel: "Got it",
                  isLoadingWindow: false,
                });
                break;
              default:
                navigate("/");
                openPopup({
                  title: "Oops",
                  description: `Sorry, an internal server error occured: ${data.errors[0].message}`,
                  buttonLabel: "OK",
                  isLoadingWindow: false,
                });
            }
          }
        } catch (err) {
          openPopup({
            title: "Oops",
            description: `Sorry, an internal server error occured. ${err}`,
            buttonLabel: "OK",
            isLoadingWindow: false,
          });
        }
        return;
      }

      if (userData?.nick === "" || !userData?.nick) {
        navigate("/");
      }
    };
    checkIfUserCanAccessTheChat();
  }, [
    isLoaded,
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
  const [messages, setMessages] = useState<IMessage["messages"]>([]);

  useEffect(() => {
    if(serverStatus !== 200) return;
    const fetchMessages = async () => {
      try {
        const { data } = await Axios.get(`${serverUrl}/getmessages/${roomId}`, {
          withCredentials: true,
        });

        switch (data.queryStatus) {
          case 200:
            const { messages } = data.result;
            setMessages(messages);
            break;
          default:
            switch (data.errors[0].message) {
              case "NOT_ALLOWED":
                openPopup({
                  title: "Oops",
                  description:
                    "You're not allowed to see the messages of this room since you're not a member of it",
                  isLoadingWindow: false,
                  buttonLabel: "OK",
                });
                navigate(`/join?id=${roomId}`);
                break;
              default:
                openPopup({
                  title: "Oops",
                  description: `An error occured while trying to fetch the messages: ${data.errors[0].message}`,
                  isLoadingWindow: false,
                  buttonLabel: "OK",
                });
            }
        }
      } catch (err) {
        openPopup({
          title: "Oops",
          description: `Sorry, an internal server error occurred. ${err}`,
          isLoadingWindow: false,
          buttonLabel: "OK",
        });
      }
    };
    fetchMessages();
  }, [isLoaded, navigate, openPopup, roomId, serverStatus, serverUrl]);

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
        pfp: "default.png",
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
      <ChatContainer setIsLoaded={setIsLoaded}>
        <ChatTopContainer>
          <p>
            Room ID: <span style={{ color: "forestgreen" }}>{roomId}</span>
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
