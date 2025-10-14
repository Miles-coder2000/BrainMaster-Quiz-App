import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { questionData } from '../utils/questions';
import { shuffle } from '../utils/quizEngine';

export default function QuizScreen({ route, navigation }) {
  const { category, difficulty, resume, savedCurrent, savedScore } = route.params || {};

  const filteredQuestions = questionData.filter(
    q =>
      q.category.toLowerCase() === category.toLowerCase() &&
      q.difficulty.toLowerCase() === difficulty.toLowerCase()
  );

  const randomized = shuffle(filteredQuestions).slice(0, 10);

  const [questions, setQuestions] = useState(randomized);
  const [current, setCurrent] = useState(resume ? savedCurrent : 0);
  const [score, setScore] = useState(resume ? savedScore : 0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [usedTime, setUsedTime] = useState(false);
  const [usedSkip, setUsedSkip] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: (current + 1) / questions.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [current, questions.length]);

  useEffect(() => {
    if (isPaused) return;
    if (timeLeft <= 0) return handleNext(false);

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isPaused]);

  const handleAnswer = (option) => {
    if (selected) return;
    setSelected(option);
    setIsPaused(true);

    const correct = option === questions[current].correct;
    if (correct) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
    }

    setTimeout(() => handleNext(correct), 700);
  };

  const handleNext = async (answeredCorrectly) => {
    setSelected(null);
    setIsPaused(false);
    setTimeLeft(15);

    if (current + 1 < questions.length && lives > 0) {
      setCurrent(prev => prev + 1);
    } else {
      // ✅ Wait a bit to ensure score state updates before finish
      setTimeout(async () => {
        const finalScore = answeredCorrectly ? score + 1 : score;

        await AsyncStorage.setItem('lastScore', finalScore.toString());
        await AsyncStorage.setItem('lastTotal', questions.length.toString());
        await AsyncStorage.setItem('lastStatus', 'completed');
        await AsyncStorage.setItem('lastCategory', category);
        await AsyncStorage.setItem('lastDifficulty', difficulty);

        navigation.replace('Result', {
          score: finalScore,
          total: questions.length,
          category,
          difficulty,
        });
      }, 300);
    }
  };

  const useHint = () => {
    if (usedHint) return;
    setUsedHint(true);
    Alert.alert('💡 Hint Used', `The correct answer starts with: "${questions[current].correct[0]}"`);
  };

  const addTime = () => {
    if (usedTime) return;
    setUsedTime(true);
    setTimeLeft(prev => prev + 10);
  };

  const skipQuestion = () => {
    if (usedSkip) return;
    setUsedSkip(true);
    handleNext(true);
  };

  if (!questions || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>😕 No questions found for this category/difficulty.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Category')}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = questions[current];

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.statsRow}>
        <Text style={styles.stats}>❤️ {lives}</Text>
        <Text style={styles.stats}>🔥 {streak}</Text>
        <Text style={styles.stats}>💰 {score}</Text>
      </View>

      {/* Progress Bar */}
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

      {/* Timer */}
      <Text style={styles.timer}>⏱ {timeLeft}s</Text>

      {/* Question */}
      <Text style={styles.question}>
        {current + 1}. {question.question}
      </Text>

      {/* Options */}
      {question.options.map((option, i) => {
        const isCorrect = selected === question.correct && selected === option;
        const isWrong = selected && selected === option && selected !== question.correct;
        return (
          <TouchableOpacity
            key={i}
            style={[
              styles.option,
              selected && isCorrect && { backgroundColor: '#22c55e' },
              selected && isWrong && { backgroundColor: '#ef4444' },
            ]}
            onPress={() => handleAnswer(option)}
            disabled={!!selected}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        );
      })}

      {/* Power-ups */}
      <View style={styles.powerUps}>
        <TouchableOpacity
          style={[styles.powerButton, usedHint && { opacity: 0.5 }]}
          onPress={useHint}
          disabled={usedHint}
        >
          <Text style={styles.powerText}>💡 Hint</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.powerButton, usedTime && { opacity: 0.5 }]}
          onPress={addTime}
          disabled={usedTime}
        >
          <Text style={styles.powerText}>⏰ +10s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.powerButton, usedSkip && { opacity: 0.5 }]}
          onPress={skipQuestion}
          disabled={usedSkip}
        >
          <Text style={styles.powerText}>⏭️ Skip</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.progressText}>
        Question {current + 1} / {questions.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827', padding: 20, justifyContent: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  stats: { color: '#facc15', fontSize: 16, fontWeight: 'bold' },
  progressContainer: {
    height: 12,
    backgroundColor: '#374151',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressBar: { height: '100%', backgroundColor: '#22c55e' },
  timer: { textAlign: 'center', color: '#fbbf24', fontSize: 18, marginBottom: 15 },
  question: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  option: { backgroundColor: '#1f2937', padding: 15, borderRadius: 10, marginVertical: 5 },
  optionText: { color: '#fff', fontSize: 16 },
  powerUps: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  powerButton: { backgroundColor: '#3b82f6', borderRadius: 10, padding: 12, width: '30%' },
  powerText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  progressText: { textAlign: 'center', color: '#9ca3af', marginTop: 15 },
  button: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 10, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
  errorText: { color: '#f87171', fontSize: 18, textAlign: 'center' },
});
