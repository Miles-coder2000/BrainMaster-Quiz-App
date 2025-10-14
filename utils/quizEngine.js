// utils/quizEngine.js

// ✅ Fisher–Yates Shuffle Algorithm (true random)
export const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// ✅ Helper function to get randomized questions
export const getRandomizedQuestions = (questionData, category, difficulty, limit = 10) => {
  const filtered = questionData.filter(
    (q) => q.category === category && q.difficulty === difficulty
  );

  // Randomize questions and each question's options
  const randomized = shuffle(filtered)
    .slice(0, limit)
    .map((q) => ({
      ...q,
      options: shuffle(q.options),
    }));

  return randomized;
};
