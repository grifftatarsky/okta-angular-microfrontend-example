import { Role } from './role';

export class Organization {
    constructor(
        public orgId?: number,
        public orgNumber?: string,
        public activeInd?: string,
        public department?: string,
        public dunsNumber?: string,
        public dunsNumber4?: string,
        public einNumber?: string,
        public emailAddress?: string,
        public entryDate?: Date,
        public entryUser?: string,
        public faxNumber?: string,
        public legalName?: string,
        public phoneNumber?: string,
        public updateDate?: Date,
        public updateUser?: string,
        public orgTypeId?: number,
        public orgType?: string,
        public wyoVendorOrgId?: number,
        public wyos?: String[],
        public roles?: Role[],
        public communityId?: string
    ) { }
}
