import React from "react";
import "./ChatContent.css";

import { IState as IProp } from "../../Pages/Chat";

const ChatContent: React.FC<IProp["message"]> = ({ messages }) => {
  const renderMessages = () => {
    return messages.map((message) => {
      return (
        <div key={message.id} className="message">
          <img src={message.pfp} alt="user-pfp" />
          <div className="message-text">
            <p className="message-nick">
              <span style={{ color: message.color }}>{message.nick}</span>
            </p>
            <p className="message-content">{message.content}</p>
          </div>
        </div>
      );
    });
  };
  return <div className="chat-content">{renderMessages()}</div>;
};

export default ChatContent;
