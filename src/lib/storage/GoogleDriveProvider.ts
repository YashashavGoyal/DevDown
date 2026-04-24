import type { Document, Folder, IStorageProvider } from './types';

export class GoogleDriveProvider implements IStorageProvider {
  name = 'Google Drive';
  private accessToken: string | null = null;
  private folderId: string | null = null; // ID of 'DevDown' folder in Drive

  constructor(token: string) {
    this.accessToken = token;
  }

  private async fetchDrive(url: string, options: RequestInit = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Drive API Error');
    }
    return res.json();
  }

  async ensureDevDownFolder() {
    if (this.folderId) return;

    // Search for folder
    const q = encodeURIComponent("name = 'DevDown' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
    const data = await this.fetchDrive(`https://www.googleapis.com/drive/v3/files?q=${q}`);

    if (data.files.length > 0) {
      this.folderId = data.files[0].id;
    } else {
      // Create folder
      const res = await this.fetchDrive('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'DevDown',
          mimeType: 'application/vnd.google-apps.folder',
        }),
      });
      this.folderId = res.id;
    }
  }

  async getDocuments(): Promise<Document[]> {
    await this.ensureDevDownFolder();
    try {
      const q = encodeURIComponent(`name = 'docs.json' and '${this.folderId}' in parents and trashed = false`);
      const data = await this.fetchDrive(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`);
      if (data.files.length === 0) return [];

      const fileId = data.files[0].id;
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      return await res.json();
    } catch {
      return [];
    }
  }

  async getFolders(): Promise<Folder[]> {
    await this.ensureDevDownFolder();
    try {
      const q = encodeURIComponent(`name = 'folders.json' and '${this.folderId}' in parents and trashed = false`);
      const data = await this.fetchDrive(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`);
      if (data.files.length === 0) return [];

      const fileId = data.files[0].id;
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      return await res.json();
    } catch {
      return [];
    }
  }

  async saveDocument(doc: Document): Promise<void> {
    const docs = await this.getDocuments();
    const index = docs.findIndex(d => d.id === doc.id);
    if (index > -1) docs[index] = doc;
    else docs.unshift(doc);
    await this.uploadFile('docs.json', docs);
  }

  async saveFolder(folder: Folder): Promise<void> {
    const folders = await this.getFolders();
    const index = folders.findIndex(f => f.id === folder.id);
    if (index > -1) folders[index] = folder;
    else folders.push(folder);
    await this.uploadFile('folders.json', folders);
  }

  async deleteDocument(id: string): Promise<void> {
    const docs = await this.getDocuments();
    const filtered = docs.filter(d => d.id !== id);
    await this.uploadFile('docs.json', filtered);
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

    await this.uploadFile('folders.json', folders);
    await this.uploadFile('docs.json', docs);
  }

  private async uploadFile(name: string, data: any) {
    await this.ensureDevDownFolder();

    // Find existing file
    const q = encodeURIComponent(`name = '${name}' and '${this.folderId}' in parents and trashed = false`);
    const search = await this.fetchDrive(`https://www.googleapis.com/drive/v3/files?q=${q}`);

    const metadata = {
      name,
      parents: [this.folderId],
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }));

    if (search.files.length > 0) {
      // Update
      const fileId = search.files[0].id;
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${this.accessToken}` },
        body: formData,
      });
    } else {
      // Create
      await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.accessToken}` },
        body: formData,
      });
    }
  }
}
