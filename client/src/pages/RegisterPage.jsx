import { useState } from 'react';
import { Navigate } from 'react-router-dom';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        if (username.trim() === '' || password.trim() === '') {
            return alert('Заповніть поля!');
        }
        const res = await fetch('http://localhost:3000/register', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();
        alert(data);
        setUsername('');
        setPassword('');
        setRedirect(true);
    }
    if (redirect) {
        return <Navigate to={'/'} />;
    }

    return (
        <form className="register" onSubmit={handleSubmit}>
            <h2>Реєстрація</h2>
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
            <button type="submit">Зареєструватись</button>
        </form>
    );
};

export default RegisterPage;
