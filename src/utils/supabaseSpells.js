import { supabase } from "../lib/supabase";

export async function fetchCustomSpells() {
  const { data, error } = await supabase
    .from("custom_spells")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCustomSpell(spell) {
  const { data, error } = await supabase
    .from("custom_spells")
    .insert([spell])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomSpell(spell) {
  const { data, error } = await supabase
    .from("custom_spells")
    .update({
      name: spell.name,
      level: spell.level,
    })
    .eq("id", spell.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCustomSpell(id) {
  const { error } = await supabase
    .from("custom_spells")
    .delete()
    .eq("id", id);

  if (error) throw error;
}