import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpProgress, setXpProgress] = useState(0);
  const progress = new Animated.Value(0);

  const xpPerLevel = 100;

  const safeParse = (value) => {
    const num = parseInt(value);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    const loadData = async () => {
      const storedXp = safeParse(await AsyncStorage.getItem('xp'));
      const storedCoins = safeParse(await AsyncStorage.getItem('coins'));

      setXp(storedXp);
      setCoins(storedCoins);

      const newLevel = Math.floor(storedXp / xpPerLevel) + 1;
      const progressInLevel = storedXp % xpPerLevel;

      setLevel(newLevel);
      setXpProgress(progressInLevel);

      const validProgress = isNaN(progressInLevel / xpPerLevel)
        ? 0
        : progressInLevel / xpPerLevel;

      Animated.timing(progress, {
        toValue: validProgress,
        duration: 600,
        useNativeDriver: false,
      }).start();
    };

    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Player Profile</Text>

      <Text style={styles.text}>Level: {level}</Text>
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
      <Text style={styles.text}>
        {xpProgress}/{xpPerLevel} XP to next level
      </Text>

      <Text style={styles.text}>🪙 Coins: {coins}</Text>

      <Text
        style={styles.link}
        onPress={() => navigation.navigate('Home')}
      >
        ← Back to Home
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  text: { color: '#f1f5f9', fontSize: 18, textAlign: 'center', marginBottom: 10 },
  progressContainer: { height: 16, backgroundColor: '#333', borderRadius: 10, overflow: 'hidden', marginBottom: 10 },
  progressBar: { height: '100%', backgroundColor: '#4CAF50' },
  link: { color: '#60a5fa', fontSize: 18, textAlign: 'center', marginTop: 30 },
});
