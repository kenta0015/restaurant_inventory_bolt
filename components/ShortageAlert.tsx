import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TriangleAlert as AlertTriangle, X } from 'lucide-react-native';
import { IngredientShortage } from '../types/types';

interface ShortageAlertProps {
  shortages: IngredientShortage[];
  onClose: () => void;
}

export default function ShortageAlert({ shortages, onClose }: ShortageAlertProps) {
  if (shortages.length === 0) return null;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <AlertTriangle color="#FFF" size={20} />
          <Text style={styles.title}>Ingredient Shortage Alert</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X color="#FFF" size={20} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.message}>
          The following ingredients are low or unavailable for the suggested prep:
        </Text>
        
        {shortages.map((shortage, index) => (
          <View key={index} style={styles.shortageItem}>
            <Text style={styles.ingredientName}>{shortage.ingredientName}</Text>
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityText}>
                Need: <Text style={styles.quantityValue}>{shortage.required} {shortage.unit}</Text>
              </Text>
              <Text style={styles.quantityText}>
                Have: <Text style={[
                  styles.quantityValue,
                  shortage.available < shortage.required && styles.shortageValue
                ]}>
                  {shortage.available} {shortage.unit}
                </Text>
              </Text>
            </View>
          </View>
        ))}
        
        <Text style={styles.suggestion}>
          Consider adjusting your prep quantity or restocking these items.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FF7F00',
  },
  header: {
    backgroundColor: '#FF7F00',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  message: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  },
  shortageItem: {
    backgroundColor: '#FFF8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
  },
  quantityValue: {
    fontWeight: '600',
    color: '#333',
  },
  shortageValue: {
    color: '#FF0000',
  },
  suggestion: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 8,
  },
});