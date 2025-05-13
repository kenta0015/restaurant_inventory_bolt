import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { InventoryItem as InventoryItemType } from '../types/types';
import { supabase } from '../supabaseClient';

interface InventoryItemProps {
  item: InventoryItemType;
  onDelete: () => void;
}

export default function InventoryItem({ item, onDelete }: InventoryItemProps) {
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [comment, setComment] = useState(item.comment || '');
  const [loading, setLoading] = useState(false);

  const isLowStock = item.quantity < item.alertLevel;

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('inventory')
      .update({
        quantity: parseFloat(quantity),
        comment: comment
      })
      .eq('id', item.id);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Inventory item updated');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.itemName}>
          {item.name} {isLowStock && '⚠️'}
        </Text>
        <TouchableOpacity onPress={onDelete}>
          <Trash2 size={20} color="red" />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Text>Qty:</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <Text>{item.unit}</Text>
      </View>

      <View style={styles.row}>
        <Text>Comment:</Text>
        <TextInput
          style={styles.input}
          value={comment}
          onChangeText={setComment}
          placeholder="Add comment..."
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    borderRadius: 4,
    flex: 1,
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: '#8a1e1e',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
