import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export default function ResultScreen({ route, navigation }) {
  const { score = 0, total = 10, category = 'Unknown', difficulty = 'Unknown' } = route.params || {};
  const [highScore, setHighScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [animatedScore] = useState(new Animated.Value(0));
  const [newAchievements, setNewAchievements] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const updateResults = async () => {
      if (!user) return;

      const multiplier = difficulty === 'Hard' ? 3 : difficulty === 'Medium' ? 2 : 1;
      const xp = score * 10 * multiplier;
      const coins = score * 5 * multiplier;

      setXpEarned(xp);
      setCoinsEarned(coins);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) return;

      const newXp = profile.xp + xp;
      const newCoins = profile.coins + coins;
      const newHighScore = Math.max(profile.high_score || 0, score);

      await supabase
        .from('profiles')
        .update({
          xp: newXp,
          coins: newCoins,
          high_score: newHighScore,
          last_played: new Date().toISOString(),
        })
        .eq('id', user.id);

      await supabase.from('quiz_results').insert({
        user_id: user.id,
        category,
        difficulty,
        score,
        total,
        xp_earned: xp,
        coins_earned: coins,
      });

      setHighScore(newHighScore);

      await checkAchievements(profile, newXp, newCoins, newHighScore, score, total);
    };

    updateResults();

    Animated.timing(animatedScore, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [user]);

  const checkAchievements = async (profile, newXp, newCoins, newHighScore, score, total) => {
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*');

    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
    const newlyUnlocked = [];

    const { count: totalQuizzes } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: hardQuizzes } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('difficulty', 'Hard');

    for (const achievement of allAchievements || []) {
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.requirement) {
        case 'complete_1_quiz':
          shouldUnlock = totalQuizzes >= 1;
          break;
        case 'complete_10_quizzes':
          shouldUnlock = totalQuizzes >= 10;
          break;
        case 'perfect_score':
          shouldUnlock = score === total;
          break;
        case '7_day_streak':
          shouldUnlock = profile.daily_streak >= 7;
          break;
        case 'earn_1000_xp':
          shouldUnlock = newXp >= 1000;
          break;
        case 'earn_500_coins':
          shouldUnlock = newCoins >= 500;
          break;
        case 'complete_5_hard':
          shouldUnlock = hardQuizzes >= 5;
          break;
      }

      if (shouldUnlock) {
        await supabase.from('user_achievements').insert({
          user_id: user.id,
          achievement_id: achievement.id,
        });

        await supabase
          .from('profiles')
          .update({
            xp: newXp + achievement.xp_reward,
            coins: newCoins + achievement.coin_reward,
          })
          .eq('id', user.id);

        newlyUnlocked.push(achievement);
      }
    }

    setNewAchievements(newlyUnlocked);
  };

  const displayedScore = animatedScore.interpolate({
    inputRange: [0, score],
    outputRange: [0, score],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏁 Quiz Complete!</Text>

      <Text style={styles.category}>
        Category: <Text style={{ color: '#38bdf8' }}>{category}</Text>
      </Text>
      <Text style={styles.category}>
        Difficulty: <Text style={{ color: '#facc15' }}>{difficulty}</Text>
      </Text>

      <Animated.Text style={styles.score}>
        Your Score: {Math.round(score)} / {total}
      </Animated.Text>

      <Text style={styles.stat}>⭐ XP Earned: {xpEarned}</Text>
      <Text style={styles.stat}>💰 Coins Earned: {coinsEarned}</Text>
      <Text style={styles.highScore}>🏆 High Score: {highScore}</Text>

      {newAchievements.length > 0 && (
        <View style={styles.achievementsContainer}>
          <Text style={styles.achievementsTitle}>🎉 New Achievements!</Text>
          {newAchievements.map((ach, i) => (
            <Text key={i} style={styles.achievement}>
              {ach.icon} {ach.name}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Home')}>
        <Text style={styles.buttonText}>Return Home</Text>
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
    color: '#facc15',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  category: {
    color: '#e2e8f0',
    fontSize: 18,
    marginBottom: 8,
  },
  score: {
    color: '#4ade80',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  stat: {
    color: '#cbd5e1',
    fontSize: 18,
    marginVertical: 4,
  },
  highScore: {
    color: '#f97316',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
  },
  achievementsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    width: '90%',
  },
  achievementsTitle: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  achievement: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 3,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    width: '70%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});
