import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/do";
import { Router } from "@angular/router";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/environments/environment";
import { CookieService } from "ngx-cookie-service";

@Injectable()
export class jwtInterceptor implements HttpInterceptor {
  private clsUtility: Utility;
  constructor(
    private route: Router,
    private toastr: ToastrService,
    private cookieService: CookieService
  ) {
    this.clsUtility = new Utility(toastr);
  }
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // console.log("in iterceptor");

    if (this.cookieService.get("AID")) {
      // const authToken = this.clsUtility.decryptobj(
      //   localStorage.getItem("token")
      // );
      // const authToken = localStorage.getItem("token");
      const authToken = this.cookieService.get("AID");
      // console.log(authToken);

      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }
    // request = request.clone({
    //   setHeaders: {
    //     Authorization: `Bearer ${this.auth.getToken()}`
    //   }
    // });
    // return next.handle(request);
    return next.handle(request).do(
      (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
        }
      },
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.clsUtility.showError("Token expired. Please login again.");
            localStorage.clear();
            this.cookieService.delete("UID");
            this.cookieService.delete("AID");
            // this.route.navigate(["login"]);
            window.location.assign(environment.ssoServiceLoginUrl);
          }
        }
      }
    );
  }
}
