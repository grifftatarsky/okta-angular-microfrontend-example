import { Card } from './card';

export class Category {
    // @ts-ignore
    title: string;
    // @ts-ignore
    cards: Card[];
    color?: string;
    category?: Category;
    name?: string;

    public static getCards(categories: Category[]) {
        return categories.reduce<Card[]>((cards, category) => {
            return cards ? cards.concat(category.cards) : cards;
        }, []);
    }
}
