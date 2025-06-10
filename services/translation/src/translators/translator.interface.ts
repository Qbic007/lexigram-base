export interface Translator {
  translate(word: string): Promise<string | null>;
  getName(): string;
} 