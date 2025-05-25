import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import GradientBackground from "../components/GradientBackground"
import { JournalEntry } from "../types"

const mockJournalEntries: JournalEntry[] = [
  {
    id: "1",
    user_id: "user1",
    content:
      "Had a great day analyzing my handwriting. Feeling more confident!",
    mood_score: 92,
    created_at: "2024-01-15T10:00:00Z",
    date: "Today",
  },
  {
    id: "2",
    user_id: "user1",
    content: "Practiced my signature today. Learning a lot about myself.",
    mood_score: 78,
    created_at: "2024-01-14T15:30:00Z",
    date: "Yesterday",
  },
  {
    id: "3",
    user_id: "user1",
    content: "Feeling a bit overwhelmed, but writing helps me process.",
    mood_score: 65,
    created_at: "2024-01-13T20:15:00Z",
    date: "2 days ago",
  },
]

interface JournalEntryCardProps {
  entry: JournalEntry
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry }) => {
  const getMoodColor = (score: number) => {
    if (score >= 80) return "#10B981"
    if (score >= 60) return "#F59E0B"
    return "#EF4444"
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 80) return "😊"
    if (score >= 60) return "😐"
    return "😔"
  }

  return (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.dateContainer}>
          <Ionicons
            name="calendar"
            size={16}
            color="rgba(255, 255, 255, 0.8)"
          />
          <Text style={styles.entryDate}>{entry.date}</Text>
        </View>
        <View style={styles.moodContainer}>
          <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood_score)}</Text>
          <Text
            style={[
              styles.moodScore,
              { color: getMoodColor(entry.mood_score) },
            ]}
          >
            {entry.mood_score}%
          </Text>
        </View>
      </View>
      <Text style={styles.entryContent}>{entry.content}</Text>
    </View>
  )
}

export default function JournalScreen() {
  const [modalVisible, setModalVisible] = useState(false)
  const [newEntry, setNewEntry] = useState("")
  const [moodScore, setMoodScore] = useState(70)

  const handleAddEntry = () => {
    if (newEntry.trim()) {
      // In a real app, you would save to database here
      Alert.alert("Entry Added!", "Your journal entry has been saved.")
      setNewEntry("")
      setMoodScore(70)
      setModalVisible(false)
    } else {
      Alert.alert("Empty Entry", "Please write something before saving.")
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Journal</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {mockJournalEntries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))}
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Journal Entry</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>How are you feeling today?</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={6}
                placeholder="Write about your thoughts, feelings, or insights..."
                placeholderTextColor="#9CA3AF"
                value={newEntry}
                onChangeText={setNewEntry}
              />

              <Text style={styles.inputLabel}>Mood Score: {moodScore}%</Text>
              <View style={styles.moodSliderContainer}>
                <TouchableOpacity
                  style={styles.moodButton}
                  onPress={() => setMoodScore(Math.max(0, moodScore - 10))}
                >
                  <Ionicons name="remove" size={20} color="#6B7280" />
                </TouchableOpacity>
                <View style={styles.moodBar}>
                  <View
                    style={[
                      styles.moodFill,
                      {
                        width: `${moodScore}%`,
                        backgroundColor:
                          moodScore >= 80
                            ? "#10B981"
                            : moodScore >= 60
                            ? "#F59E0B"
                            : "#EF4444",
                      },
                    ]}
                  />
                </View>
                <TouchableOpacity
                  style={styles.moodButton}
                  onPress={() => setMoodScore(Math.min(100, moodScore + 10))}
                >
                  <Ionicons name="add" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddEntry}
                >
                  <Text style={styles.saveButtonText}>Save Entry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(236, 72, 153, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  entryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  entryDate: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 6,
  },
  moodContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  moodScore: {
    fontSize: 14,
    fontWeight: "bold",
  },
  entryContent: {
    fontSize: 16,
    color: "#ffffff",
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#374151",
    textAlignVertical: "top",
    marginBottom: 20,
    minHeight: 120,
  },
  moodSliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  moodButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  moodBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginHorizontal: 15,
    overflow: "hidden",
  },
  moodFill: {
    height: "100%",
    borderRadius: 4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
})
