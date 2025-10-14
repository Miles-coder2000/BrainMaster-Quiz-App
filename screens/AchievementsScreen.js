import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState([]);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data: allAchievements, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .order('xp_reward', { ascending: true });

      if (achError) throw achError;

      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      if (userError) throw userError;

      setAchievements(allAchievements || []);
      setUnlockedIds((userAchievements || []).map(ua => ua.achievement_id));
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isUnlocked = unlockedIds.includes(item.id);
    return (
      <View style={[styles.card, isUnlocked && styles.cardUnlocked]}>
        <Text style={styles.icon}>{item.icon}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.reward}>
            {item.xp_reward} XP • {item.coin_reward} Coins
          </Text>
        </View>
        {isUnlocked && <Text style={styles.unlocked}>Unlocked</Text>}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Achievements</Text>
      <Text style={styles.subtitle}>
        {unlockedIds.length} / {achievements.length} Unlocked
      </Text>

      <FlatList
        data={achievements}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
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
    marginBottom: 10,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    opacity: 0.5,
  },
  cardUnlocked: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  icon: {
    fontSize: 32,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  reward: {
    color: '#facc15',
    fontSize: 12,
  },
  unlocked: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
