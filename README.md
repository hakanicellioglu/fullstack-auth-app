# Fullstack Authentication App

Bu proje, Node.js, Express.js ve MongoDB kullanarak basit bir kullanıcı kimlik doğrulama (auth) uygulaması geliştirmeyi amaçlamaktadır. Kullanıcılar, şifreleri güvenli bir şekilde hash'lenmiş olarak kaydedilir ve JWT (JSON Web Token) kullanılarak oturum yönetimi yapılır. Tokenlar güvenli bir şekilde HTTP-Only cookie ile saklanır.

## Proje Özellikleri
- Kullanıcı kaydı
- JWT ile kimlik doğrulama
- HTTP-Only Cookie ile güvenli oturum yönetimi
- Şifrelerin bcrypt.js ile hash'lenmesi
- MongoDB ile kullanıcı bilgilerini saklama

## Proje Bağlantısı
Proje GitHub üzerinde şu adreste barındırılmaktadır:
[https://github.com/hakanicellioglu/fullstack-auth-app](https://github.com/hakanicellioglu/fullstack-auth-app)

## Projeyi Çalıştırmak İçin Gerekenler

Projeyi çalıştırabilmek için aşağıdaki araçlara ihtiyacınız var:

- **Node.js** (v14 veya üstü): [Node.js İndir](https://nodejs.org/)
- **MongoDB**: Yerel bir MongoDB sunucusu ya da MongoDB Atlas kullanabilirsiniz.

### 1. Projeyi Klonlayın
Projeyi GitHub'dan klonlayın:

```bash
git clone https://github.com/hakanicellioglu/fullstack-auth-app.git
cd fullstack-auth-app
