import { z } from 'zod';
import a1 from './texts/a1.json';
import a2 from './texts/a2.json';
import b1 from './texts/b1.json';
import { textSchema, type Level, type ReadingText } from './schema';

export const TEXTS: ReadingText[] = z.array(textSchema).parse([...a1, ...a2, ...b1]);

export const textsByLevel = (level: Level) => TEXTS.filter((t) => t.level === level);
export const textById = (id: string) => TEXTS.find((t) => t.id === id);
