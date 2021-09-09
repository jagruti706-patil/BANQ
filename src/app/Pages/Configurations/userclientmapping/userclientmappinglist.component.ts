import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { ToastrService } from "ngx-toastr";
import { Utility } from "src/app/Model/utility";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
declare var $: any;
import { Api } from "./../../../Services/api";
import { UserclientmappingComponent } from "./userclientmapping.component";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { CoreauthService } from "src/app/Services/coreauth.service";
import { isNullOrUndefined } from "util";
import { Client } from "src/app/Model/client";
import { Subclient } from "src/app/Model/subclient";
import { Userclient } from "src/app/Model/Configuration/Userclient";
import { AllConfigurationService } from "src/app/Services/all-configuration.service";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { SubSink } from "subsink";

@Component({
  selector: "app-userclientmappinglist",
  templateUrl: "./userclientmappinglist.component.html",
  styleUrls: ["./userclientmappinglist.component.css"],
})
export class UserclientmappinglistComponent
  implements OnInit, AfterViewInit, OnDestroy {
  toggleme: boolean = false;
  public userclientmappinggridData: {};
  public userclientmappinggridView: GridDataResult;
  private userclientmappingitems: any[] = [];
  public userclientmappingskip = 0;
  public userclientmappingpageSize = 0;

  private userclientmappingid: string = "";
  public edituserclientmappingid: string = "";
  private deleteuserclientmappingid: string = "";
  public Edituserclientmappingid: string = "";

  public InputEditMessage: string;
  public OutEditResult: boolean;
  public InputDeleteMessage: string;
  public OutDeleteResult: boolean;
  //private subscription = new SubSink();
  private clsUtility: Utility;

  public del_client: string = "";
  public del_subclient: string = "";
  public del_email: string = "";
  // Loading
  loadinguserclientmappingGrid = true;
  public clientList: any = [];
  public SelectAllClients: any = [];
  public SelectAllSubClients: any = [];
  public subClientList: any = [];
  public sSelectedSubClientId: any = 0;
  public sSelectedClientId: any = "0";
  public sSearchText: string = "";
  DropDownGroup: FormGroup;
  disablesubclient: boolean = true;
  disableclient: boolean = true;
  disablesearch: boolean = true;
  updatemappingid: any;
  updatestatus: boolean = false;
  updatemessage: string = "";
  updateclient: string = "";
  updateuser: string = "";
  updatesubclient: string = "";

  public sStatus: any = [
    { value: "2", text: "All" },
    { value: "0", text: "Active" },
    { value: "1", text: "Inactive" },
  ];
  public selectedStatusValue: string = "All";
  public sSelectedStatus: string = "2";
  public disabledstatus: boolean = false;
  public clsPermission: clsPermission;
  private subscription = new SubSink();

  @ViewChild("AdduserclientmappingChild")
  private AdduserclientmappingChild: UserclientmappingComponent;

  public userclientmappingsort: SortDescriptor[] = [
    {
      field: "spayername",
      dir: "desc",
    },
  ];

  constructor(
    private toastr: ToastrService,
    private api: Api,
    private fb: FormBuilder,
    private coreService: CoreauthService,
    private allConfigService: AllConfigurationService,
    private dataService: DatatransaferService
  ) {
    this.clsUtility = new Utility(toastr);
    this.userclientmappingpageSize = this.clsUtility.configPageSize;
    this.DropDownGroup = this.fb.group({
      fcClientName: [""],
      fcSubClientName: [""],
      fcSearch: [""],
      fcStatus: [""],
    });
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

      this.userclientmappingid = "";
      this.getuserclientmappingById();
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

  getuserclientmappingById(insertlog: boolean = true) {
    try {
      this.userclientmappinggridView = null;
      this.userclientmappingitems = [];
      this.loadinguserclientmappingGrid = true;
      let param: {
        v_userclientmappingid: string;
        v_clientid: string;
        v_subclientid: string;
        searchtext: string;
        sstatus: string;
        pageno: number;
        pagesize: number;
      } = {
        v_userclientmappingid: "0",
        v_clientid: this.sSelectedClientId,
        v_subclientid: this.sSelectedSubClientId,
        searchtext: this.sSearchText,
        sstatus: this.selectedStatusValue,
        pageno: this.userclientmappingskip,
        pagesize: this.userclientmappingpageSize,
      };
      let seq = this.api.post("UserClientMapping", param);
      this.subscription.add(
        seq.subscribe(
          (data) => {
            if (data != null || data != undefined) {
              this.userclientmappinggridData = data;
              if (
                this.userclientmappinggridData != null ||
                this.userclientmappinggridData != undefined
              ) {
                this.userclientmappingitems = <any>(
                  this.userclientmappinggridData["content"]
                );
                if (
                  this.userclientmappingitems != null &&
                  this.userclientmappingitems != undefined
                ) {
                  this.disableclient = false;
                  this.loaduserclientmappingitems();
                } else {
                  this.userclientmappingitems = [];
                  this.loaduserclientmappingitems();
                }
                this.loadinguserclientmappingGrid = false;

                if (insertlog) {
                  this.api.insertActivityLog(
                    "User Mapping List Viewed",
                    "User Mapping",
                    "READ"
                  );
                }
              } else {
                // this.disableclient = true;
                // this.disablesubclient = true;
                this.userclientmappingitems = [];
                this.loaduserclientmappingitems();
                this.loadinguserclientmappingGrid = false;

                if (insertlog) {
                  this.api.insertActivityLog(
                    "User Mapping List Viewed",
                    "User Mapping",
                    "READ"
                  );
                }
              }
            }
          },
          (error) => {
            this.loadinguserclientmappingGrid = false;
            this.clsUtility.LogError(error);
          }
        )
      );
    } catch (error) {
      this.loadinguserclientmappingGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  private loaduserclientmappingitems(): void {
    try {
      if (this.userclientmappingitems.length > 0) {
        this.userclientmappinggridView = {
          data: orderBy(
            this.userclientmappingitems,
            this.userclientmappingsort
          ),
          total: this.userclientmappinggridData["totalelements"],
        };
      } else {
        this.userclientmappinggridView = <any>this.userclientmappingitems;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortPayerChange(sort: SortDescriptor[]): void {
    try {
      if (this.userclientmappingitems != null) {
        this.userclientmappingsort = sort;
        this.loaduserclientmappingitems();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeuserclientmapping(event: PageChangeEvent): void {
    try {
      this.userclientmappinggridView = null;
      this.userclientmappingskip = event.skip;
      this.getuserclientmappingById(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  Edituserclientmapping({ sender, rowIndex, dataItem }) {
    try {
      this.edituserclientmappingid = dataItem.id;
      this.InputEditMessage = "Do you want to edit user mapping?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  Deleteuserclientmapping({ sender, rowIndex, dataItem }) {
    try {
      this.deleteuserclientmappingid = dataItem.id;
      this.del_client = dataItem.clientname;
      this.del_subclient =
        dataItem.subclientname + " - " + dataItem.subclientcode;
      this.del_email = dataItem.firstname + " " + dataItem.lastname;
      this.InputDeleteMessage = "Do you want to delete user mapping?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  deleteuserclientmapping() {
    try {
      let seq = this.api.delete(
        "UserClientMapping/Delete/" + this.deleteuserclientmappingid
      );
      this.subscription.add(
        seq.subscribe(
          (data) => {
            if (data != null || data != undefined) {
              if (data == 1) {
                this.clsUtility.showSuccess(
                  "User mapping deleted successfully."
                );

                this.api.insertActivityLog(
                  "Deleted User Mapping for Groupname: " +
                    this.del_client +
                    ", " +
                    (this.del_subclient == "0"
                      ? ""
                      : "Practice: " + this.del_subclient + "") +
                    ", Username: " +
                    this.del_email,
                  "User Mapping",
                  "DELETE"
                );
                this.getuserclientmappingById(false);
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

  updateuserclientmappingStatus(Payerid, Payer) {
    try {
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  Adduserclientmapping() {
    try {
      this.edituserclientmappingid = "";
      this.Edituserclientmappingid = "";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputEditResult($event) {
    try {
      this.OutEditResult = $event;
      if (this.OutEditResult == true) {
        this.Edituserclientmappingid = this.edituserclientmappingid;
        $("#adduserclientmappingModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputDeleteResult($event) {
    try {
      this.OutDeleteResult = $event;
      if (this.OutDeleteResult == true) {
        this.deleteuserclientmapping();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputUserclientmappingEditResult($event) {
    try {
      this.userclientmappingid = "";
      let IsSaved = $event;
      if (IsSaved == true) {
        this.getuserclientmappingById();
        this.AdduserclientmappingChild.ResetComponents();
        this.edituserclientmappingid = null;
        this.Edituserclientmappingid = null;
        $("#adduserclientmappingModal").modal("hide");
      } else {
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnuserclientmappingStatus(Payerid, PayerStatus) {
    try {
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

  getClientlist() {
    try {
      // this.loading = true;
      let getclient: { clientid: string; clientstatus: boolean } = {
        clientid: "0",
        clientstatus: true,
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

              if (this.userclientmappingitems.length > 0) {
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
        this.subClientList = [];
        this.SelectAllSubClients = [];
        this.disablesubclient = true;
        this.userclientmappingskip = 0;
      } else {
        if (this.DropDownGroup.controls.fcClientName.value == 0) {
          this.userclientmappingskip = 0;
          this.subClientList = [];
          this.SelectAllSubClients = [];
          this.disablesubclient = true;
          this.sSelectedClientId = "0";
          this.sSelectedSubClientId = 0;
          this.getsubClientlist(this.DropDownGroup.controls.fcClientName.value);
          this.getuserclientmappingById(false);
        } else {
          this.userclientmappingskip = 0;
          this.sSelectedClientId = this.DropDownGroup.controls.fcClientName.value;
          this.disablesubclient = false;
          this.sSelectedSubClientId = 0;
          this.getsubClientlist(this.DropDownGroup.controls.fcClientName.value);
          this.getuserclientmappingById(false);
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getsubClientlist(clientid: any) {
    try {
      let getsubclient: {
        clientid: string;
        subclientcode: string;
        subclientstatus: boolean;
      } = {
        clientid: clientid,
        subclientcode: "",
        subclientstatus: true,
      };
      let seq = this.api.post("SubClient/GetSubClient", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.subClientList = res;
            if (this.subClientList != null || this.subClientList != undefined) {
              if (this.subClientList.length > 0) {
                const Subclt = new Subclient();
                Subclt.id = 0;
                Subclt.subclientcode = "0";
                Subclt.subclientname = "All";
                this.subClientList.unshift(Subclt);
                this.SelectAllSubClients = this.subClientList;
                this.sSelectedSubClientId = 0;
              } else {
                this.subClientList = [];
                this.SelectAllSubClients = [];
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

  onSubClientChange(event: any) {
    try {
      if (
        this.DropDownGroup.controls.fcSubClientName.value == undefined ||
        this.DropDownGroup.controls.fcSubClientName.value == ""
      ) {
        // this.subClientList = [];
        // this.SelectAllSubClients = [];
        this.userclientmappingskip = 0;
        this.sSelectedSubClientId = 0;
        this.getuserclientmappingById(false);
      } else {
        this.userclientmappingskip = 0;
        this.sSelectedSubClientId = this.DropDownGroup.controls.fcSubClientName.value;
        this.getuserclientmappingById(false);
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

  handleSubclientFilter(value) {
    this.subClientList = this.SelectAllSubClients.filter(
      (s) => s.subclientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  onSearch($event: any = null) {
    try {
      if (!isNullOrUndefined($event)) {
        if ($event.type == "keyup") {
          this.userclientmappingskip = 0;
          this.sSearchText = "";
          this.sSearchText = this.DropDownGroup.controls.fcSearch.value.trim();
          this.getuserclientmappingById(false);
        } else if ($event.type == "click") {
          this.userclientmappingskip = 0;
          this.sSearchText = "";
          this.sSearchText = this.DropDownGroup.controls.fcSearch.value.trim();
          this.getuserclientmappingById(false);
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortuserclientmappingChange(sort: SortDescriptor[]): void {
    try {
      this.userclientmappingsort = sort;
      this.loaduserclientmappingitems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnclientusermappingStatus(mappingid, Status) {
    try {
      let objmapping: Userclient;
      objmapping = new Userclient();
      objmapping.id = mappingid;
      objmapping.status = Status;
      //this.updateStatusMapping(Providermappingid, objProvidermapping);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  deleteConfiratmion(dataItem: any) {
    try {
      this.updatemappingid = dataItem.id;
      this.updateclient = dataItem.clientname;
      this.updatesubclient =
        dataItem.subclientname + " - " + dataItem.subclientcode;
      this.updateuser = dataItem.firstname + " " + dataItem.lastname;

      if (Boolean(dataItem.status)) {
        this.updatemessage =
          "Do you want to Deactivate user mapping for group: '" +
          dataItem.clientname +
          "', practice: '" +
          dataItem.subclientname +
          "', user: '" +
          this.updateuser +
          "'?";
        this.updatestatus = false;
      } else {
        this.updatemessage =
          "Do you want to Activate user mapping for group: '" +
          dataItem.clientname +
          "', practice: '" +
          dataItem.subclientname +
          "', user: '" +
          this.updateuser +
          "'?";
        this.updatestatus = true;
      }

      $("#deletemodal").modal("show");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  updatestatususermapping() {
    try {
      let updateclient: { id: string; status: boolean } = {
        id: this.updatemappingid,
        status: this.updatestatus,
      };
      let seq = this.api.post("UserClientMapping/UpdateStatus", updateclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            if (res != null || res != undefined) {
              if (res == 1) {
                this.clsUtility.showSuccess(
                  "User mapping status updated successfully."
                );

                this.api.insertActivityLog(
                  "User Mapping (Groupname: " +
                    this.updateclient +
                    ", Practice: " +
                    this.updatesubclient +
                    ", Username: " +
                    this.updateuser +
                    ") " +
                    (this.updatestatus == true ? "Activated" : "Deactivated") +
                    "",
                  "User Mapping",
                  this.updatestatus == true ? "ACTIVATE" : "DEACTIVATE"
                );
                this.getuserclientmappingById(false);
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

  onStatusChange(event: any) {
    try {
      this.userclientmappingskip = 0;
      this.sSelectedStatus = event;
      if (this.sSelectedStatus.toLowerCase() == "active") {
        this.selectedStatusValue = "true";
      } else if (this.sSelectedStatus.toLowerCase() == "inactive") {
        this.selectedStatusValue = "false";
      } else {
        this.selectedStatusValue = "All";
      }
      this.getuserclientmappingById(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
