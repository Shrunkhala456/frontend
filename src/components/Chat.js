// import React, { useState, useEffect, useRef } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios';
// import './Chat.css'; // For styling

// // Connect to your backend Socket.IO server
// const socket = io('http://localhost:5000');

// function Chat({ currentUser }) {
//     const [users, setUsers] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null); // The user you're chatting with
//     const [messageInput, setMessageInput] = useState('');
//     const [messages, setMessages] = useState([]);
//     const [file, setFile] = useState(null);
//     const messagesEndRef = useRef(null); // For auto-scrolling to the bottom of messages

//     const API_BASE_URL = 'http://localhost:5000';

//     useEffect(() => {
//         if (currentUser) {
//             // Join a specific Socket.IO room for the current user's ID
//             // This allows the server to send messages directly to this user's client
//             socket.emit('join_chat', currentUser.id);

//             // Fetch all registered users to display in the sidebar
//             axios.get(`${API_BASE_URL}/users`)
//                 .then(response => {
//                     // Filter out the current user from the list to avoid chatting with self
//                     setUsers(response.data.filter(user => user.id !== currentUser.id));
//                 })
//                 .catch(error => console.error('Error fetching users:', error));

//             // Listen for incoming messages from the Socket.IO server
//             socket.on('receive_message', (message) => {
//                 console.log('Received message:', message);
//                 // Only add message if it's relevant to the current chat window
//                 // A message is relevant if:
//                 // 1. Current user is the sender AND selected user is the receiver
//                 // 2. Selected user is the sender AND current user is the receiver
//                 if (
//                     (message.sender_id === currentUser.id && message.receiver_id === selectedUser?.id) ||
//                     (message.sender_id === selectedUser?.id && message.receiver_id === currentUser.id)
//                 ) {
//                     setMessages((prevMessages) => {
//                         // Prevent duplicate messages if Socket.IO somehow delivers them multiple times
//                         // (though with proper setup, this is less likely)
//                         const exists = prevMessages.some(msg => msg.id === message.id);
//                         return exists ? prevMessages : [...prevMessages, message];
//                     });
//                 }
//             });

//             // Cleanup function for Socket.IO event listener
//             return () => {
//                 socket.off('receive_message');
//             };
//         }
//     }, [currentUser, selectedUser]); // Re-run if currentUser or selectedUser changes

//     // Effect to scroll to the bottom of the messages display whenever messages update
//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     // Function to fetch historical messages between two users
//     const fetchMessages = async (userId1, userId2) => {
//         if (!userId1 || !userId2) return;
//         try {
//             const response = await axios.get(`${API_BASE_URL}/messages/${userId1}/${userId2}`);
//             setMessages(response.data);
//         } catch (error) {
//             console.error('Error fetching message history:', error);
//             setMessages([]); // Clear messages on error
//         }
//     };

//     // Handler when a user is selected from the sidebar
//     const handleUserSelect = (user) => {
//         setSelectedUser(user);
//         setMessages([]); // Clear previous chat history when a new chat is selected
//         fetchMessages(currentUser.id, user.id); // Fetch new history
//     };

//     // Handler for sending text messages
//     const sendMessage = (e) => {
//         e.preventDefault(); // Prevent default form submission behavior
//         if (messageInput.trim() && selectedUser) { // Ensure message is not empty and a user is selected
//             const messageData = {
//                 senderId: currentUser.id,
//                 receiverId: selectedUser.id,
//                 messageContent: messageInput.trim(),
//             };
//             socket.emit('send_message', messageData); // Emit the message to the server via Socket.IO
//             setMessageInput(''); // Clear the message input field
//         }
//     };

//     // Handler for when a file is selected using the input type="file"
//     const handleFileChange = (e) => {
//         setFile(e.target.files[0]); // Store the selected file object
//     };

//     // Handler for uploading files
//     const uploadFile = async () => {
//         if (!file || !selectedUser) {
//             alert('Please select a file and a user to send to.');
//             return;
//         }

//         const formData = new FormData(); // FormData is required for file uploads
//         formData.append('file', file);
//         formData.append('senderId', currentUser.id);
//         formData.append('receiverId', selectedUser.id);
//         // Determine message type based on file type
//         formData.append('messageType', file.type.startsWith('image/') ? 'image' : 'document');
//         // You could also add a message content/caption here if desired
//         // formData.append('messageContent', 'Optional file caption');

//         try {
//             // Send the file to the backend's /upload endpoint
//             await axios.post(`${API_BASE_URL}/upload`, formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data', // Important for file uploads
//                 },
//             });
//             setFile(null); // Clear the file state
//             // Reset the file input visually (important for sending same file again)
//             if (document.getElementById('file-input')) {
//                 document.getElementById('file-input').value = null;
//             }
//             // The new message will be received via socket.io, so no need to manually add to state here
//         } catch (error) {
//             console.error('Error uploading file:', error);
//             alert('Failed to upload file.');
//         }
//     };

//     // If no user is logged in, prompt them to log in
//     if (!currentUser) {
//         return <p>Please log in to use the chat.</p>;
//     }

