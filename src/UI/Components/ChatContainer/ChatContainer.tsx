import React from "react";
import "./ChatContainer.css";

interface IProp {
  children: React.ReactNode;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContainer: React.FC<IProp> = ({ children, setIsLoaded }) => {
  return (
    <div
      onLoad={() => {
        setIsLoaded(true);
      }}
      className="chat-container"
    >
      {children}
    </div>
  );
};

export default ChatContainer;
