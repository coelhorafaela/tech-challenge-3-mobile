import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorCardProps {
  message: string;
  onRetry: () => void;
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={onRetry} activeOpacity={0.7}>
        <Text style={styles.retryText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  message: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  retryText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
});

