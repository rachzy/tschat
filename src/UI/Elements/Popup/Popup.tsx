import React, { MutableRefObject, useEffect, useRef } from "react";
import "./Popup.css";

import { IPopupState } from "../../../App";
import Loader from "../Loader/Loader";

interface IProp {
  popupState: IPopupState;
  setPopupState: React.Dispatch<React.SetStateAction<IPopupState>>;
}

const Popup: React.FC<IProp> = ({ popupState, setPopupState }) => {
  const popup = useRef() as MutableRefObject<HTMLDivElement>;
  const popupWindow = useRef() as MutableRefObject<HTMLDivElement>;

  const openPopup = () => {
    popup.current.style.display = "flex";

    setTimeout(() => {
      popup.current.classList.add("active");
      popupWindow.current.classList.add("active");
    }, 200);
  };

  const closePopup = () => {
    popup.current.classList.remove("active");
    popupWindow.current.classList.remove("active");

    setTimeout(() => {
      popup.current.style.display = "none";
    }, 200);
  };

  useEffect(() => {
    if (popupState.enabled) {
      return openPopup();
    }
    closePopup();
  }, [popupState]);

  const renderPopupWindow = () => {
    if (popupState.isLoadingWindow) {
      return (
        <div ref={popupWindow} className="popup-window">
          <h1>{popupState.title}</h1>
          <p>{popupState.description}</p>
          <Loader />
        </div>
      );
    }
    return (
      <div ref={popupWindow} className="popup-window">
        <h1>{popupState.title}</h1>
        <p>{popupState.description}</p>
        <button onClick={closePopup}>{popupState.buttonLabel}</button>
      </div>
    );
  };

  return (
    <div ref={popup} className="popup">
      {renderPopupWindow()}
    </div>
  );
};

export default Popup;
