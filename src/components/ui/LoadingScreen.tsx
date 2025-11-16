import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface LoadingScreenProps {
  backgroundColor?: string;
  color?: string;
}

export function LoadingScreen({
  backgroundColor = '#F5F6FA',
  color = '#294FC1',
}: LoadingScreenProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

