import { supabase } from "../lib/supabase";

export async function fetchCustomLootItems() {
  const { data, error } = await supabase
    .from("custom_loot_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCustomLootItem(item) {
  const { data, error } = await supabase
    .from("custom_loot_items")
    .insert([item])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomLootItem(item) {
  const { data, error } = await supabase
    .from("custom_loot_items")
    .update({
      name: item.name,
      category: item.category,
      rarity: item.rarity,
      source: item.source,
      slots: item.slots,
    })
    .eq("id", item.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCustomLootItem(id) {
  const { error } = await supabase
    .from("custom_loot_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}