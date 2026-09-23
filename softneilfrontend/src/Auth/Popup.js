import React from "react";
import "./Popup.css";

function Popup({ show, title, message, onClose, onConfirm, isConfirm }) {
  if (!show) return null;

  // Close popup if user clicks on the darkened overlay
  const handleOverlayClick = (e) => {
    if (e.target.className === "popup-overlay") onClose();
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-box">
        {/* Optional Icon/Visual Element */}
        <div className={`popup-icon ${isConfirm ? "warning" : "info"}`}>
          {isConfirm ? "!" : "i"}
        </div>
        
        {title && <h2 className="popup-title">{title}</h2>}
        <p className="popup-message">{message}</p>
        
        <div className="popup-actions">
          {isConfirm ? (
            <>
              <button className="popup-btn cancel" onClick={onClose}>
                Cancel
              </button>
              <button className="popup-btn confirm" onClick={onConfirm}>
                Confirm
              </button>
            </>
          ) : (
            <button className="popup-btn primary" onClick={onClose}>
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Popup;