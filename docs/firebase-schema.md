# 🔥 Firebase Schema Documentation

## 📊 **Collection Overview**

### 1. `users` Collection
```javascript
// Document ID: {userId}
{
  "username": "string",
  "makam": "number", // 0-4 (Çırak, İşçi, Usta, Master, Efsane)
  "altin": "number", // Gold amount
  "can": "number",   // Lives amount
  "profilePic": "string", // Optional profile image URL
  "createdAt": "timestamp",
  "lastLogin": "timestamp"
}
```

### 2. `habits` Collection
```javascript
// Document ID: {habitId}
{
  "habitname": "string", // Habit name
  "makam": "number",     // Required makam level (0-4)
  "description": "string", // Optional description
  "category": "string",    // Optional category
  "createdAt": "timestamp"
}
```

### 3. `userHabitCompletions` Collection ⭐ **NEW**
```javascript
// Document ID: {userId}_{date} (örnek: "user123_2025-01-15")
{
  "userId": "string",      // User ID
  "date": "string",        // YYYY-MM-DD format
  "completions": {
    "habitId1": {
      "count": "number",     // Kaç kere tamamlandı (1,2,3...)
      "timestamp": "string"  // Son completion zamanı (ISO format)
    },
    "habitId2": {
      "count": "number",
      "timestamp": "string"
    }
  },
  "metadata": {
    "totalHabits": "number",    // O gün toplam tamamlanan habit sayısı
    "lastUpdated": "timestamp"  // Son güncelleme zamanı
  }
}
```

## 🔍 **Data Reading Examples**

### User Data Okuma:
```javascript
// Single user
const userDoc = await db.collection('users').doc(userId).get();
const userData = userDoc.data();

// All users (admin)
const usersSnapshot = await db.collection('users').get();
const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### Habits Okuma:
```javascript
// All habits
const habitsSnapshot = await db.collection('habits').get();
const habits = habitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Makam seviyesine göre filter (client-side - güvenlik için)
const userAccessibleHabits = habits.filter(habit => user.makam >= habit.makam);
```

### Habit Completions Okuma:
```javascript
// Belirli kullanıcının belirli gün completion'ları
const date = '2025-01-15';
const docId = `${userId}_${date}`;
const completionDoc = await db.collection('userHabitCompletions').doc(docId).get();

if (completionDoc.exists) {
  const completions = completionDoc.data().completions;
  console.log('Today completions:', completions);
} else {
  console.log('No completions for this date');
}

// Kullanıcının belirli tarih aralığındaki tüm completion'ları
const startDate = '2025-01-01';
const endDate = '2025-01-31';
const completionsSnapshot = await db.collection('userHabitCompletions')
  .where('userId', '==', userId)
  .where('date', '>=', startDate)
  .where('date', '<=', endDate)
  .orderBy('date', 'desc')
  .get();
```

## ✍️ **Data Writing Examples**

### Habit Completion Kaydetme:
```javascript
// Habit tamamlandığında
const markHabitComplete = async (userId, habitId, date) => {
  const docId = `${userId}_${date}`;
  const docRef = db.collection('userHabitCompletions').doc(docId);
  
  const doc = await docRef.get();
  
  if (doc.exists) {
    // Existing document - update completion
    const data = doc.data();
    const currentCount = data.completions[habitId]?.count || 0;
    
    await docRef.update({
      [`completions.${habitId}.count`]: currentCount + 1,
      [`completions.${habitId}.timestamp`]: new Date().toISOString(),
      'metadata.lastUpdated': new Date()
    });
  } else {
    // New document - create
    await docRef.set({
      userId: userId,
      date: date,
      completions: {
        [habitId]: {
          count: 1,
          timestamp: new Date().toISOString()
        }
      },
      metadata: {
        totalHabits: 1,
        lastUpdated: new Date()
      }
    });
  }
};
```

### Habit Completion Silme/Azaltma:
```javascript
const decreaseHabitCompletion = async (userId, habitId, date) => {
  const docId = `${userId}_${date}`;
  const docRef = db.collection('userHabitCompletions').doc(docId);
  
  const doc = await docRef.get();
  if (doc.exists) {
    const data = doc.data();
    const currentCount = data.completions[habitId]?.count || 0;
    
    if (currentCount > 1) {
      // Decrease count
      await docRef.update({
        [`completions.${habitId}.count`]: currentCount - 1,
        'metadata.lastUpdated': new Date()
      });
    } else {
      // Remove habit completion entirely
      await docRef.update({
        [`completions.${habitId}`]: firebase.firestore.FieldValue.delete(),
        'metadata.lastUpdated': new Date()
      });
    }
  }
};
```

## 🔒 **Security Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Habits collection (read-only for users)
    match /habits/{habitId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // User habit completions
    match /userHabitCompletions/{completionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

## 📈 **Firestore Indexes**

### Composite Indexes:
1. **userHabitCompletions Collection:**
   - Fields: `userId` (Ascending), `date` (Descending)
   - Purpose: User'ın completion history'sini tarih sırasına göre çekmek

### Single Field Indexes (otomatik):
- `userId`, `date`, `makam` fields automatically indexed

## 🎯 **Best Practices**

### Performance:
- Document ID'lerde predictable pattern kullan: `{userId}_{date}`
- Batch operations kullan (multiple habits aynı anda)
- Client-side caching with AsyncStorage

### Data Consistency:
- Always update metadata fields
- Use transactions for critical operations
- Validate data before writing

### Security:
- Never trust client-side data
- Use server-side validation
- Implement proper user permissions

## 📱 **Mobile App Integration**

### AsyncStorage Keys:
```javascript
const STORAGE_KEYS = {
  HABIT_COMPLETIONS: '@habit_completions_',
  LAST_SYNC: '@last_sync_date',
  USER_DATA: '@user_data'
};
```

### Offline Support:
```javascript
// Save to AsyncStorage first (instant UI)
// Then sync to Firebase (background)
// Handle conflicts on app restart
``` 