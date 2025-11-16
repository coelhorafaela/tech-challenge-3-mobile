import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { DisplayCard } from '../utils/cardUtils';

interface CardDetailsProps {
  card: DisplayCard;
}

export function CardDetails({ card }: CardDetailsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.invoiceSection}>
        <View>
          <Text style={styles.invoiceLabel}>Fatura atual</Text>
          <Text style={styles.invoiceAmount}>{card.invoiceAmountLabel}</Text>
          <Text style={styles.dueDate}>
            Vencimento: {card.invoiceDueDateLabel}
          </Text>
        </View>
        <TouchableOpacity style={styles.detailsButton} activeOpacity={0.7}>
          <Text style={styles.detailsButtonText}>Ver detalhes</Text>
          <Ionicons name="chevron-forward" size={16} color="#294FC1" />
        </TouchableOpacity>
      </View>

      <View style={styles.limitSection}>
        <Text style={styles.limitLabel}>Limite disponível</Text>
        <TouchableOpacity style={styles.limitButton} activeOpacity={0.7}>
          <Text style={styles.limitAmount}>{card.availableLimitLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 16,
  },
  invoiceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  invoiceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101142',
    marginBottom: 2,
  },
  dueDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#294FC1',
  },
  limitSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  limitLabel: {
    fontSize: 14,
    color: '#374151',
  },
  limitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  limitAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101142',
  },
});

