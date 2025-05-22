import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import PrepSheetSummary from '../../components/PrepSheetSummary';
import RecipePrepTaskItem from '../../components/RecipePrepTaskItem';
import RecipePrepDetailModal from '../../components/RecipePrepDetailModal';
import { supabase } from '../../supabaseClient';
import {
  Recipe,
  PrepTask,
  IngredientShortage,
  InventoryItem,
} from '../../types/types';
import {
  checkIngredientShortages,
  calculateNecessaryPrepAmount,
} from '../../utils/prepSuggestionUtils';

export default function PrepSheet() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tasks, setTasks] = useState<PrepTask[]>([]);
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

  const convertShortages = (list: IngredientShortage[]) =>
    list.map((s) => ({
      name: s.ingredientName,
      necessaryAmount: s.required,
      unit: s.unit,
      currentStock: s.available,
    }));

  const fetchRecipes = async () => {
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('*');

    if (inventoryError || !inventoryData) {
      console.error('❌ Failed to load inventory:', inventoryError?.message);
      return;
    }

    const { data, error } = await supabase
      .from('recipes')
      .select(
        `id, name, category, createdAt, description,
         recipe_ingredients (
           ingredient_id ( id, name ),
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
      estimatedTime: 20,
    }));

    setRecipes(formatted);

    const prepQty = 10;

    const generatedTasks: PrepTask[] = formatted.map((recipe) => {
      const shortagesRaw = checkIngredientShortages(recipe, prepQty, inventoryData);
      const shortages = convertShortages(shortagesRaw);
      const prepInfo = calculateNecessaryPrepAmount(recipe, prepQty, inventoryData);

      return {
        id: recipe.id,
        recipeId: recipe.id,
        recipeName: recipe.name,
        ingredientName: '',
        quantity: prepQty,
        unit: 'batch',
        estimatedTime: recipe.estimatedTime,
        isCompleted: false,
        completedQuantity: 0,
        recipe,
        shortages,
        necessaryPrepInfo: prepInfo,
      };
    });

    setTasks(generatedTasks);
  };

  const handleComplete = async (
    taskId: string,
    isCompleted: boolean,
    completedQuantity: number
  ) => {
    if (!isCompleted) return;

    const recipe = recipes.find((r) => r.id === taskId);
    if (!recipe) return;

    for (const ing of recipe.ingredients) {
      const totalUsed = ing.quantity * completedQuantity;

      const { data: inventoryItem, error: fetchError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('name', ing.name)
        .single();

      if (fetchError || !inventoryItem) {
        console.error('❌ Failed to fetch inventory for:', ing.name);
        continue;
      }

      const newQuantity = inventoryItem.quantity - totalUsed;

      await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('name', ing.name);
    }

    const { error } = await supabase.from('meal_logs').insert({
      recipe_id: taskId,
      quantity: completedQuantity,
      manualOverrideServings: null,
      notes: null,
    });

    if (error) {
      Alert.alert('Error', 'Failed to log meal: ' + error.message);
    } else {
      Alert.alert('✅ Success', `${recipe.name} logged as ${completedQuantity} batch(es)`);
      setTasks((prev) =>
        prev.map((t) =>
          t.recipeId === taskId ? { ...t, isCompleted: true } : t
        )
      );
    }
  };

  const handleQuantityChange = (taskId: string, newQty: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, quantity: newQty } : t))
    );
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
                  task={task}
                  onComplete={handleComplete}
                  onQuantityChange={handleQuantityChange}
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
          shortages={shortages.map((s) => ({
            name: s.ingredientName,
            necessaryAmount: s.required,
            unit: s.unit,
            currentStock: s.available,
          }))}
          necessaryPrepInfo={necessaryPrepInfo}
          onQuantityChange={setSelectedQuantity}
          onConfirm={(qty) => {
            setSelectedQuantity(qty);
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
