import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../model/user.model';
import { SessionStorageService } from 'ngx-webstorage';
import { Category } from '../helpers/category';
import { Card } from '../helpers/card';
import { UserMetadata } from '../helpers/user-metadata';
import { ConfigService } from './config.service';

import {
    WYO_ORG_TYPE, VENDOR_ORG_TYPE, FEMA_REGIONAL_ORG_TYPE, STATE_ORG_TYPE,
    SHMO_ORG_TYPE
} from '../constant/org.constants';

import { SUB_CATEGORY_RESOURCE_TYPE } from '../constant/resourcetype.constants';
import { Resource } from '../helpers/resource';

export interface Company {
    cmpyNumber:	string;
    cmpyName:	string;
}


@Injectable()
export class UserDataService {
    // @ts-ignore
    res$: Resource[];
    user$: User = new User;
    public data: any = [];
    // @ts-ignore
    public token: string;

    allowedResourceMap: Map<string, Resource> = new Map<string, Resource>();
    // @ts-ignore
    catalogMetadataMap: Map<string, Card>;

    constructor(private http: HttpClient, private storage: SessionStorageService, private configService: ConfigService) {
    }

    getCurrentUserNew(token: string): Observable<User> {
        const jwtBody = JSON.parse(window.atob(token.split('.')[1]));

        return this.http.get<Array<Resource>>(this.getPARTServiceURL() + 'api/account/').
        pipe(map((res) => {
            const user = new User();
            user.firstName = jwtBody.firstName;
            user.lastName = jwtBody.lastName;
            user.userName = jwtBody.sub;
            user.email = jwtBody.email;
            user.organizationId = jwtBody.orgId;
            user.organizationName = jwtBody.orgType;
            user.resources = this.generateChildren(res.slice());
            return user;
        }));
    }

    // remove when JWT changes happen on portal side
    parsePrivileges(jwtBody: any): Array<string> {
        // @ts-ignore
        let privileges = [];

        // @ts-ignore
        jwtBody.access.forEach((apps) => {
            // @ts-ignore
            apps.roles.forEach((role) => {
                // @ts-ignore
                privileges = privileges.concat(role.privileges);
            })
        });
        // @ts-ignore
        return privileges;
    }

    generateChildren(resources: Array<Resource>): Array<Resource> {
        resources.forEach((resource) => {
            // @ts-ignore
            resource.childResourceDTOList = this.findChildren(resource.reportName, resources);
        });

        return resources;
    }

    findChildren(resourceName: string, resources: Array<Resource>): Array<Resource> {
        // @ts-ignore
        const resourceChildren = [];

        resources.forEach((resource) => {
            if (resource.reportParentName === resourceName) {
                resourceChildren.push(resource);
            }
        });

        // @ts-ignore
        return resourceChildren;
    }

    getUserType(): number {
        const baseurl = location.origin;
        if (baseurl.includes('sso')) {
            return 1;
        } else {
            return 2;
        }
    }

    getRoles(): string {
        const currentUser: User = this.storage.retrieve('currentUser');
        if (!currentUser || !currentUser.roles) {
            return '';
        }
        // @ts-ignore
        const allroles = currentUser.roles.map((role) => {
            return role.name;
        });

        return allroles.join(",");
    }

    isVendorOrWyo(): boolean {
        const orgType: number = this.getOrgType();
        return orgType === VENDOR_ORG_TYPE || orgType === WYO_ORG_TYPE;
    }

    // @ts-ignore
    getOrgType(): number {

        const currentUser: User = this.storage.retrieve('currentUser');

        if (!currentUser || !currentUser.organization) {
            return 0;
        }

        // @ts-ignore
        return currentUser.organization.orgTypeId;
    }

    getWyoCompanies(): Company[] {
        const companyList: Company[] = [];
        const currentUser: User = this.storage.retrieve('currentUser');

        if (!currentUser || !currentUser.roles || !currentUser.organization) {
            return companyList;
        }

        if (currentUser.organization.orgTypeId === WYO_ORG_TYPE) {
            companyList.push({
                // @ts-ignore
                cmpyNumber: currentUser.organization.orgNumber,
                // @ts-ignore
                cmpyName: currentUser.organization.legalName.replace('&amp;', '&')
            });

            return companyList;
        }

        if (currentUser.organization.orgTypeId === VENDOR_ORG_TYPE) {
            if (!currentUser.vendorWyos) {
                return companyList;
            }

            // @ts-ignore
            currentUser.vendorWyos.forEach((vendorWyo) => {
                companyList.push({
                    // @ts-ignore
                    cmpyNumber: vendorWyo.orgNumber,
                    // @ts-ignore
                    cmpyName: vendorWyo.legalName.replace('&amp;', '&')
                });
            });

            companyList.sort(function(x, y) {
                const a = x.cmpyName.toUpperCase(),
                    b = y.cmpyName.toUpperCase();
                if (a > b) {
                    return 1;
                }
                if (a < b) {
                    return -1;
                }
                return 0;
            });

            return companyList;
        }

        return companyList;
    }

    getWyos(): string {
        const currentUser: User = this.storage.retrieve('currentUser');
        if (!currentUser || !currentUser.roles || !currentUser.organization) {
            return '';
        }
        if (currentUser.organization.orgTypeId === WYO_ORG_TYPE) {
            // @ts-ignore
            return currentUser.organization.orgNumber;
        }

        if (currentUser.organization.orgTypeId === VENDOR_ORG_TYPE) {
            // nop
        }

        return '';
    }

    getVendors(): string {
        const currentUser: User = this.storage.retrieve('currentUser');
        if (!currentUser || !currentUser.roles || !currentUser.organization) {
            return '';
        }
        if (currentUser.organization.orgTypeId === VENDOR_ORG_TYPE) {
            // @ts-ignore
            return currentUser.organization.orgNumber;
        }

        return '';
    }

