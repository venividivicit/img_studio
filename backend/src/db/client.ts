import { Database } from "bun:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { config } from "../core/config.ts";

let db: Database | null = null;

function applySchema(db: Database): void {
  const schemaPath = new URL("./schema.sql", import.meta.url);
  const sql = readFileSync(schemaPath, "utf8");
  for (const statement of sql.split(";")) {
    const trimmed = statement.trim();
    if (trimmed) db.run(trimmed);
  }
}

export function getDb(): Database {
  if (db) return db;

  mkdirSync(dirname(config.databasePath), { recursive: true });

  db = new Database(config.databasePath);
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA foreign_keys = ON;");

  applySchema(db);

  return db;
}
