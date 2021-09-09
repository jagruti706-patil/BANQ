import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Servicetype } from '../Model/servicetype';
import { Ftpmaster } from '../Model/ftpmaster';
import { SplitParameter } from '../Model/split-parameter';
import { catchError } from 'rxjs/operators';
import { Global } from '../Model/global';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class MasterdataService {
  serviceEndpoint = environment.coreServiceUrl;
  // 'http://dev53:9084/BANQRegistrationService/Client/';
  // serviceEndpoint = 'http://35.190.93.24/banq/Client/';
  // ftpEndpoint = 'http://dev53:9084/BANQRegistrationService/ClientFTP/';
  // serviceEndpoint = 'https://services.myqone.com/BANQRegistrationService/Client/';
  // ftpEndpoint = 'https://services.myqone.com/BANQRegistrationService/ClientFTP/';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  constructor(private httpClient: HttpClient) { }

  getServiceType(servicetype): Observable<Servicetype> {
    return this.httpClient.get<Servicetype>(this.serviceEndpoint + 'ServiceType', this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getSplitParameter(splitparameter): Observable<SplitParameter[]> {
    return this.httpClient.get<SplitParameter[]>(this.serviceEndpoint + 'SplitParameter', this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // postFTPMaster(ftpmaster): Observable<Ftpmaster> {
  //   return this.httpClient.post<Ftpmaster>(this.ftpEndpoint + 'InsertFTP', ftpmaster, this.httpOptions).pipe(
  //     catchError(this.handleError)
  //   );
  // }

  // getFTPMaster(id: number): Observable<Ftpmaster> {
  //   return this.httpClient.get<Ftpmaster>(this.ftpEndpoint + id, this.httpOptions).pipe(
  //     catchError(this.handleError)
  //   );
  // }

  getClientID() {
    return this.httpClient.get<number>(this.serviceEndpoint + 'GetClientId', this.httpOptions)
      .pipe(
      catchError(this.handleError)
      );
  }

  getRoleName(roleId: string): Observable<any> {
    // alert(this.serviceEndpoint + 'GetBanqRoleName/' + roleId);
    return this.httpClient.get(this.serviceEndpoint + 'GetBanqRoleName/' + roleId, this.httpOptions)
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
