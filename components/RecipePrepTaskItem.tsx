import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import { PrepTask } from '../types/types';
import { formatTime } from '../utils/prepSheetUtils';
import RecipePrepDetailModal from './RecipePrepDetailModal';

interface PrepTaskItemProps {
  task: PrepTask;
  onComplete: (taskId: string, isCompleted: boolean, completedQuantity: number) => void;
  onQuantityChange: (taskId: string, newQuantity: number) => void;
}

export default function RecipePrepTaskItem({ task, onComplete, onQuantityChange }: PrepTaskItemProps) {
  const [showModal, setShowModal] = useState(false);

  const handleCardPress = () => {
    setShowModal(true);
  };

  return (
    <>
      <TouchableOpacity onPress={handleCardPress} activeOpacity={0.9}>
        <View style={styles.card}>
          <Text style={styles.recipeName}>{task.recipeName}</Text>

          <View style={styles.row}>
            <Clock size={14} color="#333" />
            <Text style={styles.timeText}>Estimated Time: {formatTime(task.estimatedTime)}</Text>
          </View>

          <View style={styles.batchRow}>
            <Text style={styles.label}>📘 Batch Quantity:</Text>
            <Text style={styles.valueText}>{task.quantity} batch(es)</Text>
          </View>

          <View style={styles.ingredientsBlock}>
            <Text style={styles.label}>⚖️ Ingredients Required:</Text>
            {task.recipe.ingredients.map((ing) => (
              <Text key={ing.id}>
                {ing.name}: {(ing.quantity * task.quantity).toFixed(2)} {ing.unit}
              </Text>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => onComplete(task.id, true, task.quantity)}
            >
              <Text style={styles.doneText}>DONE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notDoneButton}>
              <Text style={styles.notDoneText}>NOT DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <RecipePrepDetailModal
        visible={showModal}
        recipe={task.recipe}
        initialBatchQuantity={task.quantity}
        shortages={task.shortages}
        onConfirm={(qty) => {
          onQuantityChange(task.id, qty);
          setShowModal(false);
        }}
        onClose={() => setShowModal(false)}
        onQuantityChange={(qty) => {
          onQuantityChange(task.id, qty);
        }}
        necessaryPrepInfo={task.necessaryPrepInfo}
        showShortage={true}
        onCloseShortage={() => {}}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#8B0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B0000',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#555',
  },
  batchRow: {
    marginTop: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  ingredientsBlock: {
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doneButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  notDoneButton: {
    backgroundColor: '#B0BEC5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  doneText: {
    color: '#fff',
    fontWeight: '600',
  },
  notDoneText: {
    color: '#fff',
    fontWeight: '600',
  },
});
