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
  selector: "app-hubpending-files",
  templateUrl: "./hubpending-files.component.html",
  styleUrls: ["./hubpending-files.component.css"],
})
export class HUBPendingFilesComponent implements OnInit, OnDestroy {
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

  public HUBlstClients: any;
  public HUBSelectAllClients: any;
  public HUBselectedClientID: string = "0";
  public HUBlstSubClients: any;
  public HUBSelectAllSubClients: any;
  public HUBselectedSubClientID: string = "0";
  public HUBSubClientDefaultValue = { subclientid: 0, subclientname: "All" };
  public HUBdisablegroup: boolean = true;
  public HUBdisablepractice: boolean = true;
  public HUBdisablebtn: boolean = true;
  private bOninit = false;

  public HUBPendingFileGridData: {};
  public HUBPendingFileGridView: GridDataResult;
  private HUBPendingFileItems: any[] = [];
  public HUBPendingFileResponse: any[] = [];
  public HUBPendingFileSkip = 0;
  public HUBPendingFiletotalrecordscount = 0;
  public loadingHUBPendingFile = true;

  public HUB_total_0_15: number = 0;
  public HUB_total_16_30: number = 0;
  public HUB_total_31_60: number = 0;
  public HUB_total_61_90: number = 0;
  public HUB_total_91_120: number = 0;
  public HUB_total_121: number = 0;
  public HUB_total_total: number = 0;

  public HUBExportFilename: string =
    "HUB_PendingFileList_" + this.datePipe.transform(new Date(), "MMddyyyy");

  HUBDropDownGroup = this.fb.group({
    fcHUBClientName: ["", Validators.required],
    fcHUBSubClientName: ["", Validators.required],
  });
  get fbcHUBClientName() {
    return this.HUBDropDownGroup.get("fcHUBClientName");
  }

  get fbcHUBSubClientName() {
    return this.HUBDropDownGroup.get("fcHUBSubClientName");
  }

