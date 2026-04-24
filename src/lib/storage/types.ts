export interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  folderId: string | null;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface IStorageProvider {
  name: string;
  getDocuments(): Promise<Document[]>;
  getFolders(): Promise<Folder[]>;
  saveDocument(doc: Document): Promise<void>;
  saveFolder(folder: Folder): Promise<void>;
  deleteDocument(id: string): Promise<void>;
  deleteFolder(id: string, recursive?: boolean): Promise<void>;
  sync?(): Promise<void>;
}
