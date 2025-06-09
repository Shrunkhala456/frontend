// client/src/chat/ChatPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { connectSocket, getSocket, disconnectSocket } from '../services/socketService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import UserListItem from './components/UserListItem';
import { FiLogOut, FiSearch } from 'react-icons/fi'; // Icons for logout and search

const ChatContainer = styled.div`
    display: flex;
    height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f0f2f5;
    overflow: hidden;
`;

const Sidebar = styled.div`
    width: 350px;
    border-right: 1px solid #ddd;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 10px rgba(0,0,0,0.05);
`;

const SidebarHeader = styled.div`
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #075e54; /* WhatsApp header green */
    color: white;
`;

const UserNameDisplay = styled.h3`
    margin: 0;
    font-size: 1.2em;
`;

const LogoutButton = styled.button`
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1.5em;
    padding: 5px;
    border-radius: 5px;
    transition: background-color 0.2s ease;
    &:hover {
        background-color: rgba(255,255,255,0.1);
    }
`;

const SearchContainer = styled.div`
    padding: 15px;
    border-bottom: 1px solid #eee;
    display: flex;
    gap: 10px;
    align-items: center;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 20px;
    font-size: 1em;
    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const SearchButton = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 10px 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: background-color 0.2s ease;
    &:hover {
        background-color: #0056b3;
    }
`;

const UserList = styled.div`
    flex: 1;
    overflow-y: auto;
`;

const SearchResultsContainer = styled.div`
    background-color: white;
    border: 1px solid #eee;
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    position: relative; /* To make it appear above other content */
    z-index: 10; /* Ensure it's on top */
    width: 100%;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
`;

const NoResults = styled.div`
    padding: 15px;
    color: #666;
    text-align: center;
`;

const MainChatArea = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #e5ddd5; /* WhatsApp chat background */
    position: relative;
`;

const ChatHeader = styled.div`
    padding: 15px 20px;
    border-bottom: 1px solid #ddd;
    background-color: #075e54; /* WhatsApp header green */
    color: white;
    display: flex;
    align-items: center;
`;

const ChatPartnerName = styled.h3`
    margin: 0;
    font-size: 1.2em;
    margin-left: 15px;
`;

const AvatarSmall = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(255,255,255,0.2);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 1.1em;
`;


const MessageListContainer = styled.div`
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    /* Custom scrollbar for better aesthetics */
    &::-webkit-scrollbar {
        width: 8px;
    }
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
    }
    &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
`;

const WelcomeMessage = styled.div`
    text-align: center;
    margin-top: 50px;
    color: #666;
    font-size: 1.2em;
`;

const ChatPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [chatUsers, setChatUsers] = useState([]); // Users current user has chatted with
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [sending, setSending] = useState(false); // State for send button loading
    const messagesEndRef = useRef(null);

    // Axios instance with auth token
    const authAxios = axios.create({
        baseURL: 'my-backend-ea4o-5f26miis2-shrunkhala345s-projects.vercel.app',
        headers: {
            Authorization: `Bearer ${user?.token}`,
        },
    });
