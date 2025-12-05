import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import { Profile } from '../types';

interface ProfileEditorProps {
  profile: Profile;
  onSave: (updatedProfile: Profile) => void;
  onClose: () => void;
  visible: boolean;
}

const AVATAR_COLORS = [
  '#3B82F6', // blue-400
  '#2563EB', // blue-500
  '#6366F1', // indigo-500
  '#A855F7', // purple-500
  '#EC4899', // pink-400
  '#F43F5E', // rose-500
  '#DC2626', // red-400
  '#EA580C', // orange-400
  '#D97706', // amber-400
  '#FBBF24', // yellow-400
  '#84CC16', // lime-500
  '#22C55E', // green-500
  '#10B981', // emerald-500
  '#14B8A6', // teal-500
  '#06B6D4', // cyan-500
  '#64748B', // slate-500
];

const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  onSave,
  onClose,
  visible,
}) => {
  const [name, setName] = useState(profile.name);
  const [color, setColor] = useState(profile.avatarColor);
  const [dob, setDob] = useState(profile.dateOfBirth || '');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      ...profile,
      name: name.trim(),
      avatarColor: color,
      dateOfBirth: dob,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Avatar Preview */}
              <View style={styles.avatarSection}>
                <View
                  style={[
                    styles.avatarPreview,
                    { backgroundColor: color },
                  ]}
                >
                  <Text style={styles.avatarLetter}>
                    {name.charAt(0) || '?'}
                  </Text>
                </View>

                {/* Color Picker Grid */}
                <View style={styles.colorGrid}>
                  {AVATAR_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setColor(c)}
                      style={[
                        styles.colorOption,
                        { backgroundColor: c },
                        color === c && styles.colorOptionSelected,
                      ]}
                    >
                      {color === c && (
                        <Text style={styles.colorCheckmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Form Fields */}
              <View style={styles.formSection}>
                {/* Name Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Child's Name"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Date of Birth Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Date of Birth (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={dob}
                    onChangeText={setDob}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>

              <View style={styles.bottomPadding} />
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#94A3B8',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  colorOption: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#1E293B',
  },
  colorCheckmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 24,
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
  },
  saveButton: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomPadding: {
    height: 20,
  },
});

export default ProfileEditor;
