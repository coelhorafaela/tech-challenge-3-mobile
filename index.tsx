import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/src/components/HelloWave';
import ParallaxScrollView from '@/src/components/ParallaxScrollView';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { healthCheck } from '@/src/services/firebase';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const handleHealthCheck = async () => {
    setIsLoading(true);
    try {
      const result = await healthCheck();
      // The cloud function will return the document ID on success
      const data = result.data as { success: boolean; docId?: string; error?: string };
      if (data.success && data.docId) {
        Alert.alert('Success', `Timestamp saved to Firestore with ID: ${data.docId}`);
      } else {
        Alert.alert('Error', `Failed to save timestamp: ${data.error || JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Firebase health check failed:', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'Failed to connect to Firebase backend. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 4: Firebase Health Check</ThemedText>
        <TouchableOpacity
          onPress={handleHealthCheck}
          style={[styles.button, { backgroundColor: Colors[colorScheme].tint }]}
          disabled={isLoading}>
          <ThemedText type="defaultSemiBold" style={{ color: Colors[colorScheme].background }}>
            {isLoading ? 'Checking...' : 'Check Firebase Backend'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
