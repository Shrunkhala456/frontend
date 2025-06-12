// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import io from 'socket.io-client';
// import './App.css'; // For basic styling

// const API_BASE_URL = 'http://localhost:5000/api';
// const SOCKET_SERVER_URL = 'http://localhost:5000';

// function App() {
//     const [currentUser, setCurrentUser] = useState(null); // { id: 1, username: 'Alice' }
//     const [selectedUser, setSelectedUser] = useState(null); // The user you're chatting with
//     const [users, setUsers] = useState([]);
//     const [messages, setMessages] = useState([]);
//     const [messageInput, setMessageInput] = useState('');
//     const [file, setFile] = useState(null);

//     // Login/Registration States
//     const [authUsername, setAuthUsername] = useState(''); // Unified state for username
//     const [authPassword, setAuthPassword] = useState(''); // Unified state for password
//     const [isRegistering, setIsRegistering] = useState(false); // New state to toggle between login/register

//     const messagesEndRef = useRef(null);
//     const socket = useRef(null);

//     // Effect to fetch users only once on component mount
//     useEffect(() => {
//         const fetchUsers = async () => {
//             try {
//                 const response = await axios.get(`${API_BASE_URL}/users`);
//                 setUsers(response.data);
//             } catch (error) {
//                 console.error('Error fetching users:', error);
//             }
//         };
//         fetchUsers();
//     }, []);

//     // Effect for Socket.IO connection and event listeners
//     useEffect(() => {
//         if (currentUser && !socket.current) {
//             socket.current = io(SOCKET_SERVER_URL);

//             socket.current.on('connect', () => {
//                 console.log('Connected to Socket.IO server');
//                 socket.current.emit('register_user', currentUser.id);
//             });

//             socket.current.on('receive_message', (newMessage) => {
//                 console.log('Received message:', newMessage);
//                 // Only add if it's relevant to the current chat (sender or receiver is current user and the other party is selectedUser)
//                 if (
//                     (newMessage.sender_id === currentUser.id && newMessage.receiver_id === selectedUser?.id) ||
//                     (newMessage.sender_id === selectedUser?.id && newMessage.receiver_id === currentUser.id)
//                 ) {
//                     // Fetch sender/receiver usernames if they are not already available in newMessage object
//                     // For now, these are placeholders in the backend response, so we might need to update here
//                     // if (newMessage.sender_username === 'Unknown' || newMessage.receiver_username === 'Unknown') {
//                     //     // A more robust solution would be to update the message with actual usernames
//                     //     // by fetching user info from the 'users' state or making a separate API call.
//                     //     // For this basic example, we'll assume the backend provides them in production.
//                     // }
//                     setMessages((prevMessages) => [...prevMessages, newMessage]);
//                 }
//             });

//             socket.current.on('disconnect', () => {
//                 console.log('Disconnected from Socket.IO server');
//             });

//             return () => {
//                 socket.current.disconnect();
//                 socket.current = null;
//             };
//         }
//     }, [currentUser, selectedUser]); // Re-run if currentUser or selectedUser changes

//     // Effect to scroll to the bottom of messages when new messages arrive
//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await axios.post(`${API_BASE_URL}/login`, {
//                 username: authUsername,
//                 password: authPassword,
//             });
//             setCurrentUser(response.data.user);
//             setAuthUsername('');
//             setAuthPassword('');
//             alert('Login successful!');
//         } catch (error) {
//             console.error('Login error:', error.response?.data?.message || error.message);
//             alert(error.response?.data?.message || 'Login failed!');
//         }
//     };

//     const handleRegister = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await axios.post(`${API_BASE_URL}/register`, {
//                 username: authUsername,
//                 password: authPassword,
//             });
//             alert(response.data.message);
//             setIsRegistering(false); // Switch back to login after successful registration
//             setAuthUsername('');
//             setAuthPassword('');
//         } catch (error) {
//             console.error('Registration error:', error.response?.data?.message || error.message);
//             alert(error.response?.data?.message || 'Registration failed!');
//         }
//     };

