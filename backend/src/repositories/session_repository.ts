import { getDb } from "../db/client.ts";

export type SessionRecord = {
  id: string;
  created_at: string;
};

export const sessionRepository = {
  create(id: string): void {
    getDb().run("INSERT INTO sessions (id) VALUES (?)", [id]);
  },

  exists(id: string): boolean {
    const row = getDb()
      .query<{ id: string }, [string]>("SELECT id FROM sessions WHERE id = ?")
      .get(id);
    return row !== null;
  },

  findById(id: string): SessionRecord | null {
    return getDb()
      .query<
        SessionRecord,
        [string]
      >("SELECT id, created_at FROM sessions WHERE id = ?")
      .get(id);
  },
};
