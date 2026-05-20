import { sqlite, initializeDatabase } from "./storage";

async function update() {
  initializeDatabase();
  console.log("Updating database records...");
  
  const roms = sqlite.prepare("SELECT * FROM uploaded_roms WHERE system = 'NES'").all();
  for (const rom of roms as any[]) {
    sqlite.prepare("UPDATE uploaded_roms SET system = 'nes' WHERE id = ?").run(rom.id);
    console.log(`Updated ROM ${rom.id} to lowercase 'nes'`);
  }
  
  console.log("Update complete.");
}

update().catch(console.error);
