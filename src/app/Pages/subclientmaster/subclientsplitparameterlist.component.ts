import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  GridDataResult,
  DataStateChangeEvent,
  PageChangeEvent,
} from "@progress/kendo-angular-grid";
import { process, State } from "@progress/kendo-data-query";
import { SortDescriptor } from "@progress/kendo-data-query";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { AllConfigurationService } from "src/app/Services/all-configuration.service";
import { Api } from "./../../Services/api";
import { SubSink } from "subsink";

@Component({
  selector: "app-subclientsplitparameterlist",
  templateUrl: "./subclientsplitparameterlist.component.html",
  styleUrls: ["./subclientsplitparameterlist.component.css"],
})
export class SubclientsplitparameterlistComponent implements OnInit, OnDestroy {
  private clsUtility: Utility;
  public subscription = new SubSink();
  toggleme: any;
  public loading: boolean = false;
  public spliteparameterslist: any;
  public gridView: GridDataResult;

  public state: State = {
    skip: 0,
    take: 50,
  };

  public sort: SortDescriptor[] = [
    {
      field: "subclientname",
      dir: "asc",
    },
  ];

  constructor(
    private allConfigService: AllConfigurationService,
    private toaster: ToastrService,
    public api: Api
  ) {
    this.clsUtility = new Utility(toaster);
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.allConfigService.toggleSidebar.subscribe((isToggle) => {
          this.toggleme = isToggle;
        })
      );
      this.getsplitparameterlist(true);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  togglesidebar() {
    try {
      this.allConfigService.toggleSidebar.next(!this.toggleme);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getsplitparameterlist(insertlog: boolean = true) {
    try {
      this.loading = true;
      let seq = this.api.get("SubClient/AllSplitParameter");
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.spliteparameterslist = res;

            if (
              this.spliteparameterslist != null &&
              this.spliteparameterslist != undefined &&
              this.spliteparameterslist.length > 0
            ) {
              this.loading = false;
              this.loadItems();
            } else {
              this.spliteparameterslist = [];
              this.loadItems();
              this.loading = false;
            }

            if (insertlog) {
              this.api.insertActivityLog(
                "Practice Split Parameters List Viewed",
                "Split Parameters",
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

  public loadItems(): void {
    try {
      if (
        this.spliteparameterslist != null &&
        this.spliteparameterslist != undefined
      ) {
        if (this.spliteparameterslist.length > 0) {
          this.gridView = process(this.spliteparameterslist, this.state);
        } else {
          this.spliteparameterslist = [];
          this.gridView = process(this.spliteparameterslist, this.state);
        }
      } else {
        this.spliteparameterslist = [];
        this.gridView = process(this.spliteparameterslist, this.state);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    if (
      this.spliteparameterslist != null &&
      this.spliteparameterslist != undefined
    ) {
      if (this.spliteparameterslist.length > 0) {
        this.state = state;
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
        this.loadItems();
      }
    } else {
      this.spliteparameterslist = [];
      this.loadItems();
    }
  }

  pageChange(event: PageChangeEvent): void {
    try {
      this.state.skip = event.skip;
      this.loadItems();
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
