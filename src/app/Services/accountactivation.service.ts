import { Injectable } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Utility } from "../Model/utility";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class AccountactivationService {
  serviceEndpoint = environment.baseServiceUrl;
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json"
    })
  };
  constructor(private httpClient: HttpClient) {
    this.clsUtility = new Utility();
  }
  clsUtility: Utility;

  handleError(error) {
    let errorMessage = "";
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    var errMessage = `${error.message}`;

    if (errMessage.toString().search("ConnectionExist") < 0) {
      window.alert(errorMessage);
    }

    return throwError(errorMessage);
  }

  getSubClientAndClientIDs(externalid: any) {
    return this.httpClient
      .post<any>(
        this.serviceEndpoint + "/HubAccountVerification",
        externalid,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));

    // return this.httpClient
    // .post<any>(
    //   this.authServiceEndpoint + "signin",
    //   logindetails,
    //   this.httpOptions
    // )
    // .pipe(
    //   map(authuserdetails => {
    //     if (authuserdetails && authuserdetails.token) {
    //       localStorage.setItem("token", authuserdetails.token);
    //     }
    //     return authuserdetails;
    //   }),
    //   catchError(this.handleError)
    // );
  }
}
