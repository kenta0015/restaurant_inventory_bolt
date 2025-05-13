import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import PrepSheetSummary from '../../components/PrepSheetSummary';
import RecipePrepTaskItem from '../../components/RecipePrepTaskItem';
import RecipePrepDetailModal from '../../components/RecipePrepDetailModal';
import { supabase } from '../../supabaseClient';
import {
  Recipe,
  RecipePrepTask,
  IngredientShortage,
} from '../../types/types';
import {
  checkIngredientShortages,
  calculateNecessaryPrepAmount,
} from '../../utils/prepSuggestionUtils';

export default function PrepSheet() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tasks, setTasks] = useState<RecipePrepTask[]>([]);
  const [comment, setComment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [shortages, setShortages] = useState<IngredientShortage[]>([]);
  const [showShortage, setShowShortage] = useState(true);
  const [necessaryPrepInfo, setNecessaryPrepInfo] = useState<{
    necessaryIngredients: {
      name: string;
      necessaryAmount: number;
      unit: string;
      currentStock: number;
    }[];
    canPrepWithCurrentStock: boolean;
  }>();

  useEffect(() => {
    fetchRecipes();
    fetchOrCopyComment();
  }, []);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const fetchOrCopyComment = async () => {
    const today = formatDate(selectedDate);
    const yesterday = formatDate(new Date(Date.now() - 86400000));

    const { data: todayNote } = await supabase
      .from('prep_notes')
      .select('comment')
      .eq('note_date', today)
      .single();

    if (todayNote?.comment) {
      setComment(todayNote.comment);
    } else {
      const { data: yesterdayNote } = await supabase
        .from('prep_notes')
        .select('comment')
        .eq('note_date', yesterday)
        .single();

      if (yesterdayNote?.comment) {
        setComment(yesterdayNote.comment);
      }
    }
  };

  const saveComment = async (text: string) => {
    setComment(text);
    const today = formatDate(selectedDate);

    await supabase.from('prep_notes').upsert(
      {
        note_date: today,
        comment: text,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'note_date' }
    );
  };

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select(
        `id, name, category, createdAt, description,
         recipe_ingredients (
           ingredient_id ( name ),
           quantity_per_batch,
           unit
         )`
      );

    if (error) {
      console.error('❌ Failed to load recipes:', error.message);
      return;
    }

    const formatted: Recipe[] = data.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      category: r.category,
      createdAt: r.createdAt,
      ingredients: r.recipe_ingredients.map((ing: any) => ({
        id: ing.ingredient_id?.id || '',
        name: ing.ingredient_id?.name || 'Unknown',
        quantity: ing.quantity_per_batch,
        unit: ing.unit,
      })),
      estimatedTime: 20, // Default fallback
    }));

    setRecipes(formatted);

    const generatedTasks: RecipePrepTask[] = formatted.map((recipe) => {
      const totalWeight = recipe.ingredients.reduce(
        (sum, ing) => sum + (typeof ing.quantity === 'number' ? ing.quantity : 0),
        0
      );

      return {
        id: recipe.id,
        recipeId: recipe.id,
        recipeName: recipe.name,
        prepQuantity: 1,
        estimatedTime: recipe.estimatedTime,
        totalIngredientWeight: totalWeight,
        isCompleted: false,
      };
    });

    setTasks(generatedTasks);
  };

  const handleComplete = async (recipeId: string, batchQuantity: number) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    const { error } = await supabase.from('meal_logs').insert({
      recipe_id: recipeId,
      quantity: batchQuantity,
      manualOverrideServings: null,
      notes: null,
    });

    if (error) {
      Alert.alert('Error', 'Failed to log meal: ' + error.message);
    } else {
      Alert.alert('✅ Success', `${recipe.name} logged as ${batchQuantity} batch(es)`);
      setTasks((prev) =>
        prev.map((t) =>
          t.recipeId === recipeId ? { ...t, isCompleted: true } : t
        )
      );
    }
  };

  const handleDefer = (recipeId: string) => {
    Alert.alert('Deferred', `Task for recipe ID ${recipeId} will remain.`);
  };

  const handleOpenDetail = (recipe: Recipe, batchQty: number) => {
    setSelectedRecipe(recipe);
    setSelectedQuantity(batchQty);

    const shortages = checkIngredientShortages(recipe, batchQty, []);
    const prepInfo = calculateNecessaryPrepAmount(recipe, batchQty, []);

    setShortages(shortages);
    setShowShortage(true);
    setNecessaryPrepInfo(prepInfo);
    setModalVisible(true);
  };

  const totalTime = tasks.reduce(
    (acc, task) => acc + (task.isCompleted ? 0 : task.estimatedTime),
    0
  );
  const completedTasks = tasks.filter((task) => task.isCompleted).length;
  const totalTasks = tasks.length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Today's Prep Sheet</Text>

          <Text style={styles.commentLabel}>📝 Daily Comment:</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="e.g., Tomatoes arrived late. Use older batch first."
            multiline
            value={comment}
            onChangeText={saveComment}
          />
        </View>

        <PrepSheetSummary
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          totalTimeInMinutes={totalTime}
          selectedDate={selectedDate}
        />

        <View style={styles.tasksContainer}>
          <Text style={styles.tasksTitle}>Prep Tasks</Text>

          {tasks.map(
            (task) =>
              !task.isCompleted && (
                <RecipePrepTaskItem
                  key={task.id}
                  recipe={{
                    ...recipes.find((r) => r.id === task.recipeId)!,
                  }}
                  onComplete={(recipeId, batchQty) => handleComplete(recipeId, batchQty)}
                  onDefer={handleDefer}
                  onOpenDetail={handleOpenDetail}
                />
              )
          )}
        </View>
      </View>

      {selectedRecipe && necessaryPrepInfo && (
        <RecipePrepDetailModal
          visible={modalVisible}
          recipe={selectedRecipe}
          initialBatchQuantity={selectedQuantity}
          shortages={shortages}
          necessaryPrepInfo={necessaryPrepInfo}
          onQuantityChange={setSelectedQuantity}
          onConfirm={(qty) => {
            setSelectedQuantity(qty); // Only update batch quantity
            setModalVisible(false);
          }}
          onClose={() => setModalVisible(false)}
          showShortage={showShortage}
          onCloseShortage={() => setShowShortage(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  commentLabel: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  commentInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    minHeight: 60,
    marginTop: 6,
  },
  tasksContainer: {
    marginTop: 24,
  },
  tasksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
