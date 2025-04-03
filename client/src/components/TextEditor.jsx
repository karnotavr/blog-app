import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const TextEditor = ({ value, setValue }) => {
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean'],
        ],
    };

    return (
        <ReactQuill
            theme="snow"
            value={value}
            onChange={setValue}
            modules={modules}
        />
    );
};

export default TextEditor;
