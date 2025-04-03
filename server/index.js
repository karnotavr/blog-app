const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Можна завантажувати лише зображення'), false);
    }
};
const uploadMiddleware = multer({ dest: 'uploads/', fileFilter });
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const User = require('./models/User');
const Post = require('./models/Post');

app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: ['http://localhost:4173', 'http://localhost:5173'],
    })
);
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose
    .connect(process.env.DB_URI)
    .then(() => console.log('Підключено до бази даних'))
    .catch((err) => console.error('Помилка підключення:', err));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const isExist = await User.findOne({ username });
        if (isExist) {
            return res.status(400).json('Такий користувач вже існує!');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            password: hashedPassword,
        });
        res.status(201).json('Користувача успішно зареєстровано!');
    } catch (err) {
        res.status(500).json('Помилка на сервері: ' + err.message);
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userInfo = await User.findOne({ username });
        if (!userInfo) {
            return res.status(400).json('Неправильний логін або пароль');
        }

        const passOk = bcrypt.compareSync(password, userInfo.password);
        if (!passOk) {
            return res.status(400).json('Неправильний логін або пароль');
        }

        const token = jwt.sign(
            { username, _id: userInfo._id, isAdmin: userInfo.isAdmin },
            process.env.JWT_SECRET
        );

        res.cookie('token', token).json({
            username,
            _id: userInfo._id,
            isAdmin: userInfo.isAdmin,
        });
    } catch (err) {
        res.status(500).json('Помилка на сервері: ' + err.message);
    }
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json('Неавторизований');
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json('Невірний токен');
        }

        const user = await User.findById(decoded._id).select('-password');
        res.json(user);
    });
});

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('Користувач успішно вийшов з системи');
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const { token } = req.cookies;

    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decoded) => {
        if (err) {
            return res.status(500).json('Помилка при авторизації користувача');
        }
        const { title, description, content } = req.body;

        try {
            const postInfo = await Post.create({
                title,
                description,
                content,
                image: newPath,
                author: decoded._id,
            });
            res.json(postInfo);
        } catch (err) {
            return res.status(500).json('Помилка при створенні посту');
        }
    });
});

app.get('/post', async (req, res) => {
    const posts = await Post.find()
        .populate('author', ['username'])
        .sort({ createdAt: -1 });
    res.json(posts);
});

app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postInfo = await Post.findById(id).populate('author', ['username']);
    res.json(postInfo);
});

app.delete('/post/:id', async (req, res) => {
    const { id } = req.params;
    const { token } = req.cookies;
    const postInfo = await Post.findById(id);
    if (!postInfo) {
        return res.status(404).json('Пост не знайдено');
    }

    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decoded) => {
        if (err) {
            return res.status(500).json('Помилка при авторизації користувача');
        }
        const isAdmin = decoded.isAdmin;
        const isAuthor =
            JSON.stringify(postInfo.author) === JSON.stringify(decoded._id);
        if (isAdmin || isAuthor) {
            const imagePath = path.join(__dirname, postInfo.image);
            if (!imagePath) {
                return res.status(500).json('Помилка при видаленні зображення');
            }
            fs.unlink(imagePath, (err) => {
                if (err) {
                    return res
                        .status(500)
                        .json('Помилка при видаленні зображення');
                }
            });
            await Post.findByIdAndDelete(id);
            res.json('Пост успішно видалено');
        }
    });
});

app.post('/post/:id/like', async (req, res) => {
    const { id } = req.params;
    const { token } = req.cookies;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const post = await Post.findById(id);
    if (!post) {
        return res.status(404).json('Пост не знайдено');
    }
    const userIndex = post.likes.indexOf(decoded._id);
    if (userIndex === -1) {
        post.likes.push(decoded._id);
    } else {
        post.likes.splice(userIndex, 1);
    }

    await post.save();
    res.json({ likes: post.likes.length });
});

app.post('/post/:id/comment', async (req, res) => {
    const { id } = req.params;
    const { token } = req.cookies;
    const { text } = req.body;

    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decoded) => {
        if (err) {
            return res.status(500).json('Помилка при авторизації користувача');
        }
        const userId = decoded._id;
        const username = decoded.username;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json('Пост не знайдено');
        }
        const newComment = {
            userId,
            username,
            text,
            createdAt: new Date(),
        };

        post.comments.push(newComment);
        await post.save();

        res.json(post.comments);
    });
});

app.delete('/post/:id/comment', async (req, res) => {
    // const { id } = req.params;
    // const { token } = req.cookies;
    // const post = await Post.findById(id);
    // if (!post) {
    //     return res.status(404).json('Пост не знайдено');
    // }
    // const { commentId } = req.body;
    // const comment = post.comments.find((el) => el._id.toString() === commentId);
    // if (!comment) {
    //     return res.status(404).json('Коментар не знайдено');
    // }
    // jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decoded) => {
    //     if (err) {
    //         return res.status(500).json('Помилка при авторизації користувача');
    //     }
    //     const userId = decoded._id;
    //     if (userId === comment.userId.toString() || decoded.isAdmin) {
    //         post.comments = post.comments.filter(
    //             (el) => el._id.toString() !== commentId
    //         );
    //         await post.save();
    //         res.json(post.comments);
    //     }
    // });
    const { id } = req.params;
    const { token } = req.cookies;
    const post = await Post.findById(id);
    if (!post) {
        return res.status(404).json('Пост не знайдено');
    }
    const { commentId } = req.body;
    const comment = post.comments.find((el) => el._id.toString() === commentId);
    if (!comment) {
        return res.status(404).json('Коментар не знайдено');
    }
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decoded) => {
        if (err) {
            return res.status(500).json('Помилка при авторизації користувача');
        }
        const userId = decoded._id;
        if (userId === comment.userId.toString() || decoded.isAdmin) {
            post.comments = post.comments.filter(
                (el) => el._id.toString() !== commentId
            );
            await post.save();
            res.json(post.comments);
        }
    });
});

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;
    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decoded) => {
        if (err) {
            return res.status(500).json('Помилка при авторизації користувача');
        }
        const { title, description, content, id } = req.body;
        const postInfo = await Post.findById(id);
        if (!postInfo) {
            return res.status(404).json('Пост не знайдено');
        }
        const isAuthor =
            JSON.stringify(postInfo.author) === JSON.stringify(decoded._id);
        if (!isAuthor) {
            return res.status(400).json('Ви не є автором посту');
        }
        postInfo.title = title;
        postInfo.description = description;
        postInfo.content = content;
        postInfo.image = newPath ? newPath : postInfo.image;

        await postInfo.save();
        res.json(postInfo);
    });
});

app.listen(3000);
