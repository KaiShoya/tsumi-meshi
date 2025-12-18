export interface Folder {
  id: number
  userId: number
  name: string
  parentId?: number
  children?: Folder[]
  createdAt: Date
  updatedAt: Date
}

export interface FolderInput {
  name: string
  parentId?: number
}

export interface FolderUpdate {
  name?: string
  parentId?: number
}

export interface FolderTree extends Folder {
  children: FolderTree[]
}
