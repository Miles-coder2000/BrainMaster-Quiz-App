import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const categories = ['General Knowledge', 'Science', 'History', 'Technology', 'Sports'];

export default function CategorySelectionScreen({ navigation }) {
  const handleSelectCategory = (category) => {
    navigation.navigate('Difficulty', { category });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧩 Select a Category</Text>

      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', paddingVertical: 10 }}
      >
        {categories.map((category, i) => (
          <TouchableOpacity
            key={i}
            style={styles.button}
            onPress={() => handleSelectCategory(category)}
          >
            <Text style={styles.buttonText}>{category}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#f87171', marginTop: 20 }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>🏠 Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#3b82f6',
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
