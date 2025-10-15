import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, ScrollView } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

export default function StoreScreen({ navigation }) {
  const [coins, setCoins] = useState(0);
  const [powerUps, setPowerUps] = useState([]);
  const [userInventory, setUserInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadStoreData);
    return unsubscribe;
  }, [navigation]);

  const loadStoreData = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', user.id)
        .maybeSingle();

      setCoins(profile?.coins || 0);

      const { data: powerUpsData } = await supabase
        .from('power_ups')
        .select('*')
        .order('price', { ascending: true });

      setPowerUps(powerUpsData || []);

      const { data: inventory } = await supabase
        .from('user_power_ups')
        .select('power_up_id, quantity')
        .eq('user_id', user.id);

      const inventoryMap = {};
      inventory?.forEach((item) => {
        inventoryMap[item.power_up_id] = item.quantity;
      });
      setUserInventory(inventoryMap);
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (item) => {
    if (coins < item.price) {
      Alert.alert('Not enough coins', `You need ${item.price - coins} more coins.`);
      return;
    }

    try {
      const updatedCoins = coins - item.price;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: updatedCoins })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const currentQuantity = userInventory[item.id] || 0;

      if (currentQuantity > 0) {
        const { error: inventoryError } = await supabase
          .from('user_power_ups')
          .update({ quantity: currentQuantity + 1 })
          .eq('user_id', user.id)
          .eq('power_up_id', item.id);

        if (inventoryError) throw inventoryError;
      } else {
        const { error: insertError } = await supabase
          .from('user_power_ups')
          .insert({
            user_id: user.id,
            power_up_id: item.id,
            quantity: 1,
          });

        if (insertError) throw insertError;
      }

      setCoins(updatedCoins);
      setUserInventory({ ...userInventory, [item.id]: currentQuantity + 1 });

      Alert.alert('Purchase Successful!', `You bought ${item.name}`);
    } catch (error) {
      console.error('Error purchasing item:', error);
      Alert.alert('Error', 'Failed to purchase item. Please try again.');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'hint':
        return '#3b82f6';
      case 'skip':
        return '#8b5cf6';
      case 'time':
        return '#22c55e';
      case 'freeze':
        return '#06b6d4';
      case 'double_xp':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  const renderItem = ({ item }) => {
    const ownedCount = userInventory[item.id] || 0;
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemIcon}>{item.icon}</Text>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDesc}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.itemStats}>
            <Text style={styles.itemCost}>🪙 {item.price}</Text>
            <Text style={styles.owned}>Owned: {ownedCount}</Text>
          </View>
          <TouchableOpacity
            style={[styles.buyButton, { backgroundColor: getTypeColor(item.type) }]}
            onPress={() => handleBuy(item)}
          >
            <Text style={styles.buyText}>Buy</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading store...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Power-Up Store</Text>

      <View style={styles.coinsCard}>
        <Text style={styles.coinsLabel}>Your Balance</Text>
        <Text style={styles.coinsValue}>🪙 {coins}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How to Earn Coins</Text>
        <Text style={styles.infoText}>• Complete quizzes and challenges</Text>
        <Text style={styles.infoText}>• Maintain daily streaks</Text>
        <Text style={styles.infoText}>• Unlock achievements</Text>
        <Text style={styles.infoText}>• Claim daily rewards</Text>
      </View>

      <Text style={styles.sectionTitle}>Available Power-Ups</Text>

      {powerUps.length === 0 ? (
        <Text style={styles.emptyText}>No power-ups available</Text>
      ) : (
        powerUps.map((item) => (
          <View key={item.id}>
            {renderItem({ item })}
          </View>
        ))
      )}

      <View style={styles.spacer} />
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
    fontSize: 32,
    color: '#22c55e',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  coinsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#facc15',
  },
  coinsLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  coinsValue: {
    color: '#facc15',
    fontSize: 36,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDesc: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemStats: {
    flex: 1,
  },
  itemCost: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  owned: {
    color: '#22c55e',
    fontSize: 14,
  },
  buyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  spacer: {
    height: 40,
  },
});
