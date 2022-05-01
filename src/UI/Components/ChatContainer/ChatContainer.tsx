import React, { useEffect } from "react";
import "./ChatContainer.css";

interface IProp {
  children: React.ReactNode;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContainer: React.FC<IProp> = ({ children, setIsLoaded }) => {
  useEffect(() => {
    setIsLoaded(true);
  }, [setIsLoaded]);
  return <div className="chat-container">{children}</div>;
};

export default ChatContainer;
