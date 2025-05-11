import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MealLog } from '../types/types';

interface Props {
  mealLog: MealLog;
  onDelete: () => void;
  onEdit: () => void;
}

export default function MealLogEntry({ mealLog, onDelete, onEdit }: Props) {
  const confirmDelete = () => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete "${mealLog.recipe.name}" log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={styles.entry}>
      <View style={styles.headerRow}>
        <Text style={styles.recipe}>{mealLog.recipe.name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.edit}>🖊 Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete}>
            <Text style={styles.delete}>🗑 Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.details}>
        Quantity: {mealLog.quantity}
        {mealLog.manualOverrideServings !== null &&
          ` → Override: ${mealLog.manualOverrideServings}`}
      </Text>
      {mealLog.notes && (
        <Text style={styles.comment}>Note: {mealLog.notes}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  entry: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recipe: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  edit: {
    color: '#007aff',
    marginRight: 12,
  },
  delete: {
    color: '#ff3b30',
  },
  details: {
    marginTop: 6,
  },
  comment: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#666',
  },
});
