import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  ToastAndroid,
  Alert,
  TextInput,
  Button,
  TouchableOpacity,
} from 'react-native';
import Tesseract from 'tesseract.js';
import { supabase } from '../supabaseClient';
import { normalizeLine, correctName } from '../utils/ocrCorrection';
import { useIngredientCategories } from '../hooks/useIngredientCategories';
import { InventoryItem } from '../types/types';

interface Props {
  onUpdate: () => void;
}

interface OCRItem {
  name: string;
  quantity: number;
  unit: string;
  status: 'tracked' | 'new' | 'unknown';
  correctedName: string;
  category?: string;
  showNewCategoryInput?: boolean;
}

export default function RealOCRUploader({ onUpdate }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<OCRItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { categories, addCategory } = useIngredientCategories();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectURL = URL.createObjectURL(file);
    setImageUrl(objectURL);
    setLoading(true);

    const result = await Tesseract.recognize(file, 'eng');
    const text = result.data.text;
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    const { data } = await supabase.from('inventory').select('id, name, quantity, category');
    const inventoryList = (data as InventoryItem[]) || [];
    const inventoryNames = inventoryList.map((i) => ({ id: i.id, name: i.name }));

    const structured: OCRItem[] = [];
    for (const line of lines) {
      const parsed = normalizeLine(line);
      if (!parsed || !parsed.name || isNaN(parsed.quantity)) continue;

      const correctedName = correctName(parsed.name, inventoryNames);
      const exists = inventoryList.find((i) => i.name.toLowerCase() === correctedName.toLowerCase());

      structured.push({
        name: parsed.name,
        quantity: parsed.quantity,
        unit: parsed.unit,
        status: exists ? 'tracked' : (correctedName === parsed.name ? 'unknown' : 'new'),
        correctedName,
        category: exists?.category || '',
        showNewCategoryInput: false,
      });
    }

    setParsedItems(structured);
    setLoading(false);
  };

  const commitOCRItems = async () => {
    let updatedCount = 0;
    const { data } = await supabase.from('inventory').select('id, name, quantity');
    const inventoryList = (data as InventoryItem[]) || [];

    for (const item of parsedItems) {
      const existing = inventoryList.find((i) => i.name.toLowerCase() === item.correctedName.toLowerCase());

      if (existing) {
        const updatedQty = parseFloat(existing.quantity ?? 0) + item.quantity;
        await supabase.from('inventory').update({ quantity: updatedQty }).eq('id', existing.id);
      } else {
        await supabase.from('inventory').insert({
          name: item.correctedName,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category || null,
          alertLevel: 1,
        });
      }

      updatedCount++;
    }

    const message = `✅ ${updatedCount} item${updatedCount !== 1 ? 's' : ''} updated`;
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Update Complete', message);
    }

    onUpdate();
    setParsedItems([]);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>📷 Upload Invoice Image</Text>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {imageUrl && (
        <View style={styles.imagePreviewBlock}>
          <Text style={styles.subtitle}>🖼️ Before Scan Preview:</Text>
          <Image source={{ uri: imageUrl }} style={styles.image} />
        </View>
      )}

      {parsedItems.length > 0 && (
        <View style={styles.preview}>
          <Text style={styles.subtitle}>🧾 Parsed Items:</Text>
          {parsedItems.map((item, i) => (
            <View key={i} style={styles.lineItem}>
              <TextInput
                style={styles.inputName}
                value={item.correctedName}
                onChangeText={(text) => {
                  const newItems = [...parsedItems];
                  newItems[i].correctedName = text;
                  setParsedItems(newItems);
                }}
              />
              <TextInput
                style={styles.inputQty}
                value={String(item.quantity)}
                onChangeText={(text) => {
                  const newItems = [...parsedItems];
                  newItems[i].quantity = parseFloat(text) || 0;
                  setParsedItems(newItems);
                }}
                keyboardType="numeric"
              />
              <Text>{item.unit}</Text>
              <Text style={{ color: item.status === 'tracked' ? 'green' : item.status === 'new' ? 'orange' : 'red' }}>
                {item.status === 'tracked' ? 'Tracked' : item.status === 'new' ? 'New' : '❗ No Match'}
              </Text>

              {item.status !== 'tracked' && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontWeight: '600' }}>Category:</Text>
                  {!item.showNewCategoryInput ? (
                    <View style={styles.categoryList}>
                      {categories.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.categoryOption, item.category === cat && styles.categorySelected]}
                          onPress={() => {
                            const newItems = [...parsedItems];
                            newItems[i].category = cat;
                            setParsedItems(newItems);
                          }}
                        >
                          <Text>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity onPress={() => {
                        const updated = [...parsedItems];
                        updated[i].showNewCategoryInput = true;
                        setParsedItems(updated);
                      }}>
                        <Text style={styles.addMore}>+ New Category</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <TextInput
                        placeholder="New Category Name"
                        style={styles.inputCategory}
                        value={item.category || ''}
                        onChangeText={(text) => {
                          const titleCase = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
                          const updated = [...parsedItems];
                          updated[i].category = titleCase;
                          setParsedItems(updated);
                          addCategory(titleCase);
                        }}
                      />
                      <TouchableOpacity onPress={() => {
                        const updated = [...parsedItems];
                        updated[i].showNewCategoryInput = false;
                        setParsedItems(updated);
                      }}>
                        <Text style={styles.addMore}>← Back to Category List</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
          <Button title="✅ Confirm and Update Inventory" onPress={commitOCRItems} />
        </View>
      )}

      {loading && <Text style={styles.loading}>🔄 Scanning image with OCR...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 4, marginTop: 16, maxWidth: 600, alignSelf: 'center' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  subtitle: { fontWeight: 'bold', marginTop: 12, fontSize: 16 },
  imagePreviewBlock: { marginTop: 8, borderRadius: 8, overflow: 'hidden' },
  image: { width: '100%', height: 240, resizeMode: 'contain', borderRadius: 8, backgroundColor: '#eee' },
  preview: { marginTop: 12 },
  lineItem: { flexDirection: 'column', gap: 4, marginBottom: 12 },
  inputName: { borderBottomWidth: 1, borderColor: '#ccc', padding: 4, minWidth: 120 },
  inputQty: { borderBottomWidth: 1, borderColor: '#ccc', padding: 4, minWidth: 70, marginTop: 4 },
  inputCategory: { borderBottomWidth: 1, borderColor: '#999', padding: 4, marginTop: 2 },
  categoryList: { marginTop: 4 },
  categoryOption: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginVertical: 2 },
  categorySelected: { backgroundColor: '#def', borderColor: '#007AFF' },
  loading: { marginTop: 10, color: '#888', fontStyle: 'italic' },
  addMore: { color: '#007AFF', marginTop: 6 },
});
