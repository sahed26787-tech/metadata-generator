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
  const defaultNotice = `Recraft-এর পার্সোনাল অ্যাকাউন্টে (1250 ক্রেডিট) এখন 
 মাত্র 230 টাকায়। ✅ 
 তাই, প্রতারণার হাত থেকে রক্ষা পেতে বিশ্বস্ত স্থান থেকেই 
 সাবস্ক্রিপশন নিন। 🌸 
 যোগাযোগ করুন WhatsApp-এ। ☎️`;
  
  useEffect(() => {
    // Show notice on every page refresh
    setIsVisible(true);
    
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
          if (line.includes("WhatsApp-এ। ☎️")) {
            const whatsappText = "WhatsApp-এ। ☎️";
            const parts = line.split(whatsappText);
            return (
              <p key={index} className="mb-2 last:mb-0">
                {parts[0]}
                <a
                  href="https://wa.me/message/O5LMYSSX2PHSI1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline text-blue-700 hover:text-blue-800"
                >
                  WhatsApp-এ। ☎️
                </a>
                {parts[1]}
              </p>
            );
          }
          return <p key={index} className="mb-2 last:mb-0">{line}</p>;
        })}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-w-md w-full mx-4 p-6 bg-yellow-300 text-black rounded-lg shadow-lg">
        <div className="mb-6 text-center">
          {formatNoticeContent()}
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={handleClose}
            disabled={!canClose}
            className={`px-6 py-2 bg-gray-800 text-white font-medium rounded-md transition-colors 
              ${canClose ? "hover:bg-gray-700" : "opacity-50 cursor-not-allowed"}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticePopup;