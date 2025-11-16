import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DatePickerFieldProps {
  label: string;
  date: Date;
  activePicker: 'date' | 'time' | null;
  formattedDate: string;
  formattedTime: string;
  onOpenPicker: (mode: 'date' | 'time') => void;
  onDatePickerChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
  onClosePicker: () => void;
}

export function DatePickerField({
  label,
  date,
  activePicker,
  formattedDate,
  formattedTime,
  onOpenPicker,
  onDatePickerChange,
  onClosePicker,
}: DatePickerFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.dateTimeRow}>
        <TouchableOpacity
          style={styles.dateButton}
          activeOpacity={0.7}
          onPress={() => onOpenPicker('date')}
        >
          <Ionicons name="calendar-outline" size={18} color="#294FC1" />
          <Text style={styles.dateButtonText}>{formattedDate}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateButton}
          activeOpacity={0.7}
          onPress={() => onOpenPicker('time')}
        >
          <Ionicons name="time-outline" size={18} color="#294FC1" />
          <Text style={styles.dateButtonText}>{formattedTime}</Text>
        </TouchableOpacity>
      </View>

      {activePicker ? (
        <View style={styles.pickerWrapper}>
          <DateTimePicker
            value={date}
            mode={activePicker}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDatePickerChange}
            locale="pt-BR"
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.pickerDoneButton}
              activeOpacity={0.7}
              onPress={onClosePicker}
            >
              <Text style={styles.pickerDoneButtonText}>Concluir</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
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
});

