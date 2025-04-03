import { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import UserContext from '../context/UserContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState('');
    const { userInfo, setUserInfo } = useContext(UserContext);

    async function handleSubmit(e) {
        e.preventDefault();
        if (username.trim() === '' || password.trim() === '') {
            return alert('Заповніть поля!');
        }
        const res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
            setUserInfo(data);
            setRedirect(true);
        } else {
            alert(data);
            setUsername('');
            setPassword('');
        }
    }

    if (redirect) {
        return <Navigate to={'/'} />;
    }

    return (
        <form className="login" onSubmit={handleSubmit}>
            <h2>Вхід</h2>
            <div className="inputs">
                <input
                    type="text"
                    placeholder="Введіть логін"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Введіть пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button type="submit">Увійти</button>
        </form>
    );
};

export default LoginPage;
