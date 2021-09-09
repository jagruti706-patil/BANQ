import { Injectable, Provider } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError, BehaviorSubject } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Utility } from "src/app/Model/utility";
import { Providers } from "../Model/Configuration/providers";

@Injectable({
  providedIn: "root"
})
export class AllConfigurationService {

  public toggleSidebar = new BehaviorSubject<boolean>(true);

  serviceEndpoint = environment.coreServiceUrl;
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json"
    })
  };
  constructor(private httpClient: HttpClient) {
    this.clsUtility = new Utility();
  }
  clsUtility: Utility;

  getProvidersID() {
    // return this.httpClient
    //   .get<number>(
    //     this.serviceEndpoint + "Client/GetClientId",
    //     this.httpOptions
    //   )
    //   .pipe(catchError(this.handleError));
    // var clskeys = new keys();
    // const clskey: keys[] = [];
    // clskeys.keyname = "";
    // clskeys.keyvalue = "";
    // clskey.push(clskeys);
    // var DetailMessage;
    // var Resultdata;
    // return this.httpClient
    //   .get<number>(
    //     this.serviceEndpoint + "Client/GetClientId",
    //     this.httpOptions
    //   )
    //   .pipe(
    //     map(data => {
    //       Resultdata = data;
    //       if (Resultdata != null || Resultdata != undefined) {
    //         DetailMessage = "Clientid created successfully";
    //       } else {
    //         DetailMessage = "Clientid not created";
    //       }
    //       this.SaveLogs(
    //         "INFO",
    //         "getClientID",
    //         "GET",
    //         "Get clientid",
    //         DetailMessage,
    //         clskey
    //       );
    //       return Resultdata;
    //     }),
    //     catchError(this.handleError)
    //   );
  }

  getProvidersById(
    id: any //: Observable<Provider[]>
  ) {
    // return this.httpClient
    // .get<number>(
    //   this.serviceEndpoint + "Client/GetClientId",
    //   this.httpOptions
    // )
    // .pipe(catchError(this.handleError));
    // var clskeys = new keys();
    // const clskey: keys[] = [];
    // clskeys.keyname = "clientid";
    // clskeys.keyvalue = id;
    // clskey.push(clskeys);
    // var DetailMessage;
    // var Resultdata;
    // return this.httpClient
    //   .get<Client[]>(this.serviceEndpoint + "Client/" + id, this.httpOptions)
    //   .pipe(
    //     map(data => {
    //       Resultdata = data;
    //       if (Resultdata != null || Resultdata != undefined) {
    //         DetailMessage = "Get all client details successfully";
    //       } else {
    //         DetailMessage = "Client details not retrived";
    //       }
    //       this.SaveLogs(
    //         "INFO",
    //         "getClientConfigurationById",
    //         "POST",
    //         "Get clientdetails",
    //         DetailMessage,
    //         clskey
    //       );
    //       return Resultdata;
    //     }),
    //     catchError(this.handleError)
    //   );
  }

  saveProviders(
    client //: Observable<Provider>
  ) {
    // return this.httpClient
    //   .post<Client>(
    //     this.serviceEndpoint + "Client/Save",
    //     client,
    //     this.httpOptions
    //   )
    //   .pipe(catchError(this.handleError));
    // var objclient = new Client();
    // objclient = JSON.parse(client);
    // var strclient =
    //   objclient.nclientid +
    //   "|" +
    //   objclient.clientcode +
    //   "|" +
    //   objclient.qlivedt +
    //   "|" +
    //   objclient.arstartdt +
    //   "|" +
    //   objclient.sclientname +
    //   "|" +
    //   objclient.address +
    //   "|" +
    //   objclient.sdatabasename +
    //   "|" +
    //   objclient.sausid +
    //   "|" +
    //   objclient.stin +
    //   "|" +
    //   objclient.snpi +
    //   "|" +
    //   objclient.nstatus +
    //   "|" +
    //   objclient.dtstatusdate +
    //   "|" +
    //   objclient.modifiedon;
    // var clskeys = new keys();
    // const clskey: keys[] = [];
    // clskeys.keyname = "client";
    // clskeys.keyvalue = strclient;
    // clskey.push(clskeys);
    // var DetailMessage;
    // var Resultdata;
    // return this.httpClient
    //   .post<Client>(
    //     this.serviceEndpoint + "Client/Save",
    //     client,
    //     this.httpOptions
    //   )
    //   .pipe(
    //     map(data => {
    //       Resultdata = data;
    //       if (Resultdata != null || Resultdata != undefined) {
    //         // DetailMessage = "Saved client details successfully";
    //         DetailMessage = this.LogMessage("Client", "saved", Resultdata);
    //       } else {
    //         DetailMessage = "Client details not saved";
    //       }
    //       this.SaveLogs(
    //         "INFO",
    //         "saveClientConfiguration",
    //         "POST",
    //         "Save clientdetails",
    //         DetailMessage,
    //         clskey
    //       );
    //       return Resultdata;
    //     }),
    //     catchError(this.handleError)
    //   );
  }

  updateProviders(
    id: number,
    client //: Observable<Client>
  ) {
    // return this.httpClient
    //   .put<Client>(
    //     this.serviceEndpoint + "Client/Update",
    //     client,
    //     this.httpOptions
    //   )
    //   .pipe(catchError(this.handleError));
    // var clskeys = new keys();
    // const clskey: keys[] = [];
    // clskeys.keyname = "id";
    // clskeys.keyvalue = "1";
    // clskey.push(clskeys);
    // clskeys = new keys();
    // clskeys.keyname = "client";
    // clskeys.keyvalue = "configuration";
    // clskey.push(clskeys);
    // console.log(clskey);
    // var objclient = new Client();
    // objclient = JSON.parse(client);
    // var strclient =
    //   objclient.nclientid +
    //   "|" +
    //   objclient.clientcode +
    //   "|" +
    //   objclient.qlivedt +
    //   "|" +
    //   objclient.arstartdt +
    //   "|" +
    //   objclient.sclientname +
    //   "|" +
    //   objclient.address +
    //   "|" +
    //   objclient.sdatabasename +
    //   "|" +
    //   objclient.sausid +
    //   "|" +
    //   objclient.stin +
    //   "|" +
    //   objclient.snpi +
    //   "|" +
    //   objclient.nstatus +
    //   "|" +
    //   objclient.dtstatusdate +
    //   "|" +
    //   objclient.modifiedon;
    // var clskeys = new keys();
    // const clskey: keys[] = [];
    // clskeys.keyname = "client";
    // clskeys.keyvalue = strclient;
    // clskey.push(clskeys);
    // var DetailMessage;
    // var Resultdata;
    // return this.httpClient
    //   .put<Client>(
    //     this.serviceEndpoint + "Client/Update",
    //     client,
    //     this.httpOptions
    //   )
    //   .pipe(
    //     map(data => {
    //       Resultdata = data;
    //       if (Resultdata != null || Resultdata != undefined) {
    //         // DetailMessage = "Update client details successfully";
    //         DetailMessage = this.LogMessage("Client", "updated", Resultdata);
    //       } else {
    //         DetailMessage = "Client details not updated";
    //       }
    //       this.SaveLogs(
    //         "INFO",
    //         "updateClientConfiguration",
    //         "PUT",
    //         "Update clientdetails",
    //         DetailMessage,
    //         clskey
    //       );
    //       return Resultdata;
    //     }),
    //     catchError(this.handleError)
    //   );
  }

  updateProvidersStatus(
    id: number,
    client //: Observable<Client>
  ) {
    // return this.httpClient
    //   .put<Client>(
    //     this.serviceEndpoint + "Client/UpdateStatus",
    //     client,
    //     this.httpOptions
    //   )
    //   .pipe(catchError(this.handleError));
    // console.log(client);
    // var objclient = new Client();
    // objclient = JSON.parse(client);
    // var strclient = objclient.nclientid + "|" + objclient.nstatus;
    // var clskeys = new keys();
    // const clskey: keys[] = [];
    // clskeys.keyname = "client";
    // clskeys.keyvalue = strclient;
    // clskey.push(clskeys);
    // var DetailMessage;
    // var Resultdata;
    // return this.httpClient
    //   .put<Client>(
    //     this.serviceEndpoint + "Client/UpdateStatus",
    //     client,
    //     this.httpOptions
    //   )
    //   .pipe(
    //     map(data => {
    //       Resultdata = data;
    //       if (Resultdata != null || Resultdata != undefined) {
    //         // DetailMessage = "Update client status successfully";
    //         DetailMessage = this.LogMessage(
    //           "Client status",
    //           "updated",
    //           Resultdata
    //         );
    //       } else {
    //         DetailMessage = "Client status not updated";
    //       }
    //       this.SaveLogs(
    //         "INFO",
    //         "updateClientStatus",
    //         "PUT",
    //         "Update clientstatus",
    //         DetailMessage,
    //         clskey
    //       );
    //       return Resultdata;
    //     }),
    //     catchError(this.handleError)
    //   );
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
    var errMessage = `${error.message}`;

    if (errMessage.toString().search("ConnectionExist") < 0) {
      window.alert(errorMessage);
    }

    return throwError(errorMessage);
  }
}
