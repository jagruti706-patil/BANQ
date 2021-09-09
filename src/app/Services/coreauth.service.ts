import { Injectable } from "@angular/core";
import { Utility } from "src/app/Model/utility";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { log } from "util";
import { GCPUser } from "../Model/login";
import { MailSend } from "../Pages/Configurations/emailconfiguration/clsemail";

@Injectable({
  providedIn: "root"
})
export class CoreauthService {
  authServiceEndpoint = environment.authServiceUrl;
  coreServiceEndPoint = environment.coreServiceUrl;
  baseServiceEndPoint = environment.baseServiceUrl;
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json"
    })
  };

  constructor(
    private httpClient: HttpClient,
    private dataService: DatatransaferService
  ) {}

  getUserFromAuthService(logindetails): Observable<any> {
    // console.log(
    //   "getUserFromAuthService coreservice : " + JSON.stringify(logindetails)
    // );

    return this.httpClient
      .post<any>(
        this.authServiceEndpoint + "signin",
        logindetails,
        this.httpOptions
      )
      .pipe(
        map(authuserdetails => {
          if (authuserdetails && authuserdetails.token) {
            localStorage.setItem("token", authuserdetails.token);
          }
          return authuserdetails;
        }),
        catchError(this.handleError)
      );
  }

  getAuthorizeUserForApp(uid): Observable<any> {
    // console.log("getAuthorizeUserForApp : " + uid);

    return this.httpClient
      .get<any>(
        // Banq applicationid
        this.authServiceEndpoint + "cicp/authorizeUserForApp/" + uid + "/1"

        // this.authServiceEndpoint + "cicp/authorizeUser/" + uid,
        // ,this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getUserPermission(userid: string): Observable<any> {
    return this.httpClient
      .get<any>(
        this.authServiceEndpoint +
          "users/applicationpermissions/" +
          userid +
          "/" +
          this.dataService.applicationCode
      )
      .pipe(catchError(this.handleError));
  }

  getAllUsers(applicationCode: any): Observable<GCPUser[]> {
    return this.httpClient
      .get<GCPUser[]>(
        this.authServiceEndpoint + "users/" + applicationCode + "/0"
      )
      .pipe(catchError(this.handleError));
  }

  getGroupList(): Observable<any> {
    // alert(this.serviceEndpoint + 'GetBanqRoleName/' + roleId);
    return this.httpClient
      .get(
        this.authServiceEndpoint +
          "groups?pagenumber=0&size=999999&sortby=groupname",
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getgroupwiseuser(groupid: any): Observable<any> {
    return this.httpClient
      .get<GCPUser[]>(
        this.authServiceEndpoint + "users/getUserByGroup/" + groupid
      )
      .pipe(catchError(this.handleError));
  }

  getIdleTimer(): Observable<any> {
    return this.httpClient
      .get(this.baseServiceEndPoint + "GetIdleTimer")
      .pipe(catchError(this.handleError));
  }

  // getAuthorizeUserForApp(uid) {
  //   return [
  //     {
  //       userid: 831,
  //       username: "Jagruti Patil",
  //       clientid: 310,
  //       useremail: "jagruti.patil@triarqhealth.com",
  //       roleid: 3,
  //       subclientcode: "310",
  //       rolename: "TRIARQ Admin"
  //     }
  //   ];
  // }

  // getUserPermission(userid: string) {
  //   return [
  //     {
  //       moduledescription: "TRIARQ Admin",
  //       permissiondescription: "TRIARQ Admin Access Granted",
  //       permissioncode: "1.1.P1"
  //     },
  //     {
  //       moduledescription: "TRIARQ RCM User",
  //       permissiondescription: "TRIARQ RCM User Access Granted",
  //       permissioncode: "1.2.P2"
  //     },
  //     {
  //       moduledescription: "Group Admin",
  //       permissiondescription: "Group Admin Access Granted",
  //       permissioncode: "1.3.P3"
  //     },
  //     {
  //       moduledescription: "Group User",
  //       permissiondescription: "Group User Access Granted",
  //       permissioncode: "1.4.P4"
  //     }
  //   ];
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

  getAllLocalGCPUser(): Observable<GCPUser[]> {
    return this.httpClient
      .get<GCPUser[]>(this.authServiceEndpoint + "users/1/0?")
      .pipe(catchError(this.handleError));
  }

  sendMailwithAttachment(
    emailconfiguration: MailSend,
    file: File
  ): Observable<any> {
    var objFormDate = new FormData();

    objFormDate.append("To", emailconfiguration.To);
    objFormDate.append("Cc", emailconfiguration.Cc);
    objFormDate.append("FromEmail", emailconfiguration.FromEmail);
    objFormDate.append("FromPassword", emailconfiguration.FromPassword);
    objFormDate.append("Body", emailconfiguration.Body);
    objFormDate.append("Subject", emailconfiguration.Subject);
    objFormDate.append("file", file);

    return this.httpClient
      .post<any>(this.authServiceEndpoint + "sendAttachmentMail", objFormDate)
      .pipe(catchError(this.handleError));
  }

  sendMail(emailconfiguration: MailSend): Observable<any> {
    var objFormDate = new FormData();

    objFormDate.append("To", emailconfiguration.To);
    objFormDate.append("Cc", emailconfiguration.Cc);
    objFormDate.append("FromEmail", emailconfiguration.FromEmail);
    objFormDate.append("FromPassword", emailconfiguration.FromPassword);
    objFormDate.append("Body", emailconfiguration.Body);
    objFormDate.append("Subject", emailconfiguration.Subject);

    return this.httpClient
      .post<any>(this.authServiceEndpoint + "sendAttachmentMail", objFormDate)
      .pipe(catchError(this.handleError));
  }

  sendMail1(emailconfiguration: MailSend): Observable<any> {
    var objFormDate = new FormData();

    objFormDate.append("To", emailconfiguration.To);
    objFormDate.append("Cc", emailconfiguration.Cc);
    objFormDate.append("FromEmail", emailconfiguration.FromEmail);
    objFormDate.append("FromPassword", emailconfiguration.FromPassword);
    objFormDate.append("Body", emailconfiguration.Body);
    objFormDate.append("Subject", emailconfiguration.Subject);

    return this.httpClient
      .post<any>(this.authServiceEndpoint + "sendAttachmentMail", objFormDate)
      .pipe(catchError(this.handleError1));
  }

  handleError1(error) {
    let errorMessage = "";
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    // window.alert(errorMessage);
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
