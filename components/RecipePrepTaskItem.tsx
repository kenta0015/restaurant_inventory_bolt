import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import { Recipe } from '../types/types';

interface RecipePrepTaskItemProps {
  recipe: Recipe;
  onComplete: (recipeId: string, batchQuantity: number) => void;
  onDefer: (recipeId: string) => void;
  onOpenDetail: (recipe: Recipe, initialBatchQuantity: number) => void;
}

const RecipePrepTaskItem: React.FC<RecipePrepTaskItemProps> = ({
  recipe,
  onComplete,
  onDefer,
  onOpenDetail,
}) => {
  const [batchQuantity, setBatchQuantity] = useState<number>(1);
  const [totalIngredients, setTotalIngredients] = useState<
    { name: string; quantity: number; unit: string }[]
  >([]);

  useEffect(() => {
    const updatedIngredients = recipe.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity * batchQuantity,
      unit: ingredient.unit,
    }));
    setTotalIngredients(updatedIngredients);
  }, [batchQuantity, recipe.ingredients]);

  return (
    <TouchableOpacity style={styles.container} onPress={() => onOpenDetail(recipe, batchQuantity)}>
      <Text style={styles.title}>{recipe.name}</Text>
      <Text style={styles.time}>🕒 Estimated Time: {recipe.estimatedTime || 20} min</Text>

      <Text style={styles.label}>🔢 Batch Quantity:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={batchQuantity.toString()}
        onChangeText={(text) => setBatchQuantity(Number(text))}
      />

      <Text style={styles.subtitle}>⚖️ Ingredients Required:</Text>
      {totalIngredients.map((ingredient, index) => (
        <Text key={index}>
          {ingredient.name}: {ingredient.quantity} {ingredient.unit}
        </Text>
      ))}

      <View style={styles.buttonContainer}>
        <Button title="Done" onPress={() => onComplete(recipe.id, batchQuantity)} />
        <Button title="Not Done" onPress={() => onDefer(recipe.id)} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  label: {
    marginTop: 12,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 8,
    width: 60,
  },
  subtitle: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

export default RecipePrepTaskItem;
