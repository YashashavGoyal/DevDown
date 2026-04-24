import type { Document, Folder, IStorageProvider } from './types';

export class LocalStorageProvider implements IStorageProvider {
  name = 'Local Storage';
  private DOCS_KEY = 'devdown_docs';
  private FOLDERS_KEY = 'devdown_folders';

  async getDocuments(): Promise<Document[]> {
    const saved = localStorage.getItem(this.DOCS_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  async getFolders(): Promise<Folder[]> {
    const saved = localStorage.getItem(this.FOLDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  async saveDocument(doc: Document): Promise<void> {
    const docs = await this.getDocuments();
    const index = docs.findIndex(d => d.id === doc.id);
    if (index > -1) docs[index] = doc;
    else docs.unshift(doc);
    localStorage.setItem(this.DOCS_KEY, JSON.stringify(docs));
  }

  async saveFolder(folder: Folder): Promise<void> {
    const folders = await this.getFolders();
    const index = folders.findIndex(f => f.id === folder.id);
    if (index > -1) folders[index] = folder;
    else folders.push(folder);
    localStorage.setItem(this.FOLDERS_KEY, JSON.stringify(folders));
  }

  async deleteDocument(id: string): Promise<void> {
    const docs = await this.getDocuments();
    const filtered = docs.filter(d => d.id !== id);
    localStorage.setItem(this.DOCS_KEY, JSON.stringify(filtered));
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

    localStorage.setItem(this.FOLDERS_KEY, JSON.stringify(folders));
    localStorage.setItem(this.DOCS_KEY, JSON.stringify(docs));
  }
}
