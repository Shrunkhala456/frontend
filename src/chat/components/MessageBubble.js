// client/src/chat/components/MessageBubble.js
import React from 'react';
import styled from 'styled-components';
import { GoDownload } from 'react-icons/go'; // Icon for download

const BubbleContainer = styled.div`
    display: flex;
    justify-content: ${props => (props.$isSender ? 'flex-end' : 'flex-start')};
    margin-bottom: 10px;
`;

const Bubble = styled.div`
    background-color: ${props => (props.$isSender ? '#dcf8c6' : '#ffffff')}; /* WhatsApp-like colors */
    color: #333;
    padding: 8px 12px;
    border-radius: 8px;
    max-width: 70%;
    box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        ${props => (props.$isSender ? 'right: -8px;' : 'left: -8px;')}
        border: 8px solid transparent;
        border-${props => (props.$isSender ? 'left' : 'right')}-color: ${props => (props.$isSender ? '#dcf8c6' : '#ffffff')};
        border-top-color: ${props => (props.$isSender ? '#dcf8c6' : '#ffffff')};
    }
`;

const SenderName = styled.div`
    font-size: 0.8em;
    font-weight: bold;
    color: #075e54; /* Dark green for sender name */
    margin-bottom: 4px;
`;

const MessageText = styled.p`
    margin: 0;
    word-wrap: break-word;
    white-space: pre-wrap; /* Preserve whitespace and line breaks */
`;

const Timestamp = styled.span`
    display: block;
    font-size: 0.7em;
    color: #888;
    margin-top: 5px;
    text-align: right;
`;

const FileContainer = styled.div`
    background-color: #f0f0f0;
    border-radius: 5px;
    padding: 10px;
    margin-top: 5px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const FileName = styled.p`
    margin: 0 0 5px 0;
    font-weight: bold;
    color: #007bff;
`;

const FileImagePreview = styled.img`
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin-bottom: 5px;
`;

const DownloadLink = styled.a`
    display: flex;
    align-items: center;
    color: #007bff;
    text-decoration: none;
    font-size: 0.9em;

    &:hover {
        text-decoration: underline;
    }

    svg {
        margin-right: 5px;
    }
`;

const MessageBubble = ({ message, isSender, currentUser }) => {
    const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const FILE_BASE_URL = 'http://localhost:5000'; // Your backend server URL for static files

    const renderFileContent = () => {
        if (!message.file_url) return null;

        const fileFullUrl = `${FILE_BASE_URL}${message.file_url}`;
        const isImage = message.mime_type?.startsWith('image/');
        const isPdf = message.mime_type === 'application/pdf';

        return (
            <FileContainer>
                <FileName>{message.file_name}</FileName>
                {isImage && (
                    <FileImagePreview src={fileFullUrl} alt={message.file_name} />
                )}
                {isPdf && (
                    <p style={{ margin: '0' }}>
                        <a href={fileFullUrl} target="_blank" rel="noopener noreferrer">
                            View PDF
                        </a>
                    </p>
                )}
                {!isImage && !isPdf && (
                    <DownloadLink href={fileFullUrl} download={message.file_name}>
                        <GoDownload /> Download
                    </DownloadLink>
                )}
            </FileContainer>
        );
    };

    return (
        <BubbleContainer $isSender={isSender}>
            <Bubble $isSender={isSender}>
                {!isSender && <SenderName>{message.sender?.username || 'Unknown'}</SenderName>}
                {message.message_type === 'text' && <MessageText>{message.content}</MessageText>}
                {message.file_url && renderFileContent()}
                <Timestamp>{formattedTime}</Timestamp>
            </Bubble>
        </BubbleContainer>
    );
};

export default MessageBubble;