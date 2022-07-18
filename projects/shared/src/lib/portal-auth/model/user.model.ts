import { Role } from '../helpers/role';
import { Resource } from '../helpers/resource';
import { Organization } from '../helpers/organization';
import { State } from '../helpers/state';

export class User {

    constructor(
        public id?: number,
        public login?: string,
        public email?: string,
        public organization?: Organization,
        public userName?: string,
        public firstName?: string,
        public lastName?: string,
        public imageUrl?: string,
        public activated?: boolean,
        public langKey?: string,
        public organizationName?: string,
        public organizationId?: number,
        public homePhoneNumber?: string,
        public workPhoneNumber?: string,
        public mobilePhoneNumber?: string,
        public createdBy?: string,
        public createdDate?: Date,
        public lastModifiedBy?: string,
        public lastModifiedDate?: Date,
        public groups?: string[],
        public resources?: Resource[],
        public roles?: Role[],
        public userStatus?: 'Active' | 'Inactive',
        public userType?: number,
        public vendorWyos?: Organization[],
        public state?: State,
        public communityId?: string
    ) {}
    populateUser(user: User): User {
        const u: User = new User();
        u.id = user.id;
        u.login = user.login;
        u.email = user.email;
        u.organization = user.organization;
        u.userName = user.userName;
        u.firstName = user.firstName;
        u.lastName = user.lastName;
        u.imageUrl = user.imageUrl;
        u.activated = user.activated;
        u.langKey = user.langKey;
        u.organizationName = user.organizationName;
        u.organizationId = user.organizationId;
        u.homePhoneNumber = user.homePhoneNumber;
        u.workPhoneNumber = user.workPhoneNumber;
        u.mobilePhoneNumber = user.mobilePhoneNumber;
        u.createdBy = user.createdBy;
        u.createdDate = user.createdDate;
        u.lastModifiedBy = user.lastModifiedBy;
        u.lastModifiedDate = user.lastModifiedDate;
        u.groups = user.groups;
        u.resources = user.resources;
        u.roles = user.roles;
        u.userStatus = user.userStatus;
        u.userType = user.userType;
        u.vendorWyos = user.vendorWyos;
        u.state = user.state;
        u.communityId = user.communityId;
        return u;
    }
}
