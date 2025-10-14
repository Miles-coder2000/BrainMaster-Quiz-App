# 🧠 BrainMaster Quiz App

A modern, feature-rich quiz application built with **React Native** and **Expo**, designed to challenge your general knowledge across multiple categories and difficulty levels — from Easy to Hard.  
Built as an educational and interactive mobile learning tool, it features real-time authentication, score tracking, achievements, and leaderboard integration powered by **Supabase**.

---

## 🚀 Features

### 🎮 Core Gameplay
- Multiple quiz categories (General Knowledge, Science, History, Technology, Sports)
- Three difficulty levels (Easy, Medium, Hard)
- Interactive multiple-choice questions
- Timer, lives, and streak system
- Real-time score updates and progress bar

### 🧍 User Features
- Sign up and login with Supabase authentication
- Personalized profile with XP, coins, level, and progress
- Achievements system (auto unlock based on performance)
- Global leaderboard based on XP and high scores
- Quiz result history with XP and coins earned
- Power-ups (Hint, Add Time, Skip)

### 🏪 Additional Screens
- **Home Screen:** Quick access to all features
- **Store Screen:** Purchase power-ups (planned)
- **Profile Screen:** Level and XP progress
- **Leaderboard:** Global ranking system
- **Achievements:** Unlock badges and rewards
- **About Screen:** App info and developer credits

---

## 🧩 Tech Stack

| Technology | Purpose |
|-------------|----------|
| **React Native (Expo)** | Frontend framework for cross-platform mobile apps |
| **Supabase** | Authentication, database, and storage |
| **React Navigation** | Multi-screen navigation and stack management |
| **AsyncStorage** | Local storage for quiz states |
| **Animated API** | UI animations and progress transitions |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Miles-coder2000/BrainMaster-Quiz-App.git
cd BrainMaster-Quiz-App
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables
You can edit the Supabase credentials in **`config/supabase.js`** or use Expo environment variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4️⃣ Run the App
```bash
npx expo start
```

To test it on your device, scan the QR code using **Expo Go** (Android/iOS).

---

## 📱 Screens Overview

| Screen | Description |
|--------|--------------|
| **Login / Signup** | User authentication via Supabase |
| **Home** | Shows stats, high score, coins, and navigation buttons |
| **Category Selection** | Choose quiz category |
| **Difficulty Selection** | Choose difficulty level |
| **Quiz Screen** | Interactive gameplay with timer and power-ups |
| **Result Screen** | Displays score, XP, coins, and achievements |
| **Profile** | Tracks user level, XP, and overall performance |
| **Leaderboard** | Shows top players globally |
| **Achievements** | Shows unlocked and locked badges |
| **About** | App info and developer credits |

---

## 🧠 Game Logic Summary

- **XP & Coins** are earned based on correct answers and difficulty:
  - Easy ×1, Medium ×2, Hard ×3 multipliers.
- **Achievements** unlock automatically when criteria are met (e.g., 10 quizzes, 1000 XP).
- **Level** increases every 100 XP.
- **Local progress** is stored using `AsyncStorage`.

---

## 🎨 Design & UI/UX

- Dark mode inspired UI (`#0f172a` and `#1e293b`)
- Consistent color palette with glowing accents:
  - 🟢 Green: Progress / XP
  - 🟡 Yellow: Score / Difficulty
  - 🔵 Blue: Actions / Buttons
- Smooth animated transitions for XP bars and scores

---

## 📦 Deployment

The app can be built and deployed using **Expo EAS**:

```bash
eas build --platform android
```

It supports:
- **Android (.apk / .aab)**
- **iOS (via TestFlight or App Store)**

---

## 🌟 Optional Enhancements

- [ ] Add sound effects and background music  
- [ ] Offline quiz mode  
- [ ] Power-up store functionality  
- [ ] Custom quiz creation feature  
- [ ] Friend challenges and multiplayer mode  

---

## 👩‍💻 Developers

**Group 5 – BSIT 2B**  
📘 Course: MAD101 (TFS)  
🧑‍💻 Lead Developer: *Miles Lander S. Garcia*  
🧠 Project: BrainMaster Quiz App (v2.0.0)

---

## 📄 License

This project is licensed under the **MIT License** — feel free to modify and build upon it.

---

> © 2025 BrainMaster App. All rights reserved.
