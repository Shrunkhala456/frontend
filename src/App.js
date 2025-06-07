// // client/src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './auth/AuthContext';
// import LoginPage from './auth/LoginPage';
// import RegisterPage from './auth/RegisterPage';
// import ChatPage from './chat/ChatPage';
// import styled from 'styled-components'; // For global styles

// const GlobalStyle = styled.div`
//     body {
//         margin: 0;
//         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//         -webkit-font-smoothing: antialiased;
//         -moz-osx-font-smoothing: grayscale;
//         background-color: #f0f2f5;
//     }
//     #root {
//         height: 100vh;
//         display: flex;
//         flex-direction: column;
//     }
// `;

// // A private route component to protect authenticated routes
// const PrivateRoute = ({ children }) => {
//     const { user, loading } = useAuth();

//     if (loading) {
//         return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5em' }}>Loading application...</div>;
//     }

//     return user ? children : <Navigate to="/login" />;
// };

// function App() {
//     return (
//         <GlobalStyle>
//             <Router>
//                 <AuthProvider>
//                     <Routes>
//                         <Route path="/login" element={<LoginPage />} />
//                         <Route path="/register" element={<RegisterPage />} />
//                         <Route
//                             path="/chat"
//                             element={
//                                 <PrivateRoute>
//                                     <ChatPage />
//                                 </PrivateRoute>
//                             }
//                         />
//                         {/* Redirect to chat if authenticated, otherwise to login */}
//                         <Route
//                             path="/"
//                             element={
//                                 <PrivateRoute>
//                                     <Navigate to="/chat" />
//                                 </PrivateRoute>
//                             }
//                         />
//                         <Route path="" element={<Navigate to="/" />} /> {/ Catch-all for unknown routes */}
//                     </Routes>
//                 </AuthProvider>
//             </Router>
//         </GlobalStyle>
//     );
// }

// export default App;



import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ChatPage from './chat/ChatPage';


// A simple protected route wrapper
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5em' }}>Loading authentication...</div>; // Or a spinner
    }
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/chat"
                        element={
                            <PrivateRoute>
                                <ChatPage />
                            </PrivateRoute>
                        }
                    />
                    {/* Redirect to login if no specific route matches, or set a default home */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;