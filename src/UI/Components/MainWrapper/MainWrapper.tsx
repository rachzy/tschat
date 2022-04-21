import React from "react";
import "./MainWrapper.css";

interface IProp {
  children: React.ReactNode;
}

const MainWrapper: React.FC<IProp> = ({ children }) => {
  return <div className="main-wrapper">{children}</div>;
};

export default MainWrapper;
