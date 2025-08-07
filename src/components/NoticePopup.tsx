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
  const defaultNotice = `আসসালামু আলাইকুম!

Google এখন তাদের ফ্রি Gemini API-র লিমিট আগের তুলনায় অনেক কমিয়ে দিয়েছে। যার ফলে অনেক সময় মেটাডাটা ঠিকভাবে জেনারেট হচ্ছে না।

এই সমস্যার স্থায়ী সমাধান হিসেবে আমরা এখন একটি পেইড API ব্যবহার করছি। ফলে এখন আর ম্যানুয়ালি API কী বসানো বা বারবার পরিবর্তনের কোনো ঝামেলা থাকবে না — সবকিছুই স্বয়ংক্রিয়ভাবে কাজ করবে।

তবে যেহেতু এই পেইড API ব্যবহারে আমাদের খরচ বেড়েছে, তাই আমাদের সাইটটি বেশি বেশি প্রমোট করার অনুরোধ রইল — যেন আমরা সকল ব্যবহারকারীদের জন্য খরচ সর্বনিম্ন পর্যায়ে রাখতে পারি।

নতুন সাইটটি আপনি ৩ দিন ফ্রি-তে ব্যবহার করে দেখতে পারবেন। (আনলিমিটেড )`;
  
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

  // Function to format the notice with red text for the specified part
  const formatNoticeWithRedText = () => {
    if (message) return message;
    
    const redTextPart = "📌 বিঃদ্রঃ এই বর্তমান সাইটটি ৩ দিনের জন্য বন্ধ থাকবে। এরপর আপনি নতুন সাইটে সাবস্ক্রিপশন নিতে পারবেন অথবা চাইলে এই সাইটেই থাকতে পারবেন।";
    
    const noticeWithRedText = (
      <>
        {defaultNotice.split("\n\n").map((paragraph, index) => (
          <p key={index} className="mb-3">
            {paragraph}
          </p>
        ))}
        <p className="mb-3 text-red-600 font-medium">
          {redTextPart}
        </p>
      </>
    );
    
    return noticeWithRedText;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-w-md w-full mx-4 p-6 bg-white text-black rounded-lg shadow-lg">
        <div className="mb-6">
          {formatNoticeWithRedText()}
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