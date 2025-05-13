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
import { updateInventoryByDelta } from "../../utils/supabaseUtils"; // ← 自作関数の場所に合わせてください

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

    // Step 1: fetch current log (for old quantity + recipe_id)
    const { data, error } = await supabase
      .from("meal_logs")
      .select("quantity, recipe_id")
      .eq("id", id)
      .single();

    if (error || !data) {
      Alert.alert("Error", "Failed to retrieve original quantity");
      return;
    }

    const oldQuantity = data.quantity;
    const recipeId = data.recipe_id;
    const delta = newQuantity - oldQuantity;

    console.log(`📐 Delta = ${delta}`);

    if (delta !== 0) {
      await updateInventoryByDelta(recipeId, delta);
    }

    // Step 2: update the log itself
    const { error: updateError } = await supabase
      .from("meal_logs")
      .update({ quantity: newQuantity })
      .eq("id", id);

    if (updateError) {
      Alert.alert("Error", updateError.message);
    } else {
      fetchMealLogs();
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <TextInput
        style={styles.searchBox}
        placeholder="Search meal logs..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={mealLogs.filter((log) =>
          log.recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
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

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

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
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
