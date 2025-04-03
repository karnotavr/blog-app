import { useEffect, useState } from 'react';
import Post from '../components/Post';

const HomePage = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/post')
            .then((res) => res.json())
            .then((json) => setPosts(json))
            .catch((err) => alert(err.message));
    }, []);

    if (posts.length === 0) return <div>Постів немає</div>;

    return (
        <>
            {posts.length > 0 &&
                posts.map((post) => <Post key={post._id} {...post} />)}
        </>
    );
};

export default HomePage;
