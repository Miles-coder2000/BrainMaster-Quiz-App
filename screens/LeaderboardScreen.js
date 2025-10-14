import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '../config/supabase';

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, xp, high_score')
        .order('xp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <Text style={styles.username}>{item.username || 'Anonymous'}</Text>
      <View style={styles.stats}>
        <Text style={styles.xp}>{item.xp} XP</Text>
        <Text style={styles.score}>Best: {item.high_score}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Global Leaderboard</Text>

      <FlatList
        data={leaderboard}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No players yet. Be the first!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },
  title: {
    color: '#facc15',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  rank: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: 'bold',
    width: 40,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  stats: {
    alignItems: 'flex-end',
  },
  xp: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
  },
  score: {
    color: '#9ca3af',
    fontSize: 12,
  },
  empty: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