    getStates(): string {
        const currentUser: User = this.storage.retrieve('currentUser');
        if (!currentUser || !currentUser.roles || !currentUser.organization) {
            return '';
        }
        if (currentUser.organization.orgTypeId === STATE_ORG_TYPE || currentUser.organization.orgTypeId === SHMO_ORG_TYPE) {
            // @ts-ignore
            return currentUser.organization.orgNumber;
        }
        return '';
    }

    getRegions(): string {
        const currentUser: User = this.storage.retrieve('currentUser');
        if (!currentUser || !currentUser.roles || !currentUser.organization || !currentUser.organization.orgTypeId) {
            return '';
        }
        /*
        organization.orgType will be 4 and the organization.orgNumber will be region name
        */
        if (currentUser.organization.orgTypeId === FEMA_REGIONAL_ORG_TYPE) {
            // @ts-ignore
            return currentUser.organization.orgNumber;
        }
        return '';
    }

    populateCategories(user: User): Category[] {
        // @ts-ignore
        const resources: Resource[] = user.resources;

        this.allowedResourceMap.clear();
        const catA: Category[] = [];

        let description: string;
        let split: any;
        const filterparams = '';
        let url = '';
        let children: string[] = [];

        resources.forEach((resource) => {
            if (resource.typeName === SUB_CATEGORY_RESOURCE_TYPE) {
                const category = new Category();
                category.color = '#4773aa';
                // @ts-ignore
                category.title = resource.reportTitle;
                category.cards = [];
                // @ts-ignore
                resource.childResourceDTOList.forEach((childResource) => {
                    const card = new Card();
                    // @ts-ignore
                    card.name = childResource.reportTitle;

                    // @ts-ignore
                    if (childResource.reportValue.includes('|')) {
                        // @ts-ignore
                        split = childResource.reportValue.split('|');
                        card.url = split[0];
                    } else {
                        card.url = childResource.reportValue;
                    }

                    category.cards.push(card);

                    // @ts-ignore
                    description = childResource.reportDescription;
                    if (description) {
                        if (description.includes('|')) {
                            split = description.split('|');
                            description = split[-1]
                        }
                    }
                    const currentResource = new Resource();
                    currentResource.reportName = childResource.reportName;
                    // @ts-ignore
                    if (childResource.reportValue.includes('../part/#/')) {
                        // @ts-ignore
                        currentResource.reportValue = childResource.reportValue.substring(10);
                    } else {
                        currentResource.reportValue = childResource.reportValue;
                    }
                    // @ts-ignore
                    url = currentResource.reportValue;
                    children = [];

                    if (url) {
                        if (url.includes('|')) {
                            split = url.split('|');
                            currentResource.reportValue = split[0];

                            currentResource.children = [];
                            for (let i = 1; i < split.length; i++) {
                                // add the allowed children
                                children.push(split[i]);
                                currentResource.children.push(split[i]);
                            }
                        }

                        // @ts-ignore
                        this.allowedResourceMap.set(currentResource.reportValue, currentResource);
                        if (children && children.length > 0) {
                            children.forEach((_child) => {
                                this.allowedResourceMap.set(_child, currentResource);
                            });
                        }
                    } else {
                        // @ts-ignore
                        this.allowedResourceMap.set(currentResource.reportValue, currentResource);
                    }

                    // add card reference
                    card.referenceName = currentResource.reportValue;
                });

                catA.push(category);
            }
        });

        return catA;
    }

    buildResourceWithChildren(resource: Resource): Resource {
        const currentResource = new Resource();
        currentResource.reportName = resource.reportName;
        const url = resource.reportValue;

        if (url && url.includes('|')) {
            currentResource.children = url.split('|');
            currentResource.reportValue = currentResource.children[0];
        }

        return currentResource;
    }

    isAllowedResources(resourceName: string) {
        const allowedResource = this.allowedResourceMap.get(resourceName);
        let resourceInSession = null;
        if (allowedResource) {
            // @ts-ignore
            sessionStorage.removeItem(sessionStorage.getItem('pReport'));
            sessionStorage.setItem(resourceName, JSON.stringify(allowedResource));
            sessionStorage.setItem('pReport', resourceName);
        } else {
            resourceInSession = sessionStorage.getItem(resourceName);
        }

        const isAllowed = allowedResource || resourceInSession;

        if (isAllowed && this.catalogMetadataMap?.get(resourceName)) {
            // @ts-ignore
            return this.catalogMetadataMap.get(resourceName).cardStatus;
        } else if (isAllowed) {
            return true;
        }

        return false;
    }

    authenticateUser(uname: string, pwd: string): Observable<string> {
        const model = {
            'pswd': pwd,
            'username': uname
        };
        let head = new HttpHeaders();
        head = head.set('Content-Type', 'application/json');
        const options = {
            headers: head
        };

        return this.http.post<any>(`${this.configService.PAM_API}api/v1/authenticate`, model, options).
        pipe(map((res) => {
            this.token = res.id_token;
            return res.id_token;
        }));
    }


    getPARTServiceURL() {
        return this.configService.MICROFICHE_API;
    }

    public getPARTUserMetadata(userCategories: Category[]): Observable<UserMetadata> {
        return this.http.get<UserMetadata>(`${this.getPARTServiceURL()}api/user-favorite-reports`);
    }

    public savePARTUserFavorites(reportNames: string[]): Observable<any> {
        return this.http.post<any>(`${this.getPARTServiceURL()}api/user-favorite-reports`, reportNames);
    }

    public populateCatalogMetadata(catalogMetadata: Map<string, Card>) {
        this.catalogMetadataMap = catalogMetadata;
    }
}
