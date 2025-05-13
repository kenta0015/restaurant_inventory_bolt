import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  ScrollView,
} from 'react-native';
import { InventoryItem as InventoryItemType } from '../../types/types';
import { supabase } from '../../supabaseClient';
import InventoryItem from '../../components/InventoryItem';
import AddIngredientModal from '../../components/AddIngredientModal';
import { Plus } from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItemType[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<{ [category: string]: boolean }>({});
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const { data, error } = await supabase.from('inventory').select('*');

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setItems(data as InventoryItemType[]);

      const initialExpanded: { [category: string]: boolean } = {};
      (data as InventoryItemType[]).forEach((item) => {
        const category = item.category ?? 'Uncategorized';
        if (!(category in initialExpanded)) {
          initialExpanded[category] = true;
        }
      });
      setExpandedCategories(initialExpanded);
    }
  };

  const handleDelete = async (itemId: string) => {
    const { error } = await supabase.from('inventory').delete().eq('id', itemId);

    if (error) {
      Alert.alert('Error deleting item', error.message);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const toggleCategory = (category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const grouped = items.reduce((acc: { [key: string]: InventoryItemType[] }, item) => {
    const cat = item.category ?? 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const lowStockItems = items.filter((item) => item.quantity < item.alertLevel);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory List</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Plus size={28} color="#8a1e1e" />
        </TouchableOpacity>
      </View>

      {lowStockItems.length > 0 && (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>
            ⚠️ {lowStockItems.length} items are below minimum stock level:{' '}
            {lowStockItems.map((i) => i.name).join(', ')}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {Object.entries(grouped).map(([category, categoryItems]) => (
          <View key={category} style={styles.categorySection}>
            <TouchableOpacity onPress={() => toggleCategory(category)} style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>
                {expandedCategories[category] ? '▼' : '▶'} {category}
              </Text>
            </TouchableOpacity>

            {expandedCategories[category] &&
              categoryItems.map((item) => (
                <InventoryItem
                  key={item.id}
                  item={item}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
          </View>
        ))}
      </ScrollView>

      <AddIngredientModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={fetchInventory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  alertBox: {
    backgroundColor: '#ffe6e6',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  alertText: {
    color: '#a00',
    fontWeight: 'bold',
  },
  categorySection: { marginBottom: 24 },
  categoryHeader: {
    paddingVertical: 8,
    backgroundColor: '#ddd',
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

