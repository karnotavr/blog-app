import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '../context/UserContext';

const Header = () => {
    const { userInfo, setUserInfo } = useContext(UserContext);

    const handleLogout = () => {
        fetch('http://localhost:3000/logout', {
            method: 'POST',
            credentials: 'include',
        }).then(() => setUserInfo(null));
    };

    const username = userInfo?.username;

    return (
        <header>
            <Link to="/" className="logo">
                The Blog
            </Link>

            <nav>
                {!username && (
                    <>
                        <Link to="/login">Вхід</Link>
                        <Link to="/register">Зареєструватись</Link>
                    </>
                )}
                {username && (
                    <>
                        <Link to="/create-post">Створити пост</Link>
                        <Link to="/" onClick={handleLogout}>
                            Вийти
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;
