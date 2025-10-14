import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ResultScreen({ route, navigation }) {
  const { score = 0, total = 10, category = 'Unknown', difficulty = 'Unknown' } = route.params || {};
  const [highScore, setHighScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [animatedScore] = useState(new Animated.Value(0));

  useEffect(() => {
    const updateResults = async () => {
      const multiplier = difficulty === 'Hard' ? 3 : difficulty === 'Medium' ? 2 : 1;
      const xp = score * 10 * multiplier;
      const coins = score * 5 * multiplier;

      setXpEarned(xp);
      setCoinsEarned(coins);

      const storedXp = parseInt(await AsyncStorage.getItem('xp')) || 0;
      const storedCoins = parseInt(await AsyncStorage.getItem('coins')) || 0;
      const storedHighScore = parseInt(await AsyncStorage.getItem('highScore')) || 0;

      const newXp = storedXp + xp;
      const newCoins = storedCoins + coins;
      const newHighScore = Math.max(storedHighScore, score);

      await AsyncStorage.setItem('xp', newXp.toString());
      await AsyncStorage.setItem('coins', newCoins.toString());
      await AsyncStorage.setItem('highScore', newHighScore.toString());

      setHighScore(newHighScore);
    };

    updateResults();

    // ✅ Animate score counter
    Animated.timing(animatedScore, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, []);

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
