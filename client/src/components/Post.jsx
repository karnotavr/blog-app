import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { AiOutlineLike, AiOutlineComment } from 'react-icons/ai';

const Post = ({
    _id,
    title,
    description,
    image,
    content,
    createdAt,
    author,
    comments,
    likes,
}) => {
    return (
        <div className="post">
            <div className="content">
                <p className="info">
                    <span className="author">{author.username}</span>
                    <span className="date">
                        {format(new Date(createdAt), 'd MMMM yyyy, HH:mm', {
                            locale: uk,
                        })}
                    </span>
                </p>
                <Link to={`/post/${_id}`}>
                    <h3>{title}</h3>
                </Link>
                <p className="description">{description}</p>
                <span className="likes">
                    <AiOutlineLike className="likes-icon" />
                    {likes.length}
                </span>
                <span className="comments">
                    <AiOutlineComment className="likes-icon" />
                    {comments.length}
                </span>
            </div>
            <div className="image">
                <Link to={`/post/${_id}`}>
                    <img
                        src={`http://localhost:3000/${image}`}
                        alt="Обкладинка"
                    />
                </Link>
            </div>
        </div>
    );
};

export default Post;
