import { Component, OnInit, OnDestroy } from "@angular/core";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { SubSink } from "../../../../node_modules/subsink";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { Router, ActivatedRoute } from "@angular/router";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { BreadcrumbService } from "src/app/Services/breadcrumb.service";
import { THRESHOLD_DIFF } from "@progress/kendo-angular-popup/dist/es2015/services/scrollable.service";
import { FormBuilder, Validators } from "@angular/forms";
import { Api } from "src/app/Services/api";
import { Client } from "src/app/Model/client";
import { Subclient } from "src/app/Model/subclient";
import { isNullOrUndefined, isNull } from "util";
import { SearchfiltersService } from "src/app/Services/searchfilters.service";
import { clsPermission } from "./../../Services/settings/clspermission";
import { parseNumber } from "@progress/kendo-angular-intl";
declare var $: any;
import { Workbook } from "@progress/kendo-angular-excel-export";
import { Observable } from "rxjs";

@Component({
  selector: "app-filesummary",
  templateUrl: "./filesummary.component.html",
  styleUrls: ["./filesummary.component.css"],
})
export class FilesummaryComponent implements OnInit, OnDestroy {
  public clsUtility: Utility;
  public subscription = new SubSink();
  public GridView: GridDataResult;
  public MasterFilesGridView: GridDataResult;
  public SplitFilesGridView: GridDataResult;
  public MasterFilesItems: any[] = [];
  public MasterFilesResponse: any[] = [];
  public SplitFilesItems: any[] = [];
  public SplitFilesResponse: any[] = [];
  public MasterFilesdisplaytotalrecordscount: number = 0;
  public SplitFilesdisplaytotalrecordscount: number = 0;
  public MasterFilesSkip = 0;
  public MasterFilespagesize: number = 0;
  public SplitFilesSkip = 0;
  public SplitFilespagesize: number = 0;
  public sortMaster: SortDescriptor[] = [
    {
      field: "fileimportdate",
      dir: "desc",
    },
  ];

  public splitesortMaster: SortDescriptor[] = [
    {
      field: "splitfileimportdate",
      dir: "desc",
    },
  ];

  neraMasterFileid: any = "0";
  nerasplitfileid: any = "0";
  public nSelectedClientID: string = "0";
  public sAllClients: any;
  public SelectAllClients: any;
  public sSubClients: any;
  public SelectAllSubClients: any;
  public selectedClientValue: string = "0";
  public sMasterStatus: any = [
    { value: "3", text: "All" },
    { value: "0", text: "Inprocess" },
    { value: "1", text: "Process" },
    { value: "2", text: "Unprocess" },
  ];
  public sSplitStatus: any = [
    { value: "3", text: "All" },
    { value: "0", text: "Inprocess" },
    { value: "1", text: "Process" },
    { value: "2", text: "Unprocess" },
  ];
  public selectedMasterStatusValue: string = "3";
  public selectedSplitStatusValue: string = "3";
  public startDate: Date = new Date();
  public endDate: Date = new Date();
  public sSelectedSubClientCode: string = "0";
  public sSelectedMasterStatus: string = "3";
  public sSelectedSplitStatus: string = "3";
  public loadingMasterFilesGrid: boolean = false;
  public loadingSplitFilesGrid: boolean = false;
  public sSearchText: string = "";
  public sSplitSearchText: string = "";
  public currentuserid: string = "0";
  public disabledclient: boolean = false;
  public disabledstatus: boolean = false;
  public disabledstartdate: boolean = false;
  public disabledenddate: boolean = false;
  public disabledsearch: boolean = false;
  public disabledsubclient: boolean = false;
  public disabledsplitstatus: boolean = false;
  public disabledsplitsearch: boolean = false;
  public disabledsearchBy: boolean = false;
  public disabledsplitsearchBy: boolean = false;
  public disableddivision: boolean = false;
  public disabledapplybtn: boolean = false;
  public disabledclearbtn: boolean = false;
  public sSplitDivisionCode: string = "All";
  public SelectAllDivision: any;
  public sAllDivision: any;

  public sMasterSearchBy: any = [
    { value: "Filename", text: "Filename" },
    { value: "Claim", text: "Claim" },
    { value: "Check", text: "Check" },
    { value: "Payer name", text: "Payer name" },
    { value: "Payerid", text: "Payerid" },
    { value: "Patient firstname", text: "Patient firstname" },
    { value: "Patient lastname", text: "Patient lastname" },
    {
      value: "Rendering provider firstname",
      text: "Rendering provider firstname",
    },
    {
      value: "Rendering provider lastname",
      text: "Rendering provider lastname",
    },
    { value: "Rendering provider npi", text: "Rendering provider npi" },
  ];
  public sSelectedMasterSearchBy: string = "Filename";

  public sSplitSearchBy: any = [
    { value: "Filename", text: "Filename" },
    { value: "Claim", text: "Claim" },
    { value: "Check", text: "Check" },
    { value: "Payer name", text: "Payer name" },
    { value: "Payerid", text: "Payerid" },
    { value: "Patient firstname", text: "Patient firstname" },
    { value: "Patient lastname", text: "Patient lastname" },
    {
      value: "Rendering provider firstname",
      text: "Rendering provider firstname",
    },
    {
      value: "Rendering provider lastname",
      text: "Rendering provider lastname",
    },
    { value: "Rendering provider npi", text: "Rendering provider npi" },
  ];
  public sSelectedSplitSearchBy: string = "Filename";
  public clsPermission: clsPermission;
  private bOninit = false;
  public emailloading = false;
  public MasterFileExportExcelDownloadConfirmationMessage: any;
  public SplitFileExportExcelDownloadConfirmationMessage: any;
  public MasterexportFilename: string =
  "MasterFilesList_" + this.datePipe.transform(new Date(), "MMddyyyy");
  public SplitexportFilename: string =
  "SplitFilesList_" + this.datePipe.transform(new Date(), "MMddyyyy");

  DropDownGroup = this.fb.group({
    fcClientName: ["", Validators.required],
    fcSubClientName: ["", Validators.required],
    fcMasterStatus: ["", Validators.required],
    fcMasterSearchBy: [""],
    fcSearch: [""],
    fcSplitStatus: [""],
    fcSplitSearch: [""],
    fcSplitSearchBy: [""],
    fcDivision: ["", Validators.required],
  });

  get ClientName() {
    return this.DropDownGroup.get("fcClientName");
  }

