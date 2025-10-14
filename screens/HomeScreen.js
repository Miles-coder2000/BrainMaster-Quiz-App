import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const savedHigh = parseInt(await AsyncStorage.getItem('highScore')) || 0;
      const savedCoins = parseInt(await AsyncStorage.getItem('coins')) || 0;
      const savedXp = parseInt(await AsyncStorage.getItem('xp')) || 0;
      const savedStreak = parseInt(await AsyncStorage.getItem('dailyStreak')) || 0;
      setHighScore(savedHigh);
      setCoins(savedCoins);
      setXp(savedXp);
      setStreak(savedStreak);
    };
    const unsubscribe = navigation.addListener('focus', loadStats);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Brain Master Quiz</Text>

      <View style={styles.statsContainer}>
        <Text style={styles.stat}>🏆 High Score: {highScore}</Text>
        <Text style={styles.stat}>🪙 Coins: {coins}</Text>
        <Text style={styles.stat}>⚡ XP: {xp}</Text>
        <Text style={styles.stat}>🔥 Streak: {streak}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#22c55e' }]}
        onPress={() => navigation.navigate('Category')}
      >
        <Text style={styles.buttonText}>🎮 Start Quiz</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#3b82f6' }]}
        onPress={() => navigation.navigate('Store')}
      >
        <Text style={styles.buttonText}>🛍️ Open Store</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#facc15' }]}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>👤 View Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#ef4444' }]}
        onPress={() => navigation.navigate('About')}
      >
        <Text style={styles.buttonText}>ℹ️ About</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#22c55e',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  statsContainer: {
    marginBottom: 30,
  },
  stat: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 4,
    textAlign: 'center',
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
