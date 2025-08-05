import { useState, useEffect } from "react";

interface NoticePopupProps {
  message: string;
}

export const NoticePopup = ({
  message,
}: NoticePopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [canClose, setCanClose] = useState(false);
  
  useEffect(() => {
    // Show notice on every page refresh
    setIsVisible(true);
    
    // Set timer to allow closing after exactly 5 seconds
    const timer = setTimeout(() => {
      setCanClose(true);
    }, 5000); // Hardcoded to exactly 5 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  // Function to format message with WhatsApp link
  const formatMessageWithLink = (text: string) => {
    const whatsappUrl = "https://wa.me/message/O5LMYSSX2PHSI1";
    // Split the text by "WhatsApp" to create parts for rendering
    const parts = text.split("WhatsApp");
    
    if (parts.length === 1) {
      // "WhatsApp" not found in the text
      return <span>{text}</span>;
    }
    
    return (
      <>
        {parts[0]}
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium underline hover:text-blue-800"
        >
          WhatsApp
        </a>
        {parts.slice(1).join("WhatsApp")}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-w-md w-full mx-4 p-6 bg-yellow-300 text-black rounded-lg shadow-lg">
        <div className="mb-6 whitespace-pre-line">
          {formatMessageWithLink(message)}
        </div>
        {canClose && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-md transition-colors"
              aria-label="Close notice"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticePopup;