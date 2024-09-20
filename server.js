const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser'); // Cookie işlemleri için

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'secretkey';

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

// Static dosyaları sunma (HTML, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/cusana', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// Kayıt işlemi
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // E-posta zaten kullanımda mı kontrol et
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email is already in use',
            });
        }

        // Şifreyi hash'le
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluştur
        const user = new User({
            email,
            password: hashedPassword,
        });

        await user.save();

        // JWT token oluştur (1 saat geçerli olacak)
        const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        // Token'ı HTTP-Only bir cookie olarak saklama
        res.cookie('token', token, {
            httpOnly: true, // JavaScript tarafından erişilemez
            secure: process.env.NODE_ENV === 'production', // Sadece HTTPS'de kullanılır
            sameSite: 'Strict', // CSRF koruması için
            maxAge: 3600000, // 1 saat
        });

        // Başarı cevabı
        return res.status(201).json({
            success: true,
            message: 'User successfully registered',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                },
            },
        });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// Sunucuyu başlatma
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});