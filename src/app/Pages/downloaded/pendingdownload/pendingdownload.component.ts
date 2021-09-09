import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from "@angular/core";
import { FileDetailsService } from "src/app/Services/file-details.service";
import {
  GridDataResult,
  PageChangeEvent,
  SelectableSettings,
  DataStateChangeEvent,
} from "@progress/kendo-angular-grid";
import { DatePipe } from "@angular/common";
import * as FileSaver from "file-saver";
import * as JSZip from "jszip";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { CoreoperationsService } from "src/app/Services/coreoperations.service";
import { Client } from "src/app/Model/client";
import { Subclient } from "src/app/Model/subclient";
import { FormBuilder, Validators } from "@angular/forms";
import { isNullOrEmptyString } from "@progress/kendo-angular-grid/dist/es2015/utils";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../../node_modules/subsink";
import { Api } from "src/app/Services/api";
import { BreadcrumbService } from "src/app/Services/breadcrumb.service";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Router } from "@angular/router";
import { ContextMenuSelectEvent } from "@progress/kendo-angular-menu";
import { isNullOrUndefined, isNull } from "util";
import { SearchfiltersService } from "src/app/Services/searchfilters.service";
import { clsPermission } from "./../../../Services/settings/clspermission";
declare var $: any;
import * as moment from "moment";
import { async } from "@angular/core/testing";
import { parseNumber } from "@progress/kendo-angular-intl";
import { process, State } from "@progress/kendo-data-query";
import { CheckwiseeobreportComponent } from '../../eobreport-check/checkwiseeobreport.component';

