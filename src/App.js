import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css'; // For basic styling

const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_SERVER_URL = 'http://localhost:5000';

function App() {
    const [currentUser, setCurrentUser] = useState(null); // { id: 1, username: 'Alice' }
    const [selectedUser, setSelectedUser] = useState(null); // The user you're chatting with
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [file, setFile] = useState(null);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const messagesEndRef = useRef(null);

    const socket = useRef(null);

    useEffect(() => {
        // Fetch users for selection
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users`);
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (currentUser && !socket.current) {
            socket.current = io(SOCKET_SERVER_URL);

            socket.current.on('connect', () => {
                console.log('Connected to Socket.IO server');
                socket.current.emit('register_user', currentUser.id);
            });

            socket.current.on('receive_message', (newMessage) => {
                console.log('Received message:', newMessage);
                // Only add if it's relevant to the current chat
                if (
                    (newMessage.sender_id === currentUser.id && newMessage.receiver_id === selectedUser?.id) ||
                    (newMessage.sender_id === selectedUser?.id && newMessage.receiver_id === currentUser.id)
                ) {
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            });

            socket.current.on('disconnect', () => {
                console.log('Disconnected from Socket.IO server');
            });

            return () => {
                socket.current.disconnect();
                socket.current = null;
            };
        }
    }, [currentUser, selectedUser]); // Re-run if currentUser or selectedUser changes

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                username: loginUsername,
                password: loginPassword,
            });
            setCurrentUser(response.data.user);
            alert('Login successful!');
        } catch (error) {
            console.error('Login error:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Login failed!');
        }
    };

    const fetchChatHistory = async (user1Id, user2Id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/messages/${user1Id}/${user2Id}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching chat history:', error);
            setMessages([]);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        if (currentUser && user) {
            fetchChatHistory(currentUser.id, user.id);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() && !file) return;
        if (!currentUser || !selectedUser) {
            alert('Please select a user to chat with.');
            return;
        }

        const formData = new FormData();
        formData.append('senderId', currentUser.id);
        formData.append('receiverId', selectedUser.id);

        let messageType = 'text';
        if (file) {
            formData.append('file', file);
            if (file.type.startsWith('image/')) {
                messageType = 'image';
            } else {
                messageType = 'document';
            }
        }
        formData.append('messageType', messageType);
        formData.append('textContent', messageInput); // Even for files, send text content if any

        try {
            // Using Axios for file upload (multipart/form-data)
            const response = await axios.post(`${API_BASE_URL}/upload-message`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Message sent via API:', response.data.newMessage);
            // The message will be added to state by the socket 'receive_message' listener
            // setMessages((prevMessages) => [...prevMessages, response.data.newMessage]);
            setMessageInput('');
            setFile(null);
        } catch (error) {
            console.error('Error sending message:', error.response?.data?.message || error.message);
            alert('Failed to send message.');
        }
    };

    if (!currentUser) {
        return (
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
                <p>
                    (For demonstration, use existing users or register one directly in MySQL for now.
                    <br/>Example: user: testuser, pass: testpass)
                </p>
            </div>
        );
    }

    return (
        <div className="chat-app">
            <div className="sidebar">
                <h3>Users ({currentUser.username})</h3>
                <ul className="user-list">
                    {users.map((user) => (
                        user.id !== currentUser.id && (
                            <li
                                key={user.id}
                                className={selectedUser?.id === user.id ? 'selected' : ''}
                                onClick={() => handleUserSelect(user)}
                            >
                                {user.username}
                            </li>
                        )
                    ))}
                </ul>
            </div>
            <div className="chat-area">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <h2>Chat with {selectedUser.username}</h2>
                        </div>
                        <div className="messages-container">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`message-bubble ${
                                        msg.sender_id === currentUser.id ? 'sent' : 'received'
                                    }`}
                                >
                                    <strong>{msg.sender_id === currentUser.id ? 'You' : msg.sender_username}:</strong>
                                    {msg.message_type === 'text' && <p>{msg.content}</p>}
                                    {msg.message_type === 'image' && (
                                        <img
                                            src={`${SOCKET_SERVER_URL}${msg.content}`} // Use full path for image
                                            alt="Sent Image"
                                            style={{ maxWidth: '200px', maxHeight: '200px' }}
                                        />
                                    )}
                                    {msg.message_type === 'document' && (
                                        <a href={`${SOCKET_SERVER_URL}${msg.content}`} target="_blank" rel="noopener noreferrer">
                                            Download Document
                                        </a>
                                    )}
                                    <span className="timestamp">
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} /> {/* Scroll target */}
                        </div>
                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                disabled={!selectedUser}
                            />
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                disabled={!selectedUser}
                            />
                            <button type="submit" disabled={!selectedUser}>Send</button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        Select a user to start chatting.
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;