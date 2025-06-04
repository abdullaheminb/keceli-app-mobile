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
  "ihlas": "number",
  "role": "string"
}
```

### 2. `habits` Collection
```javascript
// Document ID: {habitId}
{
  "habitname": "string", // Habit name
  "makam": "number",     // Required makam level (0-4)
  "approval": "string", //Shows if habit auto approved or manually
  "canReward": "number", // Shows how much health point habit gives
  "frequency": "string", // Shows if habit weekly or daily
  "isActive": "boolean", // Shows if habit live
  "points": "number", // Shows how much points habit give.
  "repeat": "number", // Shows how many times it can be completed in given frequency
  "reward": "number", // Shows how much gold habit rewards
  "weekday": "string" // Shows whichday this habits shown (relevant only for weekly frequencies)
}
```
### 3. `habitLogs` Collection
```javascript
// Document ID: {habitId}
{
  "habitID": "string", // Related habits document ID
  "completed": "boolean",     // Shows if habit completed
  "createdAt": "timestamp", // Shows when habit is completed
  "date": "string", // Shows the day of completed habit
  "state": "string", // Shows if task is approved or not
  "timestamp": "string", // Timestamp
  "userId": "string" // Related users document ID
}
```

## 🔍 **Data Reading Examples**

### User Data Okuma:
```javascript
// Single user (NEW SCHEMA)
const userDoc = await db.collection('users').doc(userId).get();
const userData = userDoc.data();

// Map Firebase fields to app fields
const user = {
  id: userDoc.id,
  name: userData.username, // schema: username
  profileImage: userData.profilePic, // schema: profilePic
  lives: userData.can, // schema: can
  gold: userData.altin, // schema: altin
  makam: userData.makam // schema: makam (0-4)
};

// All users (admin)
const usersSnapshot = await db.collection('users').get();
const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### Habits Okuma (NEW SCHEMA):
```javascript
// All habits with new field names
const habitsSnapshot = await db.collection('habits').get();
const habits = habitsSnapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.habitname, // schema: habitname
    goldReward: data.reward, // schema: reward
    type: data.frequency, // schema: frequency (daily/weekly)
    isActive: data.isActive, // schema: isActive
    makam: data.makam, // schema: makam (0-4)
    canReward: data.canReward, // schema: canReward
    points: data.points, // schema: points
    repeat: data.repeat, // schema: repeat
    weekday: data.weekday, // schema: weekday
    approval: data.approval // schema: approval
  };
});

// Makam seviyesine göre filter (client-side - güvenlik için)
const userAccessibleHabits = habits.filter(habit => user.makam >= habit.makam);
```

### Habit Logs Okuma (NEW SCHEMA):
```javascript
// Belirli kullanıcının belirli gün completion'ları
const date = '2025-01-15';
const completionsQuery = query(
  collection(db, 'habitLogs'),
  where('userId', '==', userId), // schema: userId
  where('date', '==', date), // schema: date
  where('completed', '==', true) // schema: completed
);

const completionsSnapshot = await getDocs(completionsQuery);
const completions = completionsSnapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    habitId: data.habitID, // schema: habitID
    userId: data.userId, // schema: userId
    date: data.date, // schema: date
    completed: data.completed, // schema: completed
    state: data.state, // schema: state ('approved', 'pending', 'cancelled')
    createdAt: data.createdAt.toDate(), // schema: createdAt
    timestamp: data.timestamp // schema: timestamp
  };
});

// Kullanıcının belirli tarih aralığındaki tüm logs
const startDate = '2025-01-01';
const endDate = '2025-01-31';
const logsQuery = query(
  collection(db, 'habitLogs'),
  where('userId', '==', userId),
  where('date', '>=', startDate),
  where('date', '<=', endDate),
  orderBy('date', 'desc')
);
```

## ✍️ **Data Writing Examples**

### User Creation (NEW SCHEMA):
```javascript
const createUser = async (userId, userData) => {
  const userRef = doc(db, 'users', userId);
  
  await setDoc(userRef, {
    username: userData.name, // schema: username
    makam: 0, // schema: makam (0-4)
    altin: 0, // schema: altin (gold)
    can: 100, // schema: can (lives)
    profilePic: null, // schema: profilePic
    ihlas: 0, // schema: ihlas
    role: 'user', // schema: role
    createdAt: serverTimestamp()
  });
};
```