//     const fetchChatHistory = async (user1Id, user2Id) => {
//         try {
//             const response = await axios.get(`${API_BASE_URL}/messages/${user1Id}/${user2Id}`);
//             // Map the messages to include sender/receiver usernames for display
//             const messagesWithUsernames = response.data.map(msg => {
//                 const sender = users.find(u => u.id === msg.sender_id);
//                 const receiver = users.find(u => u.id === msg.receiver_id);
//                 return {
//                     ...msg,
//                     sender_username: sender ? sender.username : 'Unknown',
//                     receiver_username: receiver ? receiver.username : 'Unknown',
//                 };
//             });
//             setMessages(messagesWithUsernames);
//         } catch (error) {
//             console.error('Error fetching chat history:', error);
//             setMessages([]);
//         }
//     };

//     const handleUserSelect = (user) => {
//         setSelectedUser(user);
//         if (currentUser && user) {
//             fetchChatHistory(currentUser.id, user.id);
//         }
//     };

//     const handleSendMessage = async (e) => {
//         e.preventDefault();
//         if (!messageInput.trim() && !file) return; // Prevent sending empty messages/files
//         if (!currentUser || !selectedUser) {
//             alert('Please select a user to chat with.');
//             return;
//         }

//         const formData = new FormData();
//         formData.append('senderId', currentUser.id);
//         formData.append('receiverId', selectedUser.id);

//         let messageType = 'text';
//         if (file) {
//             formData.append('file', file);
//             if (file.type.startsWith('image/')) {
//                 messageType = 'image';
//             } else {
//                 messageType = 'document';
//             }
//         }
//         formData.append('messageType', messageType);
//         formData.append('textContent', messageInput); // Even for files, send text content if any

//         try {
//             const response = await axios.post(`${API_BASE_URL}/upload-message`, formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                 },
//             });
//             console.log('Message sent via API:', response.data.newMessage);
//             // The message will be added to state by the socket 'receive_message' listener
//             // (after fetching missing usernames for display, if necessary)
//             setMessageInput('');
//             setFile(null); // Clear selected file after sending
//         } catch (error) {
//             console.error('Error sending message:', error.response?.data?.message || error.message);
//             alert('Failed to send message.');
//         }
//     };

//     if (!currentUser) {
//         return (
//             <div className="auth-container">
//                 {isRegistering ? (
//                     <>
//                         <h2>Register</h2>
//                         <form onSubmit={handleRegister}>
//                             <input
//                                 type="text"
//                                 placeholder="Username"
//                                 value={authUsername}
//                                 onChange={(e) => setAuthUsername(e.target.value)}
//                                 required
//                             />
//                             <input
//                                 type="password"
//                                 placeholder="Password"
//                                 value={authPassword}
//                                 onChange={(e) => setAuthPassword(e.target.value)}
//                                 required
//                             />
//                             <button type="submit">Register</button>
//                         </form>
//                         <p>
//                             Already have an account?{' '}
//                             <span className="auth-toggle" onClick={() => setIsRegistering(false)}>
//                                 Login here.
//                             </span>
//                         </p>
//                     </>
//                 ) : (
//                     <>
//                         <h2>Login</h2>
//                         <form onSubmit={handleLogin}>
//                             <input
//                                 type="text"
//                                 placeholder="Username"
//                                 value={authUsername}
//                                 onChange={(e) => setAuthUsername(e.target.value)}
//                                 required
//                             />
//                             <input
//                                 type="password"
//                                 placeholder="Password"
//                                 value={authPassword}
//                                 onChange={(e) => setAuthPassword(e.target.value)}
//                                 required
//                             />
//                             <button type="submit">Login</button>
//                         </form>
//                         <p>
//                             Don't have an account?{' '}
//                             <span className="auth-toggle" onClick={() => setIsRegistering(true)}>
//                                 Register here.
//                             </span>
//                         </p>
                       
//                     </>
//                 )}
//             </div>
//         );
//     }

