
import initSqlJs from 'sql.js';

interface OnosConfig {
  id: number;
  ip: string;
  port: string;
  username: string;
  password: string;
  created_at: string;
  updated_at: string;
}

class SQLiteService {
  private db: any = null;
  private SQL: any = null;

  async initialize() {
    try {
      // Initialiser SQL.js
      this.SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });

      // Charger la base de données existante ou en créer une nouvelle
      const savedDb = localStorage.getItem('onosDatabase');
      if (savedDb) {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        this.db = new this.SQL.Database(uint8Array);
      } else {
        this.db = new this.SQL.Database();
        this.createTables();
      }

      console.log('SQLite database initialized');
    } catch (error) {
      console.error('Failed to initialize SQLite:', error);
      throw error;
    }
  }

  private createTables() {
    // Créer la table des configurations ONOS
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS onos_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT NOT NULL,
        port TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Créer la table des requêtes API sauvegardées
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS api_requests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        method TEXT NOT NULL,
        url TEXT NOT NULL,
        headers TEXT,
        body TEXT,
        timestamp INTEGER
      );
    `);

    this.saveDatabase();
  }

  private saveDatabase() {
    const data = this.db.export();
    const buffer = Array.from(data);
    localStorage.setItem('onosDatabase', JSON.stringify(buffer));
  }

  // Méthodes pour les configurations ONOS
  async saveOnosConfig(config: Omit<OnosConfig, 'id' | 'created_at' | 'updated_at'>) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO onos_configs (ip, port, username, password, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    
    stmt.run([config.ip, config.port, config.username, config.password]);
    stmt.free();
    this.saveDatabase();
  }

  async getLatestOnosConfig(): Promise<OnosConfig | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM onos_configs 
      ORDER BY updated_at DESC 
      LIMIT 1
    `);
    
    const result = stmt.getAsObject();
    stmt.free();
    
    return result ? result as OnosConfig : null;
  }

  async getAllOnosConfigs(): Promise<OnosConfig[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM onos_configs 
      ORDER BY updated_at DESC
    `);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as OnosConfig);
    }
    stmt.free();
    
    return results;
  }

  // Méthodes pour les requêtes API
  async saveApiRequest(request: any) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO api_requests (id, name, method, url, headers, body, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      request.id,
      request.name,
      request.method,
      request.url,
      JSON.stringify(request.headers),
      request.body,
      request.timestamp
    ]);
    stmt.free();
    this.saveDatabase();
  }

  async getAllApiRequests(): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM api_requests 
      ORDER BY timestamp DESC
    `);
    
    const results = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        ...row,
        headers: JSON.parse(row.headers as string)
      });
    }
    stmt.free();
    
    return results;
  }

  async deleteApiRequest(id: string) {
    const stmt = this.db.prepare(`DELETE FROM api_requests WHERE id = ?`);
    stmt.run([id]);
    stmt.free();
    this.saveDatabase();
  }

  async close() {
    if (this.db) {
      this.db.close();
    }
  }
}

export const sqliteService = new SQLiteService();
