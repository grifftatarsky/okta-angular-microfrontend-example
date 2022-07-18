
export class Resource {
    constructor(
        public reportName?: string,
        public reportValue?: string,
        public reportTitle?: string,
        public typeName?: string,
        public reportParentName?: string,
        public displayOrder?: number,
        public reportDescription?: string,
        public childResourceDTOList?: Resource[],
        public children?: string[]
    ) {}
}
