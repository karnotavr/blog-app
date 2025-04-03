import './App.css';
import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePostPage from './pages/CreatePostPage';
import SinglePostPage from './pages/SinglePostPage';
import EditPostPage from './pages/EditPostPage';
import { UserContextProvider } from './context/UserContext';

function App() {
    return (
        <UserContextProvider>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/create-post" element={<CreatePostPage />} />
                    <Route path="/post/:id" element={<SinglePostPage />} />
                    <Route path="/edit/:id" element={<EditPostPage />} />
                </Route>
            </Routes>
        </UserContextProvider>
    );
}

export default App;
