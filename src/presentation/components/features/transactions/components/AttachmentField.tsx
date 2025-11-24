import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AttachmentFieldProps {
  label: string;
  attachment: DocumentPicker.DocumentPickerResult | null;
  onPickDocument: () => Promise<void>;
  onRemoveAttachment: () => void;
}

export function AttachmentField({
  label,
  attachment,
  onPickDocument,
  onRemoveAttachment,
}: AttachmentFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {attachment && !attachment.canceled ? (
        <View style={styles.attachmentCard}>
          <View style={styles.attachmentInfo}>
            <Ionicons name="document-text-outline" size={20} color="#294FC1" />
            <Text style={styles.attachmentName}>{attachment.assets[0].name}</Text>
          </View>
          <TouchableOpacity onPress={onRemoveAttachment} activeOpacity={0.7}>
            <Text style={styles.removeAttachmentText}>Remover</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={onPickDocument}
          activeOpacity={0.7}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#294FC1" />
          <Text style={styles.attachmentButtonText}>Selecionar arquivo</Text>
        </TouchableOpacity>
      )}
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
});

