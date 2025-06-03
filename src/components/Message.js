import React from 'react';
import './Message.css';

function Message({ message }) {
  const isSender = message.sender === 'You'; // मैसेज भेजने वाले के आधार पर स्टाइलिंग

  return (
    <div className={`message ${isSender ? 'sent' : 'received'}`}>
      <div className="message-content">
        {message.type === 'text' && <p>{message.text}</p>}
        {message.type === 'image' && (
          <div>
            <img src={message.url} alt={message.text} className="message-image" />
            <p className="image-caption">{message.text}</p>
          </div>
        )}
        {message.type === 'file' && (
          <div className="file-attachment">
            <a href={message.url} target="_blank" rel="noopener noreferrer">
              📄 {message.text}
            </a>
          </div>
        )}
        <span className="timestamp">{message.timestamp}</span>
      </div>
    </div>
  );
}

export default Message;