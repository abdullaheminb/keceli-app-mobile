/**
 * 404 Not Found Screen
 * 
 * Kullanıcı var olmayan bir route'a gittiğinde
 * gösterilen 404 hata sayfası.
 * 
 * @purpose 404 error handling
 * @routing Expo Router'ın otomatik catch-all route'u
 */

import { Link, Stack } from 'expo-router';
import React from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Layout, Typography } from '../css';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={Layout.containerCentered}>
        <ThemedText type="title">This screen does not exist.</ThemedText>
        <Link href="/" style={[Typography.link, { marginTop: 15, paddingVertical: 15 }]}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}
