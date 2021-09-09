import { Injectable } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Client } from "../Model/client";
import { Subclient } from "src/app/Model/subclient";
import { environment } from "src/environments/environment";
import { Ftpmaster } from "../Model/ftpmaster";

@Injectable({
  providedIn: "root"
})
export class CoreoperationsService {
  // serviceEndpoint = 'https://services.myqone.com/BANQRegistrationService/Client/';
  serviceEndpoint = environment.coreServiceUrl;
  serviceEDITranslationEndpoint = environment.configBANQEDIServiceUrl;
  // 'http://dev53:9084/BANQRegistrationService/Client/';
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json"
    })
  };
  constructor(private httpClient: HttpClient) {}

  saveClientDetails(client): Observable<Client> {
    // const fieldName = 'clientjson';
    // const fieldValue = JSON.stringify(client);
    // const obj = {};
    // obj[fieldName] = fieldValue;
    return this.httpClient
      .post<Client>(
        this.serviceEndpoint + "ClientRegistration",
        client,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updateClientDetial(id: string, client): Observable<Client> {
    return this.httpClient
      .put<Client>(
        this.serviceEndpoint + "UpdateClient/" + id,
        client,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  updateClientStatus(id: string, client): Observable<Client> {
    // console.log('URL:', this.serviceEndpoint + 'UpdateClientStatus/' + id);

    return this.httpClient
      .put<Client>(
        this.serviceEndpoint + "UpdateClientStatus/" + id,
        client,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  // getServiceType(servicetype): Observable<Servicetype> {
  //   return this.httpClient.get<Servicetype>(this.serviceEndpoint + 'ServiceType', this.httpOptions);
  // }

  // getSplitParameter(splitparameter): Observable<SplitParameter[]> {
  //   return this.httpClient.get<SplitParameter[]>(this.serviceEndpoint + 'SplitParameter', this.httpOptions);
  //                                             //.map(res => res.json());
  // }

  getClientList(Status: number = 0): Observable<Client[]> {
    return this.httpClient
      .get<Client[]>(
        this.serviceEndpoint + "GetClientList/" + Status,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  deleteClientDetail(id: number) {
    // console.log('Delete: ' + this.serviceEndpoint + 'DeleteClient/' + id);
    return this.httpClient
      .delete(this.serviceEndpoint + "DeleteClient/" + id, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  getSubClientList() {
    return [
      // tslint:disable-next-line:max-line-length
      // { 'ClientID': 1, 'SubClientID': 1, 'ClientCode': 'CLT-1', 'SubClientCode': 'SCLT-1', 'SubclientName': 'Westland Clinic', 'ContactName': 'Timothy D. Guzman', 'ContactEmail': 'TimothyDGuzman@dayrep.com', 'ContactPhone': '909-553-3820', 'SplitParameter': 'Claim Prefix', 'Status': 'Active' },
      // tslint:disable-next-line:max-line-length
      // { 'ClientID': 1, 'SubClientID': 2, 'ClientCode': 'CLT-1', 'SubClientCode': 'SCLT-2', 'SubclientName': 'Triarq Clinic', 'ContactName': 'Ronald J. Martinez', 'ContactEmail': 'RonaldJMartinez@dayrep.com', 'ContactPhone': '909-553-3820', 'SplitParameter': 'Redering Provider', 'Status': 'Active' },
      // tslint:disable-next-line:max-line-length
    ];
  }

  // postFTPMaster(ftpmaster): Observable<Ftpmaster> {
  //   return this.httpClient.post<Ftpmaster>(this.ftpEndpoint + 'InsertFTP', ftpmaster, this.httpOptions);
  // }

  // getFTPMaster(id: number): Observable<Ftpmaster> {
  //   return this.httpClient.get<Ftpmaster>(this.ftpEndpoint + id, this.httpOptions);
  // }

  getClientDetailbyId(id: string): Observable<Client> {
    return this.httpClient
      .get<Client>(
        this.serviceEndpoint + "GetClientInformation/" + id,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getInboundFtpDetailbyClientId(id: string): Observable<Subclient[]> {
    return this.httpClient
      .get<Subclient[]>(
        this.serviceEndpoint + "InboundFTP/" + id,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getSubClientDetailbyClientId(id: string): Observable<Subclient[]> {
    return this.httpClient
      .get<Subclient[]>(
        this.serviceEndpoint + "GetSubClientList/" + id,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  CheckFtpExists(ftp): Observable<Ftpmaster> {
    return this.httpClient
      .post<Ftpmaster>(
        this.serviceEDITranslationEndpoint + "ClientInboundFTP/CheckConnection",
        ftp,
        this.httpOptions
      )
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
}