//http://localhost:5000/api
    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    // Scroll to bottom of messages
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const socket = connectSocket(user.id);

        socket.on('receiveMessage', (newMessage) => {
            // Only add message if it's for the currently selected chat or from that chat
            if (selectedChatUser &&
                ((newMessage.sender_id === selectedChatUser.id && newMessage.receiver_id === user.id) ||
                (newMessage.sender_id === user.id && newMessage.receiver_id === selectedChatUser.id))) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
            // Also, refetch chat users to update sidebar if a new chat is started
            fetchChatUsers();
        });

        fetchChatUsers(); // Fetch users you have chatted with on component mount

        return () => {
            socket.off('receiveMessage');
            disconnectSocket(); // Disconnect on unmount
        };
    }, [user, navigate, selectedChatUser]); // Re-run effect when user or selectedChatUser changes

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Fetch messages for the selected chat user
    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedChatUser) {
                try {
                    const res = await authAxios.get(`/messages/${selectedChatUser.id}`);
                    setMessages(res.data);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                    setMessages([]); // Clear messages on error or no chat selected
                }
            } else {
                setMessages([]);
            }
        };
        fetchMessages();
    }, [selectedChatUser, authAxios]);

    const fetchChatUsers = async () => {
        try {
            const res = await authAxios.get('/messages/chats/users');
            setChatUsers(res.data);
        } catch (error) {
            console.error('Error fetching chat users:', error);
        }
    };

    const handleSendMessage = async (textMessage, file) => {
        setSending(true);
        const formData = new FormData();
        formData.append('receiver_id', selectedChatUser.id);

        if (file) {
            formData.append('file', file);
            // message_type will be determined by backend based on mime type
        } else if (textMessage.trim()) {
            formData.append('content', textMessage);
            formData.append('message_type', 'text');
        } else {
            setSending(false);
            return; // No message content or file
        }

        try {
            const res = await authAxios.post('/messages/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            });
            const newMessage = res.data;

            // Emit the saved message via Socket.IO for real-time delivery to both sender and receiver
            const socket = getSocket();
            if (socket) {
                socket.emit('sendMessage', newMessage);
            }

            // The 'receiveMessage' event listener will handle adding it to the state
            // for the sender as well, ensuring consistency.
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message.'); // Simple error alert
        } finally {
            setSending(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await authAxios.get(`/messages/users/search?query=${searchTerm}`);
            setSearchResults(res.data);
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchResults([]);
        }
    };

    const startNewChat = (chatUser) => {
        setSelectedChatUser(chatUser);
        setSearchTerm('');
        setSearchResults([]);
        // Add the user to chatUsers if not already present
        if (!chatUsers.some(u => u.id === chatUser.id)) {
            setChatUsers(prev => [...prev, chatUser]);
        }
    };

    return (
        <ChatContainer>
            <Sidebar>
                <SidebarHeader>
                    <UserNameDisplay>Welcome, {user?.username}!</UserNameDisplay>
                    <LogoutButton onClick={logout} title="Logout">
                        <FiLogOut />
                    </LogoutButton>
                </SidebarHeader>

                <SearchContainer>
                    <SearchInput
                        type="text"
                        placeholder="Search or start new chat"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault(); // Prevent form submission
                                handleSearch();
                            }
                        }}
                    />
                    <SearchButton onClick={handleSearch}>
                        <FiSearch /> Search
                    </SearchButton>
                </SearchContainer>

                {searchTerm && searchResults.length > 0 && (
                    <SearchResultsContainer>
                        {searchResults.map((searchUser) => (
                            <UserListItem
                                key={searchUser.id}
                                user={searchUser}
                                onClick={startNewChat}
                                isSelected={selectedChatUser?.id === searchUser.id}
                            />
                        ))}
                    </SearchResultsContainer>
                )}
                {searchTerm && searchResults.length === 0 && (
                    <NoResults>No users found.</NoResults>
                )}

                <UserList>
                    {!searchTerm && chatUsers.length === 0 && (
                        <NoResults>No chats yet. Search for users to start one!</NoResults>
                    )}
                    {!searchTerm && chatUsers.map((chatUser) => (
                        <UserListItem
                            key={chatUser.id}
                            user={chatUser}
                            onClick={setSelectedChatUser}
                            isSelected={selectedChatUser?.id === chatUser.id}
                        />
                    ))}
                </UserList>
            </Sidebar>

            <MainChatArea>
                {selectedChatUser ? (
                    <>
                        <ChatHeader>
                            <AvatarSmall>{getInitials(selectedChatUser.username)}</AvatarSmall>
                            <ChatPartnerName>{selectedChatUser.username}</ChatPartnerName>
                        </ChatHeader>
                        <MessageListContainer>
                            {messages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    isSender={msg.sender_id === user.id}
                                    currentUser={user}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </MessageListContainer>
                        <ChatInput onSendMessage={handleSendMessage} loading={sending} />
                    </>
                ) : (
                    <WelcomeMessage>
                        <h3>Welcome to Secure Messenger!</h3>
                        <p>Select a chat from the left or search for a new user to start a conversation.</p>
                    </WelcomeMessage>
                )}
            </MainChatArea>
        </ChatContainer>
    );
};

export default ChatPage;