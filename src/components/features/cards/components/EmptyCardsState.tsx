import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyCardsStateProps {
  creatingCard: boolean;
  onCreateCard: () => void;
}

export function EmptyCardsState({
  creatingCard,
  onCreateCard,
}: EmptyCardsStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="card-outline" size={48} color="#294FC1" />
      <Text style={styles.message}>
        Você ainda não possui cartões cadastrados.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onCreateCard}
        activeOpacity={0.7}
        disabled={creatingCard}
      >
        {creatingCard ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Criar meu primeiro cartão</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#101142',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#294FC1',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

