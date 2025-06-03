import React from 'react';
import Message from './Message';
import './ChatWindow.css';

function ChatWindow({ messages }) {
  // स्क्रॉल करने के लिए ref
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]); // मैसेजेस बदलने पर स्क्रॉल करें

  return (
    <div className="chat-window">
      <div className="message-list">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} /> {/* स्क्रॉलिंग के लिए */}
      </div>
    </div>
  );
}

export default ChatWindow;