import type { Document, Folder, IStorageProvider } from './types';
import { mkdir, writeFile, readFile, exists, BaseDirectory } from '@tauri-apps/plugin-fs';

export class TauriFSProvider implements IStorageProvider {
  name = 'Local File System';
  private ROOT_DIR = 'DevDownData';

  private async ensureRoot() {
    if (!(await exists(this.ROOT_DIR, { baseDir: BaseDirectory.AppData }))) {
      await mkdir(this.ROOT_DIR, { baseDir: BaseDirectory.AppData, recursive: true });
    }
  }

  async getDocuments(): Promise<Document[]> {
    await this.ensureRoot();
    try {
      const content = await readFile(`${this.ROOT_DIR}/docs.json`, { baseDir: BaseDirectory.AppData });
      return JSON.parse(new TextDecoder().decode(content));
    } catch {
      return [];
    }
  }

  async getFolders(): Promise<Folder[]> {
    await this.ensureRoot();
    try {
      const content = await readFile(`${this.ROOT_DIR}/folders.json`, { baseDir: BaseDirectory.AppData });
      return JSON.parse(new TextDecoder().decode(content));
    } catch {
      return [];
    }
  }

  async saveDocument(doc: Document): Promise<void> {
    const docs = await this.getDocuments();
    const index = docs.findIndex(d => d.id === doc.id);
    if (index > -1) docs[index] = doc;
    else docs.unshift(doc);
    await writeFile(`${this.ROOT_DIR}/docs.json`, new TextEncoder().encode(JSON.stringify(docs)), { baseDir: BaseDirectory.AppData });
  }

  async saveFolder(folder: Folder): Promise<void> {
    const folders = await this.getFolders();
    const index = folders.findIndex(f => f.id === folder.id);
    if (index > -1) folders[index] = folder;
    else folders.push(folder);
    await writeFile(`${this.ROOT_DIR}/folders.json`, new TextEncoder().encode(JSON.stringify(folders)), { baseDir: BaseDirectory.AppData });
  }

  async deleteDocument(id: string): Promise<void> {
    const docs = await this.getDocuments();
    const filtered = docs.filter(d => d.id !== id);
    await writeFile(`${this.ROOT_DIR}/docs.json`, new TextEncoder().encode(JSON.stringify(filtered)), { baseDir: BaseDirectory.AppData });
  }

  async deleteFolder(id: string, recursive = false): Promise<void> {
    let folders = await this.getFolders();
    let docs = await this.getDocuments();

    if (recursive) {
      const getChildFolderIds = (fid: string): string[] => {
        const children = folders.filter(f => f.parentId === fid);
        return [fid, ...children.flatMap(f => getChildFolderIds(f.id))];
      };
      const idsToDelete = getChildFolderIds(id);
      folders = folders.filter(f => !idsToDelete.includes(f.id));
      docs = docs.filter(d => !d.folderId || !idsToDelete.includes(d.folderId));
    } else {
      const folder = folders.find(f => f.id === id);
      const parentId = folder?.parentId || null;
      folders = folders.filter(f => f.id !== id).map(f => f.parentId === id ? { ...f, parentId } : f);
      docs = docs.map(d => d.folderId === id ? { ...d, folderId: parentId } : d);
    }

    await writeFile(`${this.ROOT_DIR}/folders.json`, new TextEncoder().encode(JSON.stringify(folders)), { baseDir: BaseDirectory.AppData });
    await writeFile(`${this.ROOT_DIR}/docs.json`, new TextEncoder().encode(JSON.stringify(docs)), { baseDir: BaseDirectory.AppData });
  }
}
