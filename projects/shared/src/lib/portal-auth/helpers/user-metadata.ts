import { Category } from './category';

export interface UserMetadata {
    favoriteReports: string[];
    allowedCategories: Category[];
}