@Component({
  selector: "app-pendingdownload",
  templateUrl: "./pendingdownload.component.html",
  styleUrls: ["./pendingdownload.component.css"],
})
export class PendingdownloadComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private filedetailService: FileDetailsService,
    private datePipe: DatePipe,
    private coreService: CoreoperationsService,
    private toastr: ToastrService,
    public api: Api,
    private breadcrumbService: BreadcrumbService,
    private dataService: DatatransaferService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public searchfiltersvr: SearchfiltersService
  ) {
    this.clsUtility = new Utility(toastr);
    this.SplitFilesPageSize = this.clsUtility.pagesize;
    this.setSelectableSettings();
  }
  public setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: this.checkboxOnly,
      // mode: this.mode
    };
  }
  fileUrl;
  fileInProgress: string = "";
  percentage: number = 0;
  percentIncrease: number = 0;
  public checkboxOnly = true;
  private clsUtility: Utility;
  private subscription = new SubSink();
  public selectableSettings: SelectableSettings;
  loading = false;
  loadingSplitFilesGrid = true;
  neraMasterFileid: any = "0";
  nclientid: any = "0";
  public sSplitfile: any;
  public splitopened = false;
  public sSelectedClientID: string = "0";
  public sSelectedDivisionID: string = "All";
  public s835splitstring: any;

  public SplitFilesGridData: {};
  public SplitFilesGridView: GridDataResult;
  private SplitFilesItems: any[] = [];
  public SplitFilesResponse: any[] = [];
  public SplitFilesSkip = 0;
  public SplitFilesPageSize = 0;

  public stitleSplitfile = "Split File";
  public sSubClients: any;
  public SelectAllSubClients: any;
  public sSelectedSubClientCode: any = "0";
  public selectedSubClientValue: any = 0;
  public sSplitFileBreadCrumb: string = "SplitFiles";
  public SplitFilesdisplaytotalrecordscount: number = 0;
  public items: any[] = [{ text: "Reprocess" }];
  public sSplitStatus: any = [
    { value: "3", text: "All" },
    { value: "0", text: "Inprocess" },
    { value: "1", text: "Process" },
    { value: "2", text: "Unprocess" },
  ];
  public sSelectedSplitStatus: string = "3";
  public selectedSplitStatusValue: string = "3";
  public sSearchText: string = "";
  public disabledclient: boolean = false;
  public disableddivision: boolean = false;
  public disabledsubclient: boolean = false;
  public disabledsplitstatus: boolean = false;
  public disabledsplitsearch: boolean = false;
  public disabledstartdate: boolean = false;
  public disabledenddate: boolean = false;
  public disabledapplybtn: boolean = false;
  public disabledclearbtn: boolean = false;
  public disabledreftp: boolean = true;
  public clsPermission: clsPermission;
  isFilesProcessing: boolean = false;
  splitFileStatus: any[] = [];
  StatusGridView: GridDataResult;
  public startDate: Date = new Date();
  public endDate: Date = new Date();
  public currentuserid: string = "0";
  public selectedCallback = (args) => args.dataItem;
  public mySelection: any[] = [];
  public disableddownload: boolean = true;
  public reftpsplitfileids: any[] = [];
  public processStatusSort: SortDescriptor[] = [];
  public disabledsearchBy: boolean = false;
  public sAllClients: any;
  public sAllDivision: any;
  public SelectAllClients: any;
  public SelectAllDivision: any;
  public progresstitle: any = "";

  public sDivisionalSplitSearchBy: any = [
    // { value: "Master Filename", text: "Master Filename" },
    //Hear filename means splitfilename
    { value: "Fileshare", text: "Fileshare" },
    { value: "Filename", text: "Filename" },
    { value: "Check", text: "Check" },
    // { value: "Claim", text: "Claim" },
    // { value: "Payer name", text: "Payer name" },
    // { value: "Payerid", text: "Payerid" }
  ];
  public sSelectedDivisionalSplitSearchBy: string = "Fileshare";

  public sDownloadFilter: any = [
    { value: "All", text: "All" },
    { value: "Downloaded", text: "Downloaded" },
    { value: "Not Downloaded", text: "Not Downloaded" },
  ];
  public sSelectedDownloadfilter: string = "Not Downloaded";
  public currentusername: string = "";
  public Zipdownloadarray: any = [];
  public selecteddownloadarray: any = [];
  public alldownloadresponse: any = [];
  public alldownloadarray: any = [];
  public DownloadConfirmationMessage: any;
  public DownloadClickType: any;
  public globalmessage: string = "";
  public globaldate: Date = new Date();
  public checkstartdate: string = null;
  public checkenddate: string = null;
  public showValidation: boolean = false;
  public DownloadSelectedClickType: any;
  public DownloadSelectedLimit: Number = 10;
  public downloadedfilesarray: any = [];
  downloadedStatusGridView: GridDataResult;
  public downloadedprocessStatusSort: SortDescriptor[] = [
    {
      field: "downloadstatus",
      dir: "asc",
    },
  ];
  public state: State = {
    skip: 0,
    take: 50,
    sort: this.downloadedprocessStatusSort,
  };

  countObj: {
    total: number;
    success: number;
    error: number;
  } = {
    total: 0,
    success: 0,
    error: 0,
  };

  downloadcountObj: {
    total: number;
    success: number;
    error: number;
  } = {
    total: 0,
    success: 0,
    error: 0,
  };

  public exportresponse: any = [];
  public recordslist: {
    masterfileid: any;
    nerafileid: any;
  } = {
    masterfileid: 0,
    nerafileid: 0,
  };

  public sortSplit: SortDescriptor[] = [
    {
      field: "processdate",
      dir: "desc",
    },
  ];

  @ViewChild("EobreportChild")
  private EobreportChild: CheckwiseeobreportComponent; 
  public inputsplitfileid: any;
  public inputcomponentname: any = "Pending Download";
  public inputerafileid: any;
  public inputfilename: any = "";

  DropDownGroup = this.fb.group({
    fcClientName: ["", Validators.required],
    fcSubClientName: ["", Validators.required],
    fcSplitSearch: [""],
    fcSplitStatus: [""],
    fcDivisionalSplitSearchBy: ["", Validators.required],
    fcDivision: ["", Validators.required],
    fcDownloadFilter: ["", Validators.required],
    fcStartDate: [null],
    fcEndDate: [null],
  });

  get ClientName() {
    return this.DropDownGroup.get("fcClientName");
  }

  get SubClientName() {
    return this.DropDownGroup.get("fcSubClientName");
  }

  get fbcSplitFilterSearch() {
    return this.DropDownGroup.get("fcSplitSearch");
  }

  get DivisionalSplitSearchBy() {
    return this.DropDownGroup.get("fcDivisionalSplitSearchBy");
  }

  get Division() {
    return this.DropDownGroup.get("fcDivision");
  }

  get DownloadFilter() {
    return this.DropDownGroup.get("fcDownloadFilter");
  }

  get fbStartDate() {
    return this.DropDownGroup.get("fcStartDate");
  }

  get fbEndDate() {
    return this.DropDownGroup.get("fcEndDate");
  }

  ngOnInit() {
    try {
      // let dateString = "2020-03-20";
      // let newDate = new Date(dateString);
      // if (
      //   this.datePipe.transform(this.globaldate, "MMddyyyy") >=
      //   this.datePipe.transform(newDate, "MMddyyyy")
      // ) {
      //   this.globalmessage = "";
      // }

      // console.log(this.startDate.getDate());
      this.startDate.setDate(this.startDate.getDate() - 1);

      this.currentuserid = this.dataService.SelectedUserid;
      this.currentusername = this.dataService.loginName["_value"];
      this.progresstitle = "Please wait...";

      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );

      this.SplitFilesdisplaytotalrecordscount = 0;
      this.loadingSplitFilesGrid = true;
      this.Enabledisablebtn(true);
      this.RetriveAllClient();

      // this.RetriveSubClient();
      this.api.insertActivityLog(
        "My Files Pending Download List Viewed",
        "My Files Pending Download",
        "READ",
        "0"
      );
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
              // this.disableddivision = false;
              // this.disabledsubclient = false;
              // this.disabledstartdate = false;
              // this.disabledenddate = false;
              // this.disabledsplitsearch = false;
              // this.disabledapplybtn = false;
              // this.disabledclearbtn = false;
              // this.disabledsearchBy = false;
              const Allclt = new Client();
              Allclt.clientid = "0";
              Allclt.clientcode = "";
              Allclt.clientname = "All";
              this.sAllClients.unshift(Allclt);
              this.SelectAllClients = this.sAllClients;

              // if (this.searchfiltersvr.fileSelectedClientID != "0") {
              //   this.sSelectedClientID = this.searchfiltersvr.fileSelectedClientID;
              // } else {
              //   this.sSelectedClientID = "0";
              // }
              this.sSelectedClientID = "0";
              this.RetriveAllDivision(this.sSelectedClientID);
            } else {
              this.sAllClients = [];
              this.Enabledisablebtn(true);
              // this.disabledclient = true;
              // this.disableddivision = true;
              // this.disabledsubclient = true;
              // this.disabledstartdate = true;
              // this.disabledenddate = true;
              // this.disabledsplitsearch = true;
              // this.disabledapplybtn = true;
              // this.disabledclearbtn = true;
              // this.disabledsearchBy = true;
              this.SplitFilesResponse = [];
              this.SplitFilesItems = [];
              this.loading = false;
              this.loadingSplitFilesGrid = false;
              this.neraMasterFileid = "0";
              this.clsUtility.showInfo("No group is active");
            }
          },
          (err) => {
            this.loading = false;
            this.loadingSplitFilesGrid = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveAllDivision(client: string = "0") {
    try {
      class division {
        subclientdivisioncode: string;
      }
      let getdivision: { clientid: string; v_userid: string } = {
        clientid: client,
        v_userid: this.currentuserid,
      };
      let seq = this.api.post("GetDivisionCode", getdivision);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.sAllDivision = res;
            if (
              !isNullOrUndefined(this.sAllDivision) &&
              this.sAllDivision.length > 0
            ) {
              // this.disabledclient = false;
              // this.disableddivision = false;
              // this.disabledsubclient = false;
              // this.disabledstartdate = false;
              // this.disabledenddate = false;
              // this.disabledsplitsearch = false;
              // this.disabledapplybtn = false;
              // this.disabledclearbtn = false;
              // this.disabledsearchBy = false;
              const Alldiv = new division();
              Alldiv.subclientdivisioncode = "All";
              this.sAllDivision.unshift(Alldiv);
              this.SelectAllDivision = this.sAllDivision;
              this.sSelectedDivisionID = "All";
              // if (this.searchfiltersvr.fileSelectedClientID != "0") {
              //   this.sSelectedClientID = this.searchfiltersvr.fileSelectedClientID;
              // } else {
              //   this.sSelectedClientID = "0";
              // }
              this.RetriveSubClient();
            } else {
              this.sAllDivision = [];
              this.Enabledisablebtn(true);
              // this.disableddivision = true;
              // this.disabledsubclient = true;
              // this.disabledstartdate = true;
              // this.disabledenddate = true;
              // this.disabledsplitsearch = true;
              // this.disabledapplybtn = true;
              // this.disabledclearbtn = true;
              // this.disabledsearchBy = true;
              this.SplitFilesResponse = [];
              this.SplitFilesItems = [];
              this.loadingSplitFilesGrid = false;
              this.neraMasterFileid = "0";
              this.clsUtility.showInfo(
                "No Divisioncode/Subclient is available"
              );
            }
          },
          (err) => {
            this.loading = false;
            this.loadingSplitFilesGrid = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveSubClient() {
    try {
      let getsubclient: {
        userid: string;
        status: boolean;
        v_clientid: string;
        v_divisioncode: string;
      } = {
        userid: this.currentuserid,
        status: true,
        v_clientid: this.sSelectedClientID,
        v_divisioncode: this.sSelectedDivisionID,
      };
      let seq = this.api.post("SubClient/GetSubClientByUserId", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.sSubClients = res;
            if (
              !isNullOrUndefined(this.sSubClients) &&
              this.sSubClients.length > 0
            ) {
              if (this.sSubClients.length == 1) {
                this.sSelectedSubClientCode = this.sSubClients[0][
                  "subclientid"
                ];
              } else {
                const Subclt = new Subclient();
                Subclt.subclientid = "0";
                Subclt.subclientcode = "0";
                Subclt.subclientname = "All";
                this.sSubClients.unshift(Subclt);

                this.sSelectedSubClientCode = "0";
              }
              this.SelectAllSubClients = this.sSubClients;
              this.RetriveSplitFiles();
              // this.loadingSplitFilesGrid = false;
              // this.disabledclient = false;
              // this.disableddivision = false;
              // this.disabledsubclient = false;
              // this.disabledstartdate = false;
              // this.disabledenddate = false;
              // this.disabledsplitsearch = false;
              // this.disabledapplybtn = false;
              // this.disabledclearbtn = false;
              // this.disabledsearchBy = false;
              // this.RetriveSplitFiles();
            } else {
              this.sSubClients = [];
              this.loadingSplitFilesGrid = false;
              this.Enabledisablebtn(true);
              // this.disabledclient = true;
              // this.disableddivision = true;
              // this.disabledsubclient = true;
              // this.disabledstartdate = true;
              // this.disabledenddate = true;
              // this.disabledsplitsearch = true;
              // this.disabledapplybtn = true;
              // this.disabledclearbtn = true;
              // this.disabledsearchBy = true;
              this.clsUtility.showInfo("No group/practice is mapped to user");
            }
          },
          (err) => {
            this.loading = false;
            this.loadingSplitFilesGrid = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  public splitclose() {
    try {
      this.splitopened = false;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeSplit(event: PageChangeEvent): void {
    try {
      this.loadingSplitFilesGrid = true;
      this.SplitFilesGridView = null;
      this.SplitFilesSkip = event.skip;
      this.mySelection = [];
      this.disableddownload = true;
      this.disabledreftp = true;
      this.RetriveSplitFiles();
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  sortSplitChange(sort: SortDescriptor[]): void {
    try {
      this.sortSplit = sort;
      this.loadItemsSplit();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveSplitFiles() {
    let cstartdate;
    let cenddate;
    // console.log(this.fbEndDate.value);
    // console.log(this.fbStartDate.value);
    if (
      !isNullOrUndefined(this.fbStartDate.value) &&
      !isNullOrUndefined(this.fbEndDate.value)
    ) {
      cstartdate = new Date(this.fbStartDate.value);
      cenddate = new Date(this.fbEndDate.value);
    } else {
      cstartdate = "";
      cenddate = "";
    }

    this.SplitFilesGridView = null;
    this.SplitFilesItems = [];
    try {
      this.subscription.add(
        this.filedetailService
          .getMyFileList(
            this.currentuserid,
            this.datePipe.transform(cstartdate, "yyyyMMdd"),
            this.datePipe.transform(cenddate, "yyyyMMdd"),
            this.SplitFilesSkip,
            this.SplitFilesPageSize,
            this.sSelectedDivisionalSplitSearchBy,
            this.sSearchText,
            this.sSelectedSubClientCode,
            this.sSelectedClientID,
            this.sSelectedDivisionID,
            this.sSelectedDownloadfilter
          )
          .subscribe(
            (data) => {
              if (
                !isNullOrUndefined(data) &&
                !isNullOrUndefined(data.content)
              ) {
                this.SplitFilesResponse = data;
                if (
                  this.SplitFilesResponse != null &&
                  this.SplitFilesResponse != undefined
                ) {
                  this.SplitFilesItems = this.SplitFilesResponse["content"];
                  if (this.SplitFilesItems != null) {
                    if (this.SplitFilesItems.length > 0) {
                      this.SplitFilesdisplaytotalrecordscount = this.SplitFilesResponse[
                        "totalelements"
                      ];

                      this.SplitFilesItems.map((obj) => {
                        obj["checkamt"] = parseNumber(
                          !isNullOrUndefined(obj["checkamt"])
                            ? obj["checkamt"].replace("$", "").replace(",", "")
                            : "$0.00"
                        );
                      });

                      this.loadItemsSplit();
                      this.loadingSplitFilesGrid = false;
                      this.loading = false;
                      this.Enabledisablebtn(false);
                    } else {
                      this.SplitFilesItems = [];
                      this.loading = false;
                      this.SplitFilesdisplaytotalrecordscount = 0;
                      this.loadingSplitFilesGrid = false;
                      this.Enabledisablebtn(false);
                    }
                  } else {
                    this.SplitFilesItems = [];
                    this.SplitFilesdisplaytotalrecordscount = 0;
                    this.loadingSplitFilesGrid = false;
                    this.Enabledisablebtn(false);
                  }
                } else {
                  this.SplitFilesItems = [];
                  this.loading = false;
                  this.SplitFilesdisplaytotalrecordscount = 0;
                  this.loadingSplitFilesGrid = false;
                  this.Enabledisablebtn(false);
                }
              } else {
                this.SplitFilesdisplaytotalrecordscount = 0;
                this.loading = false;
                this.loadingSplitFilesGrid = false;
                this.Enabledisablebtn(false);
              }
            },
            (err) => {
              this.SplitFilesdisplaytotalrecordscount = 0;
              this.loading = false;
              this.loadingSplitFilesGrid = false;
              this.Enabledisablebtn(false);
            }
          )
      );
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
      this.Enabledisablebtn(false);
    }
  }

  private loadItemsSplit(): void {
    this.SplitFilesGridView = null;
    try {
      if (!isNullOrUndefined(this.SplitFilesItems)) {
        if (this.SplitFilesItems.length > 0) {
          this.SplitFilesGridView = {
            data: orderBy(this.SplitFilesItems, this.sortSplit),
            total: this.SplitFilesResponse["totalelements"],
          };
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async RetriveSplit835File_All(nerafileid, sfilename: string, status: string) {
    try {
      // this.loadingSplitFilesGrid = true;
      // this.subscription.add(
      await this.filedetailService
        .getSplit835File(nerafileid)
        .toPromise()
        .then(
          async (data) => {
            if (data != null && data != undefined) {
              this.selecteddownloadarray.push({
                datastring: data["s835string"],
                filename: sfilename,
              });

              const blob = new Blob([data["s835string"]], { type: "text" });
              if (blob.size != 0) {
                await FileSaver.saveAs(blob, sfilename);
                this.exportresponse.find(
                  (x) => x.nerafileid == nerafileid
                ).downloadstatus = true;
              }

              this.percentage = this.percentage + this.percentIncrease;
              this.cdr.detectChanges();
              this.updateDownloadtable_all();
            } else {
              this.selecteddownloadarray.push({
                datastring: "",
                filename: sfilename,
              });
              this.percentage = this.percentage + this.percentIncrease;
              this.cdr.detectChanges();
              this.updateDownloadtable_all();
            }
          },
          (err) => {
            this.loadingSplitFilesGrid = false;
            this.selecteddownloadarray.push({
              datastring: "",
              filename: sfilename,
            });
            this.percentage = this.percentage + this.percentIncrease;
            this.cdr.detectChanges();
            this.updateDownloadtable_all();
          }
        );
      // );
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.dataService.isFilesProcessing.next(false);
      this.clsUtility.LogError(error);
      this.selecteddownloadarray.push({
        datastring: "",
        filename: sfilename,
      });
      this.percentage = this.percentage + this.percentIncrease;
      this.cdr.detectChanges();
      this.updateDownloadtable_all();
    }
  }

  async RetriveSplit835File_Selected(
    nerafileid,
    sfilename: string,
    status: string
  ) {
    try {
      // this.loadingSplitFilesGrid = true;
      // this.subscription.add(
      await this.filedetailService
        .getSplit835File(nerafileid)
        .toPromise()
        .then(
          async (data) => {
            if (data != null && data != undefined) {
              this.selecteddownloadarray.push({
                datastring: data["s835string"],
                filename: sfilename,
              });

              const blob = new Blob([data["s835string"]], { type: "text" });
              if (blob.size != 0) {
                await FileSaver.saveAs(blob, sfilename);
                this.exportresponse.find(
                  (x) => x.nerafileid == nerafileid
                ).downloadstatus = true;
              }

              this.percentage = this.percentage + this.percentIncrease;
              this.cdr.detectChanges();
              this.updateDownloadtable_selected();
            } else {
              this.selecteddownloadarray.push({
                datastring: "",
                filename: sfilename,
              });
              this.percentage = this.percentage + this.percentIncrease;
              this.cdr.detectChanges();
              this.updateDownloadtable_selected();
            }
          },
          (err) => {
            this.loadingSplitFilesGrid = false;
            this.selecteddownloadarray.push({
              datastring: "",
              filename: sfilename,
            });
            this.percentage = this.percentage + this.percentIncrease;
            this.cdr.detectChanges();
            this.updateDownloadtable_selected();
          }
        );
    } catch (error) {
      this.selecteddownloadarray.push({
        datastring: "",
        filename: sfilename,
      });
      this.percentage = this.percentage + this.percentIncrease;
      this.cdr.detectChanges();

      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);

      this.updateDownloadtable_selected();
    }
  }

  OnViewSplitFile() {
    try {
      this.s835splitstring = this.sSplitfile.replace(/~/g, "~\n");
      this.On835splitFile();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnDownloadSplitFile(Splitfilename, nerafileid, masterfileid) {
    try {
      const blob = new Blob([this.sSplitfile], { type: "text" });
      FileSaver.saveAs(blob, Splitfilename + ".txt");

      this.exportresponse = [];
      this.exportresponse.push({
        masterfileid: masterfileid,
        nerafileid: nerafileid,
      });

      this.filedetailService
        .UpdateDownloadData(
          this.exportresponse,
          this.currentuserid,
          this.currentusername
        )
        .toPromise()
        .then(
          (data) => {
            if (data != null && data != undefined) {
              if (data == 1) {
                this.exportresponse = [];
                this.recordslist.masterfileid = 0;
                this.recordslist.nerafileid = 0;
                this.SplitFilesSkip = 0;
                this.RetriveSplitFiles();
              }
            }
          },
          (err) => {
            this.clsUtility.showError(err);
          }
        );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  On835splitFile() {
    try {
      this.splitopened = true;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSubClientChange(event: any) {
    try {
      this.sSelectedSubClientCode = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSplitSearch($event: any = null) {
    try {
      if (!isNullOrUndefined($event)) {
        if ($event.type == "keyup") {
          this.sSearchText = null;
          this.sSearchText = this.fbcSplitFilterSearch.value.trim();
        } else if ($event.type == "click") {
          this.sSearchText = null;
          this.sSearchText = this.fbcSplitFilterSearch.value.trim();
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleSubclientFilter(value) {
    this.sSubClients = this.SelectAllSubClients.filter(
      (s) => s.subclientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  checkdates(value: Date, sdate: string) {
    try {
      if (this.fbStartDate.value == null) {
        if (this.fbEndDate.value == null) {
          this.disabledapplybtn = false;
          this.showValidation = false;
        } else {
          this.disabledapplybtn = true;
          this.showValidation = true;
        }
      } else {
        if (this.fbEndDate.value == null) {
          this.disabledapplybtn = true;
          this.showValidation = true;
        } else {
          this.disabledapplybtn = false;
          this.showValidation = false;
        }
      }

      if (this.fbStartDate.value != null && this.fbEndDate.value != null) {
        if (sdate == "start date" && value > new Date(this.fbEndDate.value)) {
          this.clsUtility.showWarning(
            "Check From date must be less than To date"
          );
        } else if (sdate == "end date" && value < this.startDate) {
          this.clsUtility.showWarning(
            "Check To date must be greater than From date"
          );
        }
      }
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
        this.sSearchText = "";
        this.sSearchText = this.fbcSplitFilterSearch.value.trim();
      } else {
        this.sSearchText = "";
        this.sSearchText = this.fbcSplitFilterSearch.value.trim();
      }

      if (
        this.sSelectedSubClientCode != null &&
        this.sSelectedSubClientCode != undefined &&
        this.sSearchText != null &&
        this.sSearchText != undefined &&
        this.sSelectedDownloadfilter != null &&
        this.sSelectedDownloadfilter != undefined
      ) {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = true;
        this.mySelection = [];
        this.disableddownload = true;
        this.disabledreftp = true;
        this.Enabledisablebtn(true);
        this.RetriveSplitFiles();
      } else {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = false;
        this.SplitFilesResponse = [];
      }
    } catch (error) {
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  clearSplitFilters() {
    try {
      this.disabledapplybtn = false;
      this.showValidation = false;
      this.sSelectedClientID = "0";
      this.sSelectedDivisionID = "All";
      this.sSelectedSubClientCode = "0";
      this.sSelectedSplitStatus = "3";
      this.sSearchText = "";
      this.sSelectedDivisionalSplitSearchBy = "Fileshare";
      this.fbcSplitFilterSearch.setValue(this.sSearchText);
      // this.startDate = new Date();
      // this.startDate.setDate(this.startDate.getDate() - 1);
      // this.endDate = new Date();
      this.fbStartDate.setValue(null);
      this.fbEndDate.setValue(null);
      this.sSelectedDownloadfilter = "Not Downloaded";

      this.SplitFilesSkip = 0;
      this.SplitFilesdisplaytotalrecordscount = 0;
      this.loadingSplitFilesGrid = true;
      this.mySelection = [];
      this.disableddownload = true;
      this.disabledreftp = true;
      this.Enabledisablebtn(true);
      this.RetriveAllClient();
      // this.RetriveSplitFiles();
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  // public onDateChange(value: Date, date: string): void {
  //   try {
  //     if (value != null) {
  //       if (date == "start date" && value > this.endDate) {
  //         this.clsUtility.showWarning(
  //           "Check from date must be less than to date"
  //         );
  //         this.startDate = new Date();
  //       } else if (date == "end date" && value < this.startDate) {
  //         this.clsUtility.showWarning(
  //           "Check to date must be greater than from date"
  //         );
  //         this.endDate = new Date();
  //       }
  //     } else {
  //       if (date == "start date") {
  //         this.startDate = new Date();
  //       } else if (date == "end date") {
  //         this.endDate = new Date();
  //       }
  //       this.clsUtility.LogError("Select valid date");
  //     }
  //   } catch (error) {
  //     this.clsUtility.LogError(error);
  //   }
  // }

  public onSelectedKeysChange(e) {
    try {
      if (this.mySelection.length > 0) {
        this.disableddownload = false;
        this.disabledreftp = false;
      } else {
        this.disableddownload = true;
        this.disabledreftp = true;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onDivisionalSplitSearchByChange(event: any) {
    try {
      this.sSelectedDivisionalSplitSearchBy = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onClientChange(event: any) {
    try {
      if (this.ClientName.value == undefined || this.ClientName.value == "") {
        this.toastr.warning("Please Select Group");
      } else {
        this.sSelectedClientID = event;
        this.RetriveAllDivision(this.sSelectedClientID);
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

  onDivisionChange(event: any) {
    try {
      if (this.Division.value == undefined || this.Division.value == "") {
        this.toastr.warning("Please Select Division");
      } else {
        this.sSelectedDivisionID = event;
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

  onDownloadFilterChange(event: any) {
    try {
      this.sSelectedDownloadfilter = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async DownloadSelectedFiles() {
    try {
      this.percentage = 0;
      this.percentIncrease = 0;

      if (this.mySelection != null && this.mySelection != undefined) {
        this.disabledreftp = true;
        if (this.mySelection.length > 0) {
          this.isFilesProcessing = true;
          this.dataService.isFilesProcessing.next(true);
          this.percentage = 0;
          this.percentIncrease = 100 / this.mySelection.length;
          this.cdr.detectChanges();

          for (let i = 0; i < this.mySelection.length; i++) {
            this.exportresponse.push({
              masterfileid: this.mySelection[i].masterfileid,
              nerafileid: this.mySelection[i].nerafileid,
              sfilename: this.mySelection[i].splitfilename,
              downloadstatus: false,
            });
            let res = await this.RetriveSplit835File_Selected(
              this.mySelection[i].nerafileid,
              this.mySelection[i].splitfilename,
              "Download"
            );
          }
        }
      }
    } catch (error) {
      this.isFilesProcessing = false;
      this.dataService.isFilesProcessing.next(false);
      this.clsUtility.LogError(error);
    }
  }

  async DownloadSelectedFilesZip() {
    try {
      this.percentage = 0;
      this.percentIncrease = 0;

      if (this.mySelection != null && this.mySelection != undefined) {
        this.disabledreftp = true;
        if (this.mySelection.length > 0) {
          this.isFilesProcessing = true;
          this.dataService.isFilesProcessing.next(true);
          this.percentage = 0;
          this.percentIncrease = 100 / this.mySelection.length;
          this.cdr.detectChanges();

          for (let i = 0; i < this.mySelection.length; i++) {
            this.exportresponse.push({
              masterfileid: this.mySelection[i].masterfileid,
              nerafileid: this.mySelection[i].nerafileid,
              sfilename: this.mySelection[i].splitfilename,
              downloadstatus: false,
            });
            let res = await this.RetriveSplit835FileDownload_Selected(
              this.mySelection[i].nerafileid,
              this.mySelection[i].splitfilename,
              "Download"
            );
          }
        }
      }
    } catch (error) {
      this.isFilesProcessing = false;
      this.dataService.isFilesProcessing.next(false);
      this.clsUtility.LogError(error);
    }
  }

  async RetriveSplit835FileDownload_All(
    nerafileid,
    sfilename: string,
    status: string
  ): Promise<any> {
    try {
      // this.subscription.add(
      await this.filedetailService
        .getSplit835File(nerafileid)
        .toPromise()
        .then(
          async (data) => {
            if (data != null && data != undefined) {
              this.Zipdownloadarray.push({
                datastring: data["s835string"],
                filename: sfilename,
                nerafileid: nerafileid,
              });

              this.percentage = this.percentage + this.percentIncrease;
              this.cdr.detectChanges();
              this.updateDownloadtable_allzip();
            } else {
              this.Zipdownloadarray.push({
                datastring: "",
                filename: sfilename,
                nerafileid: nerafileid,
              });
              this.percentage = this.percentage + this.percentIncrease;
              this.cdr.detectChanges();
              this.updateDownloadtable_allzip();
            }

            return Promise.resolve(1);
          },
          (err) => {
            this.dataService.isFilesProcessing.next(false);
            this.clsUtility.LogError(err);

            this.Zipdownloadarray.push({
              datastring: "",
              filename: sfilename,
              nerafileid: nerafileid,
            });
            this.percentage = this.percentage + this.percentIncrease;
            this.cdr.detectChanges();
            this.updateDownloadtable_allzip();
          }
        );
      // );
    } catch (error) {
      this.dataService.isFilesProcessing.next(false);
      this.clsUtility.LogError(error);

      this.Zipdownloadarray.push({
        datastring: "",
        filename: sfilename,
        nerafileid: nerafileid,
      });
      this.percentage = this.percentage + this.percentIncrease;
      this.cdr.detectChanges();
      this.updateDownloadtable_allzip();
    }
  }

  async updatedatatable(type: string = "All") {
    try {
      this.downloadcountObj = { total: 0, success: 0, error: 0 };
      this.downloadcountObj.total = this.exportresponse.length;
      this.downloadedfilesarray = this.exportresponse.filter(
        (obj) => obj.downloadstatus == true
      );
      this.downloadcountObj.success = this.downloadedfilesarray.length;
      this.downloadcountObj.error = this.exportresponse.filter(
        (obj) => obj.downloadstatus == false
      ).length;

      await this.filedetailService
        .UpdateDownloadData(
          this.downloadedfilesarray,
          this.currentuserid,
          this.currentusername
        )
        .toPromise()
        .then(
          (data) => {
            if (data != null && data != undefined) {
              if (data == 1) {
                this.filedetailService.exportresponsedata = [];
                this.Zipdownloadarray = [];
                this.recordslist.masterfileid = 0;
                this.recordslist.nerafileid = 0;

                this.SplitFilesSkip = 0;
                this.mySelection = [];
                this.disableddownload = true;
                this.downloadloadProcessedItems();
                setTimeout(() => {
                  this.isFilesProcessing = false;
                  this.dataService.isFilesProcessing.next(false);
                  this.percentage = 0;
                  this.cdr.detectChanges();
                  this.progresstitle = "Please wait...";

                  $("#downloadstatusModal").modal("show");
                }, 3000);

                if (type == "All") {
                  this.api.insertActivityLog(
                    "Split Files Downloaded through Download All Zip option",
                    "My Files Pending Download",
                    "READ"
                  );
                } else {
                  this.api.insertActivityLog(
                    "Split Files Downloaded through Download Zip option",
                    "My Files Pending Download",
                    "READ"
                  );
                }
                // this.RetriveSplitFiles();
              }
            }
          },
          (err) => {
            this.isFilesProcessing = false;
            this.dataService.isFilesProcessing.next(false);
            this.clsUtility.showError(err);
          }
        );
    } catch (error) {
      this.isFilesProcessing = false;
      this.dataService.isFilesProcessing.next(false);
      this.clsUtility.LogError(error);
    }
  }

  async RetriveSplit835FileDownload_Selected(
    nerafileid,
    sfilename: string,
    status: string
  ): Promise<any> {
    try {
      // this.subscription.add(
      await this.filedetailService
        .getSplit835File(nerafileid)
        .toPromise()
        .then(
          async (data) => {
            if (data != null && data != undefined) {
              this.Zipdownloadarray.push({
                datastring: data["s835string"],
                filename: sfilename,
                nerafileid: nerafileid,
              });

              this.percentage = this.percentage + this.percentIncrease;
              this.cdr.detectChanges();

              this.updateDownloadtable_selectedzip();
            } else {
              this.Zipdownloadarray.push({
                datastring: "",
                filename: sfilename,
                nerafileid: nerafileid,
              });
              this.percentage = this.percentage + this.percentIncrease;
              this.cdr.detectChanges();

              this.updateDownloadtable_selectedzip();
            }
            return Promise.resolve(1);
          },
          (err) => {
            this.dataService.isFilesProcessing.next(false);
            this.clsUtility.LogError(err);

            this.Zipdownloadarray.push({
              datastring: "",
              filename: sfilename,
              nerafileid: nerafileid,
            });
            this.percentage = this.percentage + this.percentIncrease;
            this.cdr.detectChanges();

            this.updateDownloadtable_selectedzip();
          }
        );
      // );
    } catch (error) {
      this.dataService.isFilesProcessing.next(false);
      this.clsUtility.LogError(error);
      this.Zipdownloadarray.push({
        datastring: "",
        filename: sfilename,
        nerafileid: nerafileid,
      });
      this.percentage = this.percentage + this.percentIncrease;
      this.cdr.detectChanges();

      this.updateDownloadtable_selectedzip();
    }
  }

  async DownloadAllFilesZip() {
    try {
      this.percentage = 0;
      this.percentIncrease = 0;
      let cstartdate;
      let cenddate;
      if (
        !isNullOrUndefined(this.fbStartDate.value) &&
        !isNullOrUndefined(this.fbEndDate.value)
      ) {
        cstartdate = new Date(this.fbStartDate.value);
        cenddate = new Date(this.fbEndDate.value);
      } else {
        cstartdate = "";
        cenddate = "";
      }
      await this.filedetailService
        .getMyFileList(
          this.currentuserid,
          this.datePipe.transform(cstartdate, "yyyyMMdd"),
          this.datePipe.transform(cenddate, "yyyyMMdd"),
          0,
          this.SplitFilesdisplaytotalrecordscount,
          this.sSelectedDivisionalSplitSearchBy,
          this.sSearchText,
          this.sSelectedSubClientCode,
          this.sSelectedClientID,
          this.sSelectedDivisionID,
          this.sSelectedDownloadfilter
        )
        .toPromise()
        .then(
          async (data) => {
            if (!isNullOrUndefined(data)) {
              this.alldownloadresponse = data;
              if (
                this.alldownloadresponse != null &&
                this.alldownloadresponse != undefined
              ) {
                this.alldownloadarray = this.alldownloadresponse["content"];

                if (this.alldownloadarray != null) {
                  if (this.alldownloadarray.length > 0) {
                    this.isFilesProcessing = true;
                    this.dataService.isFilesProcessing.next(true);
                    this.percentage = 0;
                    this.percentIncrease = 100 / this.alldownloadarray.length;
                    this.cdr.detectChanges();

                    for (let i = 0; i < this.alldownloadarray.length; i++) {
                      this.exportresponse.push({
                        masterfileid: this.alldownloadarray[i].masterfileid,
                        nerafileid: this.alldownloadarray[i].nerafileid,
                        sfilename: this.alldownloadarray[i].splitfilename,
                        downloadstatus: false,
                      });
                      let res = await this.RetriveSplit835FileDownload_All(
                        this.alldownloadarray[i].nerafileid,
                        this.alldownloadarray[i].splitfilename,
                        "Download"
                      );
                    }
                  }
                }
                this.SplitFilesdisplaytotalrecordscount = 0;
              } else {
                this.SplitFilesdisplaytotalrecordscount = 0;
                this.alldownloadarray = [];
              }
              this.disableddownload = true;
              this.disabledreftp = true;
            }
          },
          (err) => {
            this.disableddownload = true;
            this.disabledreftp = true;
            this.SplitFilesdisplaytotalrecordscount = 0;
            this.loadingSplitFilesGrid = false;
          }
        );
    } catch (error) {
      this.disableddownload = true;
      this.disabledreftp = true;
      this.loadingSplitFilesGrid = false;
      this.dataService.isFilesProcessing.next(false);
      this.clsUtility.LogError(error);
    }
  }

  async DownloadAllFiles() {
    try {
      this.percentage = 0;
      this.percentIncrease = 0;
      let cstartdate;
      let cenddate;
      if (
        !isNullOrUndefined(this.fbStartDate.value) &&
        !isNullOrUndefined(this.fbEndDate.value)
      ) {
        cstartdate = new Date(this.fbStartDate.value);
        cenddate = new Date(this.fbEndDate.value);
      } else {
        cstartdate = "";
        cenddate = "";
      }
      await this.filedetailService
        .getMyFileList(
          this.currentuserid,
          this.datePipe.transform(cstartdate, "yyyyMMdd"),
          this.datePipe.transform(cenddate, "yyyyMMdd"),
          0,
          this.SplitFilesdisplaytotalrecordscount,
          this.sSelectedDivisionalSplitSearchBy,
          this.sSearchText,
          this.sSelectedSubClientCode,
          this.sSelectedClientID,
          this.sSelectedDivisionID,
          this.sSelectedDownloadfilter
        )
        .toPromise()
        .then(
          async (data) => {
            if (!isNullOrUndefined(data)) {
              this.alldownloadresponse = data;
              if (
                this.alldownloadresponse != null &&
                this.alldownloadresponse != undefined
              ) {
                this.alldownloadarray = this.alldownloadresponse["content"];

                if (this.alldownloadarray != null) {
                  if (this.alldownloadarray.length > 0) {
                    this.isFilesProcessing = true;
                    this.dataService.isFilesProcessing.next(true);
                    this.percentage = 0;
                    this.percentIncrease = 100 / this.alldownloadarray.length;
                    this.cdr.detectChanges();

                    for (let i = 0; i < this.alldownloadarray.length; i++) {
                      // this.exportresponse.push({masterfileid: this.alldownloadarray[i].masterfileid, nerafileid: this.alldownloadarray[i].nerafileid});
                      // let res = await this.RetriveSplit835FileDownload_All(this.alldownloadarray[i].nerafileid, i + "_" + this.alldownloadarray[i].splitfilename, 'Download');

                      this.exportresponse.push({
                        masterfileid: this.alldownloadarray[i].masterfileid,
                        nerafileid: this.alldownloadarray[i].nerafileid,
                        sfilename: this.alldownloadarray[i].splitfilename,
                        downloadstatus: false,
                      });
                      let res = await this.RetriveSplit835File_All(
                        this.alldownloadarray[i].nerafileid,
                        this.alldownloadarray[i].splitfilename,
                        "Download"
                      );
                    }
                    this.disableddownload = true;
                    this.disabledreftp = true;
                  }
                }
              } else {
                this.alldownloadarray = [];
              }
            }
          },
          (err) => {
            this.disableddownload = true;
            this.disabledreftp = true;
            this.SplitFilesdisplaytotalrecordscount = 0;
            this.loadingSplitFilesGrid = false;
          }
        );
    } catch (error) {
      this.disableddownload = true;
      this.disabledreftp = true;
      this.loadingSplitFilesGrid = false;
      this.dataService.isFilesProcessing.next(false);
      this.clsUtility.LogError(error);
    }
  }

  RetriveSplit835File(masterfileid, nerafileid, sfilename: string) {
    try {
      this.loadingSplitFilesGrid = true;
      this.subscription.add(
        this.filedetailService.getSplit835File(nerafileid).subscribe(
          (data) => {
            if (!isNullOrUndefined(data) && data != "") {
              this.sSplitfile = data["s835string"];
              this.stitleSplitfile = sfilename;

              this.OnDownloadSplitFile(sfilename, nerafileid, masterfileid);

              this.exportresponse.push({
                masterfileid: masterfileid,
                nerafileid: nerafileid,
              });

              // this.filedetailService
              //   .UpdateDownloadData(
              //     this.exportresponse,
              //     this.currentuserid,
              //     this.currentusername
              //   )
              //   .toPromise()
              //   .then(
              //     data => {
              //       if (data != null && data != undefined) {
              //         if (data == 1) {
              //           this.filedetailService.exportresponsedata = [];
              //           this.exportresponse = [];
              //           this.Zipdownloadarray = [];
              //           this.recordslist.masterfileid = 0;
              //           this.recordslist.nerafileid = 0;

              //           this.SplitFilesSkip = 0;
              //           this.mySelection = [];
              //           this.disableddownload = true;

              //           setTimeout(() => {
              //             this.isFilesProcessing = false;
              //             this.percentage = 0;
              //             this.cdr.detectChanges();
              //           }, 3000);

              //           this.api.insertActivityLog(
              //             "Split File (" + this.stitleSplitfile + ") Downloaded",
              //             "My Files Pending Download",
              //             "READ",
              //             nerafileid
              //           );

              //           this.RetriveSplitFiles();
              //         }
              //       }
              //     },
              //     err => {
              //       this.clsUtility.showError(err);
              //     }
              //   );
              this.api.insertActivityLog(
                "Split File Downloaded",
                "My Files Pending Downloaded",
                "READ",
                nerafileid
              );
              this.SplitFilesdisplaytotalrecordscount = 0;
              this.loadingSplitFilesGrid = false;
            }
          },
          (err) => {
            this.loadingSplitFilesGrid = false;
          }
        )
      );
    } catch (error) {
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  DownloadClick(DownloadType: any) {
    try {
      if (this.SplitFilesItems != null) {
        if (this.SplitFilesItems.length > 0) {
          if (DownloadType == "Download All") {
            this.DownloadClickType = "Download All";
            this.DownloadConfirmationMessage =
              "Do you want to download all " +
              this.SplitFilesdisplaytotalrecordscount +
              " files?";
          } else if (DownloadType == "Download Zip") {
            this.DownloadClickType = "Download Zip";
            this.DownloadConfirmationMessage =
              "Do you want to download all " +
              this.SplitFilesdisplaytotalrecordscount +
              " files in zip folder?";
          }
          $("#downloadconfirmationModal").modal("show");
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onDownloadYesConfirmationClick() {
    if (this.DownloadClickType == "Download All") {
      this.DownloadAllFiles();
    } else if (this.DownloadClickType == "Download Zip") {
      this.DownloadAllFilesZip();
    }
  }

  onDownloadCloseConfirmationClick() {
    try {
      $("#downloadconfirmationModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async reftpcall() {
    try {
      this.isFilesProcessing = true;
      this.dataService.isFilesProcessing.next(true);
      this.percentage = 0;
      var percentIncrease = 100 / this.mySelection.length;
      this.cdr.detectChanges();
      class ProcessStatus {
        sfilename: string;
        status: number;
        description: string;
      }
      this.splitFileStatus = [];
      this.countObj = {
        total: 0,
        success: 0,
        error: 0,
      };
      this.StatusGridView = null;
      this.countObj.total = this.mySelection.length;
      for (let i = 0; i < this.mySelection.length; i++) {
        this.fileInProgress = this.mySelection[i].nsplitid;
        this.reftpsplitfileids = [];
        this.reftpsplitfileids.push(this.mySelection[i].nsplitid);
        let inputJson: {
          splitids: any[];
        } = {
          splitids: this.reftpsplitfileids,
        };
        await this.api
          .post_edi("api/Parser/ReFTP", inputJson)
          .toPromise()
          .then(
            (data) => {
              if (data == 1) {
                let statusObj = new ProcessStatus();
                statusObj.sfilename = this.mySelection[i].splitfilename;
                statusObj.status = 1;
                statusObj.description = "Split file uploaded successfully";
                this.splitFileStatus.push(statusObj);
                this.countObj.success++;
                this.api.insertActivityLog(
                  "Split File (" +
                    this.mySelection[i].splitfilename +
                    ") re-uploaded.",
                  "My Files",
                  "READ",
                  this.mySelection[i].nsplitid
                );
              } else {
                let statusObj = new ProcessStatus();
                statusObj.sfilename = this.mySelection[i].splitfilename;
                statusObj.status = 0;
                statusObj.description = "Error while uploding split file";
                this.splitFileStatus.push(statusObj);
                this.countObj.error++;
              }
              this.percentage = this.percentage + percentIncrease;
              this.cdr.detectChanges();
            },
            (error) => {
              let statusObj = new ProcessStatus();
              statusObj.sfilename = this.mySelection[i].splitfilename;
              statusObj.status = 0;
              statusObj.description = "Error while uploding split file";
              this.splitFileStatus.push(statusObj);
              this.countObj.error++;
              this.percentage = this.percentage + percentIncrease;
              this.cdr.detectChanges();
            }
          );
      }
      this.loadProcessedItems();
      setTimeout(() => {
        this.isFilesProcessing = false;
        this.dataService.isFilesProcessing.next(false);
        this.percentage = 0;
        this.cdr.detectChanges();
        $("#statusModal").modal("show");
      }, 3000);

      this.mySelection = [];
      this.onSelectedKeysChange("");
    } catch (error) {
      this.isFilesProcessing = false;
      this.dataService.isFilesProcessing.next(false);
      this.clsUtility.LogError(error);
    }
  }

  loadProcessedItems(): void {
    this.StatusGridView = null;
    try {
      if (!isNullOrUndefined(this.splitFileStatus)) {
        this.StatusGridView = {
          data: orderBy(this.splitFileStatus, this.processStatusSort),
          total: this.splitFileStatus.length,
        };
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortProcessChange(sort: SortDescriptor[]): void {
    try {
      this.processStatusSort = sort;
      this.loadProcessedItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  Enabledisablebtn(status: boolean = false) {
    try {
      this.disabledclient = status;
      this.disableddivision = status;
      this.disabledsubclient = status;
      this.disabledstartdate = status;
      this.disabledenddate = status;
      this.disabledsplitsearch = status;
      this.disabledapplybtn = status;
      this.disabledclearbtn = status;
      this.disabledsearchBy = status;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  DownloadSelectedClick(DownloadType: any) {
    try {
      if (this.mySelection != null) {
        if (this.mySelection.length > 0) {
          if (this.mySelection.length > this.DownloadSelectedLimit) {
            if (DownloadType == "Download Selected") {
              this.DownloadSelectedClickType = "Download Selected";
              this.DownloadConfirmationMessage =
                "Do you want to download all " +
                this.mySelection.length +
                " files?";
            } else if (DownloadType == "Download Selected Zip") {
              this.DownloadSelectedClickType = "Download Selected Zip";
              this.DownloadConfirmationMessage =
                "Do you want to download all " +
                this.mySelection.length +
                " files in zip folder?";
            }
            $("#downloadselectedconfirmationModal").modal("show");
          } else {
            this.DownloadSelectedClickType = DownloadType;
            this.onDownloadselectedYesConfirmationClick();
          }
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onDownloadselectedYesConfirmationClick() {
    if (this.DownloadSelectedClickType == "Download Selected") {
      this.DownloadSelectedFiles();
    } else if (this.DownloadSelectedClickType == "Download Selected Zip") {
      this.DownloadSelectedFilesZip();
    }
  }

  onDownloadselectedCloseConfirmationClick() {
    try {
      $("#downloadselectedconfirmationModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private downloadloadProcessedItems(): void {
    this.downloadedStatusGridView = null;
    try {
      this.downloadedStatusGridView = process(this.exportresponse, this.state);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    try {
      this.state = state;
      this.downloadedStatusGridView = process(this.exportresponse, this.state);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async updateDownloadtable_selected() {
    try {
      if (this.mySelection.length == this.selecteddownloadarray.length) {
        if (this.selecteddownloadarray.length > 0) {
          this.downloadcountObj = { total: 0, success: 0, error: 0 };
          this.downloadcountObj.total = this.exportresponse.length;
          this.downloadedfilesarray = this.exportresponse.filter(
            (obj) => obj.downloadstatus == true
          );
          this.downloadcountObj.success = this.downloadedfilesarray.length;
          this.downloadcountObj.error = this.exportresponse.filter(
            (obj) => obj.downloadstatus == false
          ).length;

          if (this.downloadedfilesarray.length > 0) {
            await this.filedetailService
              .UpdateDownloadData(
                this.downloadedfilesarray,
                this.currentuserid,
                this.currentusername
              )
              .toPromise()
              .then(
                (data) => {
                  if (data != null && data != undefined) {
                    if (data == 1) {
                      this.filedetailService.exportresponsedata = [];
                      this.selecteddownloadarray = [];
                      this.recordslist.masterfileid = 0;
                      this.recordslist.nerafileid = 0;
                      this.mySelection = [];
                      this.disableddownload = true;
                      this.SplitFilesSkip = 0;

                      this.downloadloadProcessedItems();
                      setTimeout(() => {
                        this.isFilesProcessing = false;
                        this.dataService.isFilesProcessing.next(false);
                        this.percentage = 0;
                        this.cdr.detectChanges();
                        $("#downloadstatusModal").modal("show");
                      }, 3000);

                      this.api.insertActivityLog(
                        "Split Files Downloaded through Download option",
                        "My Files Pending Download",
                        "READ"
                      );

                      this.RetriveSplitFiles();
                    }
                  } else {
                    this.loading = false;
                    this.loadingSplitFilesGrid = false;
                  }
                },
                (err) => {
                  this.clsUtility.showError(err);
                }
              );
          } else {
            this.filedetailService.exportresponsedata = [];
            this.downloadedfilesarray = [];
            this.selecteddownloadarray = [];
            this.recordslist.masterfileid = 0;
            this.recordslist.nerafileid = 0;
            this.mySelection = [];
            this.disableddownload = true;
            this.SplitFilesSkip = 0;

            this.downloadloadProcessedItems();
            setTimeout(() => {
              this.isFilesProcessing = false;
              this.dataService.isFilesProcessing.next(false);
              this.percentage = 0;
              this.cdr.detectChanges();
              $("#downloadstatusModal").modal("show");
            }, 3000);
          }
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  clickclose() {
    try {
      this.exportresponse = [];
      this.downloadedfilesarray = [];
      this.state.skip = 0;
      this.RetriveSplitFiles();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  clickcloseresend() {
    try {
      this.splitFileStatus = [];
      this.RetriveSplitFiles();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  updateDownloadtable_selectedzip() {
    try {
      var zipfilename =
        "MyFilesList_" + moment(new Date()).format("MMDDYYYY") + ".zip";

      if (this.mySelection.length == this.Zipdownloadarray.length) {
        this.progresstitle = "Generating zip file";
        if (this.Zipdownloadarray.length > 0) {
          var zip = new JSZip();
          for (let j = 0; j < this.Zipdownloadarray.length; j++) {
            if (
              this.Zipdownloadarray[j].datastring != undefined &&
              this.Zipdownloadarray[j].datastring != null
            ) {
              if (this.Zipdownloadarray[j].datastring.length > 0) {
                zip.file(
                  this.Zipdownloadarray[j].filename,
                  this.Zipdownloadarray[j].datastring
                );
                this.exportresponse.find(
                  (x) => x.nerafileid == this.Zipdownloadarray[j].nerafileid
                ).downloadstatus = true;
              }
            }
          }

          setTimeout(() => {
            if (
              this.exportresponse.filter((x) => x.downloadstatus == true)
                .length > 0
            ) {
              let promise = zip
                .generateAsync({ type: "blob" })
                .then(function (content) {
                  saveAs(content, zipfilename);
                });

              promise.then(() => {
                this.updatedatatable("Selected");
              });
            } else {
              this.downloadcountObj = { total: 0, success: 0, error: 0 };
              this.downloadcountObj.total = this.exportresponse.length;
              this.downloadcountObj.success = this.downloadedfilesarray.length;
              this.downloadcountObj.error = this.exportresponse.filter(
                (obj) => obj.downloadstatus == false
              ).length;

              this.filedetailService.exportresponsedata = [];
              this.Zipdownloadarray = [];
              this.recordslist.masterfileid = 0;
              this.recordslist.nerafileid = 0;

              this.SplitFilesSkip = 0;
              this.mySelection = [];
              this.disableddownload = true;
              this.downloadloadProcessedItems();
              setTimeout(() => {
                this.isFilesProcessing = false;
                this.dataService.isFilesProcessing.next(false);
                this.percentage = 0;
                this.cdr.detectChanges();
                this.progresstitle = "Please wait...";

                $("#downloadstatusModal").modal("show");
              }, 3000);
              // this.RetriveSplitFiles();
            }
          }, 4000);
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async updateDownloadtable_all() {
    try {
      if (this.alldownloadarray.length == this.selecteddownloadarray.length) {
        this.downloadcountObj = { total: 0, success: 0, error: 0 };
        this.downloadcountObj.total = this.exportresponse.length;
        this.downloadedfilesarray = this.exportresponse.filter(
          (obj) => obj.downloadstatus == true
        );
        this.downloadcountObj.success = this.downloadedfilesarray.length;
        this.downloadcountObj.error = this.exportresponse.filter(
          (obj) => obj.downloadstatus == false
        ).length;

        if (this.downloadedfilesarray.length > 0) {
          await this.filedetailService
            .UpdateDownloadData(
              this.downloadedfilesarray,
              this.currentuserid,
              this.currentusername
            )
            .toPromise()
            .then(
              (data) => {
                if (data != null && data != undefined) {
                  if (data == 1) {
                    this.filedetailService.exportresponsedata = [];
                    this.selecteddownloadarray = [];
                    this.recordslist.masterfileid = 0;
                    this.recordslist.nerafileid = 0;
                    this.SplitFilesSkip = 0;

                    this.downloadloadProcessedItems();
                    setTimeout(() => {
                      this.isFilesProcessing = false;
                      this.dataService.isFilesProcessing.next(false);
                      this.percentage = 0;
                      this.cdr.detectChanges();
                      $("#downloadstatusModal").modal("show");
                    }, 3000);

                    this.api.insertActivityLog(
                      "Split Files Downloaded through Download All option",
                      "My Files Pending Download",
                      "READ"
                    );

                    // this.RetriveSplitFiles();
                  }
                }
              },
              (err) => {
                this.clsUtility.showError(err);
              }
            );
        } else {
          this.filedetailService.exportresponsedata = [];
          this.downloadedfilesarray = [];
          this.selecteddownloadarray = [];
          this.recordslist.masterfileid = 0;
          this.recordslist.nerafileid = 0;
          this.mySelection = [];
          this.disableddownload = true;
          this.SplitFilesSkip = 0;

          this.downloadloadProcessedItems();
          setTimeout(() => {
            this.isFilesProcessing = false;
            this.dataService.isFilesProcessing.next(false);
            this.percentage = 0;
            this.cdr.detectChanges();
            $("#downloadstatusModal").modal("show");
          }, 3000);
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  updateDownloadtable_allzip() {
    try {
      var zipfilename =
        "MyFilesList_" + moment(new Date()).format("MMDDYYYY") + ".zip";

      if (this.alldownloadarray.length == this.Zipdownloadarray.length) {
        this.progresstitle = "Generating zip file";
        if (this.Zipdownloadarray.length > 0) {
          var zip = new JSZip();
          for (let j = 0; j < this.Zipdownloadarray.length; j++) {
            if (
              this.Zipdownloadarray[j].datastring != undefined &&
              this.Zipdownloadarray[j].datastring != null
            ) {
              if (this.Zipdownloadarray[j].datastring.length > 0) {
                zip.file(
                  this.Zipdownloadarray[j].filename,
                  this.Zipdownloadarray[j].datastring
                );
                this.exportresponse.find(
                  (x) => x.nerafileid == this.Zipdownloadarray[j].nerafileid
                ).downloadstatus = true;
              }
            }
          }

          setTimeout(() => {
            if (
              this.exportresponse.filter((x) => x.downloadstatus == true)
                .length > 0
            ) {
              let promise = zip
                .generateAsync({ type: "blob" })
                .then(function (content) {
                  saveAs(content, zipfilename);
                });

              promise.then(() => {
                this.updatedatatable("All");
              });
            } else {
              this.downloadcountObj = { total: 0, success: 0, error: 0 };
              this.downloadcountObj.total = this.exportresponse.length;
              this.downloadcountObj.success = this.downloadedfilesarray.length;
              this.downloadcountObj.error = this.exportresponse.filter(
                (obj) => obj.downloadstatus == false
              ).length;

              this.filedetailService.exportresponsedata = [];
              this.Zipdownloadarray = [];
              this.recordslist.masterfileid = 0;
              this.recordslist.nerafileid = 0;

              this.SplitFilesSkip = 0;
              this.mySelection = [];
              this.disableddownload = true;
              this.downloadloadProcessedItems();
              setTimeout(() => {
                this.isFilesProcessing = false;
                this.dataService.isFilesProcessing.next(false);
                this.percentage = 0;
                this.cdr.detectChanges();
                this.progresstitle = "Please wait...";

                $("#downloadstatusModal").modal("show");
              }, 3000);
            }
          }, 8000);
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onViewEOBClick(record: any) {  
    try {   
      this.inputfilename = record.splitfilename;         
      if (record.hasOwnProperty("nsplitid")) {
        this.inputsplitfileid = record.nsplitid.toString();
      } else {
        this.inputsplitfileid = "0";
      }
      if (record.hasOwnProperty("nerafileid")) {
        this.inputerafileid = record.nerafileid.toString();
      } else {
        this.inputerafileid = "0";
      }      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputResult($event) {
    try {
        let IsSaved = $event;

        if(IsSaved == true){          
          this.inputerafileid = 0;
          this.inputsplitfileid = 0;
          this.inputfilename = "";
          this.EobreportChild.ResetComponents();
          $("#viewCheckEOBReportModal").modal("hide");      
        } else {
          this.inputerafileid = 0;
          this.inputsplitfileid = 0;
          this.inputfilename = "";
          this.EobreportChild.ResetComponents();
          $("#viewCheckEOBReportModal").modal("hide");      
        }
       
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
