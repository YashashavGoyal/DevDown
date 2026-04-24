import type { Document, Folder, IStorageProvider } from './types';
import { LocalStorageProvider } from './LocalStorageProvider';
import { TauriFSProvider } from './TauriFSProvider';
import { GoogleDriveProvider } from './GoogleDriveProvider';

export class StorageManager {
  private provider: IStorageProvider;
  private isTauri: boolean;

  constructor() {
    this.isTauri = !!(window as any).__TAURI_INTERNALS__;
    this.provider = this.isTauri ? new TauriFSProvider() : new LocalStorageProvider();
  }

  async setProvider(type: 'local' | 'gdrive', token?: string) {
    if (type === 'gdrive' && token) {
      this.provider = new GoogleDriveProvider(token);
    } else {
      this.provider = this.isTauri ? new TauriFSProvider() : new LocalStorageProvider();
    }
  }

  get activeProviderName() {
    return this.provider.name;
  }

  async getDocuments() {
    return this.provider.getDocuments();
  }

  async getFolders() {
    return this.provider.getFolders();
  }

  async saveDocument(doc: Document) {
    return this.provider.saveDocument(doc);
  }

  async saveFolder(folder: Folder) {
    return this.provider.saveFolder(folder);
  }

  async deleteDocument(id: string) {
    return this.provider.deleteDocument(id);
  }

  async deleteFolder(id: string, recursive?: boolean) {
    return this.provider.deleteFolder(id, recursive);
  }

  // Sync from one provider to another
  async migrateData(from: IStorageProvider, to: IStorageProvider) {
    const docs = await from.getDocuments();
    const folders = await from.getFolders();

    for (const folder of folders) {
      await to.saveFolder(folder);
    }
    for (const doc of docs) {
      await to.saveDocument(doc);
    }
  }
}

export const storageManager = new StorageManager();
