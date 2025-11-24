import { StyleSheet, Text, TextInput, View } from 'react-native';

interface AmountInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
}

export function AmountInput({
  label,
  value,
  placeholder = 'R$ 0,00',
  onChangeText,
}: AmountInputProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
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
});

