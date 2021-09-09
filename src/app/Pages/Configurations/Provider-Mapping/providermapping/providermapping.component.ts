import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { AddprovidermappingComponent } from "../addprovidermapping/addprovidermapping.component";

import { Api } from "src/app/Services/api";
import { Subclient } from "src/app/Model/subclient";
import { Validators, FormBuilder } from "@angular/forms";
import {
  convertActionBinding,
  ConvertActionBindingResult,
} from "@angular/compiler/src/compiler_util/expression_converter";
import { isNullOrUndefined } from "util";
import { Providermapping } from "src/app/Model/Configuration/providermapping";
declare var $: any;
import { Client } from "src/app/Model/client";
import { AllConfigurationService } from "src/app/Services/all-configuration.service";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { SubSink } from "subsink";

@Component({
  selector: "app-providermapping",
  templateUrl: "./providermapping.component.html",
  styleUrls: ["./providermapping.component.css"],
})
export class ProvidermappingComponent
  implements OnInit, AfterViewInit, OnDestroy {
  toggleme: boolean = false;
  public ProvidermappinggridData: {};
  public ProvidermappinggridView: GridDataResult;
  private Providermappingitems: any[] = [];
  public Providermappingskip = 0;
  public ProvidermappingpageSize = 0;

  private Providermappingid: string = "";
  public editProvidermappingid: string = "";
  private deleteProvidermappingid: string = "";
  private deleteProvidersubclient: string = "";
  private deleteProvidernpi: string = "";
  private deleteProvidersubclientcode: string = "";
  public EditProvidermappingid: string = "";

  public InputEditMessage: string;
  public OutEditResult: boolean;
  public InputDeleteMessage: string;
  public OutDeleteResult: boolean;
  //private subscription = new SubSink();
  private clsUtility: Utility;

  private updateStatusMappingId: any;
  public updateMappingMessage: string;
  private updateMappingStatus: boolean;
  private deleteNPI: string = "";
  private deletesubclient: string = "";
  private deletesubclientname: string = "";

  public sSubClients: any;
  public SelectAllSubClients: any;
  public nSelectedClientID: string = "0";
  public sSelectedSubClientId: any = "0";
  public disabledsubclient: boolean = false;
  public disabledstatus: boolean = false;
  public disabledtype: boolean = false;
  public disabledsearch: boolean = false;
  public sSearchText: string = "";

  public sStatus: any = [
    { value: "2", text: "All" },
    { value: "0", text: "Active" },
    { value: "1", text: "Inactive" },
  ];
  public sSelectedStatus: string = "2";
  public selectedStatusValue: string = "All";
  public sSelectedType: string = "2";
  public selectedTypeValue: string = "All";
  public sType: any = [
    { value: "2", text: "All" },
    { value: "0", text: "Individual" },
    { value: "1", text: "Organizational" },
  ];

  // Loading
  loadingProvidermappingGrid = true;
  public clientList: any = [];
  public SelectAllClients: any = [];
  public sSelectedClientId: any = "0";
  disableclient: boolean = true;
  disablesubclient: boolean = true;
  public clsPermission: clsPermission;
  private subscription = new SubSink();

  @ViewChild("AddProvidermappingChild")
  private AddProvidermappingChild: AddprovidermappingComponent;

  public Providermappingsort: SortDescriptor[] = [
    {
      field: "createdon",
      dir: "desc",
    },
  ];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private api: Api,
    private allConfigService: AllConfigurationService,
    private dataService: DatatransaferService
  ) {
    this.clsUtility = new Utility(toastr);
    this.ProvidermappingpageSize = this.clsUtility.configPageSize;
  }

  DropDownGroup = this.fb.group({
    fcClientName: [""],
    fcSubClientName: ["", Validators.required],
    fcSearch: [""],
    fcStatus: [""],
    fcType: [""],
  });

  get ClientName() {
    return this.DropDownGroup.get("fcClientName");
  }

  get SubClientName() {
    return this.DropDownGroup.get("fcSubClientName");
  }

  get fbcFilterSearch() {
    return this.DropDownGroup.get("fcSearch");
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );
      this.allConfigService.toggleSidebar.subscribe((isToggle) => {
        this.toggleme = isToggle;
      });
      this.Providermappingid = "";
      this.getProvidermappingById();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  togglesidebar() {
    this.allConfigService.toggleSidebar.next(!this.toggleme);
  }

  ngAfterViewInit() {
    this.getClientlist();
  }

  getProvidermappingById() {
    try {
      this.ProvidermappinggridView = null;
      this.Providermappingitems = [];
      this.loadingProvidermappingGrid = true;
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
        clientid: this.sSelectedClientId,
        subclientId: this.sSelectedSubClientId,
        npitype: this.selectedTypeValue,
        searchtext: this.sSearchText,
        sstatus: this.selectedStatusValue,
        pageno: this.Providermappingskip,
        pagesize: this.ProvidermappingpageSize,
      };
      let seq = this.api.post("SubClient/ProviderMapping", mappingid);
      this.subscription.add(
        seq.subscribe(
          (data) => {
            if (data != null || data != undefined) {
              let sdata = data;
              if (data["content"] != null && data["content"] != undefined) {
                this.ProvidermappinggridData = sdata;
                this.Providermappingitems = <any>sdata["content"];
                this.disableclient = false;
                if (
                  this.Providermappingitems != null &&
                  this.Providermappingitems != undefined
                ) {
                  this.loadProvidermappingitems();
                } else {
                  this.Providermappingitems = [];
                  this.loadProvidermappingitems();
                }

                this.loadingProvidermappingGrid = false;
                this.api.insertActivityLog(
                  "Provider Mapping List Viewed",
                  "Provider Mapping",
                  "READ"
                );
              } else {
                this.ProvidermappinggridView = null;
                this.ProvidermappinggridData = [];
                this.Providermappingitems = [];
                this.loadingProvidermappingGrid = false;
              }
            }
          },
          (error) => {
            this.loadingProvidermappingGrid = false;
            this.clsUtility.LogError(error);
          }
        )
      );
    } catch (error) {
      this.loadingProvidermappingGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  private loadProvidermappingitems(): void {
    try {
      if (this.Providermappingitems.length > 0) {
        this.ProvidermappinggridView = {
          data: orderBy(this.Providermappingitems, this.Providermappingsort),
          total: this.ProvidermappinggridData["totalelements"],
        };
      } else {
        this.ProvidermappinggridView = <any>this.Providermappingitems;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortProvidermapping(sort: SortDescriptor[]): void {
    try {
      if (this.Providermappingitems != null) {
        this.Providermappingsort = sort;
        this.loadProvidermappingitems();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeProvidermapping(event: PageChangeEvent): void {
    try {
      this.ProvidermappinggridView = null;
      this.Providermappingskip = event.skip;
      this.getProvidermappingById();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  EditProvidermapping({ sender, rowIndex, dataItem }) {
    try {
      this.editProvidermappingid = dataItem.mappingid;
      this.InputEditMessage = "Do you want to edit provider mapping?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  DeleteProvidermapping({ sender, rowIndex, dataItem }) {
    try {
      this.deleteProvidermappingid = dataItem.mappingid;
      this.deleteProvidersubclient = dataItem.subclientname;
      this.deleteProvidersubclientcode = dataItem.subclientcode;
      this.deleteProvidernpi = dataItem.providernpi;
      this.InputDeleteMessage = "Do you want to delete provider mapping?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  deleteProvidermapping() {
    try {
      let param: {
        mappingid: any;
      } = {
        mappingid: this.deleteProvidermappingid,
      };

      let seq = this.api.post("SubClient/ProviderMapping/Delete", param);
      this.subscription.add(
        seq.subscribe(
          (data) => {
            if (data != null || data != undefined) {
              if (data == 1) {
                this.clsUtility.showSuccess(
                  "Provider mapping deleted successfully."
                );

                this.api.insertActivityLog(
                  "Deleted Provider Mapping for Practice name : " +
                    this.deleteProvidersubclient +
                    " ,PracticeCode : " +
                    this.deleteProvidersubclientcode +
                    " ,NPI : " +
                    this.deleteProvidernpi,
                  "Provider Mapping",
                  "DELETE"
                );

                this.getProvidermappingById();
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

  updateProvidermappingStatus(Payerid, Payer) {
    try {
      // const jsonpayer = JSON.stringify(Payer);
      // this.subscription.add(
      //   this.ConfigurationService.updatePayerStatus(
      //     Payerid,
      //     jsonpayer
      //   ).subscribe((data: {}) => {
      //     if (data != null || data != undefined) {
      //       if (data == 1) {
      //         this.clsUtility.showSuccess("Status updated successfully");
      //       } else if (data == 0) {
      //         this.clsUtility.showError("Status not updated");
      //       } else {
      //         this.clsUtility.showInfo(
      //           "Status cannot be updated already in use"
      //         );
      //       }
      //       this.getProvidermappingById();
      //     }
      //   })
      // );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  AddProvidermapping() {
    try {
      this.editProvidermappingid = "";
      this.EditProvidermappingid = "";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputEditResult($event) {
    try {
      this.OutEditResult = $event;
      if (this.OutEditResult == true) {
        this.EditProvidermappingid = this.editProvidermappingid;
        $("#addprovidermappingModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputDeleteResult($event) {
    try {
      this.OutDeleteResult = $event;
      if (this.OutDeleteResult == true) {
        this.deleteProvidermapping();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputProvidermappingEditResult($event) {
    try {
      this.Providermappingid = "";
      let IsSaved = $event;
      if (IsSaved == true) {
        this.getProvidermappingById();
        this.AddProvidermappingChild.ResetComponents();
        this.editProvidermappingid = null;
        this.EditProvidermappingid = null;
        $("#addprovidermappingModal").modal("hide");
      } else {
        this.AddProvidermappingChild.ResetComponents();
        this.editProvidermappingid = null;
        this.EditProvidermappingid = null;
        $("#addprovidermappingModal").modal("hide");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnProvidermappingStatus(Providermappingid, ProvidermappingStatus) {
    try {
      let objProvidermapping: Providermapping;
      objProvidermapping = new Providermapping();
      objProvidermapping.mappingid = Providermappingid;
      objProvidermapping.status = ProvidermappingStatus;
      //this.updateStatusMapping(Providermappingid, objProvidermapping);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  updateStatusConfirmation(dataItem: any) {
    try {
      this.updateStatusMappingId = dataItem.mappingid;
      this.deleteNPI = dataItem.providernpi;
      this.deletesubclient = dataItem.subclientcode;
      this.deletesubclientname = dataItem.subclientname;
      let status: boolean;

      if (dataItem.status.toLowerCase() == "false") {
        status = false;
      } else if (dataItem.status.toLowerCase() == "true") {
        status = true;
      }

      if (status) {
        this.updateMappingMessage =
          "Do you want to deactivate provider mapping for " +
          dataItem.sname +
          "?";
        this.updateMappingStatus = false;
      } else {
        this.updateMappingMessage =
          "Do you want to activate provider mapping for " +
          dataItem.sname +
          "?";
        this.updateMappingStatus = true;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  updateStatusMapping() {
    try {
      let obj: { mappingid: string; status: boolean } = {
        mappingid: this.updateStatusMappingId,
        status: this.updateMappingStatus,
      };
      let seq1 = this.api.post("SubClient/ProviderMapping/UpdateStatus", obj);
      seq1.subscribe(
        (data) => {
          if (data != null || data != undefined) {
            if (data == 1) {
              this.clsUtility.showSuccess(
                "Provider Mapping status updated successfully"
              );
              this.api.insertActivityLog(
                "Provider Mapping (NPI : " +
                  this.deleteNPI +
                  " ,Practice name : " +
                  this.deletesubclientname +
                  " ,PracticeCode : " +
                  this.deletesubclient +
                  ") " +
                  (this.updateMappingStatus == true
                    ? "Activated"
                    : "Deactivated") +
                  "",
                "Provider Mapping",
                this.updateMappingStatus == true ? "ACTIVATE" : "DEACTIVATE"
              );
              this.getProvidermappingById();
            } else {
              this.clsUtility.showError("Error while updating status");
            }
          }
        },
        (error) => {
          this.clsUtility.LogError(error);
        }
      );
    } catch (err) {
      this.clsUtility.LogError(err);
    }
  }

  ngOnDestroy() {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveSubClient(clientid: any) {
    try {
      let getsubclient: {
        clientid: string;
        subclientcode: string;
        subclientstatus: boolean;
      } = {
        clientid: clientid,
        subclientcode: "",
        subclientstatus: false,
      };
      let seq = this.api.post("SubClient/GetSubClient", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.sSubClients = res;

            if (
              !isNullOrUndefined(this.sSubClients) &&
              this.sSubClients.length > 0
            ) {
              this.disabledsubclient = false;
              this.disabledstatus = false;
              this.disabledsearch = false;
              const Subclt = new Subclient();
              Subclt.id = Number(this.nSelectedClientID);
              Subclt.subclientcode = "0";
              Subclt.subclientname = "All";
              this.sSubClients.unshift(Subclt);
              this.sSelectedSubClientId = 0;
              this.SelectAllSubClients = this.sSubClients;
            } else {
              this.sSubClients = [];
              this.disabledsubclient = true;
              this.disabledstatus = true;
              this.disabledsearch = true;
              this.loadingProvidermappingGrid = false;
              this.clsUtility.showInfo("No practice is active");
            }
          },
          (err) => {
            this.loadingProvidermappingGrid = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loadingProvidermappingGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onSubClientChange(event: any) {
    try {
      this.Providermappingskip = 0;
      this.loadingProvidermappingGrid = true;
      this.sSelectedSubClientId = event;
      this.getProvidermappingById();
    } catch (error) {
      this.loadingProvidermappingGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onStatusChange(event: any) {
    try {
      this.Providermappingskip = 0;
      this.loadingProvidermappingGrid = true;
      this.sSelectedStatus = event;
      if (this.sSelectedStatus.toLowerCase() == "active") {
        this.selectedStatusValue = "true";
      } else if (this.sSelectedStatus.toLowerCase() == "inactive") {
        this.selectedStatusValue = "false";
      } else {
        this.selectedStatusValue = "All";
      }
      this.getProvidermappingById();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onTypeChange(event: any) {
    try {
      this.Providermappingskip = 0;
      this.loadingProvidermappingGrid = true;
      this.sSelectedType = event;
      if (this.sSelectedType.toLowerCase() == "individual") {
        this.selectedTypeValue = "individual";
      } else if (this.sSelectedType.toLowerCase() == "organizational") {
        this.selectedTypeValue = "organization";
      } else {
        this.selectedTypeValue = "All";
      }
      this.getProvidermappingById();
    } catch (error) {
      this.loadingProvidermappingGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onSearch($event: any = null) {
    try {
      if (!isNullOrUndefined($event)) {
        if ($event.type == "keyup") {
          this.Providermappingskip = 0;
          this.sSearchText = null;
          this.sSearchText = this.fbcFilterSearch.value.trim();
          //this.SplitFilesdisplaytotalrecordscount = 0;
          this.loadingProvidermappingGrid = true;
          this.getProvidermappingById();
        } else if ($event.type == "click") {
          this.Providermappingskip = 0;
          this.sSearchText = null;
          this.sSearchText = this.fbcFilterSearch.value.trim();
          //this.SplitFilesdisplaytotalrecordscount = 0;
          this.loadingProvidermappingGrid = true;
          this.getProvidermappingById();
        }
      }
    } catch (error) {
      this.loadingProvidermappingGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  sortProvidermappingChange(sort: SortDescriptor[]): void {
    try {
      this.Providermappingsort = sort;
      this.loadProvidermappingitems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleSubclientFilter(value) {
    this.sSubClients = this.SelectAllSubClients.filter(
      (s) => s.subclientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  getClientlist() {
    try {
      let getclient: { clientid: string; clientstatus: boolean } = {
        clientid: "0",
        clientstatus: false,
      };
      let seq = this.api.post("GetClient", getclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.clientList = res;
            if (
              this.clientList != null &&
              this.clientList != undefined &&
              this.clientList.length > 0
            ) {
              this.disableclient = false;
              const Allclt = new Client();
              Allclt.clientid = "0";
              Allclt.clientcode = "";
              Allclt.clientname = "All";
              this.clientList.unshift(Allclt);
              this.SelectAllClients = this.clientList;
              this.sSelectedClientId = "0";

              if (this.Providermappingitems.length > 0) {
                this.disableclient = false;
              } else {
                this.disableclient = true;
              }
            } else {
              this.disableclient = true;
              this.clientList = [];
              this.SelectAllClients = [];
              this.clsUtility.showInfo("No group is active");
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

  onClientChange(event: any) {
    try {
      if (
        this.DropDownGroup.controls.fcClientName.value == undefined ||
        this.DropDownGroup.controls.fcClientName.value == ""
      ) {
        this.sSubClients = [];
        this.SelectAllSubClients = [];
        this.sSelectedSubClientId = 0;
        this.disablesubclient = true;
        this.Providermappingskip = 0;
      } else {
        if (this.DropDownGroup.controls.fcClientName.value == 0) {
          this.Providermappingskip = 0;
          this.sSubClients = [];
          this.SelectAllSubClients = [];
          this.disablesubclient = true;
          this.sSelectedClientId = "0";
          this.sSelectedSubClientId = 0;
          this.RetriveSubClient(this.DropDownGroup.controls.fcClientName.value);
          this.getProvidermappingById();
        } else {
          this.Providermappingskip = 0;
          this.sSelectedClientId = this.DropDownGroup.controls.fcClientName.value;
          this.disablesubclient = false;
          this.sSelectedSubClientId = 0;
          this.RetriveSubClient(this.DropDownGroup.controls.fcClientName.value);
          this.getProvidermappingById();
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleClientFilter(value) {
    this.clientList = this.SelectAllClients.filter(
      (s) => s.clientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }
}
