# 🔥 Firebase Schema Documentation

## 📊 **Collection Overview**

### 1. `users` Collection
```javascript
// Document ID: {userId}
{
  "username": "string",
  "makam": "number", // 0-4 (Çalışkan Karınca, Azimli Çekirge, Pürdikkat Kertenkele, Arif Karga, İşlek Efendi)
  "altin": "number", // Gold amount
  "can": "number",   // Lives amount
  "maxHealth": "number", // Max lives limit
  "profilePic": "string", // Optional profile image URL
  "ihlas": "number",
  "role": "string"
}
```

#### 1.1. `users > [userId] > completedHabits` Subcollection
```javascript
// Document ID: {habitId} (same as the habit's document ID)
{
  "completed": "boolean", // Task completion status (used for uncheck or multi-repeat habits)
  "completedAt": "timestamp", // When the habit was last completed/updated
  "dates": ["string"], // Array of completion dates (YYYY-MM-DD format) ["2025-01-15", "2025-01-16", ...]
  "progress": "number", // How many times the task was repeated (total count)
  "state": "string" // "pending" if manual approval, "approved" if auto approval
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
  makam: userData.makam, // schema: makam (0-4)
  maxHealth: userData.maxHealth || 100 // schema: maxHealth
};

// All users (admin)
const usersSnapshot = await db.collection('users').get();
const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### Completed Habits Okuma (NEW SUBCOLLECTION SCHEMA):
```javascript
// Get user's completed habits for a specific date
const date = '2025-01-15';
const completedHabitsRef = collection(db, 'users', userId, 'completedHabits');
const completedHabitsSnapshot = await getDocs(completedHabitsRef);

const completedHabits = completedHabitsSnapshot.docs
  .map(doc => ({
    id: doc.id, // habitId
    ...doc.data()
  }))
  .filter(completion => 
    completion.completed === true && 
    completion.dates && 
    completion.dates.includes(date)
  );

// Get specific habit completion status
const habitCompletionRef = doc(db, 'users', userId, 'completedHabits', habitId);
const habitCompletionDoc = await getDoc(habitCompletionRef);

if (habitCompletionDoc.exists()) {
  const completionData = habitCompletionDoc.data();
  const isCompletedToday = completionData.completed === true && 
                          completionData.dates && 
                          completionData.dates.includes(date);
  
  // Get all completion dates for this habit
  const allCompletionDates = completionData.dates || [];
  console.log('Habit completed on:', allCompletionDates);
}
```

### Weekly Habits Okuma (NEW SUBCOLLECTION SCHEMA):
```javascript
// Get user's weekly habit completions
const startDate = '2025-01-13'; // Saturday
const endDate = '2025-01-19';   // Friday

const completedHabitsRef = collection(db, 'users', userId, 'completedHabits');
const weeklyCompletionsSnapshot = await getDocs(completedHabitsRef);

const weeklyCompletions = weeklyCompletionsSnapshot.docs
  .map(doc => ({
    habitId: doc.id,
    ...doc.data()
  }))
  .filter(completion => {
    if (!completion.completed || !completion.dates) return false;
    
    // Check if any completion date falls within the week range
    return completion.dates.some(date => 
      date >= startDate && date <= endDate
    );
  });

