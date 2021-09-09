import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from "@angular/core";
import { FileDetailsService } from "src/app/Services/file-details.service";
import {
  GridDataResult,
  PageChangeEvent,
  SelectableSettings,
} from "@progress/kendo-angular-grid";
import { DatePipe } from "@angular/common";
import { saveAs } from "file-saver";
import * as JSZip from "jszip";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { CoreoperationsService } from "src/app/Services/coreoperations.service";
import { Client } from "src/app/Model/client";
import { Subclient } from "src/app/Model/subclient";
import { FormBuilder, Validators } from "@angular/forms";
import { isNullOrEmptyString } from "@progress/kendo-angular-grid/dist/es2015/utils";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../node_modules/subsink";
import { Api } from "src/app/Services/api";
import { BreadcrumbService } from "src/app/Services/breadcrumb.service";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Router } from "@angular/router";
import { ContextMenuSelectEvent } from "@progress/kendo-angular-menu";
import { isNullOrUndefined } from "util";
import { SearchfiltersService } from "src/app/Services/searchfilters.service";
import { clsPermission } from "./../../Services/settings/clspermission";
import { parseNumber } from "@progress/kendo-angular-intl";
declare var $: any;
import { CheckwiseeobreportComponent } from '../eobreport-check/checkwiseeobreport.component';
import { Workbook } from "@progress/kendo-angular-excel-export";
import * as moment from "moment";
import { Observable } from "rxjs";

@Component({
  selector: "app-divisionalsplitfiledetails",
  templateUrl: "./divisionalsplitfiledetails.component.html",
  styleUrls: ["./divisionalsplitfiledetails.component.css"],
})
export class DivisionalsplitfiledetailsComponent implements OnInit, OnDestroy {
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
  fileInProgress: string = "";
  percentage: number = 0;
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
  public disabledprocessstartdate: boolean = true;
  public disabledprocessenddate: boolean = true;
  public clsPermission: clsPermission;
  isFilesProcessing: boolean = false;
  splitFileStatus: any[] = [];
  StatusGridView: GridDataResult;
  public startDate: Date = new Date();
  public endDate: Date = new Date();
  public processstartDate: Date = new Date();
  public processendDate: Date = new Date();
  public filterstartDate: Date = new Date();
  public filterendDate: Date = new Date();
  public currentuserid: string = "0";
  public selectedCallback = (args) => args.dataItem;
  public mySelection: any[] = [];
  public disabledreftp: boolean = true;
  public reftpsplitfileids: any[] = [];
  public processStatusSort: SortDescriptor[] = [];
  public disabledsearchBy: boolean = false;
  public sAllClients: any;
  public sAllDivision: any;
  public SelectAllClients: any;
  public SelectAllDivision: any;
  private bOninit = false;
  public processdatechecked: boolean = false;
  public datefilterby: string = "Check";
  public checkdatechecked: boolean = true;
  public exportFilename: string =
  "PracticeFilesList_" + this.datePipe.transform(new Date(), "MMddyyyy");
  public emailloading = false;
  public ExportExcelDownloadConfirmationMessage: any;

  public sDivisionalSplitSearchBy: any = [
    { value: "Filename", text: "Filename" },
    { value: "Claim", text: "Claim" },
    { value: "Check", text: "Check" },
    { value: "Payer name", text: "Payer name" },
    { value: "Payerid", text: "Payerid" },
  ];
  public sSelectedDivisionalSplitSearchBy: string = "Filename";

  countObj: {
    total: number;
    success: number;
    error: number;
  } = {
    total: 0,
    success: 0,
    error: 0,
  };

  public sortSplit: SortDescriptor[] = [
    {
      field: "checkdate",
      dir: "desc",
    },
  ];

  DropDownGroup = this.fb.group({
    fcClientName: [""],
    fcSubClientName: [""],
    fcSplitSearch: [""],
    fcSplitStatus: [""],
    fcDivisionalSplitSearchBy: ["", Validators.required],
    fcDivision: [""],
    fcProcessdatefilter: [""],
    fcCheckdatefilter: [""]
  });

  @ViewChild("EobreportChild")
  private EobreportChild: CheckwiseeobreportComponent;
  public inputmastererafileid: any;
  public inputtsid: any;
  public inputclpid: any;
  public inputsplitfileid: any;
  public inputcomponentname: any = "Practice Files";
  public inputerafileid: any;
  public inputfilename: any = "";

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

