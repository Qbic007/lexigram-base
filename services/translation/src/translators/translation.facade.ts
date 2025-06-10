import { Translator } from './translator.interface';
import { GoogleTranslator } from './google.translator';
import { MyMemoryTranslator } from './mymemory.translator';

export class TranslationFacade {
  private translators: Translator[] = [];
  private currentTranslatorIndex: number = 0;

  constructor() {
    // Добавляем переводчиков в порядке приоритета
    this.translators.push(new GoogleTranslator());
    this.translators.push(new MyMemoryTranslator());
  }

  async translate(word: string): Promise<string | null> {
    // Пробуем каждого переводчика по очереди
    for (let i = 0; i < this.translators.length; i++) {
      const translator = this.translators[i];
      console.log(`Попытка перевода через ${translator.getName()}`);
      
      const translation = await translator.translate(word);
      if (translation) {
        console.log(`Успешный перевод через ${translator.getName()}`);
        return translation;
      }
      
      console.log(`Перевод через ${translator.getName()} не удался`);
    }

    return null;
  }

  // Метод для добавления нового переводчика
  addTranslator(translator: Translator): void {
    this.translators.push(translator);
  }

  // Метод для получения списка доступных переводчиков
  getAvailableTranslators(): string[] {
    return this.translators.map(t => t.getName());
  }
} 