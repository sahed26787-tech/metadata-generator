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
  const defaultNotice = `ওয়ালাইকুম আসসালাম!
Google এখন তাদের ফ্রি Gemini API-র লিমিট আগের তুলনায় অনেক কমিয়ে দিয়েছে। যার কারণে অনেক সময় মেটাডাটা ঠিকভাবে জেনারেট হচ্ছে না।

এই সমস্যার সমাধান হিসেবে আমরা এখন একটি পেইড API কিনেছি। অর্থাৎ, এখন থেকে আর ম্যানুয়ালি API কী বসানোর দরকার হবে না, এবং বারবার API কী পরিবর্তনের ঝামেলাও থাকবে না।

যেহেতু এই পেইড API ব্যবহারের জন্য আমাদের খরচ হচ্ছে, তাই আমাদের সাইটটি বেশি বেশি প্রমোট করুন — যেন আমরা মাসিক খরচ সব ব্যবহারকারীদের জন্য কম রাখতে পারি।

নতুন সাইটটি আপনি ৩ দিন সম্পূর্ণ ফ্রি-তে ব্যবহার করতে পারবেন।`;
  
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
      <div className="relative max-w-md w-full mx-4 p-6 bg-white text-black rounded-lg shadow-lg">
        <div className="mb-6 whitespace-pre-line">
          {message || defaultNotice}
        </div>
        
        <div className="flex justify-center gap-4">
          <a 
            href="https://pixcraftai.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors animate-pulse hover:animate-none"
          >
            New site
          </a>
          <a 
            href="https://wa.me/message/O5LMYSSX2PHSI1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default NoticePopup;