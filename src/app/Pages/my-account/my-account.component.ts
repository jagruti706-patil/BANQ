import {
  Component,
  OnInit,
  ViewContainerRef,
  ViewChild,
  ComponentFactoryResolver,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy
} from "@angular/core";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Api } from "src/app/Services/api";
import { ToastrService } from "ngx-toastr";
import { Utility } from "src/app/Model/utility";
import { SubclientinformationComponent } from "../subclientmaster/subclientinformation.component";
import { clssplitpara } from "../subclientmaster/clssplitpara";
import {
  GridComponent,
  GridDataResult,
  DataStateChangeEvent
} from "@progress/kendo-angular-grid";
import { process, State } from "@progress/kendo-data-query";
import { SubSink } from "subsink";

@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  styleUrls: ["./my-account.component.css"]
})
export class MyAccountComponent implements OnInit, OnDestroy {
  public currentuserid: string = "0";
  public clientId: string = "0";
  public divisionalId: string = "All";
  loading: boolean = false;
  private clsUtility: Utility;
  subClientList: any = [];
  subclientcode: any;
  public state: State = {
    skip: 0
    // ,
    // take: 15
  };
  public gridView: GridDataResult;
  private subscription = new SubSink();

  constructor(
    private dataService: DatatransaferService,
    public api: Api,
    private toastr: ToastrService,
    private resolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef
  ) {
    this.clsUtility = new Utility(toastr);
  }

  ngOnInit() {
    try {
      this.currentuserid = this.dataService.SelectedUserid;
      this.retriveSubClient();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  retriveSubClient() {
    try {
      let getsubclient: {
        userid: string;
        status: boolean;
        v_clientid: string;
        v_divisioncode: string;
      } = {
        userid: this.currentuserid,
        status: false,
        v_clientid: this.clientId,
        v_divisioncode: this.divisionalId
      };
      this.loading = true;
      let seq = this.api.post("SubClient/GetSubClientByUserId", getsubclient);
      this.subscription.add(
        seq.subscribe(
          res => {
            this.subClientList = [];
            if (res && Object.entries(res).length !== 0) {
              this.subClientList = res;
              this.loadItems();
              if (this.gridView.data.length == 1) {
                this.cdr.detectChanges();
                let evt: any = {
                  index: 0,
                  dataItem: this.gridView.data[0]
                };
                this.onExpand(evt);
                document.getElementById("myAccountGrid").click();
              }
            }
            this.loading = false;
          },
          err => {
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

  onExpand(evt: any) {
    try {
      if (!this.gridView.data[evt.index].splitParameters) {
        this.GetSplitParameters(evt.index, evt.dataItem);
      }
      // if (!this.gridView.data[evt.index].subclientftplist) {
      //   this.GetFtpDetails(evt.index, evt.dataItem);
      // }
      // if (!this.gridView.data[evt.index].providerlist) {
      //   this.GetProviderMappingDetails(evt.index, evt.dataItem);
      // }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getFtpDetails(dataItem: any, index: number) {
    try {
      if (!this.gridView.data[index].subclientftplist) {
        this.GetFtpDetails(index, dataItem);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
  getProviderDetails(dataItem: any, index: number) {
    try {
      if (!this.gridView.data[index].providerlist) {
        this.GetProviderMappingDetails(index, dataItem);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  GetSplitParameters(index: number, dataItem: any) {
    try {
      // Get Split Para Start
      let getsplitpara: {
        splitparameterid: string;
        subclientcode: string;
      } = {
        splitparameterid: "0",
        subclientcode: dataItem.subclientcode
      };
      let seq2 = this.api.post("SubClient/GetSplitParameter", getsplitpara);
      this.subscription.add(
        seq2.subscribe(
          res => {
            if (res) {
              this.gridView.data[index].splitParameters = <clssplitpara[]>res;
            }
          },
          err => {
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  GetFtpDetails(index: number, dataItem: any) {
    try {
      // Get FTP INfo Start
      let getftp: { ftpid: string; subclientcode: string } = {
        ftpid: "0",
        subclientcode: dataItem.subclientcode
      };
      let seq3 = this.api.post("SubClient/GetSubClientFTP", getftp);
      this.subscription.add(
        seq3.subscribe(
          res3 => {
            if (res3) {
              this.gridView.data[index].subclientftplist = res3;
            }
          },
          err => {
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  GetProviderMappingDetails(index: number, dataItem: any) {
    try {
      let mappingid: {
        smappingid: string;
        clientid: number;
        subclientId: number;
        npitype: string;
        searchtext: string;
        sstatus: string;
        pageno: number;
        pagesize: number;
      } = {
        smappingid: "0",
        clientid: dataItem.clientid,
        subclientId: dataItem.id,
        npitype: null,
        searchtext: null,
        sstatus: null,
        pageno: null,
        pagesize: null
      };
      let seq = this.api.post("SubClient/ProviderMapping", mappingid);
      this.subscription.add(
        seq.subscribe(
          data => {
            if (data != null && data != undefined) {
              if (data["content"] != null && data["content"] != undefined) {
                this.gridView.data[index].providerlist = data["content"];
              } else {
                this.gridView.data[index].providerlist = [];
              }
            }
          },
          error => {
            this.clsUtility.LogError(error);
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
  expandDefault(kendoGridInstance: GridComponent) {
    try {
      kendoGridInstance.expandRow(0);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
  public collapseAll(topGrid: GridComponent) {
    try {
      this.gridView.data.forEach((item, idx) => {
        topGrid.collapseRow(idx);
      });
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async expandAll(topGrid: GridComponent) {
    try {
      this.loading = true;
      // this.gridView.data.forEach(async (item, idx) => {
      for (let i = 0; i < this.gridView.data.length; i++) {
        if (!this.gridView.data[i].splitParameters) {
          let evt: any = {
            index: i,
            dataItem: this.gridView[i]
          };
          // this.onExpand(evt);
          let getsplitpara: {
            splitparameterid: string;
            subclientcode: string;
          } = {
            splitparameterid: "0",
            subclientcode: this.gridView.data[i].subclientcode
          };
          await this.api
            .post("SubClient/GetSplitParameter", getsplitpara)
            .toPromise()
            .then(
              res => {
                if (res) {
                  this.gridView.data[i].splitParameters = <clssplitpara[]>res;
                }
                topGrid.expandRow(i);
              },
              err => {
                this.clsUtility.LogError(err);
              }
            );
        } else {
          topGrid.expandRow(i);
        }
      }
      // });
      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.clsUtility.LogError(error);
    }
  }
  private loadItems(): void {
    try {
      this.gridView = process(this.subClientList, this.state);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
  public dataStateChange(state: DataStateChangeEvent): void {
    if (this.subClientList.length > 1)
      document.getElementById("collapseId").click();

    this.state = state;
    // if (state.filter != undefined && state.filter != null) {
    //   state.filter.filters.forEach(f => {
    //     if (f["field"] == "subclientname" || f["field"] == "subclientcode") {
    //       if (f["value"] != null) {
    //         f["value"] = f["value"].trim();
    //       }
    //     }
    //   });
    //   // this.state.skip = 0;
    // }
    this.loadItems();
  }

  ngOnDestroy() {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
