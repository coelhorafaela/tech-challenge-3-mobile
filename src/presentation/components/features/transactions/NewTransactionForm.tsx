import { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { TransactionType } from '@/src/infrastructure/services';
import {
  AmountInput,
  AttachmentField,
  DatePickerField,
  TransactionTypeSelector,
} from './components';

interface NewTransactionFormProps {
  transactionType: TransactionType;
  amount: number;
  displayValue: string;
  operationDate: Date;
  activePicker: 'date' | 'time' | null;
  attachment: DocumentPicker.DocumentPickerResult | null;
  isSubmitting: boolean;
  formattedDate: string;
  formattedTime: string;
  onTransactionTypeChange: (key: string) => void;
  onAmountChange: (text: string) => void;
  onOpenPicker: (mode: 'date' | 'time') => void;
  onDatePickerChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
  onClosePicker: () => void;
  onPickDocument: () => Promise<void>;
  onRemoveAttachment: () => void;
  onSubmit: () => void;
}

export function NewTransactionForm({
  transactionType,
  displayValue,
  operationDate,
  activePicker,
  attachment,
  isSubmitting,
  formattedDate,
  formattedTime,
  onTransactionTypeChange,
  onAmountChange,
  onOpenPicker,
  onDatePickerChange,
  onClosePicker,
  onPickDocument,
  onRemoveAttachment,
  onSubmit,
}: NewTransactionFormProps) {
  return (
    <View style={styles.formCard}>
      <TransactionTypeSelector
        label="Tipo de movimentação"
        value={transactionType}
        onChange={onTransactionTypeChange}
      />

      <AmountInput
        label="Valor"
        value={displayValue}
        onChangeText={onAmountChange}
      />

      <DatePickerField
        label="Data e hora da operação"
        date={operationDate}
        activePicker={activePicker}
        formattedDate={formattedDate}
        formattedTime={formattedTime}
        onOpenPicker={onOpenPicker}
        onDatePickerChange={onDatePickerChange}
        onClosePicker={onClosePicker}
      />

      <AttachmentField
        label="Anexo (opcional)"
        attachment={attachment}
        onPickDocument={onPickDocument}
        onRemoveAttachment={onRemoveAttachment}
      />

      <TouchableOpacity
        style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          {isSubmitting ? 'Processando...' : 'Criar transação'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    gap: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#294FC1',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