### Habit Creation (NEW SCHEMA):
```javascript
const createHabit = async (habitData) => {
  const habitRef = await addDoc(collection(db, 'habits'), {
    habitname: habitData.name, // schema: habitname
    makam: habitData.makam || 0, // schema: makam
    approval: 'auto', // schema: approval
    canReward: habitData.canReward || 0, // schema: canReward
    frequency: habitData.type || 'daily', // schema: frequency
    isActive: true, // schema: isActive
    points: habitData.goldReward || 0, // schema: points
    repeat: 1, // schema: repeat
    reward: habitData.goldReward || 0, // schema: reward
    weekday: '', // schema: weekday
    createdAt: serverTimestamp()
  });
  
  return habitRef.id;
};
```

### Habit Log Creation (NEW SCHEMA):
```javascript
const completeHabit = async (userId, habitId, date) => {
  // Create habit log
  const logRef = await addDoc(collection(db, 'habitLogs'), {
    habitID: habitId, // schema: habitID
    completed: true, // schema: completed
    createdAt: serverTimestamp(), // schema: createdAt
    date: date, // schema: date
    state: 'approved', // schema: state
    timestamp: new Date().toISOString(), // schema: timestamp
    userId: userId // schema: userId
  });
  
  // Update user's gold (altin field)
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    altin: increment(goldReward) // schema: altin
  });
  
  return logRef.id;
};
```

### Habit Log Update (NEW SCHEMA):
```javascript
const uncompleteHabit = async (userId, habitId, date) => {
  // Find the habit log
  const logsQuery = query(
    collection(db, 'habitLogs'),
    where('userId', '==', userId),
    where('habitID', '==', habitId),
    where('date', '==', date),
    where('completed', '==', true)
  );
  
  const snapshot = await getDocs(logsQuery);
  
  if (!snapshot.empty) {
    const logDoc = snapshot.docs[0];
    
    // Update the log
    await updateDoc(logDoc.ref, {
      completed: false, // schema: completed
      state: 'cancelled', // schema: state
      timestamp: new Date().toISOString() // schema: timestamp
    });
    
    // Reduce user's gold
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      altin: increment(-goldReward) // schema: altin
    });
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
    
    // Habit logs collection (NEW SCHEMA)
    match /habitLogs/{logId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
        request.auth.token.admin == true;
      // Only allow creation if user owns the log
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## 📈 **Firestore Indexes**

### Composite Indexes Required:

1. **habitLogs Collection:**
   - Fields: `userId` (Ascending), `date` (Descending), `completed` (Ascending)
   - Purpose: User'ın belirli tarih completion'larını çekmek
   
   - Fields: `userId` (Ascending), `habitID` (Ascending), `date` (Ascending), `completed` (Ascending)
   - Purpose: Belirli habit'in completion durumunu kontrol etmek
   
   - Fields: `userId` (Ascending), `date` (Ascending), `state` (Ascending)
   - Purpose: User'ın onay bekleyen habit'lerini çekmek

2. **habits Collection:**
   - Fields: `isActive` (Ascending), `makam` (Ascending)
   - Purpose: Aktif habit'leri makam seviyesine göre filtrelemek
   
   - Fields: `frequency` (Ascending), `isActive` (Ascending)
   - Purpose: Günlük/haftalık habit'leri filtrelemek

### Single Field Indexes (otomatik):
- `userId`, `date`, `makam`, `isActive`, `habitID`, `completed`, `state` fields automatically indexed

### Index Commands for Firebase CLI:
```bash
# habitLogs collection indexes
firebase firestore:indexes:add --collection-group=habitLogs --query-scope=COLLECTION --field=userId,ASCENDING --field=date,DESCENDING --field=completed,ASCENDING

firebase firestore:indexes:add --collection-group=habitLogs --query-scope=COLLECTION --field=userId,ASCENDING --field=habitID,ASCENDING --field=date,ASCENDING --field=completed,ASCENDING

firebase firestore:indexes:add --collection-group=habitLogs --query-scope=COLLECTION --field=userId,ASCENDING --field=date,ASCENDING --field=state,ASCENDING

