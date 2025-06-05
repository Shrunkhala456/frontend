// client/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import './App.css'; // For basic styling

function App() {
    const [currentUser, setCurrentUser] = useState(null); // { id, username }

    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        // Clear any stored tokens/user info in localStorage if you implement it
    };

    return (
        <Router>
            <div className="App">
                <nav>
                    <ul>
                        {!currentUser && (
                            <>
                                <li>
                                    <Link to="/login">Login</Link>
                                </li>
                                <li>
                                    <Link to="/register">Register</Link>
                                </li>
                            </>
                        )}
                        {currentUser && (
                            <li>
                                <button onClick={handleLogout}>Logout ({currentUser.username})</button>
                            </li>
                        )}
                    </ul>
                </nav>

                <Routes>
                    <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/chat"
                        element={
                            currentUser ? (
                                <Chat currentUser={currentUser} />
                            ) : (
                                <p>Please <Link to="/login">login</Link> to access the chat.</p>
                            )
                        }
                    />
                    <Route path="/" element={
                        currentUser ? (
                            <p>Welcome, {currentUser.username}! Go to <Link to="/chat">chat</Link>.</p>
                        ) : (
                            <p>Welcome! Please <Link to="/login">login</Link> or <Link to="/register">register</Link>.</p>
                        )
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;




// import React from 'react';
// import Chat from './components/Chat';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <h2>📨 Simple Chat (No Login)</h2>
//       <Chat />
//     </div>
//   );
// }

// export default App;