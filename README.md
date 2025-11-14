rolepermission

Müdür-Çalışan ilişkili görev atama uygulaması
Bu proje, şirket içi görev atama ve takip sürecini dijitalleştirmek için geliştirilmiştir. Yöneticiler sisteme giriş yaparak çalışanlara iş/görev atayabilir; çalışanlar ise kendi hesaplarıyla giriş yapıp üzerlerine atanan görevleri görüntüleyebilir, durum güncellemesi yapabilir.

Özellikler

Rol bazlı erişim kontrolü (Yönetici vs Çalışan)

Görev oluşturma, atama, güncelleme ve silme

Departman bazlı görev yönetimi

Görev durumları (Beklemede, Devam Ediyor, Tamamlandı vb.)

Dosya ekleri ve son teslim tarihi takibi

RESTful API + JWT veya Session tabanlı kimlik doğrulama

Veri tabanı olarak MongoDB ve girişimler için Mongoose

Kullanıcı arayüzü için React kullanılmıştır

Teknik Yapı

Backend: Node.js + Express

Frontend: React

Veri tabanı: MongoDB + Mongoose

Kimlik doğrulama: JWT veya session – ihtiyaçlarınıza göre seçilebilir

Rol-izin sistemi: ayrı Role koleksiyonu + kullanıcı koleksiyonunda role referansı

Kurulum
1. Depoyu indirme
git clone https://github.com/ismailsoykok/rolepermission.git  
cd rolepermission  

2. Backend kurulumu
cd backend  
npm install  


.env dosyasını oluşturun ve içerisine aşağıdaki temel değişkenleri ekleyin:

MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_secret_key  
PORT=5000  

3. Frontend kurulumu
cd ../frontend  
npm install  


.env dosyasına (frontend klasöründe) gerekli değişkenleri ekleyin:

REACT_APP_API_URL=http://localhost:5000/api  

4. Projeyi başlatma

Backend için:

cd ../backend  
npm run dev / npm start




Frontend için:

cd ../frontend  
npm start


Tarayıcıda http://localhost:3000 adresinden uygulamayı görüntüleyebilirsiniz.

Kullanım

Yönetici hesabı oluşturun (örneğin /api/auth/register endpoint’i üzerinden).

Yönetici ile giriş yapın, departman oluşturun, çalışan ekleyin ve role (örneğin “Çalışan”) atayın.

Yönetici arayüzünden görev oluşturun, çalışanlara atayın.

Çalışan hesabıyla giriş yaparak size atanmış görevleri görüntüleyin, durum güncellemesi yapın veya ilgili dosyaları yükleyin.

Yönetici olarak görevlerin durumlarını takip edin, tamamlanan görevleri değerlendirin.

Rol & İzin Sistemi

roles koleksiyonu: her rol için bir belge (örneğin “Yönetici”, “Çalışan”, “Departman Yöneticisi”).

users koleksiyonu: her kullanıcı için rol referansı (roleId) bulunur.

Endpoint’ler, middleware sayesinde kullanıcının rolünü kontrol eder; yalnızca atanmış role sahip kullanıcılar erişebilir.

Örneğin: /api/tasks/create sadece “Yönetici” rolü tarafından çağrılabilir.
