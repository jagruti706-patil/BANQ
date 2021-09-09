import {
  Component,
  OnInit,
  ComponentFactoryResolver,
  ViewContainerRef,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { Api } from "./../../Services/api";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { ClientinformationComponent } from "./clientinformation.component";
import { DatePipe } from "@angular/common";
import { IntlModule } from "@progress/kendo-angular-intl";

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
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { SubSink } from "subsink";
import { isNullOrUndefined } from "util";
declare var $: any;

@Component({
  selector: "app-clientmasterlist",
  templateUrl: "./clientmasterlist.component.html",
  styleUrls: ["./clientmasterlist.component.css"],
})
export class ClientmasterlistComponent implements OnInit, OnDestroy {
  public subscription = new SubSink();
  public clsPermission: clsPermission;
  private clsUtility: Utility;
  public clientlist: any;
  public gridView: GridDataResult;
  public pageSize: number = 0;
  public skip = 0;
  public pagenumber: number = 0;
  public deleteClientID: string = "";
  public deleteClientstatus: boolean;
  public deletemessage: string = "";
  public editmessage: string = "";
  public editclientid: string = "";
  public loading: boolean = false;
  public deleteClientname: string = "";

  public sort: SortDescriptor[] = [
    {
      field: "clientname",
      dir: "asc",
    },
  ];
  public state: State = {
    skip: 0,
    take: 50,
  };
  toggleme: boolean = false;
  @ViewChild("infocontainer", { read: ViewContainerRef })
  entry: ViewContainerRef

  constructor(
    private datePipe: DatePipe,
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
      this.subscription.add(
        this.allConfigService.toggleSidebar.subscribe((isToggle) => {
          this.toggleme = isToggle;
        })
      );
      this.getClientlist();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  createInfoComponent(clientid: string, clientname: string) {
    try {
      this.entry.clear();
      const factory = this.resolver.resolveComponentFactory(
        ClientinformationComponent
      );
      const componentRef = this.entry.createComponent(factory);
      // componentRef.instance.message = message;
      componentRef.instance.clientid = clientid;

      this.api.insertActivityLog(
        "Group Details Viewed (Group name : " + clientname + " )",
        "Group",
        "READ"
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  toggle() {
    this.allConfigService.toggleSidebar.next(!this.toggleme);
  }

  getClientlist(insertlog: boolean = true) {
    try {
      this.loading = true;
      let getclient: { clientid: string; clientstatus: boolean } = {
        clientid: "0",
        clientstatus: false,
      };
      let seq = this.api.post("GetClient", getclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.clientlist = res;

            if (
              this.clientlist != null &&
              this.clientlist != undefined &&
              this.clientlist.length > 0
            ) {
              this.clientlist.forEach(
                (item) =>
                  (item.dt = new Date(
                    new Date(item["createdon"]).getFullYear(),
                    new Date(item["createdon"]).getMonth(),
                    new Date(item["createdon"]).getDate()
                  ))
              );
              this.loading = false;
              // this.gridView = process(this.clientlist, this.state);
              this.loadItems();
            } else {
              this.clientlist = [];
              this.loadItems();
              this.loading = false;
            }

            if (insertlog) {
              this.api.insertActivityLog("Group List Viewed", "Group", "READ");
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
          if (f["field"] == "clientname" || f["field"] == "clientcode") {
            if (f["value"] != null) {
              f["value"] = f["value"].trim();
            }
          }
        });
      }
      // this.state.skip = 0;
    }
    this.gridView = process(this.clientlist, this.state);
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
    this.gridView = process(this.clientlist, this.state);
    // this.gridView = {
    //   data: this.clientlist.slice(this.skip, this.skip + this.pageSize),
    //   total: this.clientlist.length
    // };
  }

  deleteConfiratmion(dataItem: any) {
    try {
      this.deleteClientID = dataItem.clientid;
      this.deleteClientname = dataItem.clientname;

      if (Boolean(dataItem.clientstatus)) {
        this.deletemessage =
          "Do you want to Deactivate group " + dataItem.clientname + "?";
        this.deleteClientstatus = false;
      } else {
        this.deletemessage =
          "Do you want to activate group " + dataItem.clientname + "?";
        this.deleteClientstatus = true;
      }

      $("#deletemodal").modal("show");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  editConfiratmion(dataItem: any) {
    try {
      this.editclientid = dataItem.clientid;
      let Clientname = dataItem.clientname;

      this.editmessage = "Do you want to edit group " + Clientname + "?";
      $("#editclientmodal").modal("show");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  deleteusermapping() {
    try {
      let deleteclient: { clientid: string; clientstatus: boolean } = {
        clientid: this.deleteClientID,
        clientstatus: this.deleteClientstatus,
      };
      let seq = this.api.post("DeleteClient", deleteclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            if (res != null || res != undefined) {
              if (res == 1) {
                this.clsUtility.showSuccess(
                  "Group status updated successfully."
                );
                this.api.insertActivityLog(
                  "Group (Group name : " +
                    this.deleteClientname +
                    ") " +
                    (this.deleteClientstatus == true
                      ? "Activated"
                      : "Deactivated") +
                    "",
                  "Group",
                  this.deleteClientstatus == true ? "ACTIVATE" : "DEACTIVATE"
                );
                this.getClientlist(false);
              } else {
                this.clsUtility.showError("Error while updating status");
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
  ngOnDestroy() {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
