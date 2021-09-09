import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Api } from "src/app/Services/api";
import { DatePipe } from "@angular/common";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { SubSink } from "subsink";
import { Utility } from "src/app/Model/utility";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { GridDataResult } from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Client } from "src/app/Model/client";
import { Subclient } from "src/app/Model/subclient";
import { isNullOrUndefined } from "util";

@Component({
  selector: "app-ftppending-files",
  templateUrl: "./ftppending-files.component.html",
  styleUrls: ["./ftppending-files.component.css"],
})
export class FTPPendingFilesComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    public api: Api,
    private datePipe: DatePipe,
    private dataService: DatatransaferService
  ) {
    this.clsUtility = new Utility(toastr);
  }
  private subscription = new SubSink();
  private clsUtility: Utility;
  public clsPermission: clsPermission;
  private currentuserid: string = "0";

  public FTPlstClients: any;
  public FTPSelectAllClients: any;
  public FTPselectedClientID: string = "0";
  public FTPlstSubClients: any;
  public FTPSelectAllSubClients: any;
  public FTPselectedSubClientID: string = "0";
  public FTPSubClientDefaultValue = { subclientid: 0, subclientname: "All" };
  public FTPdisablegroup: boolean = true;
  public FTPdisablepractice: boolean = true;
  public FTPdisablebtn: boolean = true;
  private bOninit = false;

  public FTPPendingFileGridData: {};
  public FTPPendingFileGridView: GridDataResult;
  private FTPPendingFileItems: any[] = [];
  public FTPPendingFileResponse: any[] = [];
  public FTPPendingFileSkip = 0;
  public FTPPendingFiletotalrecordscount = 0;
  public loadingFTPPendingFile = true;

  public FTP_total_0_15: number = 0;
  public FTP_total_16_30: number = 0;
  public FTP_total_31_60: number = 0;
  public FTP_total_61_90: number = 0;
  public FTP_total_91_120: number = 0;
  public FTP_total_121: number = 0;
  public FTP_total_total: number = 0;

  public FTPExportFilename: string =
    "FTP_PendingFileList_" + this.datePipe.transform(new Date(), "MMddyyyy");

  FTPDropDownGroup = this.fb.group({
    fcFTPClientName: ["", Validators.required],
    fcFTPSubClientName: ["", Validators.required],
  });
  get fbcFTPClientName() {
    return this.FTPDropDownGroup.get("fcFTPClientName");
  }

  get fbcFTPSubClientName() {
    return this.FTPDropDownGroup.get("fcFTPSubClientName");
  }

  public sortFTPPendingFile: SortDescriptor[] = [
    {
      field: "dtimportdate",
      dir: "desc",
    },
  ];

  ngOnInit() {
    try {
      this.bOninit = true;
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );

      this.currentuserid = this.dataService.SelectedUserid;
      this.loadingFTPPendingFile = true;
      this.FTPEnabledisablebtn(true);
      this.RetriveAllClient();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortFTPPendingFileChange(sort: SortDescriptor[]): void {
    try {
      this.sortFTPPendingFile = sort;
      this.loadItemsFTPPendingFiles();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleFTPClientFilter(value) {
    this.FTPlstClients = this.FTPSelectAllClients.filter(
      (s) => s.clientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  onFTPClientChange(event: any) {
    try {
      this.FTPselectedClientID = event;
      this.FTPselectedSubClientID = "0";
      this.FTPEnabledisablebtn(true);
      this.RetriveSubClient();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleFTPSubclientFilter(value) {
    this.FTPlstSubClients = this.FTPSelectAllSubClients.filter(
      (s) => s.subclientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  onFTPSubClientChange(event: any) {
    try {
      this.FTPselectedSubClientID = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  FTPEnabledisablebtn(status: boolean = false) {
    try {
      this.FTPdisablegroup = status;
      this.FTPdisablepractice = status;
      this.FTPdisablebtn = status;
    } catch (error) {
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
            this.FTPlstClients = res;
            if (this.FTPlstClients != null && this.FTPlstClients.length > 0) {
              if (this.FTPlstClients.length == 1) {
                this.FTPSelectAllClients = this.FTPlstClients;
                this.FTPselectedClientID = this.FTPlstClients[0]["clientid"];
              } else {
                const Allclt = new Client();
                Allclt.clientid = "0";
                Allclt.clientcode = "";
                Allclt.clientname = "All";
                this.FTPlstClients.unshift(Allclt);
                this.FTPSelectAllClients = this.FTPlstClients;
                this.FTPselectedClientID = "0";
              }

              // this.fbcClientName.setValue(this.lstClients[0].clientid);
              // this.selectedClientID = this.lstClients[0].clientid;
              this.RetriveSubClient();
            } else {
              this.loadingFTPPendingFile = false;
              this.FTPEnabledisablebtn(true);
              this.FTPlstClients = [];
              this.clsUtility.showInfo("No group is active");
            }
          },
          (err) => {
            this.loadingFTPPendingFile = false;
            this.FTPEnabledisablebtn(true);
            this.FTPlstClients = [];
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loadingFTPPendingFile = false;
      this.FTPEnabledisablebtn(true);
      this.FTPlstClients = [];
      this.clsUtility.LogError(error);
    }
  }

  RetriveSubClient() {
    try {
      this.FTPlstSubClients = [];
      this.fbcFTPSubClientName.setValue(0);
      let getsubclient: {
        clientid: string;
        subclientid: string;
        userid: string;
        flag: string;
      } = {
        clientid: this.FTPselectedClientID,
        subclientid: this.FTPselectedSubClientID,
        userid: this.currentuserid,
        flag: "FTP",
      };
      let seq = this.api.post("SubClient/GetSubClientByFlag", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.FTPlstSubClients = res;
            if (
              this.FTPlstSubClients != null &&
              this.FTPlstSubClients.length > 0
            ) {
              if (this.FTPlstSubClients.length == 1) {
                this.FTPSelectAllSubClients = this.FTPlstSubClients;
                this.FTPselectedSubClientID = this.FTPlstSubClients[0][
                  "subclientid"
                ];
              } else {
                this.FTPSelectAllSubClients = this.FTPlstSubClients;
                const Subclt = new Subclient();
                Subclt.subclientid = "0";
                Subclt.subclientcode = "0";
                Subclt.subclientname = "All";
                this.FTPlstSubClients.unshift(Subclt);
                this.FTPSelectAllSubClients = this.FTPlstSubClients;
                this.FTPselectedSubClientID = "0";
              }
              if (this.bOninit) {
                this.RetriveFTPPendingFileDetails();
                this.bOninit = false;
              } else {
                this.FTPEnabledisablebtn(false);
              }
            } else {
              this.loadingFTPPendingFile = false;
              this.FTPEnabledisablebtn(true);
              this.FTPdisablegroup = false;
              this.FTPlstSubClients = [];
              this.clsUtility.showInfo("No practice is active");
            }
          },
          (err) => {
            this.loadingFTPPendingFile = false;
            this.FTPEnabledisablebtn(true);
            this.FTPdisablegroup = false;
            this.FTPlstSubClients = [];
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loadingFTPPendingFile = false;
      this.FTPEnabledisablebtn(true);
      this.FTPdisablegroup = false;
      this.FTPlstSubClients = [];
      this.clsUtility.LogError(error);
    }
  }

  RetriveFTPPendingFileDetails() {
    try {
      this.FTPSetValueZero();
      this.FTPPendingFileItems = [];
      this.FTPPendingFileGridView = null;
      let response;
      let getAgingBucket: {
        clientid: any;
        subclientid: any;
        userid: string;
      } = {
        clientid: this.FTPselectedClientID,
        subclientid: this.FTPselectedSubClientID,
        userid: this.currentuserid,
      };
      let seq = this.api.post_edi(
        "api/Dashboard/getftppendingfilescount",
        getAgingBucket
      );
      this.subscription.add(
        seq.subscribe(
          (res) => {
            response = res;
            if (
              !isNullOrUndefined(response) &&
              !isNullOrUndefined(response["content"])
            ) {
              this.FTPPendingFileResponse = response;
              this.FTPPendingFileItems = this.FTPPendingFileResponse["content"];
              this.FTPPendingFiletotalrecordscount = this.FTPPendingFileResponse[
                "totalelements"
              ];
              this.FTP_total_0_15 = this.FTPPendingFileResponse["total_0_15"];
              this.FTP_total_16_30 = this.FTPPendingFileResponse["total_16_30"];
              this.FTP_total_31_60 = this.FTPPendingFileResponse["total_31_60"];
              this.FTP_total_61_90 = this.FTPPendingFileResponse["total_61_90"];
              this.FTP_total_91_120 = this.FTPPendingFileResponse[
                "total_91_120"
              ];
              this.FTP_total_121 = this.FTPPendingFileResponse["total_120"];
              this.FTP_total_total = this.FTPPendingFileResponse["total_total"];
              this.loadItemsFTPPendingFiles();
              this.loadingFTPPendingFile = false;
            } else {
              this.FTPPendingFiletotalrecordscount = 0;
              this.loadingFTPPendingFile = false;
            }
            this.api.insertActivityLog(
              "FTP pending details viewed",
              "FTP Pending Summary",
              "READ"
            );
            this.FTPEnabledisablebtn(false);
          },
          (err) => {
            this.loadingFTPPendingFile = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loadingFTPPendingFile = false;
      this.clsUtility.LogError(error);
    }
  }

  loadItemsFTPPendingFiles(): void {
    try {
      if (
        !isNullOrUndefined(this.FTPPendingFileItems) &&
        this.FTPPendingFileItems &&
        this.FTPPendingFileItems.length > 0
      ) {
        this.FTPPendingFileGridView = {
          data: orderBy(
            this.FTPPendingFileItems.slice(this.FTPPendingFileSkip),
            this.sortFTPPendingFile
          ),
          total: this.FTPPendingFileItems.length,
        };
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  FTPSetValueZero() {
    try {
      this.FTP_total_0_15 = 0;
      this.FTP_total_16_30 = 0;
      this.FTP_total_31_60 = 0;
      this.FTP_total_61_90 = 0;
      this.FTP_total_91_120 = 0;
      this.FTP_total_121 = 0;
      this.FTP_total_total = 0;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  applyFTPFilters() {
    try {
      this.FTPPendingFiletotalrecordscount = 0;
      this.loadingFTPPendingFile = true;
      this.FTPEnabledisablebtn(true);
      this.RetriveFTPPendingFileDetails();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  clearFTPFilters() {
    try {
      this.FTPPendingFiletotalrecordscount = 0;
      this.loadingFTPPendingFile = true;
      this.bOninit = true;
      this.FTPEnabledisablebtn(true);
      this.fbcFTPClientName.setValue(this.FTPlstClients[0].clientid);
      this.fbcFTPSubClientName.setValue(0);
      this.FTPselectedClientID = this.FTPlstClients[0].clientid;
      this.FTPselectedSubClientID = "0";
      this.RetriveSubClient();
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

  onFTPExportClick() {
    try {
      this.api.insertActivityLog(
        "FTP pending details exported excel",
        "FTP Pending Summary",
        "READ"
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
