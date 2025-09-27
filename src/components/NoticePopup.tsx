import { useState, useEffect } from "react";

interface NoticePopupProps {
  message?: string;
}

export const NoticePopup = ({
  message,
}: NoticePopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [canClose, setCanClose] = useState(false);
  
  // Default notice text
  const defaultNotice = `আপরার প্রয়োজন অনুযায়ী যেকোনো ধরনের ওয়েবসাইট তৈরির জন্য, 
 যোগাযোগ করুন WhatsApp-এ।`;
  
  useEffect(() => {
    // Show notice on every page refresh
    // setIsVisible(true);
    
    // Make close button instantly available
    setCanClose(true);
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

  // Function to format the notice content
  const formatNoticeContent = () => {
    const noticeText = message || defaultNotice;
    const lines = noticeText.split('\n');

    return (
      <>
        {lines.map((line, index) => {
          // Check if the line contains "WhatsApp-এ।" and format it with a link
          if (line.includes("WhatsApp-এ।")) {
            const whatsappText = "WhatsApp-এ।";
            const parts = line.split(whatsappText);
            return (
              <p key={index} className="mb-2 last:mb-0 text-gray-800">
                {parts[0]}
                <a
                  href="https://wa.me/8801335556641"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline text-blue-700 hover:text-blue-800"
                >
                  WhatsApp-এ।
                </a>
                {parts[1]}
              </p>
            );
          }
          return <p key={index} className="mb-2 last:mb-0 text-gray-800">{line}</p>;
        })}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-w-md w-full mx-4 p-6 bg-white text-gray-800 rounded-lg shadow-md border border-gray-200">
        <div className="mb-6 text-center text-gray-800">
          {formatNoticeContent()}
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={handleClose}
            disabled={!canClose}
            className={`px-6 py-2 bg-black text-white font-medium rounded-md transition-colors 
              ${canClose ? "hover:bg-gray-800" : "opacity-50 cursor-not-allowed"}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticePopup;