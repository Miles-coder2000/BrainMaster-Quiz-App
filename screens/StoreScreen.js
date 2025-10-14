import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_ITEMS = [
  { id: 'hint', name: 'Hint 🔍', description: 'Reveal one wrong answer.', cost: 20 },
  { id: 'time', name: 'Add Time ⏱️', description: 'Gain +5 seconds in a quiz.', cost: 30 },
  { id: 'skip', name: 'Skip ➡️', description: 'Skip one question safely.', cost: 40 },
];

export default function StoreScreen({ navigation }) {
  const [coins, setCoins] = useState(0);
  const [ownedItems, setOwnedItems] = useState({});

  useEffect(() => {
    const loadStoreData = async () => {
      const savedCoins = parseInt(await AsyncStorage.getItem('coins')) || 0;
      const savedItems = JSON.parse(await AsyncStorage.getItem('ownedItems')) || {};
      setCoins(savedCoins);
      setOwnedItems(savedItems);
    };
    const unsubscribe = navigation.addListener('focus', loadStoreData);
    return unsubscribe;
  }, [navigation]);

  const handleBuy = async item => {
    if (coins < item.cost) {
      Alert.alert('Not enough coins 💸', `You need ${item.cost - coins} more coins.`);
      return;
    }

    const updatedCoins = coins - item.cost;
    const updatedOwnedItems = { ...ownedItems, [item.id]: (ownedItems[item.id] || 0) + 1 };

    setCoins(updatedCoins);
    setOwnedItems(updatedOwnedItems);

    await AsyncStorage.setItem('coins', updatedCoins.toString());
    await AsyncStorage.setItem('ownedItems', JSON.stringify(updatedOwnedItems));

    Alert.alert('✅ Purchased!', `You bought ${item.name}.`);
  };

  const renderItem = ({ item }) => {
    const ownedCount = ownedItems[item.id] || 0;
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDesc}>{item.description}</Text>
          <Text style={styles.itemCost}>Cost: 🪙 {item.cost}</Text>
          <Text style={styles.owned}>Owned: {ownedCount}</Text>
        </View>
        <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(item)}>
          <Text style={styles.buyText}>Buy</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Power-Up Store</Text>
      <Text style={styles.coinsText}>Your Coins: 🪙 {coins}</Text>

      <FlatList
        data={STORE_ITEMS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 50 }}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.backButtonText}>🏠 Back to Home</Text>
      </TouchableOpacity>
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
    fontSize: 28,
    color: '#22c55e',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  coinsText: {
    color: '#facc15',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },
  itemDetails: {
    flex: 1,
    paddingRight: 10,
  },
  itemName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDesc: {
    color: '#94a3b8',
    fontSize: 14,
    marginVertical: 3,
  },
  itemCost: {
    color: '#facc15',
    fontSize: 14,
  },
  owned: {
    color: '#4ade80',
    fontSize: 14,
    marginTop: 3,
  },
  buyButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  buyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  backButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
  },
});
