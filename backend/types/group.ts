export interface CreateGroupDTO {
  isPrivate?: boolean;
  topic?: string;
  levels: string[];
  languages: string[];
  maxPeople: number;
}
