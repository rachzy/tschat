import React from "react";
import "./MainContainer.css";

interface IProp {
  children?: React.ReactNode;
}

const MainContainer: React.FC<IProp> = ({ children }) => {
  return <div className="main-container">{children}</div>;
};

export default MainContainer;
