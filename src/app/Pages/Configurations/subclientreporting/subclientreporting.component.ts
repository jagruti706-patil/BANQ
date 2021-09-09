import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
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
import { Api } from "../../../Services/api";
import { SubSink } from "subsink";
import { AddsubclientreportingComponent } from "./addsubclientreporting.component";
declare var $: any;
import { clsPermission } from "../../../Services/settings/clspermission";
import { DatatransaferService } from "src/app/Services/datatransafer.service";

@Component({
  selector: 'app-subclientreporting',
  templateUrl: './subclientreporting.component.html',
  styleUrls: ['./subclientreporting.component.css']
})
export class SubclientreportingComponent implements OnInit, OnDestroy {

  private clsUtility: Utility;
  public subscription = new SubSink();
  toggleme: any;
  clsPermission: clsPermission;
  public loading: boolean = false;
  public spliteparameterslist: any;
  public gridView: GridDataResult;
  public deletereportingid: any;
  public delsubclientname: string = "";
  public InputDeleteMessage: string = "";
  public OutDeleteResult: boolean;

  public state: State = {
    skip: 0,
    take: 300,
  };

  public sort: SortDescriptor[] = [
    {
      field: "practicename",
      dir: "asc",
    },
  ];

  @ViewChild("AddusubclientreportingChild")
  private AddsubclientreportingChild: AddsubclientreportingComponent;

  Editpracticereportingid: string = "";

  constructor(
    private allConfigService: AllConfigurationService,
    private toaster: ToastrService,
    public api: Api,
    private dataService: DatatransaferService
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

      this.subscription.add(
        this.dataService.newpermission.subscribe(
          value => (this.clsPermission = value)
        )
      );

      this.getsubclientreportinglist(true);
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

  getsubclientreportinglist(insertlog: boolean = true) {
    try {
      this.loading = true;
      let seq = this.api.post("SubClient/GetAllSubClientReporting", '');
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.spliteparameterslist = res['content'];

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
                "Practice Reporting List Viewed",
                "Practice Reporting",
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
              f["field"] == "groupname" ||
              f["field"] == "subclientcode" ||
              f["field"] == "practicename" ||
              f["field"] == "divisioncode" ||
              f["field"] == "reportinggroup" ||
              f["field"] == "reportinggroupname"||
              f["field"] == "splitparametername" ||
              f["field"] == "splitparametervalue" ||
              f["field"] == "createdbyusername"               
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

  Addpracticereporting(){
    try {
      this.Editpracticereportingid = "";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputPracticeReportingEditResult($event) {
    try {      
      let IsSaved = $event;
      if (IsSaved == true) {        
        this.AddsubclientreportingChild.ResetComponents();
        this.Editpracticereportingid = null;       
        $("#addsubclientreportingModal").modal("hide");
        this.getsubclientreportinglist();
      } else {
        this.AddsubclientreportingChild.ResetComponents();
        this.Editpracticereportingid = null;       
        $("#addsubclientreportingModal").modal("hide");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  DeletePracticeReporting({ sender, rowIndex, dataItem }){
    try {
      this.deletereportingid = dataItem.id;      
      this.delsubclientname = dataItem.practicename;      
      this.InputDeleteMessage = "Do you want to delete practice reporting?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputDeleteResult($event) {
    try {
      this.OutDeleteResult = $event;
      if (this.OutDeleteResult == true) {
        this.deleteSelectedPracticeReporting();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  deleteSelectedPracticeReporting(){
    try {
      let para: { id: any } = { id: this.deletereportingid };
      let seq = this.api.post(
        "SubClient/DeleteSubClientReporting/", para
      );
      this.subscription.add(
        seq.subscribe(
          (data) => {
            if (data != null || data != undefined) {
              if (data == 1) {
                this.clsUtility.showSuccess(
                  "Practice Reporting deleted successfully."
                );

                this.api.insertActivityLog(
                  "Deleted Practice Reporting for Practice: " +
                    this.delsubclientname,
                  "Practice Reporting",
                  "DELETE"
                );
                this.getsubclientreportinglist(false);
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

}
