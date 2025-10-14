import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [username, setUsername] = useState('');
  const { user, signOut } = useAuth();

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setHighScore(data.high_score || 0);
        setCoins(data.coins || 0);
        setXp(data.xp || 0);
        setStreak(data.daily_streak || 0);
        setUsername(data.username || 'Player');
      }
    };
    const unsubscribe = navigation.addListener('focus', loadStats);
    return unsubscribe;
  }, [navigation, user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Brain Master Quiz</Text>
      <Text style={styles.username}>Welcome, {username}!</Text>

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
        style={[styles.button, { backgroundColor: '#8b5cf6' }]}
        onPress={() => navigation.navigate('Leaderboard')}
      >
        <Text style={styles.buttonText}>🏆 Leaderboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#f59e0b' }]}
        onPress={() => navigation.navigate('Achievements')}
      >
        <Text style={styles.buttonText}>🎯 Achievements</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#3b82f6' }]}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>👤 Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#ef4444' }]}
        onPress={signOut}
      >
        <Text style={styles.buttonText}>🚪 Logout</Text>
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
    marginBottom: 10,
  },
  username: {
    color: '#9ca3af',
    fontSize: 16,
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