# habits collection indexes  
firebase firestore:indexes:add --collection-group=habits --query-scope=COLLECTION --field=isActive,ASCENDING --field=makam,ASCENDING

firebase firestore:indexes:add --collection-group=habits --query-scope=COLLECTION --field=frequency,ASCENDING --field=isActive,ASCENDING
```

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

## 📱 **Mobile App Integration (NEW SCHEMA)**

### AsyncStorage Keys:
```javascript
const STORAGE_KEYS = {
  HABIT_LOGS: '@habit_logs_', // Updated for habitLogs
  LAST_SYNC: '@last_sync_date',
  USER_DATA: '@user_data',
  CACHED_HABITS: '@cached_habits'
};
```

### Field Mapping Functions:
```javascript
// Map Firebase user data to app format
const mapFirebaseUserToApp = (firebaseUser) => ({
  id: firebaseUser.id,
  name: firebaseUser.username, // schema: username
  profileImage: firebaseUser.profilePic, // schema: profilePic  
  lives: firebaseUser.can, // schema: can
  gold: firebaseUser.altin, // schema: altin
  makam: firebaseUser.makam // schema: makam
});

// Map Firebase habit data to app format
const mapFirebaseHabitToApp = (firebaseHabit) => ({
  id: firebaseHabit.id,
  name: firebaseHabit.habitname, // schema: habitname
  goldReward: firebaseHabit.reward, // schema: reward
  type: firebaseHabit.frequency, // schema: frequency
  isActive: firebaseHabit.isActive, // schema: isActive
  makam: firebaseHabit.makam // schema: makam
});

// Map Firebase habit log to app format
const mapFirebaseLogToApp = (firebaseLog) => ({
  id: firebaseLog.id,
  habitId: firebaseLog.habitID, // schema: habitID
  userId: firebaseLog.userId, // schema: userId
  date: firebaseLog.date, // schema: date
  completed: firebaseLog.completed, // schema: completed
  state: firebaseLog.state, // schema: state
  completedAt: firebaseLog.createdAt?.toDate() // schema: createdAt
});
```

### Offline Support Strategy:
```javascript
// 1. Save habit logs to AsyncStorage first (instant UI)
const saveHabitLogOffline = async (userId, habitId, date, completed) => {
  const key = `${STORAGE_KEYS.HABIT_LOGS}${userId}_${date}`;
  const existingLogs = await AsyncStorage.getItem(key);
  const logs = existingLogs ? JSON.parse(existingLogs) : [];
  
  const logEntry = {
    habitID: habitId, // schema: habitID
    userId: userId, // schema: userId
    date: date, // schema: date
    completed: completed, // schema: completed
    state: 'pending', // schema: state
    timestamp: new Date().toISOString(), // schema: timestamp
    synced: false // Local field for sync tracking
  };
  
  logs.push(logEntry);
  await AsyncStorage.setItem(key, JSON.stringify(logs));
  
  // 2. Then sync to Firebase (background)
  syncToFirebase(logEntry);
};

// 3. Handle conflicts on app restart
const syncPendingLogs = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const logKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.HABIT_LOGS));
  
  for (const key of logKeys) {
    const logs = JSON.parse(await AsyncStorage.getItem(key));
    const unsyncedLogs = logs.filter(log => !log.synced);
    
    for (const log of unsyncedLogs) {
      try {
        await addDoc(collection(db, 'habitLogs'), {
          habitID: log.habitID,
          userId: log.userId,
          date: log.date,
          completed: log.completed,
          state: 'approved',
          createdAt: serverTimestamp(),
          timestamp: log.timestamp
        });
        
        // Mark as synced
        log.synced = true;
      } catch (error) {
        console.warn('Failed to sync log:', error);
      }
    }
    
    await AsyncStorage.setItem(key, JSON.stringify(logs));
  }
};
```

### Error Handling:
```javascript
// Handle Firebase connection errors gracefully
const safeFirebaseOperation = async (operation, fallback) => {
  try {
    return await operation();
  } catch (error) {
    console.warn('Firebase operation failed:', error);
    return fallback();
  }
};

// Example usage
const getHabitsWithFallback = () => 
  safeFirebaseOperation(
    () => getActiveHabits(), // Try Firebase first
    () => getCachedHabits()  // Fallback to cached data
  );
``` 