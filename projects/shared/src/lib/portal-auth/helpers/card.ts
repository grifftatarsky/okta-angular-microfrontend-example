import { Category } from './category';

export class Card {
    // @ts-ignore
    name: string;
    // @ts-ignore
    description?: string;
    // @ts-ignore
    keywords?: string;
    // @ts-ignore
    isPinned?: boolean;
    // @ts-ignore
    referenceName?: string;
    // @ts-ignore
    resourceId?: number;
    // @ts-ignore
    url?: string;
    // @ts-ignore
    isSelected?: boolean;
    // @ts-ignore
    category?: Category;
    // @ts-ignore
    cardStatus = true;
    // @ts-ignore
    cardNew: boolean;
}