// Get detailed completion history
weeklyCompletions.forEach(completion => {
  const weekDates = completion.dates.filter(date => 
    date >= startDate && date <= endDate
  );
  console.log(`Habit ${completion.habitId} completed on:`, weekDates);
});
```

## ✍️ **Data Writing Examples**

### User Creation (UPDATED SCHEMA):
```javascript
const createUser = async (userId, userData) => {
  const userRef = doc(db, 'users', userId);
  
  await setDoc(userRef, {
    username: userData.name, // schema: username
    makam: 0, // schema: makam (0-4)
    altin: 0, // schema: altin (gold)
    can: 100, // schema: can (lives)
    maxHealth: 100, // schema: maxHealth (max lives limit)
    profilePic: null, // schema: profilePic
    ihlas: 0, // schema: ihlas
    role: 'user', // schema: role
    createdAt: serverTimestamp()
  });
  
  // Note: completedHabits subcollection will be created automatically when first habit is completed
};
```

### Habit Completion (NEW SUBCOLLECTION SCHEMA):
```javascript
const completeHabit = async (userId, habitId, date, habitData) => {
  // Reference to the specific habit completion document
  const habitCompletionRef = doc(db, 'users', userId, 'completedHabits', habitId);
  
  // Check if completion already exists
  const existingCompletion = await getDoc(habitCompletionRef);
  
  if (existingCompletion.exists()) {
    // Update existing completion - add new date to array
    const data = existingCompletion.data();
    const currentDates = data.dates || [];
    
    // Only add date if it's not already in the array
    if (!currentDates.includes(date)) {
      await updateDoc(habitCompletionRef, {
        completed: true,
        completedAt: serverTimestamp(),
        dates: [...currentDates, date], // Add new date to array
        progress: increment(1), // Increment total completion count
        state: habitData.approval === 'manual' ? 'pending' : 'approved'
      });
    }
  } else {
    // Create new completion document with dates array
    await setDoc(habitCompletionRef, {
      completed: true,
      completedAt: serverTimestamp(),
      dates: [date], // Initialize with first completion date
      progress: 1, // First completion
      state: habitData.approval === 'manual' ? 'pending' : 'approved'
    });
  }
  
  // Update user's gold and can
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    altin: increment(habitData.goldReward || 0),
    can: increment(habitData.canReward || 0)
  });
};
```

### Habit Uncompletion (NEW SUBCOLLECTION SCHEMA):
```javascript
const uncompleteHabit = async (userId, habitId, date, habitData) => {
  const habitCompletionRef = doc(db, 'users', userId, 'completedHabits', habitId);
  const existingCompletion = await getDoc(habitCompletionRef);
  
  if (existingCompletion.exists()) {
    const completionData = existingCompletion.data();
    const currentDates = completionData.dates || [];
    
    if (currentDates.includes(date)) {
      const updatedDates = currentDates.filter(d => d !== date);
      
      if (updatedDates.length > 0) {
        // Still has other completion dates, just remove this specific date
        await updateDoc(habitCompletionRef, {
          dates: updatedDates,
          progress: increment(-1), // Decrease total count
          completedAt: serverTimestamp()
        });
      } else {
        // No more completion dates, mark as completely uncompleted
        await updateDoc(habitCompletionRef, {
          completed: false,
          dates: [],
          progress: 0,
          completedAt: serverTimestamp(),
          state: 'cancelled'
        });
      }
      
      // Update user's gold and can (subtract rewards)
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        altin: increment(-(habitData.goldReward || 0)),
        can: increment(-(habitData.canReward || 0))
      });
    }
  }
};

// Get habit completion history
const getHabitHistory = async (userId, habitId) => {
  const habitCompletionRef = doc(db, 'users', userId, 'completedHabits', habitId);
  const habitCompletionDoc = await getDoc(habitCompletionRef);
  
  if (habitCompletionDoc.exists()) {
    const data = habitCompletionDoc.data();
    return {
      totalCompletions: data.progress || 0,
      completionDates: data.dates || [],
      isCurrentlyCompleted: data.completed || false,
      lastCompletedAt: data.completedAt?.toDate()
    };
  }
  
  return {
    totalCompletions: 0,
    completionDates: [],
    isCurrentlyCompleted: false,
    lastCompletedAt: null
  };
};
```

## 🔒 **Security Rules (UPDATED)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Completed habits subcollection
      match /completedHabits/{habitId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        allow read: if request.auth != null && request.auth.token.admin == true;
      }
      
      // Future subcollections (modular approach)
      match /completedQuests/{questId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /completedEvents/{eventId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Habits collection (read-only for users)
    match /habits/{habitId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## 📈 **Firestore Indexes (UPDATED)**

### Composite Indexes Required:

1. **users/[userId]/completedHabits Collection:**
   - Fields: `date` (Ascending), `completed` (Ascending)
   - Purpose: Get completions for specific date
   
   - Fields: `date` (Ascending), `progress` (Descending)
   - Purpose: Get progress tracking for habits
   
   - Fields: `state` (Ascending), `completedAt` (Descending)
   - Purpose: Get pending approvals chronologically

### Index Commands for Firebase CLI:
```bash
# completedHabits subcollection indexes
firebase firestore:indexes:add --collection-group=completedHabits --query-scope=COLLECTION --field=date,ASCENDING --field=completed,ASCENDING

firebase firestore:indexes:add --collection-group=completedHabits --query-scope=COLLECTION --field=date,ASCENDING --field=progress,DESCENDING

firebase firestore:indexes:add --collection-group=completedHabits --query-scope=COLLECTION --field=state,ASCENDING --field=completedAt,DESCENDING
```

## 🎯 **Modular Design Benefits**

### Future Extensibility:
```javascript
// Easy to add new completion systems
users/[userId]/completedQuests/[questId]
users/[userId]/completedEvents/[eventId]
users/[userId]/completedChallenges/[challengeId]
users/[userId]/completedAchievements/[achievementId]
```

### Performance Benefits:
- ✅ User-specific queries (no cross-user data mixing)
- ✅ Automatic data isolation
- ✅ Reduced index complexity
- ✅ Better caching opportunities
- ✅ Easier backup/restore per user

### Security Benefits:
- ✅ Natural access control boundaries
- ✅ Simpler security rules
- ✅ User data completely isolated
- ✅ No accidental cross-user data access

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
  makam: firebaseUser.makam, // schema: makam
  maxHealth: firebaseUser.maxHealth || 100 // schema: maxHealth
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