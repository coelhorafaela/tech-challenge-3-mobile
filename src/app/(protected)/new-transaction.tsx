import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SegmentControl } from '@/src/components/ui/SegmentControl';
import { useAccount } from '@/src/hooks/useAccount';
import { bankingApi, type TransactionType } from '@/src/services/bankingApi';
import { formatCurrency } from '@/src/utils/currency';

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

export default function NewTransaction() {
  const { account, refreshAccount } = useAccount();
  const [transactionType, setTransactionType] = useState<TransactionType>('DEPOSIT');
  const [amount, setAmount] = useState<number>(0);
  const [displayValue, setDisplayValue] = useState<string>('R$ 0,00');
  const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationDate, setOperationDate] = useState<Date>(new Date());
  const [activePicker, setActivePicker] = useState<'date' | 'time' | null>(null);

  const segmentControlOptions = useMemo(
    () =>
      transactionTypeOptions.map((option) => ({
        key: option.value,
        label: option.label,
      })),
    []
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    []
  );

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    []
  );

  const formattedDate = useMemo(
    () => dateFormatter.format(operationDate),
    [dateFormatter, operationDate]
  );

  const formattedTime = useMemo(
    () => timeFormatter.format(operationDate),
    [operationDate, timeFormatter]
  );

  const handleTransactionTypeChange = (key: string) => {
    setTransactionType(key as TransactionType);
  };

  const parseCurrencyInput = (input: string): number => {
    const numbers = input.replace(/\D/g, '');
    return parseInt(numbers) || 0;
  };

  const handleAmountChange = (text: string) => {
    const numericValue = parseCurrencyInput(text);
    setAmount(numericValue);
    setDisplayValue(formatCurrency(numericValue));
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setAttachment(result);
        Alert.alert('Sucesso', `Arquivo ${result.assets[0].name} selecionado`);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo');
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handleOpenPicker = (mode: 'date' | 'time') => {
    setActivePicker((current) => (current === mode ? null : mode));
  };

  const handleDatePickerChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    const currentMode = activePicker;

    if (event.type === 'dismissed') {
      if (Platform.OS === 'android') {
        setActivePicker(null);
      }
      return;
    }

    if (selectedDate && currentMode) {
      setOperationDate((previous) => {
        const nextDate = new Date(previous);

        if (currentMode === 'date') {
          nextDate.setFullYear(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate()
          );
        }

        if (currentMode === 'time') {
          nextDate.setHours(
            selectedDate.getHours(),
            selectedDate.getMinutes(),
            0,
            0
          );
        }

        return nextDate;
      });
    }

    if (Platform.OS === 'android') {
      setActivePicker(null);
    }
  };

  const handleClosePicker = () => {
    setActivePicker(null);
  };

  const handleSubmit = async () => {
    if (!account?.accountNumber) {
      Alert.alert('Erro', 'Dados da conta não disponíveis. Tente novamente.');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido maior que zero.');
      return;
    }
    setIsSubmitting(true);
    try {
      const timestamp = operationDate.getTime();
      const result = await bankingApi.performTransaction(
        account.accountNumber,
        amount,
        transactionType,
        timestamp
      );
      if (result.success) {
        await refreshAccount();
        
        const transactionTypeLabel = transactionTypeOptions.find(
          option => option.value === transactionType
        )?.label || transactionType;

        Alert.alert(
          'Sucesso',
          `${transactionTypeLabel} de ${formatCurrency(amount)} realizada com sucesso!\nNovo saldo: ${formatCurrency(result.newBalance)}`,
          [
              {
                text: 'OK',
                onPress: () => {
                  setAmount(0);
                  setDisplayValue('R$ 0,00');
                  setAttachment(null);
                  setOperationDate(new Date());
                }
              }
            ]
          );
      } else {
        Alert.alert('Erro', 'Não foi possível realizar a transação. Tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao realizar transação:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível realizar a transação. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={20} color="#294FC1" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Nova transação</Text>
            <Text style={styles.headerSubtitle}>
              Crie uma movimentação para sua conta em poucos passos.
            </Text>
          </View>

          {account && (
            <View style={styles.accountSummary}>
              <Text style={styles.accountLabel}>Conta de</Text>
              <Text style={styles.accountOwner}>{account.ownerName}</Text>
              <Text style={styles.accountNumber}>
                Nº {account.accountNumber} • Agência {account.agency}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Tipo de movimentação</Text>
            <SegmentControl
              options={segmentControlOptions}
              activeKey={transactionType}
              onOptionChange={handleTransactionTypeChange}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Valor</Text>
            <TextInput
              style={styles.input}
              placeholder="R$ 0,00"
              placeholderTextColor="#9CA3AF"
              value={displayValue}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Data e hora da operação</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateButton}
                activeOpacity={0.7}
                onPress={() => handleOpenPicker('date')}
              >
                <Ionicons name="calendar-outline" size={18} color="#294FC1" />
                <Text style={styles.dateButtonText}>{formattedDate}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateButton}
                activeOpacity={0.7}
                onPress={() => handleOpenPicker('time')}
              >
                <Ionicons name="time-outline" size={18} color="#294FC1" />
                <Text style={styles.dateButtonText}>{formattedTime}</Text>
              </TouchableOpacity>
            </View>

            {activePicker ? (
              <View style={styles.pickerWrapper}>
                <DateTimePicker
                  value={operationDate}
                  mode={activePicker}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDatePickerChange}
                  locale="pt-BR"
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.pickerDoneButton}
                    activeOpacity={0.7}
                    onPress={handleClosePicker}
                  >
                    <Text style={styles.pickerDoneButtonText}>Concluir</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Anexo (opcional)</Text>
            {attachment && !attachment.canceled ? (
              <View style={styles.attachmentCard}>
                <View style={styles.attachmentInfo}>
                  <Ionicons name="document-text-outline" size={20} color="#294FC1" />
                  <Text style={styles.attachmentName}>{attachment.assets[0].name}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleRemoveAttachment}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeAttachmentText}>Remover</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.attachmentButton}
                onPress={handlePickDocument}
                activeOpacity={0.7}
              >
                <Ionicons name="cloud-upload-outline" size={20} color="#294FC1" />
                <Text style={styles.attachmentButtonText}>Selecionar arquivo</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? 'Processando...' : 'Criar transação'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    gap: 24,
  },
  header: {
    gap: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#294FC1',
  },
  headerTextContainer: {
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#101142',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(16, 17, 66, 0.6)',
  },
  accountSummary: {
    backgroundColor: '#294FC1',
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  accountLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  accountOwner: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  accountNumber: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
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
  fieldGroup: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#101142',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#101142',
    backgroundColor: '#F9FAFB',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#101142',
  },
  pickerWrapper: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        paddingVertical: 12,
        paddingHorizontal: 16,
      },
      default: {},
    }),
  },
  pickerDoneButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#294FC1',
  },
  pickerDoneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  attachmentButton: {
    borderWidth: 1,
    borderColor: '#294FC1',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentButtonText: {
    color: '#294FC1',
    fontSize: 15,
    fontWeight: '600',
  },
  attachmentCard: {
    backgroundColor: '#F5F6FA',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  attachmentName: {
    flex: 1,
    fontSize: 15,
    color: '#101142',
  },
  removeAttachmentText: {
    color: '#D64040',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#294FC1',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
