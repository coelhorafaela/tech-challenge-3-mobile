import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAccount } from '@/src/hooks';
import { bankingApi, type TransactionType } from '@/src/services/bankingApi';
import { formatCurrency } from '@/src/utils/currency';

import { NewTransactionForm } from './NewTransactionForm';
import { transactionTypeOptions } from './components';

export function NewTransactionScreen() {
  const { account, refreshAccount } = useAccount();
  const [transactionType, setTransactionType] = useState<TransactionType>('DEPOSIT');
  const [amount, setAmount] = useState<number>(0);
  const [displayValue, setDisplayValue] = useState<string>('R$ 0,00');
  const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationDate, setOperationDate] = useState<Date>(new Date());
  const [activePicker, setActivePicker] = useState<'date' | 'time' | null>(null);

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
          (option) => option.value === transactionType
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
              },
            },
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

        <NewTransactionForm
          transactionType={transactionType}
          amount={amount}
          displayValue={displayValue}
          operationDate={operationDate}
          activePicker={activePicker}
          attachment={attachment}
          isSubmitting={isSubmitting}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
          onTransactionTypeChange={handleTransactionTypeChange}
          onAmountChange={handleAmountChange}
          onOpenPicker={handleOpenPicker}
          onDatePickerChange={handleDatePickerChange}
          onClosePicker={handleClosePicker}
          onPickDocument={handlePickDocument}
          onRemoveAttachment={handleRemoveAttachment}
          onSubmit={handleSubmit}
        />
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
});