  ngOnInit() {
    try {
      this.bOninit = true;
      this.startDate.setDate(this.startDate.getDate() - 1);
      this.processstartDate.setDate(this.processstartDate.getDate() - 1);
      this.currentuserid = this.dataService.SelectedUserid;

      this.dataService.newpermission.subscribe(
        (value) => (this.clsPermission = value)
      );

      this.SplitFilesdisplaytotalrecordscount = 0;
      this.loadingSplitFilesGrid = true;
      this.Enabledisablebtn(true);
      this.RetriveAllClient();
      // this.RetriveSplitFiles();
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
              this.Enabledisablebtn(true, "RetriveAllClient");
              this.bOninit = false;
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
              this.Enabledisablebtn(true, "RetriveAllDivision");
              this.bOninit = false;
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
              this.clsUtility.showInfo("No Divisioncode/Practice is available");
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
              const Subclt = new Subclient();
              Subclt.subclientid = "0";
              Subclt.subclientcode = "0";
              Subclt.subclientname = "All";
              this.sSubClients.unshift(Subclt);
              this.SelectAllSubClients = this.sSubClients;
              this.sSelectedSubClientCode = "0";

              if (this.bOninit) {
                this.RetriveSplitFiles();
                this.bOninit = false;
              } else {
                this.Enabledisablebtn(false, "RetriveSubClient");
              }
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
              this.Enabledisablebtn(true, "RetriveSubClient");
              this.bOninit = false;
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
            this.bOninit = false;
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
      this.bOninit = false;
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
      this.disabledreftp = true;
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
      if(this.processdatechecked == true && this.datefilterby == 'Process' && this.checkdatechecked == false){            
        this.filterstartDate = this.processstartDate;
        this.filterendDate = this.processendDate;
      } else if(this.processdatechecked == false && this.datefilterby == 'Check' && this.checkdatechecked == true) {            
        this.filterstartDate = this.startDate;
        this.filterendDate = this.endDate;
      }
      this.subscription.add(
        this.filedetailService
          .getDivisionalSplitFileList(
            this.currentuserid,
            this.datePipe.transform(this.filterstartDate, "yyyyMMdd"),
            this.datePipe.transform(this.filterendDate, "yyyyMMdd"),
            this.SplitFilesSkip,
            this.SplitFilesPageSize,
            this.sSelectedDivisionalSplitSearchBy,
            this.sSearchText,
            this.sSelectedSubClientCode,
            this.sSelectedClientID,
            this.sSelectedDivisionID,
            this.datefilterby
          )
          .subscribe(
            (data) => {
              if (
                !isNullOrUndefined(data) &&
                !isNullOrUndefined(data.content)
              ) {
                this.SplitFilesResponse = data;
                this.SplitFilesItems = data.content;
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
                  this.loading = false;
                  this.SplitFilesdisplaytotalrecordscount = 0;
                  this.loadingSplitFilesGrid = false;
                  this.Enabledisablebtn(false);
                }
              } else {
                this.loading = false;
                this.loadingSplitFilesGrid = false;
                this.Enabledisablebtn(false);
              }
            },
            (err) => {
              this.loading = false;
              this.SplitFilesdisplaytotalrecordscount = 0;
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

  RetriveSplit835File(nerafileid, sfilename: string, status: string) {
    try {
      this.loadingSplitFilesGrid = true;
      this.subscription.add(
        this.filedetailService.getSplit835File(nerafileid).subscribe(
          (data) => {
            this.sSplitfile = data["s835string"];
            this.stitleSplitfile = sfilename;
            if (status == "View") {
              this.OnViewSplitFile();
              this.loadingSplitFilesGrid = false;
              this.api.insertActivityLog(
                "Split File (" + this.stitleSplitfile + ") Viewed",
                "Divisional Files",
                "READ",
                nerafileid
              );
            } else {
              this.OnDownloadSplitFile(sfilename);
              this.loadingSplitFilesGrid = false;
              this.api.insertActivityLog(
                "Split File (" + this.stitleSplitfile + ") Downloaded",
                "Divisional Files",
                "READ",
                nerafileid
              );
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
      var zip = new JSZip();
      zip.file(Splitfilename, this.sSplitfile);
      zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, Splitfilename + ".zip");
      });
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
        this.sSearchText != undefined
      ) {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = true;
        this.mySelection = [];
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
      this.sSelectedClientID = "0";
      this.sSelectedDivisionID = "All";
      this.sSelectedSubClientCode = "0";
      this.sSelectedSplitStatus = "3";
      this.sSearchText = "";
      this.sSelectedDivisionalSplitSearchBy = "Filename";
      this.fbcSplitFilterSearch.setValue(this.sSearchText);
      this.startDate = new Date();
      this.startDate.setDate(this.startDate.getDate() - 1);
      this.endDate = new Date();
      this.processstartDate = new Date();
      this.processstartDate.setDate(this.processstartDate.getDate() - 1);
      this.processendDate = new Date();

      this.disabledprocessstartdate = true;
      this.disabledprocessenddate = true;
      this.disabledstartdate = false;
      this.disabledenddate = false;
      this.datefilterby = "Check";
      this.processdatechecked = false;
      this.checkdatechecked = true;

      this.SplitFilesSkip = 0;
      this.SplitFilesdisplaytotalrecordscount = 0;
      this.loadingSplitFilesGrid = true;
      this.mySelection = [];
      this.disabledreftp = true;
      this.Enabledisablebtn(true);
      this.bOninit = true;
      this.RetriveAllClient();
      //this.RetriveSplitFiles();
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

  public onProcessDateChange(value: Date, date: string): void {
    try {
      if (value != null) {
        if (date == "start date" && value > this.processendDate) {
          this.clsUtility.showWarning("Start date must be less than end date");
          this.processstartDate = new Date();
        } else if (date == "end date" && value < this.processstartDate) {
          this.clsUtility.showWarning(
            "End date must be greater than start date"
          );
          this.processendDate = new Date();
        }
      } else {
        if (date == "start date") {
          this.processstartDate = new Date();
        } else if (date == "end date") {
          this.processendDate = new Date();
        }
        this.clsUtility.LogError("Select valid date");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async reftpcall() {
    try {
      this.isFilesProcessing = true;
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
                statusObj.sfilename = this.mySelection[i].sfilename;
                statusObj.status = 1;
                statusObj.description = "Split file uploaded successfully";
                this.splitFileStatus.push(statusObj);
                this.countObj.success++;
                this.api.insertActivityLog(
                  "Split File (" +
                    this.mySelection[i].sfilename +
                    ") re-uploaded.",
                  "Divisional Files",
                  "READ",
                  this.mySelection[i].nsplitid
                );
              } else {
                let statusObj = new ProcessStatus();
                statusObj.sfilename = this.mySelection[i].sfilename;
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
              statusObj.sfilename = this.mySelection[i].sfilename;
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
        this.percentage = 0;
        this.cdr.detectChanges();
        $("#statusModal").modal("show");
      }, 3000);

      this.mySelection = [];
      this.onSelectedKeysChange("");
    } catch (error) {
      this.isFilesProcessing = false;
      this.clsUtility.LogError(error);
    }
  }

  public onSelectedKeysChange(e) {
    try {
      if (this.mySelection.length > 0) {
        this.disabledreftp = false;
      } else {
        this.disabledreftp = true;
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
        this.Enabledisablebtn(true);
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

  Enabledisablebtn(status: boolean = false, callfrom: string = "All") {
    try {
      if (callfrom == "RetriveAllClient" && status) {
        this.disabledclient = status;
        this.disableddivision = status;
        this.disabledsubclient = status;
        this.disabledstartdate = status;
        this.disabledenddate = status;
        this.disabledsplitsearch = status;
        this.disabledapplybtn = status;
        this.disabledclearbtn = status;
        this.disabledsearchBy = status;
      } else if (callfrom == "RetriveAllDivision" && status) {
        this.disabledclient = false;
        this.disableddivision = status;
        this.disabledsubclient = status;
        this.disabledstartdate = status;
        this.disabledenddate = status;
        this.disabledsplitsearch = status;
        this.disabledapplybtn = status;
        this.disabledclearbtn = status;
        this.disabledsearchBy = status;
      } else if (callfrom == "RetriveSubClient" && status) {
        this.disabledclient = false;
        this.disableddivision = false;
        this.disabledsubclient = status;
        this.disabledstartdate = status;
        this.disabledenddate = status;
        this.disabledsplitsearch = status;
        this.disabledapplybtn = status;
        this.disabledclearbtn = status;
        this.disabledsearchBy = status;
      } else {
        this.disabledclient = status;
        this.disableddivision = status;
        this.disabledsubclient = status;
        this.disabledstartdate = status;
        this.disabledenddate = status;
        this.disabledsplitsearch = status;
        this.disabledapplybtn = status;
        this.disabledclearbtn = status;
        this.disabledsearchBy = status;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onViewEOBClick(record: any) {  
    try {   
      console.log(record);      
      this.inputfilename = record.sfilename;         
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

  checkchangeevent(cevent: any){
    try { 
      if(cevent.target.checked){
        this.disabledprocessstartdate = true;
        this.disabledprocessenddate = true;
        this.disabledstartdate = false;
        this.disabledenddate = false;
        this.datefilterby = "Check";
        this.processdatechecked = false;
        this.checkdatechecked = true; 
      } else {
        this.disabledprocessstartdate = false;
        this.disabledprocessenddate = false;
        this.disabledstartdate = true;
        this.disabledenddate = true;
        this.datefilterby = "Process";
        this.checkdatechecked = false;
        this.processdatechecked = true;  
      }     
    } catch (error) {
      this.clsUtility.LogError(error);
    }    
  }

  processchangeevent(pevent: any){
    try {       
      if(pevent.target.checked){
        this.disabledprocessstartdate = false;
        this.disabledprocessenddate = false;
        this.disabledstartdate = true;
        this.disabledenddate = true;
        this.datefilterby = "Process";
        this.checkdatechecked = false;
        this.processdatechecked = true; 
      } else {
        this.disabledprocessstartdate = true;
        this.disabledprocessenddate = true;
        this.disabledstartdate = false;
        this.disabledenddate = false;
        this.datefilterby = "Check";
        this.processdatechecked = false;
        this.checkdatechecked = true; 
      }  
    } catch (error) {
      this.clsUtility.LogError(error);
    }    
  }

  public allData = (): Observable<any> => {
    try { 
      this.emailloading = true; 

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
        userid: this.currentuserid,
        startdate: this.datePipe.transform(this.filterstartDate, "yyyyMMdd"),
        enddate: this.datePipe.transform(this.filterendDate, "yyyyMMdd"),
        searchby: this.sSelectedDivisionalSplitSearchBy,
        searchtext: this.sSearchText,
        nsubclientid: this.sSelectedSubClientCode,
        sclientid: this.sSelectedClientID,
        sdivisioncode: this.sSelectedDivisionID,
        datefilterby: this.datefilterby
      };
      
      if (this.SplitFilesdisplaytotalrecordscount != 0) {
        var result = this.filedetailService.exporttoexceldata("api/Files/GetAllSplitDivisionalFiles", para, this.SplitFilesdisplaytotalrecordscount);
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

  public onExcelExport(args: any): void {
    try {   
      this.emailloading = true;   
      args.preventDefault();
      const workbook = args.workbook;

      new Workbook(workbook).toDataURL().then((dataUrl: string) => {
        saveAs(dataUrl, this.exportFilename + ".xlsx");
        this.api.insertActivityLog(
          "Pratice Files data exported in excel",
          "Pratice Files",
          "READ"
        );    
        this.emailloading = false;    
      });
    } catch (error) {
      this.clsUtility.showError(error);
    }
  }

  b64toBlob = (
    b64Data,
    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    sliceSize = 512
  ) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blobpdf = new Blob(byteArrays, { type: contentType });
    return blobpdf;
  };

  onClaimExcelExportClick() {
    try {
      if (this.SplitFilesdisplaytotalrecordscount > 0) {
        this.ExportExcelDownloadConfirmationMessage =
          this.SplitFilesdisplaytotalrecordscount +
          " records will be Exported, Do you want to continue ?";
        $("#ExportExcelClaimconfirmationModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onExportExcelYesConfirmationClick() {
    try {
      this.ClickExportExcel();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public ClickExportExcel() {
    try {
      document.getElementById("hbtnExportExcel").click();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onExportExcelCloseConfirmationClick() {
    try {
      $("#ExportExcelClaimconfirmationModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

}
