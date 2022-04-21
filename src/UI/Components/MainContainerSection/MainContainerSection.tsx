import React from "react";
import "./MainContainerSection.css";

interface IProp {
    children: React.ReactNode
}

const MainContainerSection: React.FC<IProp> = ({children}) => {
    return(
        <div className="main-container-section">
            {children}
        </div>
    )
}

export default MainContainerSection;