//     return (
//         <div className="chat-app">
//             <div className="sidebar">
//                 <h3>Users ({currentUser.username})</h3>
//                 <ul className="user-list">
//                     {users.map((user) => (
//                         user.id !== currentUser.id && (
//                             <li
//                                 key={user.id}
//                                 className={selectedUser?.id === user.id ? 'selected' : ''}
//                                 onClick={() => handleUserSelect(user)}
//                             >
//                                 {user.username}
//                             </li>
//                         )
//                     ))}
//                 </ul>
//             </div>
//             <div className="chat-area">
//                 {selectedUser ? (
//                     <>
//                         <div className="chat-header">
//                             <h2>Chat with {selectedUser.username}</h2>
//                         </div>
//                         <div className="messages-container">
//                             {messages.map((msg) => (
//                                 <div
//                                     key={msg.id}
//                                     className={`message-bubble ${
//                                         msg.sender_id === currentUser.id ? 'sent' : 'received'
//                                     }`}
//                                 >
//                                     <strong>
//                                         {msg.sender_id === currentUser.id ? 'You' : msg.sender_username || 'Unknown'}:
//                                     </strong>
//                                     {msg.message_type === 'text' && <p>{msg.content}</p>}
//                                     {msg.message_type === 'image' && (
//                                         <img
//                                             src={`${SOCKET_SERVER_URL}${msg.content}`} // Use full path for image
//                                             alt="Sent Image"
//                                             style={{ maxWidth: '200px', maxHeight: '200px' }}
//                                         />
//                                     )}
//                                     {msg.message_type === 'document' && (
//                                         <a href={`${SOCKET_SERVER_URL}${msg.content}`} target="_blank" rel="noopener noreferrer">
//                                             Download Document
//                                         </a>
//                                     )}
//                                     <span className="timestamp">
//                                         {new Date(msg.timestamp).toLocaleTimeString()}
//                                     </span>
//                                 </div>
//                             ))}
//                             <div ref={messagesEndRef} /> {/* Scroll target */}
//                         </div>
//                         <form className="message-input-form" onSubmit={handleSendMessage}>
//                             <input
//                                 type="text"
//                                 value={messageInput}
//                                 onChange={(e) => setMessageInput(e.target.value)}
//                                 placeholder="Type a message..."
//                                 disabled={!selectedUser}
//                             />
//                             {/* File input needs a label to be clickable */}
//                             <label htmlFor="file-upload" className="file-upload-label">
//                                 {file ? file.name : 'Attach File'}
//                             </label>
//                             <input
//                                 id="file-upload" // ID for the label
//                                 type="file"
//                                 onChange={(e) => setFile(e.target.files[0])}
//                                 disabled={!selectedUser}
//                                 style={{ display: 'none' }} // Hide default input
//                             />
//                             <button type="submit" disabled={!selectedUser}>Send</button>
//                         </form>
//                     </>
//                 ) : (
//                     <div className="no-chat-selected">
//                         Select a user to start chatting.
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default App;















import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css'; // For basic styling

const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_SERVER_URL = 'http://localhost:5000';

