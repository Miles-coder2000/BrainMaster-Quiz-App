import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const difficulties = [
  { label: 'Easy 🟢', value: 'Easy', color: '#22c55e' },
  { label: 'Medium 🟠', value: 'Medium', color: '#f59e0b' },
  { label: 'Hard 🔴', value: 'Hard', color: '#ef4444' },
];

export default function DifficultySelectionScreen({ route, navigation }) {
  const { category } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚡ Select Difficulty</Text>
      <Text style={styles.subtitle}>Category: {category}</Text>

      {difficulties.map((diff, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.button, { backgroundColor: diff.color }]}
          onPress={() =>
            navigation.navigate('Quiz', {
              category,
              difficulty: diff.value,
              resume: false,
            })
          }
        >
          <Text style={styles.buttonText}>{diff.label}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#3b82f6', marginTop: 20 }]}
        onPress={() => navigation.navigate('Category')}
      >
        <Text style={styles.buttonText}>⬅ Back to Categories</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
