import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export default function QuizHistoryScreen() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalScore: 0,
    totalXP: 0,
    totalCoins: 0,
    avgScore: 0,
    bestCategory: '',
    categoryStats: {},
    difficultyStats: {},
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      let query = supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('difficulty', filter);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      setHistory(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setStats({
        totalQuizzes: 0,
        totalScore: 0,
        totalXP: 0,
        totalCoins: 0,
        avgScore: 0,
        bestCategory: 'None',
        categoryStats: {},
        difficultyStats: {},
      });
      return;
    }

    const totalQuizzes = data.length;
    const totalScore = data.reduce((sum, quiz) => sum + quiz.score, 0);
    const totalXP = data.reduce((sum, quiz) => sum + quiz.xp_earned, 0);
    const totalCoins = data.reduce((sum, quiz) => sum + quiz.coins_earned, 0);
    const avgScore = totalScore / totalQuizzes;

    const categoryStats = {};
    const difficultyStats = { Easy: 0, Medium: 0, Hard: 0 };

    data.forEach((quiz) => {
      if (!categoryStats[quiz.category]) {
        categoryStats[quiz.category] = { count: 0, score: 0 };
      }
      categoryStats[quiz.category].count++;
      categoryStats[quiz.category].score += quiz.score;

      if (difficultyStats[quiz.difficulty] !== undefined) {
        difficultyStats[quiz.difficulty]++;
      }
    });

    let bestCategory = 'None';
    let maxCount = 0;
    Object.keys(categoryStats).forEach((cat) => {
      if (categoryStats[cat].count > maxCount) {
        maxCount = categoryStats[cat].count;
        bestCategory = cat;
      }
    });

    setStats({
      totalQuizzes,
      totalScore,
      totalXP,
      totalCoins,
      avgScore: avgScore.toFixed(1),
      bestCategory,
      categoryStats,
      difficultyStats,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Quiz History & Statistics</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalQuizzes}</Text>
          <Text style={styles.statLabel}>Total Quizzes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.avgScore}</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalXP}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCoins}</Text>
          <Text style={styles.statLabel}>Total Coins</Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Performance Breakdown</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Best Category:</Text>
          <Text style={styles.detailValue}>{stats.bestCategory}</Text>
        </View>

        <Text style={styles.sectionTitle}>Difficulty Distribution</Text>
        <View style={styles.difficultyBars}>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Easy</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${(stats.difficultyStats.Easy / stats.totalQuizzes) * 100}%`,
                    backgroundColor: '#22c55e',
                  },
                ]}
              />
            </View>
            <Text style={styles.barCount}>{stats.difficultyStats.Easy}</Text>
          </View>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Medium</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${(stats.difficultyStats.Medium / stats.totalQuizzes) * 100}%`,
                    backgroundColor: '#f59e0b',
                  },
                ]}
              />
            </View>
            <Text style={styles.barCount}>{stats.difficultyStats.Medium}</Text>
          </View>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Hard</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${(stats.difficultyStats.Hard / stats.totalQuizzes) * 100}%`,
                    backgroundColor: '#ef4444',
                  },
                ]}
              />
            </View>
            <Text style={styles.barCount}>{stats.difficultyStats.Hard}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Category Stats</Text>
        {Object.keys(stats.categoryStats).map((category) => (
          <View key={category} style={styles.categoryRow}>
            <Text style={styles.categoryName}>{category}</Text>
            <Text style={styles.categoryCount}>
              {stats.categoryStats[category].count} quizzes
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter by Difficulty:</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'Easy' && styles.filterButtonActive]}
            onPress={() => setFilter('Easy')}
          >
            <Text style={[styles.filterText, filter === 'Easy' && styles.filterTextActive]}>
              Easy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'Medium' && styles.filterButtonActive]}
            onPress={() => setFilter('Medium')}
          >
            <Text style={[styles.filterText, filter === 'Medium' && styles.filterTextActive]}>
              Medium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'Hard' && styles.filterButtonActive]}
            onPress={() => setFilter('Hard')}
          >
            <Text style={[styles.filterText, filter === 'Hard' && styles.filterTextActive]}>
              Hard
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.historyList}>
        <Text style={styles.cardTitle}>Recent Quizzes</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No quiz history yet. Start playing!</Text>
        ) : (
          history.map((quiz) => (
            <View key={quiz.id} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyCategory}>{quiz.category}</Text>
                <Text style={[styles.historyDifficulty, { color: getDifficultyColor(quiz.difficulty) }]}>
                  {quiz.difficulty}
                </Text>
              </View>
              <View style={styles.historyDetails}>
                <Text style={styles.historyScore}>
                  Score: {quiz.score}/{quiz.total}
                </Text>
                <Text style={styles.historyRewards}>
                  +{quiz.xp_earned} XP | +{quiz.coins_earned} Coins
                </Text>
              </View>
              <Text style={styles.historyDate}>{formatDate(quiz.completed_at)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#22c55e',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  difficultyBars: {
    marginBottom: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabel: {
    color: '#9ca3af',
    fontSize: 14,
    width: 60,
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#334155',
    borderRadius: 10,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  barCount: {
    color: '#fff',
    fontSize: 14,
    width: 30,
    textAlign: 'right',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  categoryName: {
    color: '#fff',
    fontSize: 14,
  },
  categoryCount: {
    color: '#9ca3af',
    fontSize: 14,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#22c55e',
  },
  filterText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#fff',
  },
  historyList: {
    marginBottom: 20,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  historyItem: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyCategory: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyDifficulty: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyScore: {
    color: '#9ca3af',
    fontSize: 14,
  },
  historyRewards: {
    color: '#22c55e',
    fontSize: 14,
  },
  historyDate: {
    color: '#9ca3af',
    fontSize: 12,
  },
});