  get SubClientName() {
    return this.DropDownGroup.get("fcSubClientName");
  }

  get MasterStatus() {
    return this.DropDownGroup.get("fcMasterStatus");
  }

  get MasterSearchBy() {
    return this.DropDownGroup.get("fcMasterSearchBy");
  }

  get fbcFilterSearch() {
    return this.DropDownGroup.get("fcSearch");
  }

  get SplitStatus() {
    return this.DropDownGroup.get("fcSplitStatus");
  }

  get SplitSearchBy() {
    return this.DropDownGroup.get("fcSplitSearchBy");
  }

  get fbcSplitFilterSearch() {
    return this.DropDownGroup.get("fcSplitSearch");
  }

  get Division() {
    return this.DropDownGroup.get("fcDivision");
  }

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private filedetailService: FileDetailsService,
    private router: Router,
    public dataService: DatatransaferService,
    private breadcrumbsvr: BreadcrumbService,
    private _routeParams: ActivatedRoute,
    public api: Api,
    public searchfiltersvr: SearchfiltersService
  ) {
    this.clsUtility = new Utility(toastr);
    this.MasterFilespagesize = this.clsUtility.pagesize;
    this.SplitFilespagesize = this.clsUtility.pagesize;
  }

  ngOnInit() {
    try {
      this.bOninit = true;
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );

      this.currentuserid = this.dataService.SelectedUserid;
      this.startDate.setDate(this.startDate.getDate() - 1);
      this._routeParams.params.subscribe((params) => {
        if (params["text"] != "split") {
          if (this.searchfiltersvr.filedatafilter == true) {
            this.nSelectedClientID = this.searchfiltersvr.getfiledataSelectedClientID();
            let sdate = new Date(this.searchfiltersvr.getfiledatastartDate());
            this.startDate = sdate;
            let edate = new Date(this.searchfiltersvr.getfiledataendDate());
            this.endDate = edate;
            this.selectedMasterStatusValue = this.searchfiltersvr.getfiledataselectedStatus();
            this.sSelectedMasterStatus = this.searchfiltersvr.getfiledataselectedStatus();
            this.sSelectedMasterSearchBy = this.searchfiltersvr.getfiledataselectedSearchby();
            this.sSearchText = this.searchfiltersvr.getfiledatasSearchText();
            this.fbcFilterSearch.setValue(this.sSearchText);
          }
          this.Enabledisablebtn(true);
          this.RetriveAllClient();
          this.loadingMasterFilesGrid = true;
          this.dataService.spliteflag = false;

          this.breadcrumbsvr.showbreadcrumb();
          this.breadcrumbsvr.showfilesummary();
          this.breadcrumbsvr.hidesplitfilesummary();
          this.api.insertActivityLog(
            "File Summary List Viewed",
            "File Data",
            "READ"
          );
        } else {
          this.nSelectedClientID = this.dataService.clientid;
          this.loadingSplitFilesGrid = true;
          this.neraMasterFileid = this.dataService.mastererafileid;
          this.dataService.spliteflag = true;
          if (
            this.neraMasterFileid != 0 &&
            this.dataService.spliteflag == true
          ) {
            if (this.searchfiltersvr.filedatafilter == true) {
              let sdate = new Date(this.searchfiltersvr.getfiledatastartDate());
              this.startDate = sdate;
              let edate = new Date(this.searchfiltersvr.getfiledataendDate());
              this.endDate = edate;
            }
            if (this.searchfiltersvr.splitfiledatafilter == true) {
              this.sSplitDivisionCode = this.searchfiltersvr.getsplitfiledatasDivisionCode();
              this.sSelectedSubClientCode = this.searchfiltersvr.getsplitfiledataSelectedSubclientID();
              this.sSelectedSplitStatus = this.searchfiltersvr.getsplitfiledataselectedStatus();
              this.sSelectedSplitSearchBy = this.searchfiltersvr.getsplitfiledataselectedSearchBy();
              this.sSplitSearchText = this.searchfiltersvr.getsplitfiledatasSearchText();
              this.fbcSplitFilterSearch.setValue(this.sSplitSearchText);
            }
            this.RetriveAllDivision(this.nSelectedClientID);
            this.getsplitfilesummary();
            // this.RetriveSubClient();
            this.api.insertActivityLog(
              "Split File Summary Viewed for File ( " +
                this.dataService.mastererafilename +
                " )",
              "File Data",
              "READ",
              this.neraMasterFileid
            );
          } else {
            this.router.navigate(["/filedata"]);
          }
          this.breadcrumbsvr.showbreadcrumb();
          this.breadcrumbsvr.showfilesummary();
          this.breadcrumbsvr.showsplitfilesummary();
        }
      });
    } catch (error) {
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  getfilesummary() {
    this.MasterFilesGridView = null;
    this.MasterFilesItems = [];
    try {
      this.subscription.add(
        this.filedetailService
          .getFileSummary(
            this.neraMasterFileid,
            this.dataService.spliteflag,
            this.MasterFilespagesize,
            this.MasterFilesSkip,
            this.datePipe.transform(this.startDate, "yyyyMMdd"),
            this.datePipe.transform(this.endDate, "yyyyMMdd"),
            this.nSelectedClientID,
            this.sSelectedMasterSearchBy,
            this.sSearchText,
            this.sSelectedSubClientCode,
            this.sSelectedMasterStatus,
            this.currentuserid,
            ""
          )
          .subscribe(
            (data) => {
              this.MasterFilesResponse = data;
              if (
                this.MasterFilesResponse != null &&
                this.MasterFilesResponse != undefined
              ) {
                this.MasterFilesItems = this.MasterFilesResponse["content"];
                if (this.MasterFilesItems != null) {
                  if (this.MasterFilesItems.length > 0) {
                    this.MasterFilesItems.map((obj) => {
                      obj["totalcheckamount"] = parseNumber(
                        obj["totalcheckamount"]
                          .replace("$", "")
                          .replace(",", "")
                      );
                    });

                    this.loadItemsMaster();
                    this.loadingMasterFilesGrid = false;
                    this.Enabledisablebtn(false);
                  }
                } else {
                  this.MasterFilesdisplaytotalrecordscount = 0;
                  this.loadingMasterFilesGrid = false;
                  this.Enabledisablebtn(false);
                }
              }
            },
            (err) => {
              this.loadingMasterFilesGrid = false;
              this.Enabledisablebtn(false);
            }
          )
      );
    } catch (error) {
      this.Enabledisablebtn(false);
      this.clsUtility.LogError(error);
      this.loadingMasterFilesGrid = false;
    }
  }

  private loadItemsMaster(): void {
    this.MasterFilesGridView = null;
    this.GridView = null;
    try {
      if(this.MasterFilesItems != null && this.MasterFilesItems != undefined){
        if (this.MasterFilesItems && this.MasterFilesItems.length > 0) {
          this.MasterFilesGridView = {
            data: orderBy(this.MasterFilesItems, this.sortMaster),
            total: this.MasterFilesResponse["totalelements"],
          };
  
          this.MasterFilesdisplaytotalrecordscount = this.MasterFilesResponse[
            "totalelements"
          ];
          if (isNullOrUndefined(this.MasterFilesdisplaytotalrecordscount)) {
            this.MasterFilesdisplaytotalrecordscount = 0;
          }
          this.GridView = this.MasterFilesGridView;
        }
      }      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnCellClickMasterFile(event: any) {
    try {
      if (event.column.field == "checkcount") {
        if (event.dataItem.filestatus == "Processed") {
          this.dataService.mastererafileid = event.dataItem.fileid;
          this.dataService.mastererafilename = event.dataItem.filename;
          this.dataService.spliterafileid = "0";
          if (
            this.searchfiltersvr.checkdatafilter == true &&
            this.searchfiltersvr.filesdata_mastererafileid !=
              event.dataItem.fileid
          ) {
            this.searchfiltersvr.clearcheckfilter();
            this.searchfiltersvr.clearclaimfilter();
          } else if (this.searchfiltersvr.checkdatafilter == true) {
            this.searchfiltersvr.filesdata_mastererafileid =
              event.dataItem.fileid;
            this.searchfiltersvr.filesdata_spliterafileid = "0";
          } else {
            this.searchfiltersvr.checkdatafilter = true;
            this.searchfiltersvr.filesdata_mastererafileid =
              event.dataItem.fileid;
            this.searchfiltersvr.filesdata_spliterafileid = "0";
          }
          this.router.navigate(["/checksummary"]);
        }
      } else if (event.column.title == "Split Files") {
        if (
          event.dataItem.splitcount != 0 &&
          event.dataItem.subclientcount != 0
        ) {
          this.dataService.mastererafileid = event.dataItem.fileid;
          this.dataService.clientid = event.dataItem.clientid;
          this.dataService.mastererafilename = event.dataItem.filename;
          this.dataService.spliteflag = true;
          if (
            this.searchfiltersvr.splitfiledatafilter == true &&
            this.searchfiltersvr.filesdatasplit_mastererafileid !=
              event.dataItem.fileid
          ) {
            this.searchfiltersvr.clearsplitfiledatafilter();
          } else if (this.searchfiltersvr.splitfiledatafilter == true) {
            this.searchfiltersvr.filesdatasplit_mastererafileid =
              event.dataItem.fileid;
            this.searchfiltersvr.filesdata_spliteflag = true;
          } else {
            this.searchfiltersvr.splitfiledatafilter = true;
            this.searchfiltersvr.filesdatasplit_mastererafileid =
              event.dataItem.fileid;
            this.searchfiltersvr.filesdata_spliteflag = true;
          }
          this.router.navigate(["/filedata/split"]);
        }
      } else if (event.column.field == "checkno") {
        this.dataService.mastererafileid = event.dataItem.splitmasterfileid;
        this.dataService.mastererafilename = event.dataItem.splitfilename;
        this.dataService.spliterafileid = event.dataItem.splitfileid;
        if (
          this.searchfiltersvr.splitcheckdatafilter == true &&
          this.searchfiltersvr.filesdatasplit_mastererafileid ==
            event.dataItem.splitmasterfileid &&
          this.searchfiltersvr.filesdata_spliterafileid !=
            event.dataItem.splitfileid
        ) {
          this.searchfiltersvr.clearsplitcheckfilter();
          this.searchfiltersvr.clearsplitclaimfilter();
        } else if (this.searchfiltersvr.splitcheckdatafilter == true) {
          this.searchfiltersvr.filesdatasplit_mastererafileid =
            event.dataItem.splitmasterfileid;
          this.searchfiltersvr.filesdata_spliterafileid =
            event.dataItem.splitfileid;
        } else {
          this.searchfiltersvr.splitcheckdatafilter = true;
          this.searchfiltersvr.filesdatasplit_mastererafileid =
            event.dataItem.splitmasterfileid;
          this.searchfiltersvr.filesdata_spliterafileid =
            event.dataItem.splitfileid;
        }
        this.router.navigate(["/checksummary"]);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeMasterFile(event: PageChangeEvent): void {
    try {
      this.MasterFilesGridView = null;
      this.MasterFilesSkip = event.skip;
      this.loadingMasterFilesGrid = true;
      this.getfilesummary();
    } catch (error) {
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {
      this.breadcrumbsvr.hidefilesummary();
      this.breadcrumbsvr.hidebreadcrumb();
      this.breadcrumbsvr.hidesplitfilesummary();
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getsplitfilesummary() {
    this.SplitFilesGridView = null;
    this.SplitFilesItems = [];
    try {
      this.subscription.add(
        this.filedetailService
          .getFileSummary(
            this.dataService.mastererafileid,
            this.dataService.spliteflag,
            this.SplitFilespagesize,
            this.SplitFilesSkip,
            this.datePipe.transform(this.startDate, "yyyyMMdd"),
            this.datePipe.transform(this.endDate, "yyyyMMdd"),
            this.nSelectedClientID,
            this.sSelectedSplitSearchBy,
            this.sSplitSearchText,
            this.sSelectedSubClientCode,
            this.sSelectedSplitStatus,
            this.currentuserid,
            this.sSplitDivisionCode
          )
          .subscribe(
            (data) => {
              this.SplitFilesResponse = data;
              if (
                this.SplitFilesResponse != null &&
                this.SplitFilesResponse != undefined &&
                !isNullOrUndefined(this.SplitFilesResponse["content"])
              ) {
                this.SplitFilesItems = this.SplitFilesResponse["content"];
                if (this.SplitFilesItems != null) {
                  if (this.SplitFilesItems.length > 0) {
                    this.SplitFilesItems.map((obj) => {
                      obj["totalpaidamt"] = parseNumber(
                        !isNullOrUndefined(obj["totalpaidamt"])
                          ? obj["totalpaidamt"]
                              .replace("$", "")
                              .replace(",", "")
                          : "$0.00"
                      );

                      obj["plbamount"] = parseNumber(
                        !isNullOrUndefined(obj["plbamount"])
                          ? obj["plbamount"].replace("$", "").replace(",", "")
                          : "$0.00"
                      );

                      obj["splittotalcheckamount"] = parseNumber(
                        !isNullOrUndefined(obj["splittotalcheckamount"])
                          ? obj["splittotalcheckamount"]
                              .replace("$", "")
                              .replace(",", "")
                          : "$0.00"
                      );
                    });

                    this.loadItemsSplit();
                    this.loadingSplitFilesGrid = false;
                  }
                } else {
                  this.SplitFilesdisplaytotalrecordscount = 0;
                  this.loadingSplitFilesGrid = false;
                }
              } else {
                this.SplitFilesdisplaytotalrecordscount = 0;
                this.loadingSplitFilesGrid = false;
              }
            },
            (err) => {
              this.clsUtility.LogError(err);
              this.loadingSplitFilesGrid = false;
            }
          )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
      this.loadingSplitFilesGrid = false;
    }
  }

  private loadItemsSplit(): void {
    this.SplitFilesGridView = null;
    this.GridView = null;
    try {
      if(this.SplitFilesItems != null && this.SplitFilesItems != undefined){
        if (this.SplitFilesItems && this.SplitFilesItems.length >0) {
          this.SplitFilesGridView = {
            data: orderBy(this.SplitFilesItems, this.splitesortMaster),
            total: this.SplitFilesResponse["totalelements"],
          };
  
          this.SplitFilesdisplaytotalrecordscount = this.SplitFilesResponse[
            "totalelements"
          ];
          this.GridView = this.SplitFilesGridView;
        }
      }      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeSplitFile(event: PageChangeEvent): void {
    try {
      this.SplitFilesGridView = null;
      this.SplitFilesSkip = event.skip;
      this.loadingSplitFilesGrid = true;
      this.getsplitfilesummary();
    } catch (error) {
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveAllClient() {
    try {
      let getclient: {
        clientid: string;
        clientstatus: boolean;
        v_userid: string;
      } = {
        clientid: "0",
        clientstatus: true,
        v_userid: this.currentuserid,
      };
      let seq = this.api.post("GetClient", getclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.sAllClients = res;
            if (
              !isNullOrUndefined(this.sAllClients) &&
              this.sAllClients.length > 0
            ) {
              // this.disabledclient = false;
              // this.disabledstatus = false;
              // this.disabledstartdate = false;
              // this.disabledenddate = false;
              // this.disabledsearch = false;
              // this.disabledsearchBy = false;
              if (
                this.sAllClients[0]["nclientcount"] == this.sAllClients.length
              ) {
                const Allclt = new Client();
                Allclt.clientid = "0";
                Allclt.clientcode = "";
                Allclt.clientname = "All";
                this.sAllClients.unshift(Allclt);
                this.selectedClientValue = "0";
                this.nSelectedClientID = "0";
              } else {
                this.selectedClientValue = this.sAllClients[0]["clientid"];
                this.nSelectedClientID = this.sAllClients[0]["clientid"];
              }

              if (this.searchfiltersvr.filedataSelectedClientID != "0") {
                this.selectedClientValue = this.searchfiltersvr.filedataSelectedClientID;
              }
              // else {
              //   this.selectedClientValue = "0";
              // }

              this.SelectAllClients = this.sAllClients;
              if (this.bOninit) {
                this.getfilesummary();
                this.bOninit = false;
              } else {
                this.Enabledisablebtn(false);
              }
            } else {
              this.sAllClients = [];
              this.Enabledisablebtn(true);
              // this.disabledclient = true;
              // this.disabledstatus = true;
              // this.disabledstartdate = true;
              // this.disabledenddate = true;
              // this.disabledsearch = true;
              // this.disabledsearchBy = true;
              this.MasterFilesResponse = [];
              this.MasterFilesItems = [];
              this.loadingMasterFilesGrid = false;
              this.neraMasterFileid = "0";
              this.clsUtility.showInfo("No group is active");
            }
          },
          (err) => {
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onClientChange(event: any) {
    try {
      this.nSelectedClientID = event;
      this.searchfiltersvr.setfiledatafilter(
        this.nSelectedClientID,
        this.startDate,
        this.endDate,
        this.sSelectedMasterStatus,
        this.sSelectedMasterSearchBy,
        this.sSearchText
      );
      // this.MasterFilesSkip = 0;
      // this.MasterFilesdisplaytotalrecordscount = 0;
      // this.loadingMasterFilesGrid = true;
      // this.getfilesummary();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterStatusChange(event: any) {
    try {
      this.sSelectedMasterStatus = event;
      // this.MasterFilesSkip = 0;
      // this.MasterFilesdisplaytotalrecordscount = 0;
      // this.loadingMasterFilesGrid = true;
      this.searchfiltersvr.setfiledatafilter(
        this.nSelectedClientID,
        this.startDate,
        this.endDate,
        this.sSelectedMasterStatus,
        this.sSelectedMasterSearchBy,
        this.sSearchText
      );
      // this.getfilesummary();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterSearchByChange(event: any) {
    try {
      this.sSelectedMasterSearchBy = event;
      this.searchfiltersvr.setfiledatafilter(
        this.nSelectedClientID,
        this.startDate,
        this.endDate,
        this.sSelectedMasterStatus,
        this.sSelectedMasterSearchBy,
        this.sSearchText
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSearch($event: any = null) {
    try {
      if (!isNullOrUndefined($event)) {
        if ($event.type == "keyup") {
          // this.MasterFilesdisplaytotalrecordscount = 0;
          // this.loadingMasterFilesGrid = true;
          // this.MasterFilesSkip = 0;
          this.sSearchText = "";
          this.sSearchText = this.fbcFilterSearch.value.trim();
          this.searchfiltersvr.setfiledatafilter(
            this.nSelectedClientID,
            this.startDate,
            this.endDate,
            this.sSelectedMasterStatus,
            this.sSelectedMasterSearchBy,
            this.sSearchText
          );
          this.searchfiltersvr.clearcheckfilter();
          this.searchfiltersvr.clearclaimfilter();
          // this.getfilesummary();
        } else if ($event.type == "click") {
          // this.MasterFilesdisplaytotalrecordscount = 0;
          // this.loadingMasterFilesGrid = true;
          // this.MasterFilesSkip = 0;
          this.sSearchText = "";
          this.sSearchText = this.fbcFilterSearch.value.trim();
          this.searchfiltersvr.setfiledatafilter(
            this.nSelectedClientID,
            this.startDate,
            this.endDate,
            this.sSelectedMasterStatus,
            this.sSelectedMasterSearchBy,
            this.sSearchText
          );
          this.searchfiltersvr.clearcheckfilter();
          this.searchfiltersvr.clearclaimfilter();
          // this.getfilesummary();
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onDateChange(value: Date, date: string): void {
    try {
      if (value != null) {
        if (date == "start date" && value > this.endDate) {
          this.clsUtility.showWarning("Start date must be less than end date");
          this.startDate = new Date();
        } else if (date == "end date" && value < this.startDate) {
          this.clsUtility.showWarning(
            "End date must be greater than start date"
          );
          this.endDate = new Date();
        }
        // this.MasterFilesSkip = 0;
        // this.MasterFilesdisplaytotalrecordscount = 0;
        // this.loadingMasterFilesGrid = true;
        this.searchfiltersvr.setfiledatafilter(
          this.nSelectedClientID,
          this.startDate,
          this.endDate,
          this.sSelectedMasterStatus,
          this.sSelectedMasterSearchBy,
          this.sSearchText
        );
        // this.getfilesummary();
      } else {
        if (date == "start date") {
          this.startDate = new Date();
        } else if (date == "end date") {
          this.endDate = new Date();
        }
        this.searchfiltersvr.setfiledatafilter(
          this.nSelectedClientID,
          this.startDate,
          this.endDate,
          this.sSelectedMasterStatus,
          this.sSelectedMasterSearchBy,
          this.sSearchText
        );
        // this.getfilesummary();
        this.clsUtility.LogError("Select valid date");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveSubClient() {
    try {
      let getsubclient: {
        clientid: string;
        subclientcode: string;
        subclientstatus: boolean;
        subclientdivisioncode: string;
      } = {
        clientid: this.nSelectedClientID,
        subclientcode: "",
        subclientstatus: true,
        subclientdivisioncode: this.sSplitDivisionCode,
      };
      let seq = this.api.post("SubClient/GetSubClient", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.sSubClients = res;

            if (
              !isNullOrUndefined(this.sSubClients) &&
              this.sSubClients.length > 0
            ) {
              this.disabledsubclient = false;
              this.disabledsplitstatus = false;
              this.disabledsplitsearch = false;
              this.disabledsplitsearchBy = false;
              const Subclt = new Subclient();
              Subclt.subclientid = "0";
              Subclt.subclientcode = "0";
              Subclt.subclientname = "All";
              this.sSubClients.unshift(Subclt);
              this.SelectAllSubClients = this.sSubClients;

              if (
                this.searchfiltersvr.splitfiledataSelectedSubclientID != "0"
              ) {
                this.sSelectedSubClientCode = this.searchfiltersvr.splitfiledataSelectedSubclientID;
              } else {
                this.sSelectedSubClientCode = "0";
              }

              // this.getsplitfilesummary();
            } else {
              this.sSubClients = [];
              this.disabledsubclient = true;
              this.disabledsplitstatus = true;
              this.disabledsplitsearch = true;
              this.disabledsplitsearchBy = true;
              this.loadingSplitFilesGrid = false;
              this.clsUtility.showInfo("No practice is active");
            }
          },
          (err) => {
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onSubClientChange(event: any) {
    try {
      this.sSelectedSubClientCode = event;
      this.searchfiltersvr.setsplitfiledatafilter(
        this.sSelectedSubClientCode,
        this.sSelectedSplitStatus,
        this.sSelectedSplitSearchBy,
        this.sSplitSearchText,
        this.sSplitDivisionCode
      );
      // this.SplitFilesSkip = 0;
      // this.SplitFilesdisplaytotalrecordscount = 0;
      // this.loadingSplitFilesGrid = true;
      // this.getsplitfilesummary();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSplitStatusChange(event: any) {
    try {
      this.sSelectedSplitStatus = event;
      this.searchfiltersvr.setsplitfiledatafilter(
        this.sSelectedSubClientCode,
        this.sSelectedSplitStatus,
        this.sSelectedSplitSearchBy,
        this.sSplitSearchText,
        this.sSplitDivisionCode
      );
      // this.SplitFilesSkip = 0;
      // this.SplitFilesdisplaytotalrecordscount = 0;
      // this.loadingSplitFilesGrid = true;
      // this.getsplitfilesummary();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSplitSearchByChange(event: any) {
    try {
      this.sSelectedSplitSearchBy = event;
      this.searchfiltersvr.setsplitfiledatafilter(
        this.sSelectedSubClientCode,
        this.sSelectedSplitStatus,
        this.sSelectedSplitSearchBy,
        this.sSplitSearchText,
        this.sSplitDivisionCode
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSplitSearch($event: any = null) {
    try {
      if (!isNullOrUndefined($event)) {
        if ($event.type == "keyup") {
          // this.SplitFilesdisplaytotalrecordscount = 0;
          // this.loadingSplitFilesGrid = true;
          // this.SplitFilesSkip = 0;
          this.sSplitSearchText = "";
          this.sSplitSearchText = this.fbcSplitFilterSearch.value.trim();
          this.searchfiltersvr.setsplitfiledatafilter(
            this.sSelectedSubClientCode,
            this.sSelectedSplitStatus,
            this.sSelectedSplitSearchBy,
            this.sSplitSearchText,
            this.sSplitDivisionCode
          );
          // this.getsplitfilesummary();
        } else if ($event.type == "click") {
          // this.SplitFilesdisplaytotalrecordscount = 0;
          // this.loadingSplitFilesGrid = true;
          // this.SplitFilesSkip = 0;
          this.sSplitSearchText = "";
          this.sSplitSearchText = this.fbcSplitFilterSearch.value.trim();
          this.searchfiltersvr.setsplitfiledatafilter(
            this.sSelectedSubClientCode,
            this.sSelectedSplitStatus,
            this.sSelectedSplitSearchBy,
            this.sSplitSearchText,
            this.sSplitDivisionCode
          );
          // this.getsplitfilesummary();
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleClientFilter(value) {
    this.sAllClients = this.SelectAllClients.filter(
      (s) => s.clientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  handleSubclientFilter(value) {
    this.sSubClients = this.SelectAllSubClients.filter(
      (s) => s.subclientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  applyFilters() {
    try {
      if (
        this.fbcFilterSearch.value != null &&
        this.fbcFilterSearch.value != undefined
      ) {
        this.sSearchText = "";
        this.sSearchText = this.fbcFilterSearch.value.trim();
        this.searchfiltersvr.setfiledatafilter(
          this.nSelectedClientID,
          this.startDate,
          this.endDate,
          this.sSelectedMasterStatus,
          this.sSelectedMasterSearchBy,
          this.sSearchText
        );
        this.searchfiltersvr.clearcheckfilter();
        this.searchfiltersvr.clearclaimfilter();
      } else {
        this.sSearchText = "";
        this.sSearchText = this.fbcFilterSearch.value.trim();
        this.searchfiltersvr.setfiledatafilter(
          this.nSelectedClientID,
          this.startDate,
          this.endDate,
          this.sSelectedMasterStatus,
          this.sSelectedMasterSearchBy,
          this.sSearchText
        );
        this.searchfiltersvr.clearcheckfilter();
        this.searchfiltersvr.clearclaimfilter();
      }

      if (
        this.nSelectedClientID != null &&
        this.nSelectedClientID != undefined &&
        this.sSelectedMasterStatus != null &&
        this.sSelectedMasterStatus != undefined &&
        this.sSearchText != null &&
        this.sSearchText != undefined &&
        this.startDate != null &&
        this.startDate != undefined &&
        this.endDate != null &&
        this.endDate != undefined
      ) {
        this.MasterFilesSkip = 0;
        this.MasterFilesdisplaytotalrecordscount = 0;
        this.loadingMasterFilesGrid = true;
        this.Enabledisablebtn(true);
        this.getfilesummary();
      } else {
        this.MasterFilesSkip = 0;
        this.MasterFilesdisplaytotalrecordscount = 0;
        this.loadingMasterFilesGrid = false;
        this.MasterFilesResponse = [];
        this.MasterFilesItems = [];
      }
    } catch (error) {
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  clearFilters() {
    try {
      this.nSelectedClientID = "0";
      this.sSelectedMasterStatus = "3";
      this.sSelectedMasterSearchBy = "Filename";
      this.sSearchText = "";
      this.fbcFilterSearch.setValue(this.sSearchText);
      this.startDate = new Date();
      this.startDate.setDate(this.startDate.getDate() - 1);
      this.endDate = new Date();

      this.searchfiltersvr.setfiledatafilter(
        this.nSelectedClientID,
        this.startDate,
        this.endDate,
        this.sSelectedMasterStatus,
        this.sSelectedMasterSearchBy,
        this.sSearchText
      );
      this.searchfiltersvr.clearcheckfilter();
      this.searchfiltersvr.clearclaimfilter();
      this.searchfiltersvr.clearsplitfiledatafilter();
      this.searchfiltersvr.clearsplitcheckfilter();
      this.searchfiltersvr.clearsplitclaimfilter();

      this.MasterFilesSkip = 0;
      this.MasterFilesdisplaytotalrecordscount = 0;
      this.loadingMasterFilesGrid = true;
      this.Enabledisablebtn(true);
      this.bOninit = true;
      this.RetriveAllClient();
      // this.getfilesummary();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  applySplitFilters() {
    try {
      if (
        this.fbcSplitFilterSearch.value != null &&
        this.fbcSplitFilterSearch.value != undefined
      ) {
        this.sSplitSearchText = "";
        this.sSplitSearchText = this.fbcSplitFilterSearch.value.trim();
        this.searchfiltersvr.setsplitfiledatafilter(
          this.sSelectedSubClientCode,
          this.sSelectedSplitStatus,
          this.sSelectedSplitSearchBy,
          this.sSplitSearchText,
          this.sSplitDivisionCode
        );

        this.searchfiltersvr.clearsplitcheckfilter();
        this.searchfiltersvr.clearsplitclaimfilter();
      } else {
        this.sSplitSearchText = "";
        this.sSplitSearchText = this.fbcSplitFilterSearch.value.trim();
        this.searchfiltersvr.setsplitfiledatafilter(
          this.sSelectedSubClientCode,
          this.sSelectedSplitStatus,
          this.sSelectedSplitSearchBy,
          this.sSplitSearchText,
          this.sSplitDivisionCode
        );

        this.searchfiltersvr.clearsplitcheckfilter();
        this.searchfiltersvr.clearsplitclaimfilter();
      }

      if (
        this.sSelectedSubClientCode != null &&
        this.sSelectedSubClientCode != undefined &&
        this.sSelectedSplitStatus != null &&
        this.sSelectedSplitStatus != undefined &&
        this.sSplitSearchText != null &&
        this.sSplitSearchText != undefined &&
        this.startDate != null &&
        this.startDate != undefined &&
        this.endDate != null &&
        this.endDate != undefined
      ) {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = true;
        this.getsplitfilesummary();
      } else {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = false;
        this.SplitFilesResponse = [];
        this.MasterFilesItems = [];
      }
    } catch (error) {
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  clearSplitFilters() {
    try {
      this.sSelectedSubClientCode = "0";
      this.sSelectedSplitStatus = "3";
      this.sSplitSearchText = "";
      this.sSelectedSplitSearchBy = "Filename";
      this.sSplitDivisionCode = "All";
      this.fbcSplitFilterSearch.setValue(this.sSplitSearchText);

      this.searchfiltersvr.setsplitfiledatafilter(
        this.sSelectedSubClientCode,
        this.sSelectedSplitStatus,
        this.sSelectedSplitSearchBy,
        this.sSplitSearchText,
        this.sSplitDivisionCode
      );

      this.searchfiltersvr.clearsplitcheckfilter();
      this.searchfiltersvr.clearsplitclaimfilter();

      this.SplitFilesSkip = 0;
      this.SplitFilesdisplaytotalrecordscount = 0;
      this.loadingSplitFilesGrid = true;
      this.RetriveSubClient();
      this.getsplitfilesummary();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveAllDivision(client: string = "0") {
    try {
      class division {
        subclientdivisioncode: string;
      }
      let getdivision: { clientid: string } = {
        clientid: client,
      };
      let seq = this.api.post("GetDivisionCode", getdivision);
      seq.subscribe(
        (res) => {
          this.sAllDivision = res;
          if (
            !isNullOrUndefined(this.sAllDivision) &&
            this.sAllDivision.length > 0
          ) {
            this.disableddivision = false;
            this.disabledsubclient = false;
            this.disabledsplitstatus = false;
            this.disabledsplitsearch = false;
            this.disabledapplybtn = false;
            this.disabledclearbtn = false;
            const Alldiv = new division();
            Alldiv.subclientdivisioncode = "All";
            this.sAllDivision.unshift(Alldiv);
            this.SelectAllDivision = this.sAllDivision;
            this.sSplitDivisionCode = "All";

            if (
              this.searchfiltersvr.splitfiledataselectedDivisionCode != "All"
            ) {
              this.sSplitDivisionCode = this.searchfiltersvr.splitfiledataselectedDivisionCode;
            } else {
              this.sSplitDivisionCode = "All";
            }

            this.RetriveSubClient();
          } else {
            this.sAllDivision = [];
            this.disableddivision = true;
            this.disabledsubclient = true;
            this.disabledsplitstatus = true;
            this.disabledsplitsearch = true;
            this.disabledapplybtn = true;
            this.disabledclearbtn = true;
            const Alldiv = new division();
            this.SplitFilesResponse = [];
            this.SplitFilesItems = [];
            this.loadingSplitFilesGrid = false;
            this.neraMasterFileid = "0";
            this.clsUtility.showInfo("No group is active");
          }
        },
        (err) => {
          this.loadingSplitFilesGrid = false;
          this.clsUtility.LogError(err);
        }
      );
    } catch (error) {
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onDivisionChange(event: any) {
    try {
      if (this.Division.value == undefined || this.Division.value == "") {
        this.toastr.warning("Please Select Division");
      } else {
        this.sSplitDivisionCode = event;
        this.sSelectedSubClientCode = "0";
        this.searchfiltersvr.setsplitfiledatafilter(
          this.sSelectedSubClientCode,
          this.sSelectedSplitStatus,
          this.sSelectedSplitSearchBy,
          this.sSplitSearchText,
          this.sSplitDivisionCode
        );
        this.RetriveSubClient();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleDivisionFilter(value) {
    this.sAllDivision = this.SelectAllDivision.filter(
      (s) =>
        s.subclientdivisioncode.toLowerCase().indexOf(value.toLowerCase()) !==
        -1
    );
  }

  sortMasterChange(sort: SortDescriptor[]): void {
    try {
      this.sortMaster = sort;
      this.loadItemsMaster();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  splitesortMasterChange(sort: SortDescriptor[]): void {
    try {
      this.splitesortMaster = sort;
      this.loadItemsSplit();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onRefreshClickMaster() {
    try {
      if (
        this.fbcFilterSearch.value != null &&
        this.fbcFilterSearch.value != undefined
      ) {
        this.sSearchText = "";
        this.sSearchText = this.fbcFilterSearch.value.trim();
        this.searchfiltersvr.setfiledatafilter(
          this.nSelectedClientID,
          this.startDate,
          this.endDate,
          this.sSelectedMasterStatus,
          this.sSelectedMasterSearchBy,
          this.sSearchText
        );
        this.searchfiltersvr.clearcheckfilter();
        this.searchfiltersvr.clearclaimfilter();
      } else {
        this.sSearchText = "";
        this.sSearchText = this.fbcFilterSearch.value.trim();
        this.searchfiltersvr.setfiledatafilter(
          this.nSelectedClientID,
          this.startDate,
          this.endDate,
          this.sSelectedMasterStatus,
          this.sSelectedMasterSearchBy,
          this.sSearchText
        );
        this.searchfiltersvr.clearcheckfilter();
        this.searchfiltersvr.clearclaimfilter();
      }

      if (
        this.nSelectedClientID != null &&
        this.nSelectedClientID != undefined &&
        this.sSelectedMasterStatus != null &&
        this.sSelectedMasterStatus != undefined &&
        this.sSearchText != null &&
        this.sSearchText != undefined &&
        this.startDate != null &&
        this.startDate != undefined &&
        this.endDate != null &&
        this.endDate != undefined
      ) {
        this.MasterFilesSkip = 0;
        this.MasterFilesdisplaytotalrecordscount = 0;
        this.loadingMasterFilesGrid = true;
        this.getfilesummary();
      } else {
        this.MasterFilesSkip = 0;
        this.MasterFilesdisplaytotalrecordscount = 0;
        this.loadingMasterFilesGrid = false;
        this.MasterFilesResponse = [];
        this.MasterFilesItems = [];
      }
    } catch (error) {
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onRefreshClickSplit() {
    try {
      if (
        this.fbcSplitFilterSearch.value != null &&
        this.fbcSplitFilterSearch.value != undefined
      ) {
        this.sSplitSearchText = "";
        this.sSplitSearchText = this.fbcSplitFilterSearch.value.trim();
        this.searchfiltersvr.setsplitfiledatafilter(
          this.sSelectedSubClientCode,
          this.sSelectedSplitStatus,
          this.sSelectedSplitSearchBy,
          this.sSplitSearchText,
          this.sSplitDivisionCode
        );

        this.searchfiltersvr.clearsplitcheckfilter();
        this.searchfiltersvr.clearsplitclaimfilter();
      } else {
        this.sSplitSearchText = "";
        this.sSplitSearchText = this.fbcSplitFilterSearch.value.trim();
        this.searchfiltersvr.setsplitfiledatafilter(
          this.sSelectedSubClientCode,
          this.sSelectedSplitStatus,
          this.sSelectedSplitSearchBy,
          this.sSplitSearchText,
          this.sSplitDivisionCode
        );

        this.searchfiltersvr.clearsplitcheckfilter();
        this.searchfiltersvr.clearsplitclaimfilter();
      }

      if (
        this.sSelectedSubClientCode != null &&
        this.sSelectedSubClientCode != undefined &&
        this.sSelectedSplitStatus != null &&
        this.sSelectedSplitStatus != undefined &&
        this.sSplitSearchText != null &&
        this.sSplitSearchText != undefined &&
        this.startDate != null &&
        this.startDate != undefined &&
        this.endDate != null &&
        this.endDate != undefined
      ) {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = true;
        this.getsplitfilesummary();
      } else {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = false;
        this.SplitFilesResponse = [];
        this.MasterFilesItems = [];
      }
    } catch (error) {
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onSplitFilesClick(event: any) {
    try {
      if (event.splitcount != 0 && event.subclientcount != 0) {
        this.dataService.mastererafileid = event.fileid;
        this.dataService.clientid = event.clientid;
        this.dataService.mastererafilename = event.filename;
        this.dataService.spliteflag = true;
        if (
          this.searchfiltersvr.splitfiledatafilter == true &&
          this.searchfiltersvr.filesdatasplit_mastererafileid != event.fileid
        ) {
          this.searchfiltersvr.clearsplitfiledatafilter();
        } else if (this.searchfiltersvr.splitfiledatafilter == true) {
          this.searchfiltersvr.filesdatasplit_mastererafileid = event.fileid;
          this.searchfiltersvr.filesdata_spliteflag = true;
        } else {
          this.searchfiltersvr.splitfiledatafilter = true;
          this.searchfiltersvr.filesdatasplit_mastererafileid = event.fileid;
          this.searchfiltersvr.filesdata_spliteflag = true;
        }
        this.router.navigate(["/filedata/split"]);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onERAReportClick(event: any) {
    try {
      this.dataService.mastererafileid = event.fileid;
      this.dataService.mastererafilename = event.filename;
      this.router.navigate(["/practicefilesummaryreport/ERAreport"]);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  Enabledisablebtn(status: boolean = false) {
    try {
      this.disabledstartdate = status;
      this.disabledenddate = status;
      this.disabledclient = status;
      this.disabledstatus = status;
      this.disabledsearchBy = status;
      this.disabledsearch = status;
      this.disabledapplybtn = status;
      this.disabledclearbtn = status;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterFilesExcelExportClick() {
    try {
      if (this.MasterFilesdisplaytotalrecordscount > 0) {
        this.MasterFileExportExcelDownloadConfirmationMessage =
          this.MasterFilesdisplaytotalrecordscount +
          " records will be Exported, Do you want to continue ?";
        $("#MasterExportExcelClaimconfirmationModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterFilesExportExcelCloseConfirmationClick() {
    try {
      $("#MasterExportExcelClaimconfirmationModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterFilesExportExcelYesConfirmationClick() {
    try {
      this.ClickMasterExportExcel();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public ClickMasterExportExcel() {
    try {
      document.getElementById("hbtnMasterExportExcel").click();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public allData = (): Observable<any> => {
    try {  
      this.emailloading = true;

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
        nmastererafileid: this.neraMasterFileid,
        splitfileflag: this.dataService.spliteflag,
        dtstartdate: this.datePipe.transform(this.startDate, "yyyyMMdd"),
        dtenddate: this.datePipe.transform(this.endDate, "yyyyMMdd"),
        nclientid: this.nSelectedClientID,
        searchby: this.sSelectedMasterSearchBy,
        searchtext: this.sSearchText,
        nsubclientid: this.sSelectedSubClientCode,
        status: this.sSelectedMasterStatus,
        userid: "0",
        divisioncode: ""                        
      };
      
      if (this.MasterFilesdisplaytotalrecordscount != 0) {        
        var result = this.filedetailService.exporttoexcelfiledata("api/Reports/getFileSummary", para, this.MasterFilesdisplaytotalrecordscount);
        return result;
      } else {
        this.clsUtility.showInfo("No records available for export"); 
        this.emailloading = false; 
        return Observable.empty();
      }
    } catch (error) {    
      this.clsUtility.showError(error);
      this.emailloading = false; 
    }
  };

  public onMasterExcelExport(args: any): void {
    try {  
      this.emailloading = true; 

      args.preventDefault();
      const workbook = args.workbook;

      new Workbook(workbook).toDataURL().then((dataUrl: string) => {
        saveAs(dataUrl, this.MasterexportFilename + ".xlsx");
        this.api.insertActivityLog(
          "Master Files data exported in excel",
          "File Data",
          "READ"
        ); 
        this.emailloading = false; 
      });
    } catch (error) {
      this.clsUtility.showError(error);
    }
  }
  
  onSplitFilesExcelExportClick() {
    try {
      if (this.SplitFilesdisplaytotalrecordscount > 0) {
        this.SplitFileExportExcelDownloadConfirmationMessage =
          this.SplitFilesdisplaytotalrecordscount +
          " records will be Exported, Do you want to continue ?";
        $("#SplitExportExcelClaimconfirmationModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSplitFilesExportExcelCloseConfirmationClick() {
    try {
      $("#SplitExportExcelClaimconfirmationModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSplitFilesExportExcelYesConfirmationClick() {
    try {
      this.ClickSplitExportExcel();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public ClickSplitExportExcel() {
    try {
      document.getElementById("hbtnSplitExportExcel").click();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public allDatasplit = (): Observable<any> => {
    try {  
      this.emailloading = true;

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
        nmastererafileid: this.neraMasterFileid,
        splitfileflag: this.dataService.spliteflag,
        dtstartdate: this.datePipe.transform(this.startDate, "yyyyMMdd"),
        dtenddate: this.datePipe.transform(this.endDate, "yyyyMMdd"),
        nclientid: this.nSelectedClientID,
        searchby: this.sSelectedMasterSearchBy,
        searchtext: this.sSearchText,
        nsubclientid: this.sSelectedSubClientCode,
        status: this.sSelectedMasterStatus,
        userid: "0",
        divisioncode: ""                        
      };
      
      if (this.SplitFilesdisplaytotalrecordscount != 0) {        
        var result = this.filedetailService.exporttoexcelfiledata("api/Reports/getFileSummary", para, this.SplitFilesdisplaytotalrecordscount);
        return result;
      } else {
        this.clsUtility.showInfo("No records available for export"); 
        this.emailloading = false; 
        return Observable.empty();
      }
    } catch (error) {    
      this.clsUtility.showError(error);
      this.emailloading = false; 
    }
  };
  
  public onSplitExcelExport(args: any): void {
    try {  
      this.emailloading = true; 

      args.preventDefault();
      const workbook = args.workbook;

      new Workbook(workbook).toDataURL().then((dataUrl: string) => {
        saveAs(dataUrl, this.SplitexportFilename + ".xlsx");
        this.api.insertActivityLog(
          "Split Files data exported in excel for File ( " +
          this.dataService.mastererafilename +
          " )",
          "File Data",
          "READ"
        ); 
        this.emailloading = false; 
      });
    } catch (error) {
      this.clsUtility.showError(error);
    }
  }

}
