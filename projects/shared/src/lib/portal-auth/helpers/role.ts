import { Resource } from './resource';

export class Role {
    constructor(
        public id: number,
        public name: string,
        public resources?: Resource[],
        public appId?: number,
        public appName?: string
    ) {}
}
