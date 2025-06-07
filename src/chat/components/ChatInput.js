
import React, { useState } from 'react';
import styled from 'styled-components';
import { MdSend, MdAttachFile } from 'react-icons/md';

const InputForm = styled.form`
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: #f0f2f5;
    border-top: 1px solid #e0e0e0;
`;

const MessageInput = styled.input`
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 20px;
    font-size: 16px;
    margin-right: 10px;
    &:focus {
        outline: none;
        border-color: #007bff;
    }
    &:disabled {
        background-color: #e9e9e9;
        cursor: not-allowed;
    }
`;

const FileInputLabel = styled.label`
    background-color: #075e54; /* WhatsApp green */
    color: white;
    padding: 10px 15px;
    border-radius: 20px;
    cursor: pointer;
    margin-right: 10px;
    display: flex;
    align-items: center;
    font-size: 16px;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #054a42;
    }

    svg {
        margin-right: 5px;
    }
`;

const HiddenFileInput = styled.input`
    display: none;
`;

const SendButton = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 50%; /* Make it circular */
    width: 45px;
    height: 45px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 24px;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #0056b3;
    }
    &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
`;

const SelectedFilePreview = styled.div`
    display: flex;
    align-items: center;
    margin-left: 10px;
    font-size: 0.9em;
    color: #555;
    background-color: #e6e6e6;
    padding: 5px 10px;
    border-radius: 5px;
    max-width: 150px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

const ChatInput = ({ onSendMessage, loading }) => {
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading) return; // Prevent sending if already loading

        if (message.trim() || selectedFile) {
            onSendMessage(message, selectedFile);
            setMessage('');
            setSelectedFile(null);
            if (document.getElementById('fileInput')) {
                document.getElementById('fileInput').value = null; // Clear file input
            }
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    return (
        <InputForm onSubmit={handleSubmit}>
            <MessageInput
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading || !!selectedFile} // Disable text input if file selected
            />
            <HiddenFileInput
                type="file"
                id="fileInput"
                onChange={handleFileChange}
            />
            <FileInputLabel htmlFor="fileInput">
                <MdAttachFile /> {selectedFile ? 'Change File' : 'Attach File'}
            </FileInputLabel>
            {selectedFile && <SelectedFilePreview>{selectedFile.name}</SelectedFilePreview>}
            <SendButton type="submit" disabled={loading}>
                <MdSend />
            </SendButton>
        </InputForm>
    );
};

export default ChatInput;