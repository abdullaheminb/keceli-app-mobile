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
 * 
 * @usage <UserHeader user={userObject} />
 * @purpose User information display in habits screen
 */

import React from 'react';
import { Image, Text, View } from 'react-native';
import { Colors, Components, Layout, Typography } from '../css';
import { User } from '../types';
import { convertMakamToString } from '../utils/habitPermissions';

interface UserHeaderProps {
  user: User;
}

export default function UserHeader({ user }: UserHeaderProps) {
  // Safe access to user properties
  const userName = user?.name || 'Kullanıcı';
  const userMakamString = convertMakamToString(user?.makam);
  const userGold = user?.gold || 0;
  const userLives = user?.lives || 0;
  const userProfileImage = user?.profileImage;

  return (
    <View style={Components.header}>
      <View style={[Layout.row, Layout.alignCenter, { marginBottom: 16 }]}>
        <View style={{ marginRight: 16 }}>
          {userProfileImage ? (
            <Image source={{ uri: userProfileImage }} style={Components.avatar} />
          ) : (
            <View style={Components.avatarDefault}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: Colors.textLight,
              }}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        
        <View style={Layout.flex1}>
          <Text style={Typography.subtitle}>{userName}</Text>
          <Text style={Typography.bodySmall}>{userMakamString}</Text>
        </View>
      </View>
      
      <View style={[Layout.row, Layout.spaceBetween]}>
        <View style={{ flex: 1, marginRight: 20 }}>
          <Text style={Typography.captionBold}>Canlar</Text>
          <View style={Layout.row}>
            <Text style={[Typography.bodyLarge, { marginLeft: 8 }]}>{userLives}/100</Text>
          </View>
        </View>
        
        <View style={Layout.flex1}>
          <Text style={Typography.captionBold}>Altın</Text>
          <View style={[Layout.row, Layout.alignCenter]}>
            <Text style={{ fontSize: 18, marginRight: 6 }}>🪙</Text>
            <Text style={[Typography.bodyLarge, { color: Colors.gold }]}>{userGold.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
} 