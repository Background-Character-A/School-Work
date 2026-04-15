import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const API = `${baseUrl}/students`;
const courses = ['bsit', 'bscs', 'bscpe', 'bsee', 'bsce'];
const levels = ['1', '2', '3', '4'];

type Student = {
  id: string | number;
  idno: string;
  lastname: string;
  firstname: string;
  course: string;
  level: string;
};

type FormState = {
  id: string;
  idno: string;
  lastname: string;
  firstname: string;
  course: string;
  level: string;
};

export default function HomeScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    id: '',
    idno: '',
    lastname: '',
    firstname: '',
    course: 'bsit',
    level: '1',
  });

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API);
      if (!response.ok) {
        throw new Error('Failed to load');
      }
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditMode(false);
    setForm({
      id: '',
      idno: '',
      lastname: '',
      firstname: '',
      course: 'bsit',
      level: '1',
    });
    setModalOpen(true);
  }

  function openEditModal(student: Student) {
    setEditMode(true);
    setForm({
      id: String(student.id),
      idno: student.idno || '',
      lastname: student.lastname || '',
      firstname: student.firstname || '',
      course: student.course?.toLowerCase() || 'bsit',
      level: student.level || '1',
    });
    setModalOpen(true);
  }

  async function submitForm() {
    if (!form.idno.trim() || !form.lastname.trim() || !form.firstname.trim()) {
      Alert.alert('Validation error', 'Please fill in all fields.');
      return;
    }

    setSaving(true);
    const payload = {
      idno: form.idno.trim(),
      lastname: form.lastname.trim(),
      firstname: form.firstname.trim(),
      course: form.course,
      level: form.level,
    };

    try {
      const response = await fetch(API, {
        method: editMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMode ? { id: form.id, ...payload } : payload),
      });

      if (!response.ok) {
        throw new Error('Save failed');
      }

      setModalOpen(false);
      loadStudents();
    } catch {
      Alert.alert('Error', 'Could not save the student.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(id: string | number) {
    Alert.alert('Delete student', 'Delete this student?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteStudent(id) },
    ]);
  }

  async function deleteStudent(id: string | number) {
    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      loadStudents();
    } catch {
      Alert.alert('Error', 'Could not delete the student.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.appTitle}>SCHOOL V1.0</Text>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>STUDENTS</Text>
        <Pressable style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ ADD</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.messageBox}>
          <ActivityIndicator size="small" color="#333" />
          <Text style={styles.messageText}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{error}</Text>
        </View>
      ) : students.length === 0 ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>No students found.</Text>
        </View>
      ) : (
        <View style={styles.table}>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={[styles.cell, styles.headerCell, styles.cellSmall]}>#</Text>
            <Text style={[styles.cell, styles.headerCell]}>IDNO</Text>
            <Text style={[styles.cell, styles.headerCell]}>LASTNAME</Text>
            <Text style={[styles.cell, styles.headerCell]}>FIRSTNAME</Text>
            <Text style={[styles.cell, styles.headerCell]}>COURSE</Text>
            <Text style={[styles.cell, styles.headerCell, styles.actionsCell]}>ACTIONS</Text>
          </View>

          {students.map((student, index) => (
            <View key={String(student.id)} style={styles.row}>
              <Text style={[styles.cell, styles.cellSmall]}>{index + 1}</Text>
              <Text style={styles.cell}>{student.idno || ''}</Text>
              <Text style={styles.cell}>{student.lastname || ''}</Text>
              <Text style={styles.cell}>{student.firstname || ''}</Text>
              <Text style={styles.cell}>{(student.course || '').toUpperCase()}</Text>
              <View style={[styles.cell, styles.actionsCell]}> 
                <Pressable style={[styles.actionButton, styles.editButton]} onPress={() => openEditModal(student)}>
                  <Text style={styles.actionButtonText}>UPDATE</Text>
                </Pressable>
                <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => confirmDelete(student.id)}>
                  <Text style={styles.actionButtonText}>DELETE</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editMode ? 'EDIT STUDENT' : 'ADD STUDENT'}</Text>

            <TextInput
              style={styles.input}
              placeholder="IDNO"
              value={form.idno}
              onChangeText={(text) => setForm({ ...form, idno: text })}
              autoCapitalize="none"
              keyboardType="number-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="LASTNAME"
              value={form.lastname}
              onChangeText={(text) => setForm({ ...form, lastname: text })}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              placeholder="FIRSTNAME"
              value={form.firstname}
              onChangeText={(text) => setForm({ ...form, firstname: text })}
              autoCapitalize="words"
            />

            <Text style={styles.label}>COURSE</Text>
            <View style={styles.optionsRow}>
              {courses.map((courseOption) => (
                <Pressable
                  key={courseOption}
                  style={[
                    styles.optionButton,
                    form.course === courseOption && styles.optionSelected,
                  ]}
                  onPress={() => setForm({ ...form, course: courseOption })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      form.course === courseOption && styles.optionTextSelected,
                    ]}
                  >
                    {courseOption.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>LEVEL</Text>
            <View style={styles.optionsRow}>
              {levels.map((levelOption) => (
                <Pressable
                  key={levelOption}
                  style={[
                    styles.optionButton,
                    form.level === levelOption && styles.optionSelected,
                  ]}
                  onPress={() => setForm({ ...form, level: levelOption })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      form.level === levelOption && styles.optionTextSelected,
                    ]}
                  >
                    {levelOption}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalActionButton, styles.cancelButton]} onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalActionButton, styles.saveButton]}
                onPress={submitForm}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>{saving ? 'Saving...' : editMode ? 'Update' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    padding: 20,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  messageBox: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    marginTop: 8,
    color: '#555',
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  tableHeader: {
    backgroundColor: '#f9f9f9',
  },
  cell: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    paddingHorizontal: 4,
  },
  cellSmall: {
    flex: 0.5,
  },
  headerCell: {
    fontWeight: 'bold',
  },
  actionsCell: {
    flex: 2,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  optionSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionTextSelected: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  modalActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
