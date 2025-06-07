// client/src/chat/components/UserListItem.js
import React from 'react';
import styled from 'styled-components';

const ListItem = styled.div`
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    background-color: ${props => (props.$isSelected ? '#e9ecef' : 'transparent')};
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;

    &:hover {
        background-color: #f5f5f5;
    }
`;

const Avatar = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #075e54; /* A default color */
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 1.1em;
    margin-right: 15px;
`;

const UserName = styled.span`
    font-weight: bold;
    color: #333;
`;

const UserListItem = ({ user, onClick, isSelected }) => {
    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <ListItem onClick={() => onClick(user)} $isSelected={isSelected}>
            <Avatar>{getInitials(user.username)}</Avatar>
            <UserName>{user.username}</UserName>
        </ListItem>
    );
};

export default UserListItem;