//     return (
//         <div className="chat-container">
//             {/* Users List Sidebar */}
//             <div className="users-list">
//                 <h3>Users</h3>
//                 <ul>
//                     {/* Map through the list of users to display them */}
//                     {users.map((user) => (
//                         <li
//                             key={user.id}
//                             onClick={() => handleUserSelect(user)}
//                             // Apply 'selected' class if this user is currently selected
//                             className={selectedUser?.id === user.id ? 'selected' : ''}
//                         >
//                             {user.username}
//                         </li>
//                     ))}
//                 </ul>
//             </div>

//             {/* Chat Window */}
//             <div className="chat-window">
//                 {selectedUser ? (
//                     <>
//                         {/* Display the name of the selected user */}
//                         <h3>Chat with {selectedUser.username}</h3>

//                         {/* Messages Display Area */}
//                         <div className="messages-display">
//                             {messages.map((msg) => (
//                                 <div
//                                     key={msg.id}
//                                     // Apply 'sent' or 'received' class based on sender
//                                     className={`message ${msg.sender_id === currentUser.id ? 'sent' : 'received'}`}
//                                 >
//                                     {/* Display sender's username */}
//                                     <strong>
//                                         {msg.sender_id === currentUser.id ? 'You' : msg.sender_username || 'Unknown User'}:
//                                     </strong>

//                                     {/* Conditionally render message content based on type */}
//                                     {msg.message_type === 'text' && <p>{msg.content}</p>}

//                                     {msg.message_type === 'image' && msg.file_path && (
//                                         <img
//                                             src={`${API_BASE_URL}${msg.file_path}`}
//                                             alt={msg.file_name || 'Uploaded Image'}
//                                             style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
//                                         />
//                                     )}

//                                     {msg.message_type === 'document' && msg.file_path && (
//                                         <a href={`${API_BASE_URL}${msg.file_path}`} target="_blank" rel="noopener noreferrer">
//                                             📄 {msg.file_name || 'Uploaded Document'}
//                                         </a>
//                                     )}

//                                     {/* Optional: Display text content (caption) for files if it exists */}
//                                     {msg.content && msg.message_type !== 'text' && <p>{msg.content}</p>}

//                                     {/* Message Timestamp */}
//                                     <span className="timestamp">
//                                         {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                     </span>
//                                 </div>
//                             ))}
//                             {/* Dummy div for auto-scrolling to the bottom */}
//                             <div ref={messagesEndRef} />
//                         </div>

//                         {/* Message Input Form */}
//                         <form onSubmit={sendMessage} className="message-input-form">
//                             <input
//                                 type="text"
//                                 placeholder="Type a message..."
//                                 value={messageInput}
//                                 onChange={(e) => setMessageInput(e.target.value)}
//                                 disabled={!selectedUser} // Disable if no user is selected
//                             />
//                             <button type="submit" disabled={!selectedUser || !messageInput.trim()}>
//                                 Send Text
//                             </button>

//                             {/* File Upload Input */}
//                             <label htmlFor="file-input">
//                                 Attach File
//                             </label>
//                             <input
//                                 type="file"
//                                 id="file-input"
//                                 onChange={handleFileChange}
//                                 disabled={!selectedUser}
//                             />
//                             {/* Display selected file name */}
//                             {file && <span style={{ marginLeft: '10px', fontSize: '0.9em' }}>{file.name}</span>}

//                             <button type="button" onClick={uploadFile} disabled={!selectedUser || !file}>
//                                 Send File
//                             </button>
//                         </form>
//                     </>
//                 ) : (
//                     // Message when no user is selected
//                     <p className="select-user-prompt">Select a user from the left to start chatting.</p>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default Chat;




import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sender, setSender] = useState('Alice');
  const [receiver, setReceiver] = useState('Bob');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const res = await axios.get('http://localhost:5000/messages');
    setMessages(res.data);
  };

  const handleSend = async () => {
    const formData = new FormData();
    formData.append('sender', sender);
    formData.append('receiver', receiver);
    formData.append('message', inputMsg);
    if (file) formData.append('file', file);

    await axios.post('http://localhost:5000/send', formData);
    setInputMsg('');
    setFile(null);
    fetchMessages();
  };

  return (
    <div>
      <div>
        <label>Sender: </label>
        <input value={sender} onChange={(e) => setSender(e.target.value)} />
        <label>Receiver: </label>
        <input value={receiver} onChange={(e) => setReceiver(e.target.value)} />
      </div>

      <div>
        <input
          type="text"
          placeholder="Enter message"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleSend}>Send</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ border: '1px solid gray', padding: '5px', marginBottom: '5px' }}>
            <strong>{msg.sender} ➡ {msg.receiver}</strong>: {msg.message}
            {msg.file_path && (
              <div>
                📎 <a href={`http://localhost:5000/uploads/${msg.file_path}`} target="_blank" rel="noreferrer">
                  {msg.file_path}
                </a>
              </div>
            )}
            <div style={{ fontSize: '0.8em', color: 'gray' }}>{msg.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Chat;




