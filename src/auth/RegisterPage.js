// client/src/auth/RegisterPage.js
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';

// Reusing styled components from LoginPage for consistency
const AuthContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f2f5;
`;

const AuthBox = styled.div`
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 100%;
    max-width: 400px;
`;

const Title = styled.h2`
    margin-bottom: 25px;
    color: #333;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const InputGroup = styled.div`
    margin-bottom: 15px;
    text-align: left;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 5px;
    color: #555;
    font-weight: bold;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    box-sizing: border-box;
    &:focus {
        border-color: #007bff;
        outline: none;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
`;

const Button = styled.button`
    padding: 12px 20px;
    background-color: #28a745; /* Green for register */
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 15px;
    &:hover {
        background-color: #218838;
    }
    &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.p`
    color: #dc3545;
    margin-top: 10px;
    font-size: 14px;
`;

const StyledLink = styled(Link)`
    color: #007bff;
    text-decoration: none;
    margin-top: 20px;
    display: block;
    &:hover {
        text-decoration: underline;
    }
`;

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(username, email, password);
            navigate('/chat');
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContainer>
            <AuthBox>
                <Title>Register</Title>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label htmlFor="username">Username:</Label>
                        <Input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </InputGroup>
                    <InputGroup>
                        <Label htmlFor="email">Email:</Label>
                        <Input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </InputGroup>
                    <InputGroup>
                        <Label htmlFor="password">Password:</Label>
                        <Input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </InputGroup>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </Button>
                </Form>
                <StyledLink to="/login">Already have an account? Login here</StyledLink>
            </AuthBox>
        </AuthContainer>
    );
};

export default RegisterPage;