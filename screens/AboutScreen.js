import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ℹ️ About BrainMaster Quiz</Text>
      <Text style={styles.paragraph}>
        Welcome to <Text style={styles.highlight}>BrainMaster Quiz App</Text> — 
        your ultimate quiz companion to test and sharpen your general knowledge!
      </Text>

      <Text style={styles.paragraph}>
        This app was developed as part of a learning project for mobile development. 
        It features multiple categories such as General Knowledge, Science, 
        Technology, History, and more — giving users a fun and engaging way 
        to learn new facts every day.
      </Text>

      <Text style={styles.sectionTitle}>🎯 Key Features</Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>• Interactive multiple-choice quiz</Text>
        <Text style={styles.listItem}>• Instant feedback on answers</Text>
        <Text style={styles.listItem}>• Score tracking with high score saving</Text>
        <Text style={styles.listItem}>• Clean, dark-themed UI for better focus</Text>
        <Text style={styles.listItem}>• Total of 150 Categorized Difficulties of Questions.</Text>
      </View>

      <Text style={styles.sectionTitle}>👨‍💻 Developer</Text>
      <Text style={styles.paragraph}>
        Created by: <Text style={styles.highlight}>Group 5</Text>{'\n'}
        Course: BSIT 2B{'\n'}
        Class: MAD101 (TFS)
      </Text>

      <Text style={styles.footer}>Version v2.0.0 • © 2025 BrainMaster App</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    padding: 20,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  list: {
    marginLeft: 10,
    marginBottom: 15,
  },
  listItem: {
    color: '#aaa',
    fontSize: 15,
    marginVertical: 3,
  },
  highlight: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  footer: {
    color: '#777',
    fontSize: 13,
    marginTop: 30,
    textAlign: 'center',
    alignSelf: 'center',
  },
});
