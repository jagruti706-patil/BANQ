import { DatatransaferService } from "src/app/Services/datatransafer.service";
import "rxjs/add/operator/map";
import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse
} from "@angular/common/http";
// import { Http, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/environments/environment";

@Injectable()
export class Api {
  token: any;
  baseEndpoint = environment.baseServiceUrl;
  serviceEndpoint = environment.coreServiceUrl;
  serviceEDITranslationEndpoint = environment.configBANQEDIServiceUrl;
  emailserviceEndpoint = environment.emailServiceUrl;
  qoredirectoryservice = environment.authServiceUrl
    .toString()
    .replace("/auth", "");
  qoreauditservice = environment.authServiceUrl.toString().replace("/auth", "");

  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json"
    })
  };
  functionnm: any;
  constructor(
    private datatransfer: DatatransaferService,
    // public http: Http,
    private httpClient: HttpClient,
    public router: Router,
    private toastr: ToastrService,
    private activetoute: ActivatedRoute
  ) {}
  getFunctionName(functionname: any) {
    this.functionnm = functionname;
  }
  // BindData(body: any, options?: RequestOptions) {
  //   // return this.http.post('http://dev54:5000/' + this.functionnm, body);  // python call
  //   return this.http.post(environment.RestService_url + this.functionnm, body); // python call
  // }
  get(endpoint: string) {
    // let params = new HttpParams();
    // for (let k in para) {
    //   params = params.append(k, para[k]);
    // }
    return this.httpClient
      .get<any[]>(this.serviceEndpoint + endpoint, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  qore_directory_get(endpoint: string) {
    return this.httpClient
      .get<any[]>(this.qoredirectoryservice + endpoint, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  post(endpoint: string, body: any) {
    return this.httpClient
      .post(this.serviceEndpoint + endpoint, body, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  put(endpoint: string, body: any) {
    return this.httpClient
      .put(this.serviceEndpoint + endpoint, body)
      .pipe(catchError(this.handleError));
  }

  delete(endpoint: string) {
    return this.httpClient
      .delete(this.serviceEndpoint + endpoint, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  core_get_call_b4tokenSet(endpoint: string) {
    return this.httpClient
      .get(this.serviceEndpoint + endpoint, { headers: new HttpHeaders() })
      .pipe(catchError(this.handleError));
  }

  get_edi(endpoint: string) {
    // let params = new HttpParams();
    // for (let k in para) {
    //   params = params.append(k, para[k]);
    // }
    return this.httpClient
      .get<any[]>(
        this.serviceEDITranslationEndpoint + endpoint,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  post_edi(endpoint: string, body: any) {
    return this.httpClient
      .post(
        this.serviceEDITranslationEndpoint + endpoint,
        body,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  put_edi(endpoint: string, body: any) {
    return this.httpClient
      .put(this.serviceEDITranslationEndpoint + endpoint, body)
      .pipe(catchError(this.handleError));
  }

  handleError(error) {
    let errorMessage = "";
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  get_email(endpoint: string) {
    return this.httpClient
      .get<any[]>(this.emailserviceEndpoint + endpoint, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  post_email(endpoint: string, body: any) {
    return this.httpClient
      .post<any[]>(this.emailserviceEndpoint + endpoint, body, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  put_email(endpoint: string, body: any) {
    return this.httpClient
      .put(this.emailserviceEndpoint + endpoint, body)
      .pipe(catchError(this.handleError));
  }

  post_base(endpoint: string, body: any) {
    return this.httpClient
      .post(this.baseEndpoint + endpoint, body, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  put_base(endpoint: string, body: any) {
    return this.httpClient
      .put(this.baseEndpoint + endpoint, body)
      .pipe(catchError(this.handleError));
  }

  delete_base(endpoint: string) {
    return this.httpClient
      .delete(this.baseEndpoint + endpoint, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   *
   * Inserts Log in GCP Activity Log
   * @param message  Messsage to Insert In Log
   * @param module  Specify Module Name
   * @param User Action must be LOGIN, LOGOUT, ADD, READ, UPDATE, DELETE, UPLOAD, DOWNLOAD, DEACTIVATE, ACTIVATE, PRINT,START,STOP
   * @param transactionid  (Optional)  Specify Code or ID. Default 123456789
   */
  insertActivityLog(
    message: string,
    module: string,
    useraction: string,
    transactionid: string = "0"
  ) {
    try {
      let strgcpUseremail: string = "";
      let strvisitor_ip: string = "";
      let strvisitor_browser: string = "";
      let strvisitor_continent: string = "";
      let strvisitor_country: string = "";
      let strvisitor_countryCode: string = "";
      let strvisitor_city: string = "";
      let strvisitor_region: string = "";
      let screen: string = this.router.url;
      let application = "HUB";

      if (this.router.url.length > 0) {
        screen = this.router.url
          .toString()
          .substr(1, this.router.url.toString().length);
      }

      this.datatransfer.gcpUseremail.subscribe(
        value => (strgcpUseremail = value)
      );
      this.datatransfer.visitor_ip.subscribe(value => (strvisitor_ip = value));
      this.datatransfer.visitor_browser.subscribe(
        value => (strvisitor_browser = value)
      );
      this.datatransfer.visitor_continent.subscribe(
        value => (strvisitor_continent = value)
      );
      this.datatransfer.visitor_country.subscribe(
        value => (strvisitor_country = value)
      );
      this.datatransfer.visitor_countryCode.subscribe(
        value => (strvisitor_countryCode = value)
      );
      this.datatransfer.visitor_city.subscribe(
        value => (strvisitor_city = value)
      );
      this.datatransfer.visitor_region.subscribe(
        value => (strvisitor_region = value)
      );

      this.httpClient
        .get(
          this.qoreauditservice +
            "audit/WriteAuditLog?" +
            "application=" +
            application +
            "&clientbrowser=" +
            strvisitor_browser +
            "&clientip=" +
            strvisitor_ip +
            "&city=" +
            strvisitor_city +
            "&continent=" +
            strvisitor_continent +
            "&country=" +
            strvisitor_country +
            "&countrycode=" +
            strvisitor_countryCode +
            "&region=" +
            strvisitor_region +
            "&loginuser=" +
            strgcpUseremail +
            "&message=" +
            message +
            "&module=" +
            module +
            "&screen=" +
            screen +
            "&transactionid=" +
            transactionid +
            "&useraction=" +
            useraction +
            ""
        )
        .subscribe(res => {
          try {

          } catch (ex) {
            // console.log("Error in Google Tag Manager");
            // console.log(ex);
          }
        });
    } catch (error) {
      // console.log("Error in Insertactivitylog");
      // console.log(error);
    }
  }

  insertActivityLogPostcall(
    message: string,
    module: string,
    useraction: string,
    transactionid: string = "0"
  ) {
    try {
      let strgcpUseremail: string = "";
      let strvisitor_ip: string = "";
      let strvisitor_browser: string = "";
      let strvisitor_continent: string = "";
      let strvisitor_country: string = "";
      let strvisitor_countryCode: string = "";
      let strvisitor_city: string = "";
      let strvisitor_region: string = "";
      let screen: string = this.router.url;
      let application = "HUB";

      if (this.router.url.length > 0) {
        screen = this.router.url
          .toString()
          .substr(1, this.router.url.toString().length);
      }

      this.datatransfer.gcpUseremail.subscribe(
        value => (strgcpUseremail = value)
      );
      this.datatransfer.visitor_ip.subscribe(value => (strvisitor_ip = value));
      this.datatransfer.visitor_browser.subscribe(
        value => (strvisitor_browser = value)
      );
      this.datatransfer.visitor_continent.subscribe(
        value => (strvisitor_continent = value)
      );
      this.datatransfer.visitor_country.subscribe(
        value => (strvisitor_country = value)
      );
      this.datatransfer.visitor_countryCode.subscribe(
        value => (strvisitor_countryCode = value)
      );
      this.datatransfer.visitor_city.subscribe(
        value => (strvisitor_city = value)
      );
      this.datatransfer.visitor_region.subscribe(
        value => (strvisitor_region = value)
      );
      let body = {};
      body["application"] = application;
      body["clientbrowser"] = strvisitor_browser;
      body["clientip"] = strvisitor_ip;
      body["city"] = strvisitor_city;
      body["continent"] = strvisitor_continent;
      body["country"] = strvisitor_country;
      body["countrycode"] = strvisitor_countryCode;
      body["region"] = strvisitor_region;
      body["loginuser"] = strgcpUseremail;
      body["message"] = message;
      body["module"] = module;
      body["screen"] = screen;
      body["transactionid"] = transactionid;
      body["useraction"] = useraction;

      this.httpClient
        .post(this.qoreauditservice + "audit/v1/WriteAuditLog", body)
        .subscribe(res => {
          try {

          } catch (ex) {
            // console.log("Error in Google Tag Manager");
            // console.log(ex);
          }
        });
    } catch (error) {
      // console.log("Error in Insertactivitylog");
      // console.log(error);
    }
  }
}
