import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpProgress, setXpProgress] = useState(0);
  const [username, setUsername] = useState('');
  const [highScore, setHighScore] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const progress = new Animated.Value(0);
  const { user } = useAuth();

  const xpPerLevel = 100;

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setXp(profile.xp || 0);
        setCoins(profile.coins || 0);
        setUsername(profile.username || 'Player');
        setHighScore(profile.high_score || 0);

        const newLevel = Math.floor(profile.xp / xpPerLevel) + 1;
        const progressInLevel = profile.xp % xpPerLevel;

        setLevel(newLevel);
        setXpProgress(progressInLevel);

        const validProgress = progressInLevel / xpPerLevel || 0;

        Animated.timing(progress, {
          toValue: validProgress,
          duration: 600,
          useNativeDriver: false,
        }).start();
      }

      const { count } = await supabase
        .from('quiz_results')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setTotalQuizzes(count || 0);
    };

    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 {username}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Level</Text>
        <Text style={styles.value}>{level}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {xpProgress}/{xpPerLevel} XP to next level
      </Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{xp}</Text>
          <Text style={styles.statLabel}>⚡ Total XP</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{coins}</Text>
          <Text style={styles.statLabel}>🪙 Coins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{highScore}</Text>
          <Text style={styles.statLabel}>🏆 Best Score</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalQuizzes}</Text>
          <Text style={styles.statLabel}>📊 Quizzes</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20, justifyContent: 'center' },
  title: { color: '#22c55e', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#1e293b', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  label: { color: '#9ca3af', fontSize: 14, marginBottom: 5 },
  value: { color: '#fff', fontSize: 48, fontWeight: 'bold' },
  progressContainer: { height: 20, backgroundColor: '#1e293b', borderRadius: 10, overflow: 'hidden', marginBottom: 10, marginTop: 10 },
  progressBar: { height: '100%', backgroundColor: '#22c55e' },
  progressText: { color: '#9ca3af', fontSize: 14, textAlign: 'center', marginBottom: 30 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { width: '48%', backgroundColor: '#1e293b', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 5 },
  statValue: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  statLabel: { color: '#9ca3af', fontSize: 12 },
  button: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
});
