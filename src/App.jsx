import { useEffect, useState } from "react";
import LootGenerator from "./components/LootGenerator";
import SpellGenerator from "./components/SpellGenerator";
import Auth from "./components/Auth";
import { supabase } from "./lib/supabase";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("loot");
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (!session) {
    return (
      <div className="app">
        <h1>Dungeon Loot Forge</h1>
        <p className="app-subtitle">
          Sign in to save and manage your custom campaign tools.
        </p>
        <Auth />
      </div>
    );
  }

  const userEmail = session.user?.email || "Signed-in user";

  return (
    <div className="app">
      <div className="app-header">
        <div>
          <h1>Dungeon Loot Forge</h1>
          <p className="app-subtitle">
            Generate randomized loot tables and spell rolls with source filtering for your campaign.
          </p>
        </div>

        <div className="user-panel">
          <div className="user-badge">Signed In</div>
          <div className="user-email">{userEmail}</div>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "loot" ? "tab active-tab" : "tab"}
          onClick={() => setActiveTab("loot")}
        >
          Loot Tables
        </button>

        <button
          className={activeTab === "spells" ? "tab active-tab" : "tab"}
          onClick={() => setActiveTab("spells")}
        >
          Spell Tables
        </button>
      </div>

      {activeTab === "loot" && <LootGenerator />}
      {activeTab === "spells" && <SpellGenerator />}
    </div>
  );
}

export default App;