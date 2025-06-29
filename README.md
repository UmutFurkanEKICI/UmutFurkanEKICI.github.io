# Push Bildirim Uygulaması

Bu proje, web push notification'ları test etmek ve öğrenmek için oluşturulmuş bir PWA (Progressive Web App) uygulamasıdır.

## Özellikler

- ✅ Push bildirim aboneliği
- ✅ Anlık bildirim gönderme
- ✅ Özel bildirim içeriği
- ✅ Zamanlı bildirimler
- ✅ PWA desteği
- ✅ Service Worker ile offline çalışma
- ✅ Modern ve responsive tasarım

## Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Sunucuyu başlatın:**
   ```bash
   npm start
   ```

3. **Tarayıcıda açın:**
   ```
   http://localhost:3000
   ```

## Kullanım

### 1. Bildirim İzni Verme
- "Bildirim İzni İste" butonuna tıklayın
- Tarayıcı izin penceresinde "İzin Ver" seçeneğini seçin

### 2. Push Aboneliği
- İzin verdikten sonra "Push Aboneliği" butonu görünecek
- Bu butona tıklayarak push bildirimleri almaya abone olun

### 3. Test Bildirimi
- "Test Bildirimi Gönder" butonu ile anlık bildirim gönderebilirsiniz

### 4. Özel Bildirim
- Başlık ve mesaj alanlarını doldurun
- "Bildirim Gönder" butonu ile özel içerikli bildirim gönderin

### 5. Zamanlı Bildirim
- Tarih ve saat seçin
- "Bildirim Zamanla" butonu ile gelecekte bir zamana bildirim planlayın

## API Endpoints

### GET /vapid-key
VAPID public key'ini döndürür.

### POST /subscribe
Push aboneliği ekler.

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

### POST /sendNotification
Bildirim gönderir.

**Request Body:**
```json
{
  "title": "Bildirim Başlığı",
  "body": "Bildirim mesajı",
  "icon": "/icon-192x192.png",
  "badge": "/icon-192x192.png"
}
```

### POST /scheduleNotification
Zamanlı bildirim planlar.

**Request Body:**
```json
{
  "title": "Zamanlı Bildirim",
  "body": "Bildirim mesajı",
  "scheduledTime": "2024-01-01T12:00:00.000Z"
}
```

### GET /subscriptions
Mevcut abonelikleri listeler.

### DELETE /subscriptions
Tüm abonelikleri temizler.

## Dosya Yapısı

```
deneme/
├── server.js          # Node.js sunucu
├── package.json       # Proje bağımlılıkları
├── index.html         # Ana HTML dosyası
├── sw.js             # Service Worker
├── manifest.json     # PWA manifest
└── README.md         # Bu dosya
```

## Güvenlik Notları

⚠️ **Önemli:** Bu proje eğitim amaçlıdır. Gerçek bir uygulamada:

1. VAPID anahtarlarını güvenli bir şekilde saklayın
2. Abonelikleri veritabanında saklayın
3. Kullanıcı kimlik doğrulaması ekleyin
4. HTTPS kullanın
5. Rate limiting ekleyin

## Tarayıcı Desteği

- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (iOS 16.4+)
- ✅ Edge (Desktop)

## Sorun Giderme

### Bildirim gelmiyor
1. Tarayıcı ayarlarından bildirim iznini kontrol edin
2. Service Worker'ın kayıtlı olduğundan emin olun
3. Sunucunun çalıştığından emin olun

### iOS'ta çalışmıyor
- iOS 16.4 veya üzeri gerekli
- Safari tarayıcısı kullanın
- Sayfayı ana ekrana ekleyin

### HTTPS gerekli
- Localhost'ta HTTP çalışır
- Canlı ortamda HTTPS gerekli

## Lisans

MIT License 