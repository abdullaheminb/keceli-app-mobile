/**
 * User Header Component
 * 
 * Kullanıcı bilgilerini gösteren header komponenti.
 * Profil resmi, kullanıcı adı, makam, can ve altın bilgilerini
 * görsel olarak sunar.
 * 
 * @features
 * - Avatar gösterimi (resim veya initial)
 * - Kullanıcı adı ve makam
 * - Can durumu (x/100 formatında)
 * - Altın miktarı
 * - Console debug logları
 * 
 * @usage <UserHeader user={userObject} />
 * @purpose User information display in habits screen
 */

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { convertMakamToString } from '../app/screens/habits/TitleComponent';
import { User } from '../types';

interface UserHeaderProps {
  user: User;
}

export default function UserHeader({ user }: UserHeaderProps) {
  console.log('=== UserHeader RENDER ===');
  console.log('UserHeader received user:', user);
  console.log('User name field:', user?.name);
  console.log('User makam field:', user?.makam);
  console.log('User lives field:', user?.lives);
  console.log('User gold field:', user?.gold);
  console.log('Raw user object keys:', user ? Object.keys(user) : 'user is null');
  if (user) {
    console.log('All user fields:', JSON.stringify(user, null, 2));
  }
  console.log('========================');
  
  // Safe access to user properties
  const userName = user?.name || 'Kullanıcı';
  const userMakamString = convertMakamToString(user?.makam);
  const userGold = user?.gold || 0;
  const userLives = user?.lives || 0;
  const userProfileImage = user?.profileImage;

  console.log('Processed values:');
  console.log('userName:', userName);
  console.log('userMakam (number):', user?.makam);
  console.log('userMakamString:', userMakamString);
  console.log('userGold:', userGold);
  console.log('userLives:', userLives);

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {userProfileImage ? (
            <Image source={{ uri: userProfileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userRank}>{userMakamString}</Text>
        </View>
      </View>
      
      <View style={styles.statsSection}>
        <View style={styles.livesContainer}>
          <Text style={styles.label}>Canlar</Text>
          <View style={styles.livesDisplay}>
            <Text style={styles.livesText}>{userLives}/100</Text>
          </View>
        </View>
        
        <View style={styles.goldContainer}>
          <Text style={styles.label}>Altın</Text>
          <View style={styles.goldDisplay}>
            <Text style={styles.goldIcon}>🪙</Text>
            <Text style={styles.goldAmount}>{userGold.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#f39c12',
  },
  defaultAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f39c12',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e67e22',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userRank: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  livesContainer: {
    flex: 1,
    marginRight: 20,
  },
  goldContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  livesDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  goldDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goldIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  goldAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f39c12',
  },
}); 