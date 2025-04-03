import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import TextEditor from '../components/TextEditor';
import DOMPurify from 'dompurify';

const CreatePostPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState(null);
    const [content, setContent] = useState('');
    const [redirect, setRedirect] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (
            title.trim() === '' ||
            description.trim() === '' ||
            !files ||
            content.trim() === ''
        ) {
            return alert('Заповніть всі поля!');
        }

        const cleanContent = DOMPurify.sanitize(content);

        const post = new FormData();
        post.set('title', title);
        post.set('description', description);
        post.set('file', files[0]);
        post.set('content', cleanContent);

        const res = await fetch('http://localhost:3000/post', {
            method: 'POST',
            body: post,
            credentials: 'include',
        });

        if (res.ok) {
            setRedirect(true);
        } else {
            const data = await res.json();
            alert(data);
        }
    }

    if (redirect) {
        return <Navigate to={'/'} />;
    }

    return (
        <form onSubmit={handleSubmit} className="post-form">
            <input
                type="text"
                placeholder="Заголовок"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <input
                type="text"
                placeholder="Опис"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <input type="file" onChange={(e) => setFiles(e.target.files)} />
            <TextEditor value={content} setValue={setContent} />
            <button>Створити пост</button>
        </form>
    );
};

export default CreatePostPage;
