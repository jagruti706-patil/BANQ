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
import { isNullOrUndefined } from "util";
import { SearchfiltersService } from "src/app/Services/searchfilters.service";
import { clsPermission } from "./../../../Services/settings/clspermission";
declare var $: any;
import * as moment from "moment";
import { parseNumber } from "@progress/kendo-angular-intl";
import { process, State } from "@progress/kendo-data-query";
import { CheckwiseeobreportComponent } from '../../eobreport-check/checkwiseeobreport.component';

@Component({
  selector: "app-downloadedfiles",
  templateUrl: "./downloadedfiles.component.html",
  styleUrls: ["./downloadedfiles.component.css"],
})
export class DownloadedfilesComponent implements OnInit, OnDestroy {
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
  public selecteddownloadarray: any = [];

  public sDivisionalSplitSearchBy: any = [
    // { value: "Master Filename", text: "Master Filename" },
    { value: "Fileshare", text: "Fileshare" },
    { value: "Filename", text: "Filename" },
    { value: "Check", text: "Check" },
    // { value: "Claim", text: "Claim" },
    // { value: "Check", text: "Check" },
    // { value: "Payer name", text: "Payer name" },
    // { value: "Payerid", text: "Payerid" }
  ];
  public sSelectedDivisionalSplitSearchBy: string = "Fileshare";

