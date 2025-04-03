import { createContext, useState, useEffect } from 'react';

const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await fetch('http://localhost:3000/profile', {
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserInfo(data);
                } else {
                    alert(data);
                    setUserInfo(null);
                }
            } catch (err) {
                console.error(err);
                setUserInfo(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserInfo();
    }, []);

    if (isLoading) return <>Завантаження...</>;

    return (
        <UserContext.Provider value={{ userInfo, setUserInfo }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserContext;
