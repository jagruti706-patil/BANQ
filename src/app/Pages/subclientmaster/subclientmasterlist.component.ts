import {
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
  OnDestroy,
} from "@angular/core";
import { Api } from "./../../Services/api";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import {
  GridComponent,
  GridDataResult,
  DataStateChangeEvent,
  PageChangeEvent,
  SelectableSettings,
  RowArgs,
} from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { process, State } from "@progress/kendo-data-query";
import { AllConfigurationService } from "src/app/Services/all-configuration.service";
import { SubclientinformationComponent } from "./subclientinformation.component";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { SubSink } from "subsink";
import { isNullOrUndefined } from "util";
declare var $: any;

@Component({
  selector: "app-subclientmasterlist",
  templateUrl: "./subclientmasterlist.component.html",
  styleUrls: ["./subclientmasterlist.component.css"],
})
export class SubclientmasterlistComponent implements OnInit, OnDestroy {
  private clsUtility: Utility;
  public subscription = new SubSink();
  public clientlist: any;
  public gridView: GridDataResult;
  public pageSize: number = 0;
  public skip = 0;
  public pagenumber: number = 0;
  public deletesubClientID: string = "";
  public deletesubClientcode: string = "";
  public deletesubClientstatus: boolean;
  public deletemessage: string = "";
  public editmessage: string = "";
  public editsubClientID: string = "";
  public editsubClientcode: string = "";
  public deletesubClientname: string = "";
  public loading: boolean = false;
  public clsPermission: clsPermission;

  public sort: SortDescriptor[] = [
    {
      field: "subclientname",
      dir: "asc",
    },
  ];
  public state: State = {
    skip: 0,
    take: 50,
  };
  toggleme: any;

  @ViewChild("subclientinfocontainer", { read: ViewContainerRef })
  entry: ViewContainerRef;

  constructor(
    private resolver: ComponentFactoryResolver,
    private _router: Router,
    private _routeParams: ActivatedRoute,
    public api: Api,
    private toaster: ToastrService,
    private allConfigService: AllConfigurationService,
    private dataService: DatatransaferService
  ) {
    this.clsUtility = new Utility(toaster);
    this.pageSize = this.clsUtility.configPageSize;
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );
      this.getsubClientlist();
      this.subscription.add(
        this.allConfigService.toggleSidebar.subscribe((isToggle) => {
          this.toggleme = isToggle;
        })
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
  togglesidebar() {
    this.allConfigService.toggleSidebar.next(!this.toggleme);
  }

  getsubClientlist(insertlog: boolean = true) {
    try {
      this.loading = true;
      let getsubclient: { clientid: string; subclientcode: string } = {
        clientid: "0",
        subclientcode: "",
      };
      let seq = this.api.post("SubClient/GetSubClient", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.clientlist = res;

            if (
              this.clientlist != null &&
              this.clientlist != undefined &&
              this.clientlist.length > 0
            ) {
              this.loading = false;
              // this.gridView = process(this.clientlist, this.state);
              this.loadItems();
            } else {
              this.clientlist = [];
              this.loadItems();
              this.loading = false;
            }

            if (insertlog) {
              this.api.insertActivityLog(
                "Practice List Viewed",
                "Practice",
                "READ"
              );
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
      this.clsUtility.LogError(error);
    }
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    if (!isNullOrUndefined(this.clientlist) && this.clientlist.length > 0) {
      if (state.filter != undefined && state.filter != null) {
        state.filter.filters.forEach((f) => {
          if (
            f["field"] == "clientname" ||
            f["field"] == "subclientcode" ||
            f["field"] == "subclientname" ||
            f["field"] == "subclientcontactname" ||
            f["field"] == "subclientdivisioncode"
          ) {
            if (f["value"] != null) {
              f["value"] = f["value"].trim();
            }
          }
        });
      }
      this.gridView = process(this.clientlist, this.state);
    }
  }

  deleteConfiratmion(dataItem: any) {
    try {
      this.deletesubClientID = dataItem.id;
      this.deletesubClientname = dataItem.subclientname;
      this.deletesubClientcode = dataItem.subclientcode;

      if (Boolean(dataItem.subclientstatus)) {
        this.deletemessage =
          "Do you want to Deactivate Practice " + dataItem.subclientname + "?";
        this.deletesubClientstatus = false;
      } else {
        this.deletemessage =
          "Do you want to activate Practice " + dataItem.subclientname + "?";
        this.deletesubClientstatus = true;
      }
      //this.deletemessage = "Do you want to delete Sub Client " + dataItem.subclientname + "?";
      $("#deletemodal").modal("show");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  editConfiratmion(dataItem: any) {
    try {
      this.editsubClientID = dataItem.id;
      let subClientname = dataItem.subclientname;
      this.editsubClientcode = dataItem.subclientcode;

      this.editmessage = "Do you want to edit Practice " + subClientname + "?";
      $("#editsubclientmodal").modal("show");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  deleteusermapping() {
    try {
      let deleteclient: { id: string; subclientstatus: boolean } = {
        id: this.deletesubClientID,
        subclientstatus: this.deletesubClientstatus,
      };
      let seq = this.api.post("SubClient/DeleteSubClient", deleteclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            if (res != null || res != undefined) {
              if (res == 1) {
                this.clsUtility.showSuccess(
                  "Practice status updated successfully."
                );

                this.api.insertActivityLog(
                  "Practice (Practice name : " +
                    this.deletesubClientname +
                    ", PracticeCode : " +
                    this.deletesubClientcode +
                    ") " +
                    (this.deletesubClientstatus == true
                      ? "Activated"
                      : "Deactivated") +
                    "",
                  "Practice",
                  this.deletesubClientstatus == true ? "ACTIVATE" : "DEACTIVATE"
                );
                this.getsubClientlist(false);
              }
            }
          },
          (err) => {
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  createInfoComponent(subclientcode: string, subclientname: string) {
    try {
      this.entry.clear();
      const factory = this.resolver.resolveComponentFactory(
        SubclientinformationComponent
      );
      const componentRef = this.entry.createComponent(factory);
      // componentRef.instance.message = message;
      componentRef.instance.subclientcode = subclientcode;

      this.api.insertActivityLog(
        "Practice Details Viewed (Practice name : " +
          subclientname +
          ", SubclientCode : " +
          subclientcode +
          ")",
        "Practice",
        "READ"
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  pageChange(event: PageChangeEvent): void {
    try {
      this.skip = event.skip;
      this.state.skip = event.skip;
      this.loadItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadItems(): void {
    try {
      this.gridView = process(this.clientlist, this.state);
      // this.gridView = {
      //   data: this.clientlist.slice(this.skip, this.skip + this.pageSize),
      //   total: this.clientlist.length
      // };
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
}
