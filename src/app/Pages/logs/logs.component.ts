import { Component, OnInit, OnDestroy } from "@angular/core";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { FormBuilder, Validators } from "@angular/forms";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { LogsService } from "src/app/Services/logs.service";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../node_modules/subsink";

@Component({
  selector: "app-logs",
  templateUrl: "./logs.component.html",
  styleUrls: ["./logs.component.css"]
})
export class LogsComponent implements OnInit, OnDestroy {
  public gridLogsData: {};
  public gridViewLogs: GridDataResult;
  private itemsLogs: any[] = [];
  public skipLogs = 0;
  public pageSizeLogs = 25;
  loadingLogs = false;
  public sAllServices: any[] = [];
  public sAllLevels: any[] = [];
  public selectedServicesID: string = "BANQQ835Parser";
  public nSelectedLevelID: number = 1;
  clsUtility: Utility;
  private subscription = new SubSink();

  public sortLogs: SortDescriptor[] = [
    {
      field: "appname",
      dir: "desc"
    }
  ];

  constructor(
    private fb: FormBuilder,
    private logsService: LogsService,
    private toastr: ToastrService
  ) {
    this.clsUtility = new Utility(toastr);
  }

  DropDownGroup = this.fb.group({
    fcServices: ["", Validators.required],
    fcLevel: ["", Validators.required]
  });

  get ServiceName() {
    try {
      return this.DropDownGroup.get("fcServices");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  get LevelName() {
    try {
      return this.DropDownGroup.get("fcLevel");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnInit() {
    try {
      this.RetriveServices();
      this.RetriveLevels();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveServices() {
    try {
      this.subscription.add(
        this.logsService.getServiceName().subscribe(
          data => {
            this.sAllServices = data;
            this.selectedServicesID = "BANQQ835Parser";
          },
          err => {
            this.loadingLogs = false;
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveLevels() {
    try {
      this.subscription.add(
        this.logsService.getLevelName().subscribe(
          data => {
            this.sAllLevels = data;
            this.nSelectedLevelID = 1;
          },
          err => {
            this.loadingLogs = false;
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveLogs() {
    try {
      this.subscription.add(
        this.logsService
          .getLogs(this.nSelectedLevelID, this.selectedServicesID)
          .subscribe(
            data => {
              this.gridLogsData = data;
              this.itemsLogs = data;
              this.loadItemsLogs();
              this.loadingLogs = false;
            },
            err => {
              this.loadingLogs = false;
            }
          )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadItemsLogs(): void {
    try {
      this.gridViewLogs = {
        data: orderBy(
          this.itemsLogs.slice(
            this.skipLogs,
            this.skipLogs + this.pageSizeLogs
          ),
          this.sortLogs
        ),
        total: this.itemsLogs.length
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortLogsChange(sort: SortDescriptor[]): void {
    try {
      this.sortLogs = sort;
      this.loadItemsLogs();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeLogs(event: PageChangeEvent): void {
    try {
      this.skipLogs = event.skip;
      this.loadItemsLogs();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onServiceChange(event: any) {
    try {
      this.skipLogs = 0;
      this.selectedServicesID = event;
      this.RetriveLogs();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onLevelChange(event: any) {
    try {
      this.skipLogs = 0;
      this.nSelectedLevelID = event;
      this.RetriveLogs();
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
