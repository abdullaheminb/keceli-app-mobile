**Genel Yapı**

Proje bir Expo (React Native) uygulaması olarak yapılandırılmıştır. Çalışmaya başlamak için README dosyasındaki adımlar izlenebilir. İlk kurulum ve çalıştırma komutları şöyle belirtilmiş:

```
1. npm install
2. npx expo start
```

Uygulama, Expo Router’ın dosya tabanlı yönlendirme sistemini kullanıyor. Sayfalar `app/` dizininde bulunuyor. Örneğin, `app/index.tsx` giriş (splash) ekranını; `app/(tabs)/` dizini ise alt sekmeleri tanımlıyor.

```
app/
  _layout.tsx       # Root layout ve navigasyon
  index.tsx         # Splash / yönlendirme ekranı
  login.tsx         # Giriş ekranı
  (tabs)/           # Alt tab bar sayfaları
    _layout.tsx     # Tab bar konfigürasyonu
    index.tsx       # “Alışkanlık” sekmesi
    adventure.tsx   # “Macera” sekmesi
    profile.tsx     # Profil sekmesi
screens/            # Ayrıntılı sayfa bileşenleri
```

Komponentler `components/` dizininde, stiller ise `css/` altında toplanmış. Ortak tip tanımları `types/index.ts` dosyasında yer alıyor. Firebase işlemleri `services/firebase.ts` içinde tanımlı.

**Firebase ve Veritabanı**

`docs/firebase-schema.md` dosyasında Firestore yapısı ayrıntılı şekilde belgelenmiş. Örneğin kullanıcı koleksiyonunun şeması ve alt koleksiyonlar şöyle gösterilmiş:

```
### 1. `users` Collection
{
  "username": "string",
  "makam": "number",
  "altin": "number",
  "can": "number",
  "maxHealth": "number",
  "profilePic": "string",
  "ihlas": "number",
  "role": "string"
}

#### 1.1. `users > [userId] > completedHabits` Subcollection
{
  "completed": "boolean",
  ...
}
```

Dosyada offline senkronizasyon stratejisi de anlatılmış; öncelikle veriler `AsyncStorage`’a kaydediliyor, daha sonra arka planda Firestore’a senkronize ediliyor:

```
### Offline Support Strategy:
const saveHabitLogOffline = async (...) => {
  ...
  syncToFirebase(logEntry);
};

const syncPendingLogs = async () => {
  ...
  await addDoc(collection(db, 'habitLogs'), { ... });
};
```

Güvenlik kuralları ve gerekli Firestore indeksleri yine aynı dokümanda belirtilmiş:

```
## 🔒 **Security Rules (UPDATED)**
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      match /completedHabits/{habitId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        ...
      }
      ...
    }
    match /habits/{habitId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

**Kodun Önemli Noktaları**

- **HabitsScreen (alışkanlık sayfası):** Kullanıcı verilerini, alışkanlıkları ve tamamlanma durumlarını Firebase’den çeker. Offline senkronizasyon ve optimistic update mantığı içerir.

- **Firebase servisleri:** `services/firebase.ts` dosyasında hem geleneksel “habitLogs” yaklaşımı hem de yeni alt koleksiyon modeline (modular completion system) yönelik fonksiyonlar bulunuyor.

Örneğin haftalık tamamlamaları alt koleksiyonlardan çekmek için yeni fonksiyonlar var:

- **CSS ve stil yönetimi:** `css/` altında komponent, layout ve modal stilleri ayrı dosyalarda tutulmuş.

- **Yerel veriler:** `AsyncStorage` profil kimliği gibi bilgileri tutmak için kullanılıyor (ör. `app/index.tsx`).

**Sonraki Aşamada Öğrenilebilecekler**

1. **Expo Router’ın dosya tabanlı yönlendirme sistemi** – yeni sayfa eklerken `app/` yapısını takip etmek.
2. **Firebase servis katmanı** – `services/firebase.ts` içinde yer alan modüler tamamlama sistemi ve kullanıcı/alışkanlık fonksiyonlarını detaylıca incelemek.
3. **Offline senkronizasyon akışı** – `docs/firebase-schema.md`’de anlatıldığı üzere, yerel kayıtların Firebase’e nasıl senkronize edildiği.
4. **Stil sistemi** – `css/` klasöründeki ortak stiller ve `constants` altındaki renk/makam tanımlarının kullanımı.
5. **Performans ve izleme** – `hooks/usePerformanceMonitor.ts` dosyasında örneklenen performans ölçümlerini geliştirmek.
6. **Projeyi sıfırlama scripti** – `npm run reset-project` komutu ile proje iskeletini temizleyip yeniden oluşturma mekanizması.

Bu temel bilgiler, kod tabanını tanımak ve yeni özellikler eklerken uyulması gereken yapıyı anlamak için iyi bir başlangıç noktası olacaktır. Projeyi çalıştırıp sayfalar arası gezerek yapıyı incelemeniz, ardından Firebase servislerinin ve mevcut bileşenlerin nasıl kullanıldığını öğrenmeniz önerilir.
