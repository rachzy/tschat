import React from "react";
import "./ChatBottomContainer.css";

interface IProp {
    children: React.ReactNode
}

const ChatBottomContainer: React.FC<IProp> = ({children}) => {
    return(
        <div className="chat-bottom-container">
            {children}
        </div>
    )
}

export default ChatBottomContainer;