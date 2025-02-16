import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Song } from '@shared/schema';

interface MusicPlayerDB extends DBSchema {
  songs: {
    key: number;
    value: Song;
    indexes: { 'by-title': string };
  };
}

class MusicDatabase {
  private db: IDBPDatabase<MusicPlayerDB> | null = null;

  async init() {
    this.db = await openDB<MusicPlayerDB>('music-player', 1, {
      upgrade(db) {
        const store = db.createObjectStore('songs', { 
          keyPath: 'id',
          autoIncrement: true 
        });
        store.createIndex('by-title', 'title');
      },
    });
  }

  async addSong(song: Omit<Song, 'id'>): Promise<number> {
    if (!this.db) await this.init();
    return await this.db!.add('songs', song as Song);
  }

  async getAllSongs(): Promise<Song[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('songs');
  }

  async getSong(id: number): Promise<Song | undefined> {
    if (!this.db) await this.init();
    return await this.db!.get('songs', id);
  }

  async deleteSong(id: number): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('songs', id);
  }
}

export const musicDB = new MusicDatabase();
