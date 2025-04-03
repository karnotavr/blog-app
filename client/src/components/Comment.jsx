import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { MdDeleteOutline } from 'react-icons/md';

const Comment = ({
    commentId,
    username,
    text,
    createdAt,
    canDelete,
    onDeleteBtnClick,
}) => {
    return (
        <div className="comment">
            <div className="comment-info">
                <div>
                    <span className="username">{username}</span>
                    <span className="date">
                        {format(new Date(createdAt), 'd MMMM yyyy, HH:mm', {
                            locale: uk,
                        })}
                    </span>
                </div>
                {canDelete && (
                    <button
                        title="Видалити коментарій"
                        className="delete-btn"
                        onClick={() => onDeleteBtnClick(commentId)}
                    >
                        <MdDeleteOutline className="delete-icon" />
                    </button>
                )}
            </div>
            <div className="comment-text">{text}</div>
        </div>
    );
};

export default Comment;
