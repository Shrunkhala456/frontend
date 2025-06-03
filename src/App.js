import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import FileUploader from './components/FileUploader';
import './App.css'; // बेसिक CSS के लिए

function App() {
  const [messages, setMessages] = useState([]);
  const [currentChatUser] = useState('Shrunkhala'); // मान लीजिए आप इस user से बात कर रहे हैं

  const handleSendMessage = (text) => {
    if (text.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'You', // आप भेज रहे हैं
        text: text,
        type: 'text',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      // यहाँ आपको बैक-एंड को मैसेज भेजने का लॉजिक जोड़ना होगा (WebSockets)
    }
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newFileMessage = {
        id: messages.length + 1,
        sender: 'You',
        text: file.name,
        type: file.type.startsWith('image') ? 'image' : 'file', // इमेज या अन्य फ़ाइल
        url: e.target.result, // या सर्वर से प्राप्त URL
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, newFileMessage]);
      // यहाँ आपको बैक-एंड पर फ़ाइल अपलोड करने का लॉजिक जोड़ना होगा
    };
    reader.readAsDataURL(file); // फ़ाइल को डेटा URL के रूप में पढ़ें (केवल डेमो के लिए)
  };

  return (
    <div className="app-container">
      <div className="chat-header">
        <h2>Chat with {currentChatUser}</h2>
      </div>
      <ChatWindow messages={messages} />
      <div className="chat-footer">
        <FileUploader onFileUpload={handleFileUpload} />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

export default App;