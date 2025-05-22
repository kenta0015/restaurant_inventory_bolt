import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../supabaseClient";
import { MealLog } from "../../types/types";
import AddMealLogModal from "../../components/AddMealLogModal";
import MealLogEntry from "../../components/MealLogEntry";
import CommentModal from "../../components/CommentModal";
import { updateInventoryByDelta } from "../../utils/supabaseUtils";

export default function MealLogScreen() {
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [commentEditingId, setCommentEditingId] = useState<string | null>(null);
  const [commentValue, setCommentValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMealLogs = async () => {
    const { data, error } = await supabase
      .from("meal_logs")
      .select(`
        id,
        quantity,
        notes,
        manualOverrideServings,
        date,
        recipe:recipe_id (
          id,
          name,
          category,
          createdAt
        )
      `)
      .order("date", { ascending: false });

    if (!error && data) {
      const mapped = data.map((log: any) => ({
        id: log.id,
        quantity: log.quantity,
        notes: log.notes,
        manualOverrideServings: log.manualOverrideServings,
        date: log.date,
        recipe: {
          id: log.recipe.id,
          name: log.recipe.name,
          category: log.recipe.category,
          createdAt: log.recipe.createdAt,
        },
      }));
      setMealLogs(mapped);
    }
  };

  useEffect(() => {
    fetchMealLogs();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("meal_logs").delete().eq("id", id);
    if (error) Alert.alert("Error", error.message);
    else fetchMealLogs();
  };

  const handleSaveComment = async (text: string) => {
    if (!commentEditingId) return;
    const { error } = await supabase
      .from("meal_logs")
      .update({ notes: text })
      .eq("id", commentEditingId);

    if (!error) fetchMealLogs();
    setCommentEditingId(null);
    setCommentValue("");
  };

  const handleQuantityUpdate = async (id: string, newQuantity: number) => {
    console.log(`✏️ Updating quantity for ID ${id} → ${newQuantity}`);

    const { data, error } = await supabase
      .from("meal_logs")
      .select("quantity, recipe_id, recipe:recipe_id (name)")
      .eq("id", id)
      .single();

    if (error || !data) {
      Alert.alert("Error", "Failed to retrieve original quantity");
      return;
    }

    const oldQuantity = data.quantity;
    const recipeId = data.recipe_id;
    const recipeName =
      Array.isArray(data.recipe) && data.recipe.length > 0
        ? data.recipe[0].name
        : (data.recipe as any)?.name || "Meal";

    const delta = newQuantity - oldQuantity;
    console.log(`📐 Delta = ${delta}`);

    if (delta !== 0) {
      await updateInventoryByDelta(recipeId, delta);
    }

    const { error: updateError } = await supabase
      .from("meal_logs")
      .update({ quantity: newQuantity })
      .eq("id", id);

    if (updateError) {
      Alert.alert("Error", updateError.message);
    } else {
      console.log("✅ Meal log updated successfully");

      const threshold = 2;
      const shouldAlert = newQuantity <= threshold;
      console.log(`🚨 recipeName: ${recipeName}`);

      if (shouldAlert) {
        setTimeout(() => {
          Alert.alert(
            "⚠️ Low Meal Stock",
            `The stock for "${recipeName}" is now ${newQuantity}, which is below the threshold of ${threshold}.`
          );
        }, 100);
      }

      setTimeout(() => {
        fetchMealLogs();
      }, 150);
    }
  };

  // ✅ Group logs by recipe name and sum quantity + merge notes
  const groupedLogs = mealLogs
    .filter((log) =>
      log.recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .reduce((acc, log) => {
      const key = log.recipe.name;
      if (!acc[key]) {
        acc[key] = {
          id: log.id,
          quantity: 0,
          notes: [],
          ids: [],
          date: log.date,
          manualOverrideServings: log.manualOverrideServings ?? null,
          recipe: log.recipe,
        };
      }
      acc[key].quantity += log.quantity;
      acc[key].ids.push(log.id);
      if (log.notes) acc[key].notes.push(log.notes);
      return acc;
    }, {} as Record<string, any>);

  const mergedLogs: MealLog[] = Object.values(groupedLogs).map((entry: any) => ({
    id: entry.ids[0],
    quantity: entry.quantity,
    notes: entry.notes.join("\n"),
    recipe: entry.recipe,
    date: entry.date,
    manualOverrideServings: entry.manualOverrideServings,
  }));

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          style={[styles.searchBox, { flex: 1 }]}
          placeholder="Search meal logs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={mergedLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MealLogEntry
            log={item}
            onDelete={() => handleDelete(item.id)}
            onEditComment={() => {
              setCommentEditingId(item.id);
              setCommentValue(item.notes || "");
            }}
            onQuantityUpdate={(newQty) => handleQuantityUpdate(item.id, newQty)}
          />
        )}
      />

      <AddMealLogModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onLogSuccess={fetchMealLogs}
      />

      <CommentModal
        visible={!!commentEditingId}
        initialValue={commentValue}
        onSave={handleSaveComment}
        onCancel={() => setCommentEditingId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
    borderRadius: 6,
    marginRight: 10,
  },
  fab: {
    backgroundColor: "#007AFF",
    borderRadius: 30,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
