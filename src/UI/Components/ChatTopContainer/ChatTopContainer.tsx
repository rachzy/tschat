import React from "react";
import "./ChatTopContainer.css";

interface IProp {
    children: React.ReactNode
}

const ChatTopContainer: React.FC<IProp> = ({children}) => {
    return(
        <div className="chat-top-container">
            {children}
        </div>
    );
}

export default ChatTopContainer;