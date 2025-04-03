import { useState, useEffect } from 'react';
import TextEditor from '../components/TextEditor';
import { useParams, Navigate } from 'react-router-dom';
import DOMPurify from 'dompurify';

const EditPostPage = () => {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:3000/post/${id}`)
            .then((res) => res.json())
            .then((postInfo) => {
                setTitle(postInfo.title);
                setDescription(postInfo.description);
                setContent(postInfo.content);
            });
    }, []);

    async function updatePost(e) {
        e.preventDefault();
        if (
            title.trim() === '' ||
            description.trim() === '' ||
            content.trim() === ''
        ) {
            return alert('Заповніть всі поля!');
        }
        const cleanContent = DOMPurify.sanitize(content);

        const post = new FormData();
        post.set('title', title);
        post.set('description', description);
        post.set('content', cleanContent);
        post.set('id', id);
        if (files?.[0]) {
            post.set('file', files?.[0]);
        }
        const res = await fetch('http://localhost:3000/post', {
            method: 'PUT',
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
        return <Navigate to={`/post/${id}`} />;
    }
    return (
        <form onSubmit={updatePost} className="post-form">
            <input
                type="text"
                placeholder="Заголовок"
                value={title}
                onChange={(ev) => setTitle(ev.target.value)}
            />
            <input
                type="text"
                placeholder="Опис"
                value={description}
                onChange={(ev) => setDescription(ev.target.value)}
            />
            <input type="file" onChange={(ev) => setFiles(ev.target.files)} />
            <TextEditor value={content} setValue={setContent} />
            <button type="submit">Оновити пост</button>
        </form>
    );
};

export default EditPostPage;
