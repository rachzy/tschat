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

  const [user, setUser] = useState(userData);

  const [messageInputValue, setMessageInputValue] = useState("");

  const [messages, setMessages] = useState<IMessage["messages"]>([]);

  useEffect(() => {
    if (!isLoaded || serverStatus !== 200) return;
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

    const checkIfUserCanAccessTheChat = async () => {
      if (!roomId && !template) {
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

          switch (data.queryStatus) {
            case 200:
              setUser(data.result.userData);
              fetchMessages();
              break;
            default:
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMessageInputValue(value);
  };

  const handleSendButtonClick = () => {
    if (messageInputValue === "") return;
    const postMessage = async () => {
      if (serverStatus !== 200) {
        const randomNumber = () => {
          return Math.floor(Math.random() * 999999 - 100000);
        };

        setMessages([
          ...messages,
          {
            id: randomNumber(),
            nick: user.nick,
            color: user.color,
            pfp: "default.png",
            content: messageInputValue,
          },
        ]);
        return setMessageInputValue("");
      }

      try {
        const { data } = await Axios.post(
          `${serverUrl}/postmessage`,
          {
            roomId: roomId,
            content: messageInputValue,
          },
          { withCredentials: true }
        );

        switch (data.queryStatus) {
          case 200:
            return setMessageInputValue("");
          default:
            switch (data.errors[0].message) {
              case "UNKNOWN_ROOM":
                navigate("/");
                openPopup({
                  title: "Oops",
                  description:
                    "It looks like this room doesn't exist or it was deleted. We redirected you to the main page",
                  isLoadingWindow: false,
                  buttonLabel: "OK",
                });
                break;
              case "INVALID_USER":
                navigate(`/join?id=${roomId}`);
                openPopup({
                  title: "Oops",
                  description:
                    "It looks like you're not a member in this room, but don't worry, you can still join on it",
                  isLoadingWindow: false,
                  buttonLabel: "OK",
                });
                break;
              default:
                openPopup({
                  title: "Oops",
                  description: `Sorry, an error occured while trying to send your message: ${data.errors[0].message}`,
                  isLoadingWindow: false,
                  buttonLabel: "OK",
                });
            }
        }
      } catch (err) {
        return openPopup({
          title: "Oops",
          description: `Sorry, an error occurred while trying to send your message. ${err}`,
          isLoadingWindow: false,
          buttonLabel: "OK",
        });
      }
    };
    postMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    handleSendButtonClick();
  };

  const handleLeaveButtonClick = () => {
    if (user.isHost) {
      const deleteRoom = async () => {
        if (serverStatus !== 200) return navigate("/");

        try {
          const { data } = await Axios.delete(
            `${serverUrl}/deleteroom/${roomId}`,
            { withCredentials: true }
          );

          switch (data.queryStatus) {
            case 200:
              navigate("/");
              openPopup({
                title: "Done!",
                description: "Your room was successfully deleted",
                isLoadingWindow: false,
                buttonLabel: "OK",
              });
              break;
            default:
              openPopup({
                title: "Oops",
                description: `An error ocurred while trying to delete your room: ${data.errors[0].message}`,
                isLoadingWindow: false,
                buttonLabel: "OK",
              });
          }
        } catch (err) {
          openPopup({
            title: "Oops",
            description: `Sorry, an internal server error occurred while trying to delete your room. ${err}`,
            isLoadingWindow: false,
            buttonLabel: "OK",
          });
        }
      };

      openPopup({
        title: "Be careful",
        description: "Are you sure you wanna delete this room?",
        isLoadingWindow: false,
        isConfirmation: {
          firstButtonLabel: "Yep, go ahead",
          secondButtonLabel: "Nah, never mind",
          afterFunction: deleteRoom,
          enabled: true,
        },
      });
    }
  };

  const leaveButtonLabel = () => {
    if (user.isHost) {
      return "Delete Room";
    }
    return "Leave";
  };

  return (
    <MainWrapper>
      <ChatContainer setIsLoaded={setIsLoaded}>
        <ChatTopContainer>
          <p>
            Room ID: <span style={{ color: "forestgreen" }}>{roomId}</span>
          </p>
          <button onClick={handleLeaveButtonClick}>{leaveButtonLabel()}</button>
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
