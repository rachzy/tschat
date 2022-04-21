import React from "react";
import "./ChatContainer.css";

interface IProp {
  children: React.ReactNode;
}

const ChatContainer: React.FC<IProp> = ({ children }) => {
  return <div className="chat-container">{children}</div>;
};

export default ChatContainer;
