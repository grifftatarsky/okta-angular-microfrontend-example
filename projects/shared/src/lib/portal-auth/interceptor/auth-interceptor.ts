import { Observable } from 'rxjs';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

export class AuthInterceptor implements HttpInterceptor {

    constructor(
    ) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const clonedRequest = request.clone({ headers: request.headers.set('Authorization', "Bearer "+sessionStorage["authToken"]) });
        return next.handle(clonedRequest);
    }

}
