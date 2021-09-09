import { Injectable } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Utility } from "../Model/utility";
import { GridDataResult } from "@progress/kendo-angular-grid";

@Injectable({
  providedIn: "root",
})
export class FileDetailsService {
  private clsUtility: Utility;
  serviceEndpointFile = environment.fileServiceUrl;
  serviceEndpointReport = environment.configBANQEDIServiceUrl;
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
    }),
  };
  public exportresponsedata: any = [];
  public exportresponsedataplb: any = [];
  constructor(private httpClient: HttpClient) {
    this.clsUtility = new Utility();
  }

  getMasterFileList(
    startdate,
    enddate,
    nclientid,
    page: number = 0,
    size: number = this.clsUtility.pagesize,
    searchtext: string = "null"
  ): Observable<any> {
    // console.log("getMasterFileList searchtext" + searchtext);

    if (searchtext != null && searchtext != "") {
      return this.httpClient
        .get<any>(
          this.serviceEndpointFile +
            "GetMasterEraFiles?" +
            "startdate=" +
            startdate +
            "&enddate=" +
            enddate +
            "&clientid=" +
            nclientid +
            "&searchtext=" +
            searchtext +
            "&page=" +
            page +
            "&size=" +
            size,
          this.httpOptions
        )
        .pipe(catchError(this.handleError));
    } else {
      return this.httpClient
        .get<any>(
          this.serviceEndpointFile +
            "GetMasterEraFiles?" +
            "startdate=" +
            startdate +
            "&enddate=" +
            enddate +
            "&clientid=" +
            nclientid +
            "&page=" +
            page +
            "&size=" +
            size,
          this.httpOptions
        )
        .pipe(catchError(this.handleError));
    }
  }

  getMasterFileList_v2(
    startdate,
    enddate,
    nclientid,
    page: number = 0,
    size: number = this.clsUtility.pagesize,
    searchby: string = "Filename",
    searchtext: string = "null",
    status: any
  ): Observable<any> {
    let para: {
      startdate: any;
      enddate: any;
      clientid: any;
      searchby: any;
      searchtext: any;
      status: any;
    } = {
      startdate: startdate,
      enddate: enddate,
      clientid: nclientid,
      searchby: searchby,
      searchtext: searchtext,
      status: status,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/GetMasterEraFiles?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getSplitFileList(
    neramasterfileid: any,
    ssubclientcode: any
  ): Observable<any> {
    return this.httpClient
      .get<any>(
        this.serviceEndpointFile +
          "GetEraSplitFiles/" +
          neramasterfileid +
          "/" +
          ssubclientcode,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getUnprocessedSplitFileList(
    page: number = 0,
    size: number = this.clsUtility.pagesize,
    searchtext: string = "null",
    nsubclientid: any,
    status: any,
    startdate: any = null,
    enddate: any = null,
    userid: any = ""
  ): Observable<any> {
    let para: {
      searchtext: string;
      nsubclientid: any;
      status: any;
      startdate: any;
      enddate: any;
      userid: any;
    } = {
      searchtext: searchtext,
      nsubclientid: nsubclientid,
      status: status,
      startdate: startdate,
      enddate: enddate,
      userid: userid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/GetUnprocessSplitFiles?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getSplitFileList_v2(
    neramasterfileid: any,
    page: number = 0,
    size: number = this.clsUtility.pagesize,
    searchby: string = "Filename",
    searchtext: string = "null",
    nsubclientid: any,
    status: any,
    divisioncode: any
  ): Observable<any> {
    let para: {
      nmastererafileid: any;
      searchby: string;
      searchtext: string;
      nsubclientid: any;
      status: any;
      divisioncode: any;
    } = {
      nmastererafileid: neramasterfileid,
      searchby: searchby,
      searchtext: searchtext,
      nsubclientid: nsubclientid,
      status: status,
      divisioncode: divisioncode,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/GetERASplitFiles?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getMaster835File(neramasterfileid: any): Observable<any> {
    let para: { nmastererafileid: any } = {
      nmastererafileid: neramasterfileid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Files/GetMaster835File/",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getSplit835File(nerafileid: any): Observable<any> {
    let para: { nerafileid: any } = {
      nerafileid: nerafileid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Files/GetSplit835File/",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getUnmatchedClaimsList(
    neramasterfileid: any,
    page: number = 0,
    size: number = this.clsUtility.pagesize,
    searchby: string = "Filename",
    searchtext: string = "null",
    startdate: any = null,
    enddate: any = null,
    sendeemailfilter: string = "All",
    nclientid: string = "0",
    probablepractice: boolean = false
  ): Observable<any> {
    let para: {
      nmastererafileid: any;
      searchby: string;
      searchtext: string;
      startdate: any;
      enddate: any;
      sendeemailfilter: string;
      clientid: string;
      bprobablepractice: boolean;
    } = {
      nmastererafileid: neramasterfileid,
      searchby: searchby,
      searchtext: searchtext,
      startdate: startdate,
      enddate: enddate,
      sendeemailfilter: sendeemailfilter,
      clientid: nclientid,
      bprobablepractice: probablepractice,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/getUnMatchedClaimDetials?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getUnmatchedPLBsList(
    neramasterfileid: any = 0,
    page: number = 0,
    size: number = this.clsUtility.pagesize,
    searchby: string = "Filename",
    searchtext: string = "null",
    startdate: any = null,
    enddate: any = null,
    sendeemailfilter: string = "All",
    nclientid: string = "0"
  ): Observable<any> {
    let para: {
      nmastererafileid: any;
      searchby: string;
      searchtext: string;
      startdate: any;
      enddate: any;
      sendeemailfilter: string;
      clientid: string;
    } = {
      nmastererafileid: neramasterfileid,
      searchby: searchby,
      searchtext: searchtext,
      startdate: startdate,
      enddate: enddate,
      sendeemailfilter: sendeemailfilter,
      clientid: nclientid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/getUnMatchedPLBDetials?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getFilesClaimDetails(
    neramasterfileid: any,
    page: number = 0,
    size: number = this.clsUtility.pagesize,
    searchby: string = "Claim",
    searchtext: string = "null"
  ): Observable<any> {
    let para: {
      nmastererafileid: any;
      searchby: string;
      searchtext: string;
    } = {
      nmastererafileid: neramasterfileid,
      searchby: searchby,
      searchtext: searchtext,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/GetFilesClaimDetails?page=" +
          page +
          "&size=" +
          size,
        para,
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

  getFileSummary(
    neramasterfileid: any,
    splitflag: any,
    pagesize: any,
    pagenumber: any,
    startdate: any,
    enddate: any,
    nclientid: any,
    searchby: string = "Filename",
    searchtext: string = "null",
    nsubclientid: any,
    status: any,
    userid: any,
    divisioncode: any
  ): Observable<any> {
    let para: {
      nmastererafileid: any;
      splitfileflag: any;
      dtstartdate: any;
      dtenddate: any;
      nclientid: any;
      searchby: any;
      searchtext: any;
      nsubclientid: any;
      status: any;
      userid: any;
      divisioncode: any;
    } = {
      nmastererafileid: neramasterfileid,
      splitfileflag: splitflag,
      dtstartdate: startdate,
      dtenddate: enddate,
      nclientid: nclientid,
      searchby: searchby,
      searchtext: searchtext,
      nsubclientid: nsubclientid,
      status: status,
      userid: "0",
      divisioncode: divisioncode,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Reports/getFileSummary?pagesize=" +
          pagesize +
          "&pagenumber=" +
          pagenumber,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getCheckSummary(
    neramasterfileid: any,
    nts835id: any,
    splitflag: boolean,
    nspliteid: any,
    pagesize: any,
    pagenumber: any,
    searchby: string = "Claim",
    searchtext: string = "null"
  ): Observable<any> {
    let para: {
      nmastererafileid: any;
      v_ts835id: any;
      splitfileflag: any;
      splitid: any;
      searchby: any;
      searchtext: any;
    } = {
      nmastererafileid: neramasterfileid,
      v_ts835id: nts835id,
      splitfileflag: splitflag,
      splitid: nspliteid,
      searchby: searchby,
      searchtext: searchtext,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Reports/getCheckSummary?pagesize=" +
          pagesize +
          "&pagenumber=" +
          pagenumber,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getPLBSummary(
    neramasterfileid: any,
    nts835id: any,
    splitflag: boolean,
    nspliteid: any,
    pagesize: any,
    pagenumber: any
  ): Observable<any> {
    let para: {
      nmastererafileid: any;
      v_ts835id: any;
      splitfileflag: any;
      splitid: any;
    } = {
      nmastererafileid: neramasterfileid,
      v_ts835id: nts835id,
      splitfileflag: splitflag,
      splitid: nspliteid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Reports/getPLBSummary?pagesize=" +
          pagesize +
          "&pagenumber=" +
          pagenumber,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getClaimSummary(
    neramasterfileid: any,
    nts835id: any,
    nclpid: any,
    splitflag: boolean,
    nspliteid: any,
    pagesize: any,
    pagenumber: any,
    searchtext: string = "null"
  ): Observable<any> {
    let para: {
      nmastererafileid: any;
      sts835id: any;
      sclpid: any;
      splitfileflag: any;
      splitid: any;
      searchtext: any;
    } = {
      nmastererafileid: neramasterfileid,
      sts835id: nts835id,
      sclpid: nclpid,
      splitfileflag: splitflag,
      splitid: nspliteid,
      searchtext: searchtext,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Reports/getClaimSummary?pagesize=" +
          pagesize +
          "&pagenumber=" +
          pagenumber,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getSVCLineSummary(
    neramasterfileid: any,
    nts835id: any,
    nclpid: any,
    nsvcid: any
  ): Observable<any> {
    let para: {
      nmastererafileid: any;
      sts835id: any;
      sclpid: any;
      ssvcid: any;
    } = {
      nmastererafileid: neramasterfileid,
      sts835id: nts835id,
      sclpid: nclpid,
      ssvcid: nsvcid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Reports/getLineSummary/",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getEOBReport(
    neramasterfileid: any,
    nts835id: any,
    nclpid: any,
    nsplitfileid: any
  ): Observable<any> {
    let para: {
      nmastererafileid: any;
      sts835id: any;
      sclpid: any;
      nsplitfileid: any;
    } = {
      nmastererafileid: neramasterfileid,
      sts835id: nts835id,
      sclpid: nclpid,
      nsplitfileid: nsplitfileid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Reports/getEOBReport/",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getclientusermappingbyuserid(userid: any): Observable<any> {
    let para: { userid: any } = {
      userid: userid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Reports/getclientusermappingbyuserid/",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  exportData(
    page: number = 0,
    size: number = 0,
    callingFrom: string = "",
    neramasterfileid: any,
    searchtext: string = "null",
    searchby: string = "null"
  ): Observable<GridDataResult> {
    var filterResponse: any;

    let para: {
      nmastererafileid: any;
      searchtext: string;
      searchby: string;
    } = {
      nmastererafileid: neramasterfileid,
      searchby: searchby,
      searchtext: searchtext,
    };

    filterResponse = this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/getUnMatchedClaimDetials?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(
        map(
          (response) =>
            <GridDataResult>{
              data: response["content"],
              total: parseInt(response["totalelements"], 10),
            }
        ),
        catchError(this.handleError)
      );

    return filterResponse;
  }

  SelectedexportData(
    page: number = 0,
    size: number = 0,
    callingFrom: string = "",
    neramasterfileid: any,
    searchtext: string = "null",
    searchby: string = "null",
    startdate: any = null,
    enddate: any = null,
    selectedarray: any[],
    removedarray: any[],
    selectedallflag: boolean,
    sendeemailfilter: string = "All",
    nclientid: string = "0",
    probablepractice: boolean = false
  ): Observable<GridDataResult> {
    var filterResponse: any;
    var filterdata: any;
    var selectedfilterdata: any[] = [];
    var totalcount: any;

    let para: {
      nmastererafileid: any;
      searchtext: string;
      searchby: string;
      startdate: any;
      enddate: any;
      sendeemailfilter: string;
      clientid: string;
      bprobablepractice: boolean;
    } = {
      nmastererafileid: neramasterfileid,
      searchby: searchby,
      searchtext: searchtext,
      startdate: startdate,
      enddate: enddate,
      sendeemailfilter: sendeemailfilter,
      clientid: nclientid,
      bprobablepractice: probablepractice,
    };

    filterResponse = this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/getUnMatchedClaimDetials?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(
        map((response) => {
          filterdata = response["content"];
          totalcount = parseInt(response["totalelements"], 10);
          if (selectedallflag == true) {
            this.exportresponsedata = filterdata;
            return <GridDataResult>{
              data: filterdata,
              total: totalcount,
            };
          } else if (selectedallflag == false) {
            if (removedarray.length > 0) {
              removedarray.forEach((obj) => {
                var item = filterdata.find((obj1) => obj1.clpid === obj);
                var index = filterdata.findIndex((obj1) => obj1.clpid === obj);
                if (item != null || item != undefined) {
                  filterdata.splice(index, 1);
                }
              });
              this.exportresponsedata = filterdata;
              selectedfilterdata = filterdata;

              return <GridDataResult>{
                data: selectedfilterdata,
                total: selectedfilterdata.length,
              };
            } else {
              selectedarray.forEach((obj) => {
                var item = filterdata.find((obj1) => obj1.clpid === obj);
                selectedfilterdata.push(item);
              });
              this.exportresponsedata = selectedfilterdata;

              return <GridDataResult>{
                data: selectedfilterdata,
                total: selectedarray.length,
              };
            }
          }
        }),
        catchError(this.handleError)
      );
    return filterResponse;
  }

  SelectedallunmatchedplbexportData(
    neramasterfileid: any = 0,
    page: number = 0,
    size: number = 0,
    callingFrom: string = "",
    searchtext: string = "null",
    searchby: string = "null",
    startdate: any = null,
    enddate: any = null,
    selectedarray: any[],
    removedarray: any[],
    selectedallflag: boolean,
    sendeemailfilter: string = "All",
    nclientid: string = "0"
  ): Observable<GridDataResult> {    
    var filterResponse: any;
    var filterdata: any;
    var selectedfilterdata: any[] = [];
    var totalcount: any;

    let para: {
      nmastererafileid: any;
      searchtext: string;
      searchby: string;
      startdate: any;
      enddate: any;
      sendeemailfilter: string;
      clientid: string;
    } = {
      nmastererafileid: neramasterfileid,
      searchby: searchby,
      searchtext: searchtext,
      startdate: startdate,
      enddate: enddate,
      sendeemailfilter: sendeemailfilter,
      clientid: nclientid,
    };

    filterResponse = this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/getUnMatchedPLBDetials?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(
        map((response) => {          
          filterdata = response["content"];
          totalcount = parseInt(response["totalelements"], 10);
          if (selectedallflag == true) {
            this.exportresponsedataplb = filterdata;
            return <GridDataResult>{
              data: filterdata,
              total: totalcount,
            };
          } else if (selectedallflag == false) {
            if (removedarray.length > 0) {
              removedarray.forEach((obj) => {
                var item = filterdata.find((obj1) => obj1.c042id === obj);
                var index = filterdata.findIndex((obj1) => obj1.c042id === obj);
                if (item != null || item != undefined) {
                  filterdata.splice(index, 1);
                }
              });
              this.exportresponsedataplb = filterdata;
              selectedfilterdata = filterdata;

              return <GridDataResult>{
                data: selectedfilterdata,
                total: selectedfilterdata.length,
              };
            } else {
              selectedarray.forEach((obj) => {
                var item = filterdata.find((obj1) => obj1.c042id === obj);
                selectedfilterdata.push(item);
              });
              this.exportresponsedataplb = selectedfilterdata;

              return <GridDataResult>{
                data: selectedfilterdata,
                total: selectedarray.length,
              };
            }
          }
        }),
        catchError(this.handleError)
      );
    return filterResponse;
  }

  ReprocessUnmatchedClaims(
    neramasterfileid: any,
    nclientid: any
  ): Observable<any> {
    let para: {
      mastererafileid: any;
      clientid: any;
    } = {
      mastererafileid: neramasterfileid,
      clientid: nclientid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Parser/UnMatchedReprocess/",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getDivisionalSplitFileList(
    userid: any,
    dtstartdate: any,
    dtenddate: any,
    page: number = 0,
    size: number = this.clsUtility.pagesize,
    searchby: string = "Filename",
    searchtext: string = "null",
    subclientid: any,
    clientid: string = "0",
    divisioncode: string = "All",
    datefilterby: string = ""
  ): Observable<any> {
    let para: {
      userid: any;
      startdate: any;
      enddate: any;
      searchby: any;
      searchtext: string;
      nsubclientid: number;
      sclientid: string;
      sdivisioncode: string;
      datefilterby: string;
    } = {
      userid: userid,
      startdate: dtstartdate,
      enddate: dtenddate,
      searchby: searchby,
      searchtext: searchtext,
      nsubclientid: subclientid,
      sclientid: clientid,
      sdivisioncode: divisioncode,
      datefilterby: datefilterby
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/GetAllSplitDivisionalFiles?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getAllSplitFileList(
    dtstartdate: any,
    dtenddate: any,
    searchtext: string,
    searchby: string,
    splitparametername: string,
    page: number = 0,
    size: number = this.clsUtility.pagesize
  ): Observable<any> {
    let para: {
      startdate: any;
      enddate: any;
      searchtext: string;
      searchby: string;
      splitparametername: string;
    } = {
      startdate: dtstartdate,
      enddate: dtenddate,
      searchtext: searchtext,
      searchby: searchby,
      splitparametername: splitparametername,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/GetAllClaimsData?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  UpdateSendEmailData(
    recordslist: any[],
    userid: string,
    username: string
  ): Observable<any> {
    let para: {
      recordslist: any[];
      userid: string;
      username: string;
    } = {
      recordslist: recordslist[0],
      userid: userid,
      username: username,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Files/UpdateSendEmailData",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  UpdatePLBSendEmailData(
    recordslist: any[],
    userid: string,
    username: string
  ): Observable<any> {
    let para: {
      recordslist: any[];
      userid: string;
      username: string;
    } = {
      recordslist: recordslist[0],
      userid: userid,
      username: username,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Files/UpdatePLBSendEmailData",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getReportFileSummary(
    neramasterfileid: any,
    pagesize: any,
    pagenumber: any
  ): Observable<any> {
    let para: {
      nmastererafileid: any;
    } = {
      nmastererafileid: neramasterfileid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Reports/getFileSummaryReport?pagesize=" +
          pagesize +
          "&pagenumber=" +
          pagenumber,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getMyFileList(
    userid: any,
    dtstartdate: any,
    dtenddate: any,
    page: number = 0,
    size: number = this.clsUtility.pagesize,
    searchby: string = "Filename",
    searchtext: string = "null",
    subclientid: any,
    clientid: string = "0",
    divisioncode: string = "All",
    downloadfilestatus: string = "All"
  ): Observable<any> {
    let para: {
      userid: any;
      startdate: any;
      enddate: any;
      searchby: any;
      searchtext: string;
      nsubclientid: number;
      nclientid: string;
      sdivisioncode: string;
      sdownloadfilestatus: string;
    } = {
      userid: userid,
      startdate: dtstartdate,
      enddate: dtenddate,
      searchby: searchby,
      searchtext: searchtext,
      nsubclientid: subclientid,
      nclientid: clientid,
      sdivisioncode: divisioncode,
      sdownloadfilestatus: downloadfilestatus,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/GetMyFiles?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  UpdateDownloadData(
    recordslist: any[],
    userid: string,
    username: string
  ): Observable<any> {
    let para: {
      recordslist: any[];
      userid: string;
      username: string;
    } = {
      recordslist: recordslist,
      userid: userid,
      username: username,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Files/DownloadFileDetails",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }
  getFileSummaryMaster(summaryinput: any): Observable<any> {
    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/getfilessummarymasterclaimdetails",
        summaryinput,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }
  getFileSummaryInfo(summaryinfoinput: any): Observable<any> {
    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Files/getfilessummaryclaimdetails",
        summaryinfoinput,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getBadgesUnmatchedClaimsCount(
    startdate: any = null,
    enddate: any = null,
    nclientid: string = "0"
  ): Observable<any> {
    let para: {
      startdate: any;
      enddate: any;
      clientid: string;
    } = {
      startdate: startdate,
      enddate: enddate,
      clientid: nclientid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Files/getBadgesUnMatchedClaimCount",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getBadgesUnprocessMasterCount(
    startdate: any = null,
    enddate: any = null,
    userid: string = "0"
  ): Observable<any> {
    let para: {
      startdate: any;
      enddate: any;
      userid: string;
    } = {
      startdate: startdate,
      enddate: enddate,
      userid: userid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Files/getBadgesUnProcessMasterCount",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getCheckEOBReport(   
    nsplitfileid: any,
    nerafileid: any
  ): Observable<any> {
    let para: {    
      nsplitfileid: any;
      nerafileid: any;
    } = {     
      nsplitfileid: nsplitfileid,
      nerafileid: nerafileid
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Reports/getCheckEOBReport/",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getmanuallyunmatchedclaims(
    clientid: any,
    subclientid: any,
    userid: any,
    mappeduserid: any,
    searchtext: any,
    startdate: any,
    enddate: any,
    searchby: any,
    page: number = 0,
    size: number = this.clsUtility.pagesize
  ): Observable<any> {
    let para: {
      clientid: any;
      subclientid: any;
      userid: any;
      mappeduserid: any;
      searchtext: any;
      startdate: any;
      enddate: any;
      searchby: any;
    } = {
      clientid: clientid,
      subclientid: subclientid,
      userid: userid,
      mappeduserid: mappeduserid,
      searchtext: searchtext,
      startdate: startdate,
      enddate: enddate,
      searchby: searchby,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/getManuallyMatchedClaimDetails?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getMappedUserList(userid: any, clietnid: any): Observable<any> {
    let para: {
      userid: any;
      clientid: any;
    } = {
      userid: userid,
      clientid: clietnid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Files/getMappedUserList",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  exporttoexceldata(
    funcationurl: string,
    para: any,
    size: number
  ): Observable<GridDataResult> {
    var filterResponse: any;

    filterResponse = this.httpClient
      .post<any>(
        this.serviceEndpointReport + funcationurl + "?page=0" + "&size=" + size,
        para,
        this.httpOptions
      )
      .pipe(
        map(
          (response) =>
            <GridDataResult>{
              data: response["content"],
              total: parseInt(response["totalelements"], 10),
            }
        ),
        catchError(this.handleError)
      );

    return filterResponse;
  }

  getmanuallymatchedclaimhistory(
    mastererafileid: any,
    ts835id: any,
    clpid: any   
  ): Observable<any> {    
    let para: {
      mastererafileid: any;
      ts835id: any;
      clpid: any;     
    } = {
      mastererafileid: mastererafileid,
      ts835id: ts835id,
      clpid: clpid      
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/getRematchClaimHistory",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getDuplicateCheckPaymentFiles(
    startdate,
    enddate,
    nclientid,
    userid,
    searchtext,
    searchby,
    page: number = 0,
    size: number = this.clsUtility.pagesize   
  ): Observable<any> {
    let para: {
      startdate: any;
      enddate: any;
      clientid: any;   
      userid: any;
      searchtext: any;
      searchby: any;
    } = {
      startdate: startdate,
      enddate: enddate,
      clientid: nclientid,  
      userid: userid,
      searchtext: searchtext,
      searchby: searchby
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/getDuplicateCheckPaymentFiles?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getBadgesHoldPayment(
    startdate: any = null,
    enddate: any = null,
    userid: string = "0"
  ): Observable<any> {
    let para: {
      startdate: any;
      enddate: any;
      userid: string;
    } = {
      startdate: startdate,
      enddate: enddate,
      userid: userid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Files/getBadgesHoldPayment",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getcheckhistory(
    clientid: any,
    checknumber: any       
  ): Observable<any> {    
    let para: {
      clientid: any;
      searchtext: any;          
    } = {
      clientid: clientid,
      searchtext: checknumber           
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/getDuplicateCheckPaymentHistory",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getMatchedtAnyPracticeToAnyClaimDataList(
    clientid: any,
    subclientid: any,   
    userid: string,
    dtstartdate: any,
    dtenddate: any,
    searchtext: string,
    searchby: string,   
    splitparametername: string,
    page: number = 0,
    size: number = this.clsUtility.pagesize
  ): Observable<any> {
    let para: {
      clientid: any;
      subclientid: any;
      userid: string;
      startdate: any;
      enddate: any;
      searchtext: string;
      searchby: string;  
      splitparametername: string;   
    } = {
      clientid: clientid,
      subclientid: subclientid,
      userid: userid,
      startdate: dtstartdate,
      enddate: dtenddate,
      searchtext: searchtext,
      searchby: searchby,
      splitparametername: splitparametername,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/MatchedtAnyPracticeToAnyClaimData?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getInprocessedSplitFileList(
    page: number = 0,
    size: number = this.clsUtility.pagesize,
    searchtext: string = "null",
    nsubclientid: any,
    status: any,
    startdate: any = null,
    enddate: any = null,
    userid: any = ""
  ): Observable<any> {
    let para: {
      searchtext: string;
      nsubclientid: any;
      status: any;
      startdate: any;
      enddate: any;
      userid: any;
    } = {
      searchtext: searchtext,
      nsubclientid: nsubclientid,
      status: status,
      startdate: startdate,
      enddate: enddate,
      userid: userid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/GetInprocessSplitFiles?page=" +
          page +
          "&size=" +
          size,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getBadgesInprocessMasterCount(
    startdate: any = null,
    enddate: any = null,
    userid: string = "0"
  ): Observable<any> {
    let para: {
      startdate: any;
      enddate: any;
      userid: string;
    } = {
      startdate: startdate,
      enddate: enddate,
      userid: userid,
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Files/getBadgesInProcessMasterCount",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  exporttoexcelfiledata(
    funcationurl: string,
    para: any,
    size: number
  ): Observable<GridDataResult> {        
    var filterResponse: any;

    filterResponse = this.httpClient
      .post<any>(
        this.serviceEndpointReport + funcationurl + "?pagesize=" + size + "&pagenumber=0" ,
        para,
        this.httpOptions
      )
      .pipe(
        map(
          (response) =>
            <GridDataResult>{
              data: response["content"],
              total: parseInt(response["totalelements"], 10),
            }
        ),
        catchError(this.handleError)
      );

    return filterResponse;
  }

  getFileDistributionReport(    
    startdate: any,
    enddate: any,
    nclientid: any,
    nstatus: any,
    searchtext: string = "null",
    pagesize: any,
    pagenumber: any
  ): Observable<any> {    
    let para: {            
      dtstartdate: any;   
      dtenddate: any;      
      nclientid: any; 
      nstatus: any;   
      searchtext: any;     
    } = {
      dtstartdate: startdate,   
      dtenddate: enddate,      
      nclientid: nclientid,  
      nstatus: nstatus,  
      searchtext: searchtext
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Reports/getFileDistributionReport?pagesize=" +
          pagesize +
          "&pagenumber=" +
          pagenumber,
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getFileDistributionCheckDetailsReport(    
    vfileid: any,
    vpayerid: string,
    vpayername: string,
    vpaymentmethodcode: string, 
    veftmonth: string,
    veftyear: string 
  ): Observable<any> {    
    let para: {      
      fileid: string;      
      payerid: string;     
      payername: string;
      paymentmethodcode: string;    
      eftmonth: string;
      eftyear: string; 
    } = {
      fileid: String(vfileid),      
      payerid: vpayerid,    
      payername: vpayername,
      paymentmethodcode: vpaymentmethodcode,
      eftmonth: veftmonth,
      eftyear: veftyear
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Reports/getFileDistributionCheckDetailsReport",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getFileDistributionPLBDetailsReport(    
    vfileid: any,
    vpayerid: string,
    vpayername: string,
    vpaymentmethodcode: string , 
    veftmonth: string,
    veftyear: string 
  ): Observable<any> {    
    let para: {      
      fileid: string;      
      payerid: string;   
      payername: string;
      paymentmethodcode: string;     
      eftmonth: string;
      eftyear: string;
    } = {
      fileid: String(vfileid),      
      payerid: vpayerid,  
      payername: vpayername,  
      paymentmethodcode: vpaymentmethodcode,
      eftmonth: veftmonth,
      eftyear: veftyear
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Reports/getFileDistributionPLBDetailsReport",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  DeleteMasterFile(
    nmastererafileid: any
  ): Observable<any> {
    let para: {
      nmastererafileid: any;
    } = {
      nmastererafileid: nmastererafileid
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/DeleteMasterFile",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  UpdateFileDistributionStatus(
    filedistributionid: any,
    nmastererafileid: any,
    nclientid: any,
    status: any
  ): Observable<any> {
    let para: {
      filedistributionid: any;
      nmastererafileid: any;
      nclientid: any;
      status: any;
    } = {
      filedistributionid: filedistributionid,
      nmastererafileid: nmastererafileid,
      nclientid: nclientid,
      status: status
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/UpdateFileDistributionStatus",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  InsertFileDistributionNotes(
    filedistributionid: any,
    nmastererafileid: any,
    scomment: string = "",
    nstatus: any = "",
    userid: any,
    username: any
  ): Observable<any> {
    let para: {
      filedistributionid: any;
      nmastererafileid: any;
      comment: string;
      status: any;
      userid: any;
      username: any;
    } = {
      filedistributionid: filedistributionid,
      nmastererafileid: nmastererafileid,
      comment: scomment,
      status: nstatus,
      userid: userid,
      username: username
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Files/InsertFileDistributionNotes",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  FileDistributionNotes(
    filedistributionid: any,
    nmastererafileid: any    
  ): Observable<any> {
    let para: {
      filedistributionid: any;
      nmastererafileid: any;      
    } = {
      filedistributionid: filedistributionid,
      nmastererafileid: nmastererafileid      
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport +
          "api/Reports/getFileDistributionNotes",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  InsertNotificationDetails(
    recordslist: any[]   
  ): Observable<any> {
    let para: {
      recordslist: any[];     
    } = {
      recordslist: recordslist
    };

    return this.httpClient
      .post<any>(
        this.serviceEndpointReport + "api/Files/InsertNotificationDetails",
        para,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }
}
