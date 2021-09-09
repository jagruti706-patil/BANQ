import { Injectable } from "@angular/core";
import { HttpHeaders, HttpResponse } from "@angular/common/http";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root"
})
export class ConfigurationService {
  // Q853ParserServiceEndpoint = environment.configParserServiceUrl;
  // Q853RivenServiceEndpoint = environment.configRivenServiceUrl;
  QBANEDIServiceEndpoint = environment.configBANQEDIServiceUrl;
  // 'http://dev08:9090/Q835Parser-0.1.0/BANKQParserScheduler/';
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json"
      //  responseType: 'text' as 'json'
    })
  };

  constructor(private httpClient: HttpClient) {}
  getQBANQEdiServiceStatus() {
    return this.httpClient
      .get<number>(
        this.QBANEDIServiceEndpoint + "BanqEDIScheduler/Status ",
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  postBANQEdiServiceStatus(value: number) {
    return this.httpClient
      .post(
        this.QBANEDIServiceEndpoint +
          "BanqEDIScheduler/StartScheduler/" +
          value,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getQBANQEdiValidateFileStatus() {
    return this.httpClient
      .get<number>(
        this.QBANEDIServiceEndpoint + "EraFileValidate/Status ",
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  postBANQEdiValidateFileStatus(body: any) {
    return this.httpClient
      .post(
        this.QBANEDIServiceEndpoint + "EraFileValidate/ChangeStatus",
        body,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  GetTimeInterval() {
    return this.httpClient
      .post(
        this.QBANEDIServiceEndpoint +
          "BanqEDIScheduler/GetTimeInterval",          
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  SetTimeInterval(vartimeinterval: number) {
    let para: {timeinterval: number } = {timeinterval: vartimeinterval}
    return this.httpClient
      .post(
        this.QBANEDIServiceEndpoint +
          "BanqEDIScheduler/SetTimeInterval",
        para,          
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // getQ853ParserServiceStatus() {
  //   return this.httpClient.get<number>(this.Q853ParserServiceEndpoint + 'Status', this.httpOptions)
  //     .pipe(
  //     catchError(this.handleError)
  //     );
  // }

  // postQ853ParserServiceStatus(value: number) {
  //   return this.httpClient.post(this.Q853ParserServiceEndpoint + 'StartScheduler/' + value, this.httpOptions)
  //     .pipe(
  //     catchError(this.handleError)
  //     );
  // }

  // getQ853RivenServiceStatus() {
  //   return this.httpClient.get<number>(this.Q853RivenServiceEndpoint + 'Status', this.httpOptions)
  //     .pipe(
  //     catchError(this.handleError)
  //     );
  // }

  // postQ853RivenServiceStatus(value: number) {
  //   return this.httpClient.post(this.Q853RivenServiceEndpoint + 'StartScheduler/' + value, this.httpOptions)
  //     .pipe(
  //     catchError(this.handleError)
  //     );
  // }

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
}