  public sDownloadFilter: any = [
    { value: "All", text: "All" },
    { value: "Downloaded", text: "Downloaded" },
    { value: "Not Downloaded", text: "Not Downloaded" },
  ];
  public sSelectedDownloadfilter: string = "Downloaded";
  public currentusername: string = "";
  public DownloadSelectedLimit: Number = 10;
  public DownloadConfirmationMessage: any;
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
  public inputcomponentname: any = "Downloaded";
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
  public globaldate: Date = new Date();
  ngOnInit() {
    try {
      let date: string = "03/20/2020";
      this.startDate = new Date(this.datePipe.transform(date, "MM/dd/yyyy"));
      let dateToBeCheckOut = new Date(this.startDate);
      let today = new Date(this.globaldate);      
      if (today >= dateToBeCheckOut) {
        this.endDate = new Date(
          this.datePipe.transform(this.globaldate, "MM/dd/yyyy")
        );
      } else {
        this.endDate = new Date(this.datePipe.transform(date, "MM/dd/yyyy"));
      }

      this.currentuserid = this.dataService.SelectedUserid;
      this.currentusername = this.dataService.loginName["_value"];

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
        "Divisional Split Files List Viewed",
        "Divisional Files",
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
              this.loading = false;
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
              this.loading = false;
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
      this.RetriveSplitFiles();
    } catch (error) {
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
    this.SplitFilesGridView = null;
    this.SplitFilesItems = [];
    try {
      this.subscription.add(
        this.filedetailService
          .getMyFileList(
            this.currentuserid,
            this.datePipe.transform(this.startDate, "yyyyMMdd"),
            this.datePipe.transform(this.endDate, "yyyyMMdd"),
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
              if (!isNullOrUndefined(data)) {
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
                    this.SplitFilesdisplaytotalrecordscount = 0;
                    this.loading = false;
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
                this.loading = false;
                this.SplitFilesdisplaytotalrecordscount = 0;
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

  // RetriveSplit835File(nerafileid, sfilename: string, status: string) {
  //   try {
  //     this.loadingSplitFilesGrid = true;
  //     this.subscription.add(
  //       this.filedetailService.getSplit835File(nerafileid).subscribe(
  //         data => {
  //           this.sSplitfile = data["s835string"];
  //           this.stitleSplitfile = sfilename;
  //           if (status == "View") {
  //             this.OnViewSplitFile();
  //             this.loadingSplitFilesGrid = false;
  //             this.api.insertActivityLog(
  //               "Split File (" + this.stitleSplitfile + ") Viewed",
  //               "Divisional Files",
  //               "READ",
  //               nerafileid
  //             );
  //           } else {
  //             this.OnDownloadSplitFile(sfilename);
  //             this.loadingSplitFilesGrid = false;
  //             this.api.insertActivityLog(
  //               "Split File (" + this.stitleSplitfile + ") Downloaded",
  //               "MyFiles Downloaded",
  //               "READ",
  //               nerafileid
  //             );
  //           }
  //         },
  //         err => {
  //           this.loadingSplitFilesGrid = false;
  //         }
  //       )
  //     );
  //   } catch (error) {
  //     this.clsUtility.LogError(error);
  //   }
  // }
  RetriveSplit835File(masterfileid, nerafileid, sfilename: string) {
    try {
      this.loadingSplitFilesGrid = true;
      this.subscription.add(
        this.filedetailService.getSplit835File(nerafileid).subscribe(
          (data) => {
            if (!isNullOrUndefined(data) && data != "") {
              this.sSplitfile = data["s835string"];
              this.stitleSplitfile = sfilename;

              this.OnDownloadSplitFile(sfilename);

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
                        this.api.insertActivityLog(
                          "Split File (" +
                            this.stitleSplitfile +
                            ") Downloaded",
                          "MyFiles Downloaded",
                          "READ",
                          nerafileid
                        );
                      }
                    }
                  },
                  (err) => {
                    this.clsUtility.showError(err);
                  }
                );
              this.loadingSplitFilesGrid = false;
            } else {
              this.loading = false;
              this.loadingSplitFilesGrid = false;
            }
          },
          (err) => {
            this.loading = false;
            this.loadingSplitFilesGrid = false;
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
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

  OnDownloadSplitFile(Splitfilename) {
    try {
      // var zip = new JSZip();
      // zip.file(Splitfilename + ".txt", this.sSplitfile);
      // zip.generateAsync({ type: "blob" }).then(function(content) {
      //   saveAs(content, Splitfilename + ".zip");
      // });
      const blob = new Blob([this.sSplitfile], { type: "text" });
      FileSaver.saveAs(blob, Splitfilename + ".txt");
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
        this.Enabledisablebtn(true);
        this.RetriveSplitFiles();
      } else {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loading = false;
        this.loadingSplitFilesGrid = false;
        this.SplitFilesResponse = [];
      }
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  clearSplitFilters() {
    try {
      this.sSelectedClientID = "0";
      this.sSelectedDivisionID = "All";
      this.sSelectedSubClientCode = "0";
      this.sSelectedSplitStatus = "3";
      this.sSearchText = "";
      this.sSelectedDivisionalSplitSearchBy = "Fileshare";
      this.fbcSplitFilterSearch.setValue(this.sSearchText);
      this.startDate = new Date();
      this.startDate.setDate(this.startDate.getDate() - 1);
      let date: string = "03/20/2020";
      this.startDate = new Date(this.datePipe.transform(date, "MM/dd/yyyy"));
      this.endDate = new Date();
      this.sSelectedDownloadfilter = "Downloaded";

      this.SplitFilesSkip = 0;
      this.SplitFilesdisplaytotalrecordscount = 0;
      this.loadingSplitFilesGrid = true;
      this.mySelection = [];
      this.disableddownload = true;
      this.Enabledisablebtn(true);
      this.RetriveAllClient();
      // this.RetriveSplitFiles();
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
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
      } else {
        if (date == "start date") {
          this.startDate = new Date();
        } else if (date == "end date") {
          this.endDate = new Date();
        }
        this.clsUtility.LogError("Select valid date");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onSelectedKeysChange(e) {
    try {
      if (this.mySelection.length > 0) {
        this.disableddownload = false;
      } else {
        this.disableddownload = true;
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
        if (this.mySelection.length > 0) {
          this.isFilesProcessing = true;
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
      this.clsUtility.LogError(error);
    }
  }

  async RetriveSplit835File_Selected(
    nerafileid,
    sfilename: string,
    status: string
  ) {
    try {
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

  DownloadSelectedClick() {
    try {
      if (this.mySelection != null) {
        if (this.mySelection.length > 0) {
          if (this.mySelection.length > this.DownloadSelectedLimit) {
            this.DownloadConfirmationMessage =
              "Do you want to download all " +
              this.mySelection.length +
              " files?";
            $("#downloadselectedconfirmationModal").modal("show");
          } else {
            this.onDownloadselectedYesConfirmationClick();
          }
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onDownloadselectedYesConfirmationClick() {
    this.DownloadSelectedFiles();
  }

  onDownloadselectedCloseConfirmationClick() {
    try {
      $("#downloadselectedconfirmationModal").modal("hide");
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
                        "MyFiles Downloaded",
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
