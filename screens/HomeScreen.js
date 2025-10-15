import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>🧠 Brain Master Quiz</Text>
      <Text style={styles.username}>Welcome, {username}!</Text>

      <View style={styles.statsContainer}>
        <Text style={styles.stat}>🏆 High Score: {highScore}</Text>
        <Text style={styles.stat}>🪙 Coins: {coins}</Text>
        <Text style={styles.stat}>⚡ XP: {xp}</Text>
        <Text style={styles.stat}>🔥 Streak: {streak}</Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Play</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#22c55e' }]}
        onPress={() => navigation.navigate('Category')}
      >
        <Text style={styles.buttonText}>🎮 Start Quiz</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#f59e0b' }]}
        onPress={() => navigation.navigate('DailyChallenge')}
      >
        <Text style={styles.buttonText}>🎯 Daily Challenge</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Progress & Stats</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: '#3b82f6' }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.buttonText}>👤 Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: '#8b5cf6' }]}
          onPress={() => navigation.navigate('QuizHistory')}
        >
          <Text style={styles.buttonText}>📊 History</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Rewards & Shop</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: '#10b981' }]}
          onPress={() => navigation.navigate('Store')}
        >
          <Text style={styles.buttonText}>🛒 Store</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: '#f59e0b' }]}
          onPress={() => navigation.navigate('DailyRewards')}
        >
          <Text style={styles.buttonText}>🎁 Rewards</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: '#ec4899' }]}
          onPress={() => navigation.navigate('Achievements')}
        >
          <Text style={styles.buttonText}>🏅 Achievements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: '#06b6d4' }]}
          onPress={() => navigation.navigate('Badges')}
        >
          <Text style={styles.buttonText}>🎖️ Badges</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Community</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#8b5cf6' }]}
        onPress={() => navigation.navigate('Leaderboard')}
      >
        <Text style={styles.buttonText}>🏆 Leaderboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#ef4444' }]}
        onPress={signOut}
      >
        <Text style={styles.buttonText}>🚪 Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: '#22c55e',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  username: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 30,
  },
  statsContainer: {
    marginBottom: 30,
    width: '100%',
  },
  stat: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    width: '100%',
    textAlign: 'left',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    marginVertical: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  smallButton: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    marginVertical: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
