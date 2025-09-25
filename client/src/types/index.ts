export interface Group {
  id: number;
  topic: string;
  isPrivate: boolean,
  maxPeople: number,
  levels: Language[];
  languages: Level[];
  createdAt: string,
  updatedAt: string,
}

export interface Language {
  id: string,
  name: string,
  createdAt: string,
  updatedAt: string,
}

export interface Level {
  id: string,
  name: string
  createdAt: string;
  updatedAt: string
}