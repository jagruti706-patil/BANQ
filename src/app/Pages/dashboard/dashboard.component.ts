import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MasterdataService } from "src/app/Services/masterdata.service";
import { CoreoperationsService } from "src/app/Services/coreoperations.service";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Client } from "src/app/Model/client";
import { Ftpmaster } from "src/app/Model/ftpmaster";
import { Subclient } from "src/app/Model/subclient";
import { Servicetype } from "src/app/Model/servicetype";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { SubSink } from "../../../../node_modules/subsink";

declare var $: any;

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(
    private aRoute: ActivatedRoute,
    private route: Router,
    private coreService: CoreoperationsService,
    private dataService: DatatransaferService,
    private toastr: ToastrService
  ) {
    this.clsClientObject = new Client();
    this.clsUtility = new Utility(toastr);
  }

  private clsUtility: Utility;
  private subscription = new SubSink();

  public clsClientObject: Client;
  public ClientStatus: number = 0;

  public ClientDetailsgridData: {};
  public ClientDetailsgridView: GridDataResult;
  private ClientDetailsitems: any[] = [];
  public ClientDetailspageSize = 10;
  public ClientDetailsskip = 0;

  public opened = false;

  public clientID = 0;
  public deleteClientID: number;
  public editClientID: string;

  public hiddenColumns: string[] = [];

  public openedDetails = false;

  public ClientDetailsInputEditMessage: string;
  public ClientDetailsOutEditResult: boolean;
  public ClientDetailsInputDeleteMessage: string;
  public ClientDetailsOutDeleteResult: boolean;

  // Loading
  loadingClientDetails = false;

  queryparams: any;
  localstoragevalue: any;
  public ClientDetailssort: SortDescriptor[] = [
    {
      field: "clientcode",
      dir: "desc"
    }
  ];

  // ClientSearchGroup = this.fb.group({
  //   fcClientSearch: [''],
  // });

  // get ClientSearch() {
  //   return this.ClientSearchGroup.get('fcClientSearch');
  // }

  OutputClientStatus($event) {
    try {
      this.opened = false;
      this.ClientStatus = 0;
      this.RetriveAllClient(this.ClientStatus);
      this.clientID = 0;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnInit() {
    try {
      this.ClientStatus = 0;
      this.RetriveAllClient(this.ClientStatus);
      this.hideColumn("clientid");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveAllClient(nClientStatus) {
    try {
      this.loadingClientDetails = true;
      this.subscription.add(
        this.coreService.getClientList(nClientStatus).subscribe(
          data => {
            this.ClientDetailsgridData = data;
            this.ClientDetailsitems = data;
            this.loadItems();
            this.loadingClientDetails = false;
          },
          err => {
            this.loadingClientDetails = false;
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onAddClientClick() {
    try {
      this.dataService.EditClientid = "0";
      this.route.navigate(["Registration"]);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  EditClient({ sender, rowIndex, dataItem }) {
    try {
      this.ClientDetailsInputEditMessage =
        "Do you want to edit client " + dataItem.clientcode + "?";
      this.editClientID = dataItem.clientid;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    try {
      this.ClientDetailsskip = event.skip;
      this.loadItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadItems(): void {
    try {
      this.ClientDetailsgridView = {
        data: orderBy(
          this.ClientDetailsitems.slice(
            this.ClientDetailsskip,
            this.ClientDetailsskip + this.ClientDetailspageSize
          ),
          this.ClientDetailssort
        ),
        total: this.ClientDetailsitems.length
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public isHidden(columnName: string): boolean {
    try {
      return this.hiddenColumns.indexOf(columnName) > -1;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public hideColumn(columnName: string): void {
    try {
      const hiddenColumns = this.hiddenColumns;
      hiddenColumns.push(columnName);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  DeleteClient({ sender, rowIndex, dataItem }) {
    try {
      this.deleteClientID = dataItem.clientid;
      this.ClientDetailsInputDeleteMessage =
        "Do you want to delete client " + dataItem.clientcode + "?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  deleteClientConfiguration() {
    try {
      this.subscription.add(
        this.coreService.deleteClientDetail(this.deleteClientID).subscribe(
          (data: {}) => {
            if (data != null || data != undefined) {
              if (data == 1) {
              } else {
              }
              this.deleteClientID = 0;
              this.RetriveAllClient(this.ClientStatus);
            }
          },
          err => {
            this.loadingClientDetails = false;
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnClientDetails(clientID) {
    try {
      this.loadingClientDetails = true;
      this.clientID = clientID;
      this.opened = true;
      this.loadingClientDetails = false;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnClientSubclientDetails(clientID) {
    try {
      this.getClientDetailbyId(clientID);
      this.loadingClientDetails = true;
      this.clientID = clientID;
      this.openedDetails = true;
      this.loadingClientDetails = false;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getClientDetailbyId(id: string) {
    try {
      this.subscription.add(
        this.coreService.getClientDetailbyId(id).subscribe(
          data => {
            let Clientdata: any = data;
            let ClientFTPDetail: Ftpmaster;
            let sServiceType: Array<Servicetype> = [];
            let allsubclientDetails: Array<Subclient> = [];
            let subclient: Subclient;

            subclient = new Subclient();
            ClientFTPDetail = new Ftpmaster();
            sServiceType = Clientdata.clientjson.clientservicetypes;
            ClientFTPDetail = Clientdata.clientjson.clientinboundftp;

            this.clsClientObject = new Client();
            this.clsClientObject.clientcode = Clientdata.clientjson.clientcode;
            this.clsClientObject.clientname = Clientdata.clientjson.clientname;
            this.clsClientObject.clientcontactname =
              Clientdata.clientjson.clientcontactname;
            this.clsClientObject.clientcontactemail =
              Clientdata.clientjson.clientcontactemail;
            this.clsClientObject.clientcontactphone =
              Clientdata.clientjson.clientcontactphone;
            this.clsClientObject.clientstatus =
              Clientdata.clientjson.clientstatus;
            this.clsClientObject.clientservicetypes = sServiceType;
            this.clsClientObject.clientinboundftp = ClientFTPDetail;
            if (
              sServiceType.find(
                x => x.servicetypename === "ERA HUB" && x.status === true
              )
            ) {
              allsubclientDetails = Clientdata.clientjson.subclients;
              this.clsClientObject.subclients = allsubclientDetails;
            } else {
              this.clsClientObject.subclients = null;
            }
          },
          err => {
            this.loadingClientDetails = false;
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortChange(sort: SortDescriptor[]): void {
    try {
      this.ClientDetailssort = sort;
      this.loadItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputEditResult($event) {
    try {
      this.ClientDetailsOutEditResult = $event;
      if (this.ClientDetailsOutEditResult == true) {
        this.dataService.EditClientid = this.editClientID;
        this.route.navigate(["/Edit"]);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputDeleteResult($event) {
    try {
      this.ClientDetailsOutDeleteResult = $event;
      if (this.ClientDetailsOutDeleteResult == true) {
        this.deleteClientConfiguration();
      }
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

  // onClientSearchClick() {
  //   // console.log("this.items" + JSON.stringify(this.items));

  //   if (this.ClientSearch.value == "") {
  //     this.RetriveAllClient();
  //     return;
  //   }

  //   if (this.items.length > 0) {
  //     this.RetriveAllClient();
  //     console.log("Loading : " + this.loading);
  //     if ((this.items.filter(x => x.clientcode.toLowerCase().indexOf(this.ClientSearch.value.toLowerCase()) >= 0)).length != 0) {
  //       this.items = this.items.filter(x => x.clientcode.toLowerCase().indexOf(this.ClientSearch.value.toLowerCase()) >= 0);
  //       console.log("Match found in clientcode");
  //     }
  //     else if ((this.items.filter(x => x.clientname.toLowerCase().indexOf(this.ClientSearch.value.toLowerCase()) >= 0)).length != 0) {
  //       this.items = this.items.filter(x => x.clientname.toLowerCase().indexOf(this.ClientSearch.value.toLowerCase()) >= 0);
  //       console.log("Match found in clientname");
  //     }
  //     else if ((this.items.filter(x => x.clientcontactname.toLowerCase().indexOf(this.ClientSearch.value.toLowerCase()) >= 0)).length != 0) {
  //       this.items = this.items.filter(x => x.clientcontactname.toLowerCase().indexOf(this.ClientSearch.value.toLowerCase()) >= 0);
  //       console.log("Match found in clientcontactname");
  //     }
  //     else if ((this.items.filter(x => x.clientcontactemail.toLowerCase().indexOf(this.ClientSearch.value.toLowerCase()) >= 0)).length != 0) {
  //       this.items = this.items.filter(x => x.clientcontactemail.toLowerCase().indexOf(this.ClientSearch.value.toLowerCase()) >= 0);
  //       console.log("Match found in clientcontactemail");
  //     }
  //     else if ((this.items.filter(x => x.clientcontactphone.toLowerCase().indexOf(this.ClientSearch.value.toLowerCase()) >= 0)).length != 0) {
  //       this.items = this.items.filter(x => x.clientcontactphone.toLowerCase().indexOf(this.ClientSearch.value.toLowerCase()) >= 0);
  //       console.log("Match found in clientcontactphone");
  //     }
  //     this.loadItems();
  //   }
  // }
}
