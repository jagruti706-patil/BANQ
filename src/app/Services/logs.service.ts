import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  serviceEndpointFile = environment.logServiceUrl;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private httpClient: HttpClient) { }

  getLogs(LevelID: any, Appname: any): Observable<any> {
    return this.httpClient.get<any>(this.serviceEndpointFile + "GetLogs/" + LevelID + "/" + Appname, this.httpOptions)
      .pipe(
      catchError(this.handleError)
      );
  }

  getServiceName(): Observable<any> {
    return this.httpClient.get<any>(this.serviceEndpointFile + "AppName", this.httpOptions)
      .pipe(
      catchError(this.handleError)
      );
  }

  getLevelName(): Observable<any> {
    return this.httpClient.get<any>(this.serviceEndpointFile + "GetLogEntryType", this.httpOptions)
      .pipe(
      catchError(this.handleError)
      );
  }

  handleError(error) {
    let errorMessage = '';
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
