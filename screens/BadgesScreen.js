import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export default function BadgesScreen() {
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .order('rarity', { ascending: true });

      setAllBadges(badges || []);

      const { data: earned } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', user.id);

      setUserBadges(earned || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const isBadgeEarned = (badgeId) => {
    return userBadges.some((ub) => ub.badge_id === badgeId);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return '#9ca3af';
      case 'rare':
        return '#3b82f6';
      case 'epic':
        return '#8b5cf6';
      case 'legendary':
        return '#f59e0b';
      default:
        return '#9ca3af';
    }
  };

  const getRarityBorderColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return '#6b7280';
      case 'rare':
        return '#2563eb';
      case 'epic':
        return '#7c3aed';
      case 'legendary':
        return '#d97706';
      default:
        return '#6b7280';
    }
  };

  const earnedCount = userBadges.length;
  const totalCount = allBadges.length;

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading badges...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Badge Collection</Text>

      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Collection Progress</Text>
        <Text style={styles.progressText}>
          {earnedCount} / {totalCount} Badges Earned
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(earnedCount / totalCount) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.badgesGrid}>
        {allBadges.map((badge) => {
          const earned = isBadgeEarned(badge.id);
          return (
            <View
              key={badge.id}
              style={[
                styles.badgeCard,
                !earned && styles.badgeCardLocked,
                { borderColor: getRarityBorderColor(badge.rarity) },
              ]}
            >
              <View style={styles.badgeIconContainer}>
                <Text style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}>
                  {earned ? badge.icon : '🔒'}
                </Text>
              </View>
              <Text
                style={[
                  styles.badgeRarity,
                  { color: getRarityColor(badge.rarity) },
                ]}
              >
                {badge.rarity.toUpperCase()}
              </Text>
              <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]}>
                {badge.name}
              </Text>
              <Text style={[styles.badgeDesc, !earned && styles.badgeDescLocked]}>
                {badge.description}
              </Text>
              {!earned && (
                <Text style={styles.lockedText}>Not yet earned</Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.legendCard}>
        <Text style={styles.legendTitle}>Rarity Guide</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#9ca3af' }]} />
          <Text style={styles.legendText}>Common</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>Rare</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} />
          <Text style={styles.legendText}>Epic</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Legendary</Text>
        </View>
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
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIconContainer: {
    marginBottom: 12,
  },
  badgeIcon: {
    fontSize: 48,
  },
  badgeIconLocked: {
    fontSize: 36,
  },
  badgeRarity: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  badgeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeNameLocked: {
    color: '#9ca3af',
  },
  badgeDesc: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  badgeDescLocked: {
    color: '#6b7280',
  },
  lockedText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
  legendCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  legendTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});
