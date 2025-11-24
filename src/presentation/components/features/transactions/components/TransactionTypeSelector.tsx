import { StyleSheet, Text, View } from 'react-native';

import { SegmentControl } from '@/src/presentation';

import type { TransactionType } from '@/src/domain/entities/transaction.entity';

export type TransactionTypeOption = {
  value: TransactionType;
  label: string;
};

export const transactionTypeOptions: TransactionTypeOption[] = [
  {
    value: 'DEPOSIT',
    label: 'Depósito',
  },
  {
    value: 'WITHDRAWAL',
    label: 'Saque',
  },
];

interface TransactionTypeSelectorProps {
  label: string;
  value: TransactionType;
  onChange: (key: string) => void;
}

export function TransactionTypeSelector({
  label,
  value,
  onChange,
}: TransactionTypeSelectorProps) {
  const segmentControlOptions = transactionTypeOptions.map((option) => ({
    key: option.value,
    label: option.label,
  }));

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <SegmentControl
        options={segmentControlOptions}
        activeKey={value}
        onOptionChange={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#101142',
  },
});

