import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Recipe } from '../types/types';
import ShortageAlert from './ShortageAlert';
import PrepQuantityAdjuster from './PrepQuantityAdjuster';

interface Props {
  visible: boolean;
  recipe: Recipe;
  initialBatchQuantity: number;
  shortages: any[];
  onConfirm: (batchQuantity: number) => void;
  onClose: () => void;
  onQuantityChange: (batchQuantity: number) => void;
  necessaryPrepInfo: {
    necessaryIngredients: Array<{
      name: string;
      necessaryAmount: number;
      unit: string;
      currentStock: number;
    }>;
    canPrepWithCurrentStock: boolean;
  };
  showShortage: boolean;
  onCloseShortage: () => void;
}

export default function RecipePrepDetailModal({
  visible,
  recipe,
  initialBatchQuantity,
  shortages,
  onConfirm,
  onClose,
  onQuantityChange,
  necessaryPrepInfo,
  showShortage,
  onCloseShortage,
}: Props) {
  const [batchQuantity, setBatchQuantity] = useState<number>(initialBatchQuantity);


  useEffect(() => {
    setBatchQuantity(initialBatchQuantity);
  }, [initialBatchQuantity]);

  const handleQuantityChange = (newQuantity: number) => {
    setBatchQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{recipe.name} – Detail</Text>
        <Text style={styles.description}>{recipe.description}</Text>

        {showShortage && shortages.length > 0 && (
          <ShortageAlert shortages={shortages} onClose={onCloseShortage} />
        )}

        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionTitle}>Total Required Ingredients</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <Text>{ingredient.name}</Text>
              <Text>
                {(ingredient.quantity * batchQuantity).toFixed(2)} {ingredient.unit}
              </Text>
            </View>
          ))}
        </View>

        <PrepQuantityAdjuster
          value={batchQuantity}
          suggestedValue={initialBatchQuantity}
          onChange={handleQuantityChange}
          min={0}
        />

        <Text style={styles.noteText}>
  <Text style={styles.boldText}>Suggested:</Text> {initialBatchQuantity} batches
  (based on past 3 weekdays – recent stock). You can adjust if needed.
</Text>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => onConfirm(batchQuantity)}
        >
          <Text style={styles.confirmButtonText}>✅ Confirm</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  ingredientsSection: {
    marginVertical: 16,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  noteText: {
    backgroundColor: '#E6F7FF',
    padding: 10,
    borderRadius: 6,
    marginTop: 12,
    marginBottom: 20,
    fontSize: 14,
    color: '#333',
  },
  boldText: {
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    marginBottom: 40,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
