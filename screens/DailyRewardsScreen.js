import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export default function DailyRewardsScreen({ navigation }) {
  const [currentDay, setCurrentDay] = useState(1);
  const [canClaim, setCanClaim] = useState(false);
  const [lastClaimDate, setLastClaimDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const rewards = [
    { day: 1, xp: 20, coins: 10 },
    { day: 2, xp: 30, coins: 15 },
    { day: 3, xp: 40, coins: 20 },
    { day: 4, xp: 50, coins: 25 },
    { day: 5, xp: 75, coins: 35 },
    { day: 6, xp: 100, coins: 50 },
    { day: 7, xp: 200, coins: 100 },
  ];

  useEffect(() => {
    checkDailyReward();
  }, []);

  const checkDailyReward = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: todayReward } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('user_id', user.id)
        .eq('claim_date', today)
        .maybeSingle();

      if (todayReward) {
        setCanClaim(false);
        setCurrentDay(todayReward.day_number);
        setLastClaimDate(today);
      } else {
        const { data: allRewards } = await supabase
          .from('daily_rewards')
          .select('*')
          .eq('user_id', user.id)
          .order('claim_date', { ascending: false })
          .limit(1);

        if (allRewards && allRewards.length > 0) {
          const lastReward = allRewards[0];
          const lastDate = new Date(lastReward.claim_date);
          const todayDate = new Date(today);
          const diffTime = Math.abs(todayDate - lastDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            const nextDay = lastReward.day_number >= 7 ? 1 : lastReward.day_number + 1;
            setCurrentDay(nextDay);
            setCanClaim(true);
          } else if (diffDays > 1) {
            setCurrentDay(1);
            setCanClaim(true);
          }
        } else {
          setCurrentDay(1);
          setCanClaim(true);
        }
      }
    } catch (error) {
      console.error('Error checking daily reward:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async () => {
    if (!canClaim) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const reward = rewards[currentDay - 1];

      const { error: insertError } = await supabase
        .from('daily_rewards')
        .insert({
          user_id: user.id,
          claim_date: today,
          day_number: currentDay,
          xp_reward: reward.xp,
          coin_reward: reward.coins,
        });

      if (insertError) throw insertError;

      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, coins')
        .eq('id', user.id)
        .maybeSingle();

      const newXp = (profile?.xp || 0) + reward.xp;
      const newCoins = (profile?.coins || 0) + reward.coins;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          xp: newXp,
          coins: newCoins,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      Alert.alert(
        'Reward Claimed!',
        `You received ${reward.xp} XP and ${reward.coins} coins!`,
        [{ text: 'OK', onPress: () => checkDailyReward() }]
      );
    } catch (error) {
      console.error('Error claiming reward:', error);
      Alert.alert('Error', 'Failed to claim reward. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Daily Rewards</Text>
      <Text style={styles.subtitle}>Login every day to claim amazing rewards!</Text>

      <View style={styles.rewardsGrid}>
        {rewards.map((reward) => {
          const isClaimed = reward.day < currentDay;
          const isToday = reward.day === currentDay;
          const isLocked = reward.day > currentDay;

          return (
            <View
              key={reward.day}
              style={[
                styles.rewardCard,
                isClaimed && styles.rewardCardClaimed,
                isToday && styles.rewardCardToday,
                isLocked && styles.rewardCardLocked,
              ]}
            >
              <Text style={styles.dayLabel}>Day {reward.day}</Text>
              {reward.day === 7 && (
                <Text style={styles.specialBadge}>Special!</Text>
              )}
              <View style={styles.rewardContent}>
                <Text style={styles.rewardIcon}>
                  {isClaimed ? '✅' : isToday ? '🎁' : '🔒'}
                </Text>
                <Text style={[styles.rewardXP, isLocked && styles.rewardTextLocked]}>
                  +{reward.xp} XP
                </Text>
                <Text style={[styles.rewardCoins, isLocked && styles.rewardTextLocked]}>
                  +{reward.coins} Coins
                </Text>
              </View>
              {isClaimed && (
                <Text style={styles.claimedText}>Claimed</Text>
              )}
              {isToday && canClaim && (
                <TouchableOpacity style={styles.claimButton} onPress={claimReward}>
                  <Text style={styles.claimButtonText}>Claim</Text>
                </TouchableOpacity>
              )}
              {isToday && !canClaim && (
                <Text style={styles.alreadyClaimedText}>Already Claimed</Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How It Works</Text>
        <Text style={styles.infoText}>• Login daily to claim rewards</Text>
        <Text style={styles.infoText}>• Each day offers bigger rewards</Text>
        <Text style={styles.infoText}>• Day 7 is a special bonus</Text>
        <Text style={styles.infoText}>• Miss a day and the streak resets</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  rewardsGrid: {
    marginBottom: 20,
  },
  rewardCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#334155',
  },
  rewardCardClaimed: {
    borderColor: '#22c55e',
    opacity: 0.6,
  },
  rewardCardToday: {
    borderColor: '#f59e0b',
    borderWidth: 3,
  },
  rewardCardLocked: {
    opacity: 0.4,
  },
  dayLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  specialBadge: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rewardContent: {
    alignItems: 'center',
    marginVertical: 12,
  },
  rewardIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  rewardXP: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rewardCoins: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rewardTextLocked: {
    color: '#6b7280',
  },
  claimedText: {
    color: '#22c55e',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  claimButton: {
    backgroundColor: '#22c55e',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  alreadyClaimedText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
