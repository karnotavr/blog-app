import { useContext, useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { FaEdit } from 'react-icons/fa';
import { AiOutlineLike, AiFillLike } from 'react-icons/ai';
import { MdDeleteOutline } from 'react-icons/md';
import Comment from '../components/Comment';

const SinglePostPage = () => {
    const { id } = useParams();
    const [postInfo, setPostInfo] = useState(null);
    const { userInfo } = useContext(UserContext);
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [redirect, setRedirect] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [canDeletePost, setCanDeletePost] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:3000/post/${id}`)
            .then((res) => res.json())
            .then((postInfo) => {
                setPostInfo(postInfo);
                setLikes(postInfo.likes.length);
                setLiked(postInfo.likes.includes(userInfo?._id));
                setCanDeletePost(
                    userInfo?.isAdmin || userInfo?._id === postInfo?.author._id
                );
                setComments(
                    postInfo.comments.map((comment) => ({
                        ...comment,
                        canDelete:
                            userInfo?.isAdmin ||
                            userInfo?._id === comment.userId,
                    }))
                );
                setIsLoading(false);
            })
            .catch((err) => alert(err.message));
    }, [userInfo, id]);

    async function createNewComment(e) {
        if (commentText.trim() === '') {
            return alert('Пусте поле');
        }
        try {
            const res = await fetch(
                `http://localhost:3000/post/${id}/comment`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: commentText }),
                    credentials: 'include',
                }
            );
            if (!res.ok) throw new Error('Помилка при додаванні коментаря');

            const updatedComments = await res.json();

            setComments(
                updatedComments.map((comment) => ({
                    ...comment,
                    canDelete:
                        userInfo?.isAdmin || userInfo?._id === comment.userId,
                }))
            );
            setCommentText('');
        } catch (err) {
            alert(err.message);
        }
    }

    async function deleteComment(commentId) {
        try {
            const res = await fetch(
                `http://localhost:3000/post/${id}/comment`,
                {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ commentId }),
                    credentials: 'include',
                }
            );
            if (!res.ok) throw new Error('Помилка при видаленні коментаря');
            setComments((prev) =>
                prev.filter((comment) => comment._id !== commentId)
            );
        } catch (err) {
            alert(err.message);
        }
    }

    async function toggleLike() {
        const res = await fetch(`http://localhost:3000/post/${id}/like`, {
            method: 'POST',
            credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
            alert(data);
        }
        setLiked(!liked);
        setLikes(liked ? likes - 1 : likes + 1);
    }

    async function deletePost() {
        const res = await fetch(`http://localhost:3000/post/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (res.ok) {
            setRedirect(true);
        } else {
            const data = await res.json();
            alert(data);
        }
    }

    if (!postInfo) return 'Завантаження...';

    if (redirect) {
        return <Navigate to={`/`} />;
    }

    if (isLoading) return <>Завантаження...</>;

    return (
        <div className="post-page">
            <div className="post-sec">
                <div className="post-info">
                    <div className="flex-wrap">
                        <h2 className="post-title">{postInfo.title}</h2>
                        <span className="date">
                            {format(
                                new Date(postInfo.createdAt),
                                'd MMMM yyyy, HH:mm',
                                {
                                    locale: uk,
                                }
                            )}
                        </span>
                        <div className="post-controls">
                            {userInfo?._id === postInfo.author._id && (
                                <Link
                                    className="edit-btn"
                                    title="Змінити пост"
                                    to={`/edit/${postInfo._id}`}
                                >
                                    <FaEdit className="edit-icon" />
                                </Link>
                            )}
                            {canDeletePost && (
                                <button
                                    className="delete-btn"
                                    title="Видалити пост"
                                    onClick={deletePost}
                                >
                                    <MdDeleteOutline className="delete-icon" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="author">
                        Автор: {postInfo.author.username}
                    </div>
                </div>
                <div className="image">
                    <img
                        src={`http://localhost:3000/${postInfo.image}`}
                        alt="Обкладинка"
                    />
                </div>
                <div dangerouslySetInnerHTML={{ __html: postInfo.content }} />
                <div className="likes-sec">
                    {userInfo?._id === postInfo.author._id || !userInfo?._id ? (
                        <span className="likes">
                            <AiOutlineLike className="likes-icon" />
                            {likes}
                        </span>
                    ) : (
                        <button className="like-btn" onClick={toggleLike}>
                            {liked ? <AiFillLike /> : <AiOutlineLike />} {likes}
                        </button>
                    )}
                </div>
            </div>

            <div className="comment-sec">
                <span>{comments.length} коментарів</span>
                <div className="form-comment">
                    <textarea
                        cols="50"
                        rows="5"
                        placeholder="Додайте коментар..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    ></textarea>
                    <div className="comments-btns">
                        <button
                            className="clear-btn"
                            onClick={() => {
                                setCommentText('');
                            }}
                        >
                            Відміна
                        </button>
                        <button className="send-btn" onClick={createNewComment}>
                            Надіслати
                        </button>
                    </div>
                </div>

                <div className="comments">
                    {comments.map((comment) => (
                        <Comment
                            key={comment._id}
                            commentId={comment._id}
                            username={comment.username}
                            text={comment.text}
                            createdAt={comment.createdAt}
                            canDelete={comment.canDelete}
                            onDeleteBtnClick={deleteComment}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SinglePostPage;
