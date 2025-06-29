const webpush = require('web-push');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// VAPID anahtarlarını oluştur (sadece ilk seferde çalıştırın)
const vapidKeys = webpush.generateVAPIDKeys();
console.log('VAPID Anahtarları:');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);

// VAPID detaylarını ayarla
webpush.setVapidDetails(
  'mailto:your-email@example.com', // Kendi email adresinizi yazın
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Abonelikleri saklamak için basit bir dizi (gerçek projede veritabanı kullanın)
let subscriptions = [];

// VAPID anahtarı endpoint'i
app.get('/vapid-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// Push aboneliği endpoint'i
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  
  // Aynı aboneliği tekrar eklemeyi önle
  const exists = subscriptions.find(sub => 
    sub.endpoint === subscription.endpoint
  );
  
  if (!exists) {
    subscriptions.push(subscription);
    console.log('Yeni abonelik eklendi:', subscription.endpoint);
  }
  
  res.status(201).json({ 
    message: 'Abonelik başarıyla eklendi',
    totalSubscriptions: subscriptions.length 
  });
});

// Bildirim gönderme endpoint'i
app.post('/sendNotification', async (req, res) => {
  const { title, body, icon, badge } = req.body;
  
  if (!title || !body) {
    return res.status(400).json({ error: 'Title ve body gerekli' });
  }
  
  const payload = JSON.stringify({ 
    title, 
    body, 
    icon: icon || '/icon-192x192.png',
    badge: badge || '/icon-192x192.png'
  });
  
  const results = [];
  
  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(subscription, payload);
      results.push({ endpoint: subscription.endpoint, status: 'success' });
    } catch (error) {
      console.error('Bildirim gönderme hatası:', error);
      
      // Geçersiz abonelikleri kaldır
      if (error.statusCode === 410) {
        subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
        console.log('Geçersiz abonelik kaldırıldı:', subscription.endpoint);
      }
      
      results.push({ endpoint: subscription.endpoint, status: 'error', error: error.message });
    }
  }
  
  res.json({ 
    success: true, 
    results,
    totalSubscriptions: subscriptions.length 
  });
});

// Zamanlı bildirim endpoint'i
app.post('/scheduleNotification', async (req, res) => {
  const { title, body, scheduledTime, icon, badge } = req.body;
  
  if (!title || !body || !scheduledTime) {
    return res.status(400).json({ error: 'Title, body ve scheduledTime gerekli' });
  }
  
  const scheduledDate = new Date(scheduledTime);
  const now = new Date();
  
  if (scheduledDate <= now) {
    return res.status(400).json({ error: 'Gelecek bir tarih seçin' });
  }
  
  const delay = scheduledDate.getTime() - now.getTime();
  
  // Zamanlı bildirim gönder
  setTimeout(async () => {
    const payload = JSON.stringify({ 
      title, 
      body, 
      icon: icon || '/icon-192x192.png',
      badge: badge || '/icon-192x192.png'
    });
    
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(subscription, payload);
        console.log('Zamanlı bildirim gönderildi:', subscription.endpoint);
      } catch (error) {
        console.error('Zamanlı bildirim hatası:', error);
      }
    }
  }, delay);
  
  res.json({ 
    success: true, 
    message: 'Bildirim zamanlandı',
    scheduledTime: scheduledDate.toISOString(),
    totalSubscriptions: subscriptions.length 
  });
});

// Abonelikleri listeleme endpoint'i
app.get('/subscriptions', (req, res) => {
  res.json({ 
    subscriptions: subscriptions.map(sub => ({ endpoint: sub.endpoint })),
    total: subscriptions.length 
  });
});

// Abonelikleri temizleme endpoint'i
app.delete('/subscriptions', (req, res) => {
  subscriptions = [];
  res.json({ message: 'Tüm abonelikler temizlendi' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Push sunucusu ${PORT} portunda çalışıyor`);
  console.log(`http://localhost:${PORT} adresinden erişebilirsiniz`);
});