function App() {
    // Initialize currentUser from localStorage, or null if not found
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Failed to parse currentUser from localStorage", error);
            return null;
        }
    });

    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [file, setFile] = useState(null);

    // Login/Registration States
    const [authUsername, setAuthUsername] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const messagesEndRef = useRef(null);
    const socket = useRef(null);

    // Effect to fetch users and ensure they are updated when currentUser changes
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users`);
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, [currentUser]); // Added currentUser to dependency array to re-fetch users if a new user logs in/registers

    // Effect for Socket.IO connection and event listeners
    useEffect(() => {
        if (currentUser && !socket.current) {
            socket.current = io(SOCKET_SERVER_URL);

            socket.current.on('connect', () => {
                console.log('Connected to Socket.IO server');
                socket.current.emit('register_user', currentUser.id);
            });

            socket.current.on('receive_message', (newMessage) => {
                console.log('Received message:', newMessage);
                // To display sender/receiver usernames for real-time messages:
                // We need to enrich the newMessage with usernames from our 'users' state
                const sender = users.find(u => u.id === newMessage.sender_id);
                const receiver = users.find(u => u.id === newMessage.receiver_id);
                const enrichedMessage = {
                    ...newMessage,
                    sender_username: sender ? sender.username : 'Unknown',
                    receiver_username: receiver ? receiver.username : 'Unknown'
                };

                // Only add if it's relevant to the current chat (sender or receiver is current user and the other party is selectedUser)
                if (
                    (enrichedMessage.sender_id === currentUser.id && enrichedMessage.receiver_id === selectedUser?.id) ||
                    (enrichedMessage.sender_id === selectedUser?.id && enrichedMessage.receiver_id === currentUser.id)
                ) {
                    setMessages((prevMessages) => [...prevMessages, enrichedMessage]);
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
    }, [currentUser, selectedUser, users]); // Added 'users' to dependency array for username lookup

    // Effect to scroll to the bottom of messages when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                username: authUsername,
                password: authPassword,
            });
            // Store user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            setCurrentUser(response.data.user);
            setAuthUsername('');
            setAuthPassword('');
            alert('Login successful!');
        } catch (error) {
            console.error('Login error:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Login failed!');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/register`, {
                username: authUsername,
                password: authPassword,
            });
            alert(response.data.message);
            setIsRegistering(false); // Switch back to login after successful registration
            setAuthUsername('');
            setAuthPassword('');
            // After successful registration, a user would typically log in immediately.
            // You might want to automatically log them in here, or require a manual login.
            // For now, it just switches back to the login form.
        } catch (error) {
            console.error('Registration error:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Registration failed!');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser'); // Remove user from localStorage
        setCurrentUser(null); // Clear currentUser state
        setSelectedUser(null); // Clear selected user
        setMessages([]); // Clear messages
        if (socket.current) {
            socket.current.disconnect(); // Disconnect socket
            socket.current = null;
        }
        alert('Logged out successfully!');
    };


    const fetchChatHistory = async (user1Id, user2Id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/messages/${user1Id}/${user2Id}`);
            // Map the messages to include sender/receiver usernames for display
            const messagesWithUsernames = response.data.map(msg => {
                const sender = users.find(u => u.id === msg.sender_id);
                const receiver = users.find(u => u.id === msg.receiver_id);
                return {
                    ...msg,
                    sender_username: sender ? sender.username : 'Unknown',
                    receiver_username: receiver ? receiver.username : 'Unknown',
                };
            });
            setMessages(messagesWithUsernames);
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
        if (!messageInput.trim() && !file) return; // Prevent sending empty messages/files
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
            const response = await axios.post(`${API_BASE_URL}/upload-message`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Message sent via API:', response.data.newMessage);
            // The message will be added to state by the socket 'receive_message' listener
            // (after fetching missing usernames for display, if necessary)
            setMessageInput('');
            setFile(null); // Clear selected file after sending
        } catch (error) {
            console.error('Error sending message:', error.response?.data?.message || error.message);
            alert('Failed to send message.');
        }
    };

    if (!currentUser) {
        return (
            <div className="auth-container">
                {isRegistering ? (
                    <>
                        <h2>Register</h2>
                        <form onSubmit={handleRegister}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={authUsername}
                                onChange={(e) => setAuthUsername(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                required
                            />
                            <button type="submit">Register</button>
                        </form>
                        <p>
                            Already have an account?{' '}
                            <span className="auth-toggle" onClick={() => setIsRegistering(false)}>
                                Login here.
                            </span>
                        </p>
                    </>
                ) : (
                    <>
                        <h2>Login</h2>
                        <form onSubmit={handleLogin}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={authUsername}
                                onChange={(e) => setAuthUsername(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                required
                            />
                            <button type="submit">Login</button>
                        </form>
                        <p>
                            Don't have an account?{' '}
                            <span className="auth-toggle" onClick={() => setIsRegistering(true)}>
                                Register here.
                            </span>
                        </p>
                       
                    </>
                )}
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
                <button className="logout-button" onClick={handleLogout}>Logout</button> {/* Logout button */}
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
                                    <strong>
                                        {msg.sender_id === currentUser.id ? 'You' : msg.sender_username || 'Unknown'}:
                                    </strong>
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
                            {/* File input needs a label to be clickable */}
                            <label htmlFor="file-upload" className="file-upload-label">
                                {file ? file.name : 'Attach File'}
                            </label>
                            <input
                                id="file-upload" // ID for the label
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                disabled={!selectedUser}
                                style={{ display: 'none' }} // Hide default input
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