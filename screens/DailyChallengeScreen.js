import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export default function DailyChallengeScreen({ navigation }) {
  const [todayChallenge, setTodayChallenge] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ completed: 0, total: 30 });
  const { user } = useAuth();

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  const loadDailyChallenge = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      let { data: challenge } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .maybeSingle();

      if (!challenge) {
        challenge = await createTodayChallenge(today);
      }

      setTodayChallenge(challenge);

      const { data: completion } = await supabase
        .from('daily_challenge_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challenge.id)
        .maybeSingle();

      setCompleted(!!completion);

      const { data: completions } = await supabase
        .from('daily_challenge_completions')
        .select('id')
        .eq('user_id', user.id);

      setUserStats({ completed: completions?.length || 0, total: 30 });
    } catch (error) {
      console.error('Error loading daily challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTodayChallenge = async (today) => {
    const categories = ['General Knowledge', 'Science', 'History', 'Technology', 'Sports', 'Geography', 'Entertainment', 'Literature', 'Math', 'Art'];
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    const bonusMultiplier = randomDifficulty === 'Easy' ? 1 : randomDifficulty === 'Medium' ? 2 : 3;

    const { data, error } = await supabase
      .from('daily_challenges')
      .insert({
        challenge_date: today,
        category: randomCategory,
        difficulty: randomDifficulty,
        bonus_xp: 50 * bonusMultiplier,
        bonus_coins: 25 * bonusMultiplier,
        time_limit: 300,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating challenge:', error);
      return null;
    }

    return data;
  };

  const startChallenge = () => {
    if (!todayChallenge || completed) return;

    navigation.navigate('Quiz', {
      category: todayChallenge.category,
      difficulty: todayChallenge.difficulty,
      isDailyChallenge: true,
      challengeId: todayChallenge.id,
      bonusXp: todayChallenge.bonus_xp,
      bonusCoins: todayChallenge.bonus_coins,
      timeLimit: todayChallenge.time_limit,
    });
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Easy') return '#22c55e';
    if (difficulty === 'Medium') return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading challenge...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Daily Challenge</Text>
      <Text style={styles.subtitle}>Complete today's challenge for bonus rewards!</Text>

      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Your Progress</Text>
        <Text style={styles.progressText}>
          {userStats.completed} / {userStats.total} Challenges Completed
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(userStats.completed / userStats.total) * 100}%` },
            ]}
          />
        </View>
      </View>

      {todayChallenge && (
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeIcon}>🎯</Text>
            <Text style={styles.challengeTitle}>Today's Challenge</Text>
          </View>

          <View style={styles.challengeDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{todayChallenge.category}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Difficulty:</Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: getDifficultyColor(todayChallenge.difficulty) },
                ]}
              >
                {todayChallenge.difficulty}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time Limit:</Text>
              <Text style={styles.detailValue}>{Math.floor(todayChallenge.time_limit / 60)} minutes</Text>
            </View>
          </View>

          <View style={styles.rewardsSection}>
            <Text style={styles.rewardsTitle}>Bonus Rewards:</Text>
            <View style={styles.rewardsRow}>
              <Text style={styles.rewardItem}>⚡ +{todayChallenge.bonus_xp} XP</Text>
              <Text style={styles.rewardItem}>🪙 +{todayChallenge.bonus_coins} Coins</Text>
            </View>
          </View>

          {completed ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✅ Completed Today!</Text>
              <Text style={styles.completedSubtext}>Come back tomorrow for a new challenge</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.startButton} onPress={startChallenge}>
              <Text style={styles.startButtonText}>Start Challenge</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How It Works</Text>
        <Text style={styles.infoText}>• New challenge available every day</Text>
        <Text style={styles.infoText}>• Complete within the time limit</Text>
        <Text style={styles.infoText}>• Earn bonus XP and coins</Text>
        <Text style={styles.infoText}>• Track your completion progress</Text>
      </View>
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
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  title: {
    color: '#22c55e',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  progressTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressText: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  challengeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  challengeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  challengeTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  challengeDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#9ca3af',
    fontSize: 16,
  },
  detailValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rewardsSection: {
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  rewardsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedBadge: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    color: '#22c55e',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  completedSubtext: {
    color: '#9ca3af',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
});
