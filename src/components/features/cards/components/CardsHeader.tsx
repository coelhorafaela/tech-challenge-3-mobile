import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CardsHeaderProps {
  creatingCard: boolean;
  hasCards: boolean;
  isDeletingActiveCard: boolean;
  onCreateCard: () => void;
  onDeleteCard: () => void;
  onLogout: () => void;
}

export function CardsHeader({
  creatingCard,
  hasCards,
  isDeletingActiveCard,
  onCreateCard,
  onDeleteCard,
  onLogout,
}: CardsHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cartões</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={onCreateCard}
          activeOpacity={0.7}
          disabled={creatingCard}
        >
          {creatingCard ? (
            <ActivityIndicator size="small" color="#294FC1" />
          ) : (
            <Ionicons name="add-circle-outline" size={20} color="#294FC1" />
          )}
          <Text style={styles.createButtonText}>Novo cartão</Text>
        </TouchableOpacity>
        {hasCards ? (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDeleteCard}
            activeOpacity={0.7}
            disabled={isDeletingActiveCard}
          >
            {isDeletingActiveCard ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            )}
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#294FC1" />
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: -16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#101142',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(41, 79, 193, 0.1)',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#294FC1',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#294FC1',
  },
});

