const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

// express: Node.js framework'ü olup, web sunucusu oluşturmak için kullanılır.
// mongoose: MongoDB ile iletişim kurmak için kullanılır. MongoDB, NoSQL bir veritabanıdır.
// bodyParser: HTTP isteklerinde gelen verileri analiz etmek için kullanılır. JSON verilerini okuyabilmemizi sağlar.
// bcrypt: Şifreleme kütüphanesi olup, kullanıcı şifrelerini güvenli bir şekilde hash'lemek (şifrelemek) için kullanılır.
// jwt (jsonwebtoken): JSON Web Token oluşturmak ve doğrulamak için kullanılır, bu sayede kullanıcı kimlik doğrulaması yapılır.
// cors: Farklı domain'ler arasında veri alışverişine izin verir. Genellikle API'ler üzerinde çalışırken kullanılır.
// path: Dosya ve dizin yolları üzerinde işlemler yapmak için kullanılan Node.js modülü.
// cookieParser: Tarayıcıya cookie ekleyebilmek ve bu cookie'leri okuyabilmek için kullanılır.

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'secretkey';

// app: Express uygulaması başlatılır.
// PORT: Sunucunun çalışacağı port numarası. Eğer ortam değişkeninde bir port belirtilmemişse 5000 portunda çalışır.
// JWT_SECRET: Token oluşturmak için kullanılan gizli anahtar.

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

// app.use(bodyParser.json()): Gelen isteklerdeki JSON verileri okunur.
// app.use(cors()): CORS politikasını uygulayarak API'ye başka domain'lerden erişimi sağlar.
// app.use(cookieParser()): Cookie işlemleri için kullanılır.

// Static dosyaları sunma (HTML, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Sunucunun "public" klasöründe bulunan HTML, CSS gibi statik dosyalar kullanıcıya sunulur.

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/cusana', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// mongoose.connect: Yerel bir MongoDB sunucusuna bağlantı sağlanır. Veritabanı adı "cusana" olarak belirtilmiştir.

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// UserSchema: Kullanıcı bilgilerini tutacak şema oluşturuluyor. Her kullanıcının bir email (benzersiz) ve password (şifrelenmiş) alanı vardır.
// User: Bu şemaya dayalı MongoDB'de "User" adında bir model oluşturulur. Bu model kullanıcıları veritabanına eklemek, güncellemek gibi işlemler için kullanılır.

// Kayıt işlemi
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // POST isteği alındığında yeni bir kullanıcı kaydı yapılır.İstek gövdesinden(request body) email ve password alınır.


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email is already in use',
            });
        }

        // existingUser: Aynı email ile kayıtlı başka bir kullanıcı olup olmadığı kontrol edilir. Eğer varsa hata döndürülür.

        // Şifreyi hash'le
        const hashedPassword = await bcrypt.hash(password, 10);

        // bcrypt.hash: Gelen şifre, bcrypt kullanılarak hash'lenir. Hash fonksiyonu 10 tur ile çalışır, yani şifre güvenliği arttırılmıştır.

        // Yeni kullanıcı oluştur
        const user = new User({
            email,
            password: hashedPassword,
        });

        await user.save();

        // Yeni bir kullanıcı oluşturulup, MongoDB veritabanına kaydedilir.

        // JWT token oluştur (1 saat geçerli olacak)
        const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        // jwt.sign: Kullanıcı kimliği doğrulamak için JSON Web Token (JWT) oluşturulur. Token 1 saat geçerli olacak şekilde ayarlanmıştır.

        // Token'ı HTTP-Only bir cookie olarak saklama
        res.cookie('token', token, {
            httpOnly: true, // JavaScript tarafından erişilemez
            secure: process.env.NODE_ENV === 'production', // Sadece HTTPS'de kullanılır
            sameSite: 'Strict', // CSRF koruması için
            maxAge: 3600000, // 1 saat
        });

        //         res.cookie: JWT token, HTTP-Only cookie olarak tarayıcıya gönderilir. Bu sayede kullanıcı kimlik doğrulaması yapılabilir ve JavaScript erişimi engellenir.
        // secure: Üretim ortamında (production) bu cookie sadece HTTPS üzerinde çalışır.
        // sameSite: CSRF saldırılarına karşı korunmak için bu seçenek kullanılır.
        // maxAge: Cookie'nin geçerlilik süresi 1 saat olarak ayarlanır.

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
// Başarılı bir şekilde kullanıcı kaydedilirse, 201 (Created) statüsü ile başarı mesajı ve kullanıcı bilgileri döndürülür. Eğer hata oluşursa, 500 (Internal Server Error) statüsü döndürülür.

// Sunucuyu başlatma
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// app.listen: Sunucu belirtilen portta çalışmaya başlar ve konsola port numarası yazdırılır.