  public sortHUBPendingFile: SortDescriptor[] = [
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
      this.loadingHUBPendingFile = true;
      this.HUBEnabledisablebtn(true);
      this.RetriveAllClient();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortHUBPendingFileChange(sort: SortDescriptor[]): void {
    try {
      this.sortHUBPendingFile = sort;
      this.loadItemsHUBPendingFiles();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleHUBClientFilter(value) {
    this.HUBlstClients = this.HUBSelectAllClients.filter(
      (s) => s.clientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  onHUBClientChange(event: any) {
    try {
      this.HUBselectedClientID = event;
      this.HUBselectedSubClientID = "0";
      this.HUBEnabledisablebtn(true);
      this.RetriveSubClient();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleHUBSubclientFilter(value) {
    this.HUBlstSubClients = this.HUBSelectAllSubClients.filter(
      (s) => s.subclientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  onHUBSubClientChange(event: any) {
    try {
      this.HUBselectedSubClientID = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  HUBEnabledisablebtn(status: boolean = false) {
    try {
      this.HUBdisablegroup = status;
      this.HUBdisablepractice = status;
      this.HUBdisablebtn = status;
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
            this.HUBlstClients = res;
            if (this.HUBlstClients != null && this.HUBlstClients.length > 0) {
              if (this.HUBlstClients.length == 1) {
                this.HUBSelectAllClients = this.HUBlstClients;
                this.HUBselectedClientID = this.HUBlstClients[0]["clientid"];
              } else {
                const Allclt = new Client();
                Allclt.clientid = "0";
                Allclt.clientcode = "";
                Allclt.clientname = "All";
                this.HUBlstClients.unshift(Allclt);
                this.HUBSelectAllClients = this.HUBlstClients;
                this.HUBselectedClientID = "0";
              }

              // this.fbcClientName.setValue(this.lstClients[0].clientid);
              // this.selectedClientID = this.lstClients[0].clientid;
              this.RetriveSubClient();
            } else {
              this.loadingHUBPendingFile = false;
              this.HUBEnabledisablebtn(true);
              this.HUBlstClients = [];
              this.clsUtility.showInfo("No group is active");
            }
          },
          (err) => {
            this.loadingHUBPendingFile = false;
            this.HUBEnabledisablebtn(true);
            this.HUBlstClients = [];
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loadingHUBPendingFile = false;
      this.HUBEnabledisablebtn(true);
      this.clsUtility.LogError(error);
    }
  }

  RetriveSubClient() {
    try {
      this.HUBlstSubClients = [];
      this.fbcHUBSubClientName.setValue(0);
      let getsubclient: {
        clientid: string;
        subclientid: string;
        userid: string;
        flag: string;
      } = {
        clientid: this.HUBselectedClientID,
        subclientid: this.HUBselectedSubClientID,
        userid: this.currentuserid,
        flag: "HUB",
      };
      let seq = this.api.post("SubClient/GetSubClientByFlag", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.HUBlstSubClients = res;
            if (
              this.HUBlstSubClients != null &&
              this.HUBlstSubClients.length > 0
            ) {
              if (this.HUBlstSubClients.length == 1) {
                this.HUBSelectAllSubClients = this.HUBlstSubClients;
                this.HUBselectedSubClientID = this.HUBlstSubClients[0][
                  "subclientid"
                ];
              } else {
                this.HUBSelectAllSubClients = this.HUBlstSubClients;
                const Subclt = new Subclient();
                Subclt.subclientid = "0";
                Subclt.subclientcode = "0";
                Subclt.subclientname = "All";
                this.HUBlstSubClients.unshift(Subclt);
                this.HUBSelectAllSubClients = this.HUBlstSubClients;
                this.HUBselectedSubClientID = "0";
              }
              if (this.bOninit) {
                this.RetriveHUBPendingFileDetails();
                this.bOninit = false;
              } else {
                this.HUBEnabledisablebtn(false);
              }
            } else {
              this.loadingHUBPendingFile = false;
              this.HUBEnabledisablebtn(true);
              this.HUBdisablegroup = false;
              this.HUBlstSubClients = [];
              this.clsUtility.showInfo("No practice is active");
            }
          },
          (err) => {
            this.loadingHUBPendingFile = false;
            this.HUBEnabledisablebtn(true);
            this.HUBdisablegroup = false;
            this.HUBlstSubClients = [];
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loadingHUBPendingFile = false;
      this.HUBEnabledisablebtn(true);
      this.HUBdisablegroup = false;
      this.HUBlstSubClients = [];
      this.clsUtility.LogError(error);
    }
  }

  RetriveHUBPendingFileDetails() {
    try {
      this.HUBSetValueZero();
      this.HUBPendingFileItems = [];
      this.HUBPendingFileGridView = null;
      let response;
      let getAgingBucket: {
        clientid: any;
        subclientid: any;
        userid: string;
      } = {
        clientid: this.HUBselectedClientID,
        subclientid: this.HUBselectedSubClientID,
        userid: this.currentuserid,
      };
      let seq = this.api.post_edi(
        "api/Dashboard/gethubpendingfilescount",
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
              this.HUBPendingFileResponse = response;
              this.HUBPendingFileItems = this.HUBPendingFileResponse["content"];
              this.HUBPendingFiletotalrecordscount = this.HUBPendingFileResponse[
                "totalelements"
              ];
              this.HUB_total_0_15 = this.HUBPendingFileResponse["total_0_15"];
              this.HUB_total_16_30 = this.HUBPendingFileResponse["total_16_30"];
              this.HUB_total_31_60 = this.HUBPendingFileResponse["total_31_60"];
              this.HUB_total_61_90 = this.HUBPendingFileResponse["total_61_90"];
              this.HUB_total_91_120 = this.HUBPendingFileResponse[
                "total_91_120"
              ];
              this.HUB_total_121 = this.HUBPendingFileResponse["total_120"];
              this.HUB_total_total = this.HUBPendingFileResponse["total_total"];
              this.loadItemsHUBPendingFiles();
              this.loadingHUBPendingFile = false;
            } else {
              this.HUBPendingFiletotalrecordscount = 0;
              this.loadingHUBPendingFile = false;
            }
            this.api.insertActivityLog(
              "HUB pending details viewed",
              "HUB Pending Summary",
              "READ"
            );
            this.HUBEnabledisablebtn(false);
          },
          (err) => {
            this.loadingHUBPendingFile = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loadingHUBPendingFile = false;
      this.clsUtility.LogError(error);
    }
  }

  loadItemsHUBPendingFiles(): void {
    try {
      if (
        !isNullOrUndefined(this.HUBPendingFileItems) &&
        this.HUBPendingFileItems &&
        this.HUBPendingFileItems.length > 0
      ) {
        this.HUBPendingFileGridView = {
          data: orderBy(
            this.HUBPendingFileItems.slice(this.HUBPendingFileSkip),
            this.sortHUBPendingFile
          ),
          total: this.HUBPendingFileItems.length,
        };
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  HUBSetValueZero() {
    try {
      this.HUB_total_0_15 = 0;
      this.HUB_total_16_30 = 0;
      this.HUB_total_31_60 = 0;
      this.HUB_total_61_90 = 0;
      this.HUB_total_91_120 = 0;
      this.HUB_total_121 = 0;
      this.HUB_total_total = 0;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  applyHUBFilters() {
    try {
      this.HUBPendingFiletotalrecordscount = 0;
      this.loadingHUBPendingFile = true;
      this.HUBEnabledisablebtn(true);
      this.RetriveHUBPendingFileDetails();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  clearHUBFilters() {
    try {
      this.HUBPendingFiletotalrecordscount = 0;
      this.loadingHUBPendingFile = true;
      this.bOninit = true;
      this.HUBEnabledisablebtn(true);
      this.fbcHUBClientName.setValue(this.HUBlstClients[0].clientid);
      this.fbcHUBSubClientName.setValue(0);
      this.HUBselectedClientID = this.HUBlstClients[0].clientid;
      this.HUBselectedSubClientID = "0";
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

  onHUBExportClick() {
    try {
      this.api.insertActivityLog(
        "HUB pending details exported excel",
        "HUB Pending Summary",
        "READ"
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
