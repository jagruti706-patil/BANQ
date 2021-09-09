import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
//import { providermapping } from "src/app/Pages/Configurations/Provider-Mapping/providermapping";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { Api } from "src/app/Services/api";
import {
  GridDataResult,
  PageChangeEvent,
  SelectableSettings
} from "@progress/kendo-angular-grid";
import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { Providermapping } from "../../../../Model/Configuration/providermapping";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { SubSink } from "subsink";
import { isNullOrUndefined } from "util";

//import { SubSink } from "../../../../../../../../node_modules/subsink";
declare var $: any;

@Component({
  selector: "app-addprovidermapping",
  templateUrl: "./addprovidermapping.component.html",
  styleUrls: ["./addprovidermapping.component.css"]
})
export class AddprovidermappingComponent
  implements OnInit, OnChanges, OnDestroy {
  public newProvidermapping = true;
  public Providermappingdetail: any = [];
  public ProvidermappingEditid: any;
  public selectedProvidermappingValue: string;
  //private clsPayer: Payer;
  //private subscription = new SubSink();
  private clsUtility: Utility;
  public submitted = false;
  private Statusid: number = 0;

  public AddprovidermappinggridData: {};
  public AddprovidermappinggridView: GridDataResult;
  private Addprovidermappingitems: any[] = [];
  public Addprovidermappingskip = 0;
  public AddprovidermappingpageSize = 10;
  public SubclientItemList = [];
  public SubclientList: any = [];
  public selectedSubclientValues: any[] = [];
  public selectableSettings: SelectableSettings = {
    enabled: true,
    checkboxOnly: true,
  };
  public NPISelected: any = [];
  public checkboxOnly = true;
  public selectedCallback = args => args.dataItem;
  private providermapping: Providermapping;
  private loginGCPuserid: string;
  public clientList: any = [];
  public SelectAllClients: any = [];
  public selectedclients: number = 0;
  public SelectAllsubClients: any = [];
  public selectedsubclients: number = 0;
  public disablesubclient: boolean = true;
  public updatestatus: string = "true";
  public disabledsave: boolean = false;
  public confirmationMappingMessage: string;
  private subscription = new SubSink();
  private originalProvdermappingdetails: any;

  public Providermappingsort: SortDescriptor[] = [
    {
      field: "spayername",
      dir: "desc"
    }
  ];

  // Loading
  loadingNPIDetails = true;
  loadingProvidermappingDetails = false;

  // Received Input from parent component
  @Input() InputProvidermappingEditid: any;

  // Send Output to parent component
  @Output() OutputProvidermappingEditResult = new EventEmitter<boolean>();

  OutputprovidermappingEditResult(data: any) {
    let outProvidermappingEditResult = data;
    this.OutputProvidermappingEditResult.emit(outProvidermappingEditResult);
  }

  ProvidermappingGroup = this.fb.group({
    fcSearch: [""],
    fcsubclient: [""],
    fcclient: [""]
  });

  get fbcType() {
    return this.ProvidermappingGroup.get("fcType");
  }

  get fbcFilterSearch() {
    return this.ProvidermappingGroup.get("fcSearch");
  }

  get fbcSubclient() {
    return this.ProvidermappingGroup.get("fcsubclient");
  }

  get fbcClient() {
    return this.ProvidermappingGroup.get("fcclient");
  }

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private datatransfer: DatatransaferService,
    private toastr: ToastrService,
    private api: Api
  ) {
    this.clsUtility = new Utility(toastr);
    this.AddprovidermappingpageSize = this.clsUtility.pagesize;
    // this.setSelectableSettings();
  }

  ngOnInit() {
    try {
      //this.clsPayer = new Payer();
      this.subscription.add(
        this.datatransfer.loginGCPUserID.subscribe(data => {
          this.loginGCPuserid = data;
        })
      );

      this.getClientlist();
      // this.getSubclient();
      this.setStatus("Individual");
      if (
        this.InputProvidermappingEditid != null &&
        this.InputProvidermappingEditid != 0
      ) {
        this.newProvidermapping = false;
        this.ProvidermappingEditid = this.InputProvidermappingEditid;
        this.getProvidermappingById(this.ProvidermappingEditid);
      } else {
        this.newProvidermapping = true;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {
    try {
      this.subscription.add(
        this.datatransfer.loginGCPUserID.subscribe(data => {
          this.loginGCPuserid = data;
        })
      );
      this.getClientlist();
      //this.clsPayer = new Payer();
      // this.getSubclient();
      this.setStatus("Individual");
      if (
        this.InputProvidermappingEditid != null &&
        this.InputProvidermappingEditid != 0
      ) {
        this.newProvidermapping = false;
        this.ProvidermappingEditid = this.InputProvidermappingEditid;
        this.getProvidermappingById(this.ProvidermappingEditid);
      } else {
        this.newProvidermapping = true;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadAddprovidermappingitems(): void {
    try {
      this.AddprovidermappinggridView = {
        data: orderBy(
          this.Addprovidermappingitems.slice(
            this.Addprovidermappingskip,
            this.Addprovidermappingskip + this.AddprovidermappingpageSize
          ),
          this.Providermappingsort
        ),
        total: this.Addprovidermappingitems.length
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortPayerChange(sort: SortDescriptor[]): void {
    try {
      if (this.Addprovidermappingitems != null) {
        this.Providermappingsort = sort;
        this.loadAddprovidermappingitems();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeProvidermapping(event: PageChangeEvent): void {
    try {
      this.Addprovidermappingskip = event.skip;
      this.loadAddprovidermappingitems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSearchNPI() {
    try {
      if (
        this.fbcFilterSearch.value != null &&
        this.fbcFilterSearch.value != undefined
      ) {
        this.NPISelected = [];
        this.loadingProvidermappingDetails = true;
        if (this.clsUtility.CheckEmptyString(this.fbcFilterSearch.value)) {
          this.AddprovidermappinggridView = null;
          this.Addprovidermappingitems = null;
          this.NPISelected = [];
          this.selectedSubclientValues = [];
          this.loadingProvidermappingDetails = false;
          return;
        }
        this.getNPIDetails(this.fbcFilterSearch.value.trim());
      }
    } catch (err) {
      this.loadingProvidermappingDetails = false;
      this.clsUtility.LogError(err);
    }
  }

  getSubclient(clientid: any, subclientid: any) {
    try {
      this.disablesubclient = false;
      let getsubclient: {
        clientid: string;
        subclientcode: string;
        subclientstatus: boolean;
      } = {
        clientid: clientid,
        subclientcode: "",
        subclientstatus: false
      };
      let seq = this.api.post("SubClient/GetSubClient", getsubclient);
      this.subscription.add(
        seq.subscribe(data => {
          this.SubclientList = data;
          if (
            this.SubclientList != null &&
            this.SubclientList != undefined &&
            this.SubclientList.length > 0
          ) {
            this.SelectAllsubClients = this.SubclientList;
            if (
              this.newProvidermapping == false &&
              this.SubclientList.length > 0 &&
              subclientid != 0
            ) {
              this.selectedsubclients = Number(subclientid);
            } else {
              this.selectedsubclients = 0;
            }
          } else {
            this.SubclientList = [];
            this.SelectAllsubClients = [];
            this.selectedsubclients = 0;
            this.clsUtility.showInfo("No practice is available for this group");
          }
        })
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  // public setSelectableSettings(): void {
  //   this.selectableSettings = {
  //     checkboxOnly: this.checkboxOnly
  //     // mode: this.mode
  //   };
  // }

  validateProvidermapping() {
    try {
      if (
        this.NPISelected.length != 0 &&
        this.selectedsubclients != 0 &&
        this.selectedsubclients != null &&
        this.selectedsubclients != undefined &&
        this.selectedclients != 0 &&
        this.selectedclients != null &&
        this.selectedclients != undefined
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getNPIDetails(npi: string) {
    try {
      this.loadingNPIDetails = true;

      let seq_inboundid;
      if (this.Statusid == 0) {
        seq_inboundid = this.api.qore_directory_get(
          "directoryservice/npiregistry/getAllProviders?npi=" + npi
        );
      } else if (this.Statusid == 1) {
        seq_inboundid = this.api.qore_directory_get(
          "directoryservice/npiregistry/getAllOrganization?npi=" + npi
        );
      }
      this.subscription.add(
        seq_inboundid.subscribe(
          data => {
            if (data != null || data != undefined) {
              this.AddprovidermappinggridData = data;
              if (
                this.AddprovidermappinggridData != null &&
                this.AddprovidermappinggridData != undefined
              ) {
                this.Addprovidermappingitems = this.AddprovidermappinggridData[
                  "result"
                ];
                if (
                  this.Addprovidermappingitems != null &&
                  this.Addprovidermappingitems != undefined
                ) {
                  this.loadAddprovidermappingitems();
                  this.loadingProvidermappingDetails = false;
                } else {
                  this.Addprovidermappingitems = [];
                  this.loadAddprovidermappingitems();
                  this.loadingProvidermappingDetails = false;
                }
              } else {
                this.AddprovidermappinggridData = [];
              }
            }
            this.loadingProvidermappingDetails = false;
          },
          err => {
            this.loadingProvidermappingDetails = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loadingProvidermappingDetails = false;
      this.clsUtility.LogError(error);
    }
  }

  getProvidermappingById(id: string) {
    try {
      let mappingid: {
        smappingid: string;
        subclientId: number;
        npitype: string;
        searchtext: string;
        sstatus: string;
        pageno: number;
        pagesize: number;
      } = {
        smappingid: this.ProvidermappingEditid,
        subclientId: 0,
        npitype: "all",
        searchtext: "",
        sstatus: "all",
        pageno: 0,
        pagesize: 10
      };

      let seq = this.api.post("SubClient/ProviderMapping", mappingid);
      this.subscription.add(
        seq.subscribe(
          data => {
            if (data != null || data != undefined) {
              if (data["content"] != null && data["content"] != undefined) {
                this.originalProvdermappingdetails = null;
                this.originalProvdermappingdetails = { ...data["content"] };
                this.Providermappingdetail = data["content"];
                this.updatestatus = this.Providermappingdetail[0].status;
                this.FillProvidermappingGroup();
                this.getNPIDetails(this.Providermappingdetail[0].providernpi);
                this.loadingProvidermappingDetails = false;
                this.api.insertActivityLog(
                  "Provider Mapping List Viewed",
                  "Provider Mapping",
                  "READ"
                );
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

  postProvidermapping(arrProvidermapping) {
    try {
      let seq = this.api.post(
        "SubClient/ProviderMapping/Save",
        arrProvidermapping
      );
      this.subscription.add(
        seq.subscribe(
          data => {
            if (data != null || data != undefined) {
              let clientname = this.clientList.find(
                x => x.clientid == this.fbcClient.value
              ).clientname;

              let subclientname = this.SubclientList.find(
                x => x.id == this.fbcSubclient.value
              ).subclientname;

              let subclientcode = this.SubclientList.find(
                x => x.id == this.fbcSubclient.value
              ).subclientcode;

              let response: { message: string; status: string };
              response = <any>data;
              if (response.message == "" && response.status == "1") {
                this.clsUtility.showSuccess(
                  "Provider mapping saved successfully"
                );
                this.disabledsave = false;
                this.OutputprovidermappingEditResult(true);
              } else if (response.message != "" && response.status == "1") {
                this.clsUtility.showWarning(response.message);
                this.disabledsave = false;
                this.OutputprovidermappingEditResult(true);
              } else if (response.message != "" && response.status == "2") {
                this.clsUtility.showWarning(response.message);
                this.disabledsave = false;
                // this.OutputprovidermappingEditResult(false);
              } else if (response.message == "" && response.status == "0") {
                this.clsUtility.showError(
                  "Error while saving provider mapping"
                );
                this.disabledsave = false;
                this.OutputprovidermappingEditResult(false);
              }

              this.api.insertActivityLog(
                "Added Provider Mapping for Group name :" +
                  clientname +
                  " ,Practice name :" +
                  subclientname +
                  " ,PracticeCode :" +
                  subclientcode +
                  " ,NPI: " +
                  arrProvidermapping.proivdersubclientmapping[0].providernpi,
                "Provider Mapping",
                "ADD"
              );
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

  updateProvidermapping(arrProvidermapping) {
    try {
      //#region "Get Modified Items of Subclient"

      let oldprovidermappingchangeditems = {};
      let ModifiedProvidermappingItems = "";
      let changedprovidermappingitems: any = this.clsUtility.jsondiff(
        this.originalProvdermappingdetails,
        JSON.parse(
          JSON.stringify(arrProvidermapping["proivdersubclientmapping"])
        )
      );

      if (
        !isNullOrUndefined(changedprovidermappingitems) &&
        changedprovidermappingitems != {}
      ) {
        let count = Object.keys(changedprovidermappingitems).length;
        for (let i = 0; i < count; i++) {
          if (changedprovidermappingitems[i].hasOwnProperty("subclientid")) {
            delete changedprovidermappingitems[i]["subclientid"];
          }

          if (
            changedprovidermappingitems[i].hasOwnProperty("providerdisplayname")
          ) {
            delete changedprovidermappingitems[i]["providerdisplayname"];
          }

          if (changedprovidermappingitems[i].hasOwnProperty("subclientcode")) {
            delete changedprovidermappingitems[i]["subclientcode"];
          }

          for (
            let index = 0;
            index < Object.keys(this.originalProvdermappingdetails).length;
            index++
          ) {
            if (
              this.originalProvdermappingdetails[index]["subclientid"] ==
              changedprovidermappingitems[i]["subclientId"]
            ) {
              if (
                changedprovidermappingitems[i].hasOwnProperty("subclientId")
              ) {
                delete changedprovidermappingitems[i].subclientId;
              }
            }
          }

          if (
            !isNullOrUndefined(changedprovidermappingitems[i]) &&
            JSON.stringify(changedprovidermappingitems[i]) == "{}"
          ) {
            delete changedprovidermappingitems[i];
          }
        }
        for (
          let index = 0;
          index < Object.keys(this.originalProvdermappingdetails).length;
          index++
        ) {
          for (let key of Object.keys(changedprovidermappingitems)) {
            for (let property of Object.keys(
              changedprovidermappingitems[key]
            )) {
              let oldvalue: string;
              if (property == "subclientId") {
                oldvalue = this.originalProvdermappingdetails[index]
                  .subclientid;
              } else {
                oldvalue = this.originalProvdermappingdetails[index][property];
              }
              if (isNullOrUndefined(oldprovidermappingchangeditems[key])) {
                oldprovidermappingchangeditems[key] = {};
              }
              if (property == "subclientId") {
                oldprovidermappingchangeditems[key]["subclientid"] = oldvalue;
              } else {
                oldprovidermappingchangeditems[key][property] = oldvalue;
              }
            }
          }
        }

        if (
          !isNullOrUndefined(changedprovidermappingitems) &&
          JSON.stringify(changedprovidermappingitems) != "{}"
        ) {
          ModifiedProvidermappingItems =
            "OLD : " +
            JSON.stringify(oldprovidermappingchangeditems) +
            ",NEW : " +
            JSON.stringify(changedprovidermappingitems);
        }
      }

      //#endregion "Get Modified Items of Subclient"

      let seq = this.api.put(
        "SubClient/ProviderMapping/Update",
        arrProvidermapping
      );
      this.subscription.add(
        seq.subscribe(
          data => {
            if (data != null || data != undefined) {
              let clientname = this.clientList.find(
                x => x.clientid == this.fbcClient.value
              ).clientname;

              let subclientname = this.SubclientList.find(
                x => x.id == this.fbcSubclient.value
              ).subclientname;

              let subclientcode = this.SubclientList.find(
                x => x.id == this.fbcSubclient.value
              ).subclientcode;
              let response: { message: string; status: string };
              response = <any>data;
              if (response.message == "" && response.status == "1") {
                this.clsUtility.showSuccess(
                  "Provider mapping updated successfully"
                );
                this.disabledsave = false;
                this.OutputprovidermappingEditResult(true);
              } else if (response.message != "" && response.status == "1") {
                this.clsUtility.showWarning(response.message);
                this.disabledsave = false;
                this.OutputprovidermappingEditResult(true);
              } else if (response.message != "" && response.status == "2") {
                this.clsUtility.showWarning(response.message);
                this.disabledsave = false;
                // this.OutputprovidermappingEditResult(false);
              } else if (response.message == "" && response.status == "0") {
                this.clsUtility.showError(
                  "Error while saving provider mapping"
                );
                this.disabledsave = false;
                this.OutputprovidermappingEditResult(false);
              }
              this.api.insertActivityLogPostcall(
                "Updated Provider Mapping for Group name :" +
                  clientname +
                  " ,Practice name :" +
                  subclientname +
                  " ,PracticeCode :" +
                  subclientcode +
                  " ,NPI: " +
                  arrProvidermapping.proivdersubclientmapping[0].providernpi +
                  ModifiedProvidermappingItems,
                "Provider Mapping",
                "UPDATE"
              );
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

  saveProvidermapping() {
    try {
      this.disabledsave = true;

      this.submitted = true;
      let currentDateTime = this.clsUtility.currentDateTime();

      let subclient = "";
      let subclientname = "";

      if (
        this.fbcSubclient.value == undefined ||
        this.fbcSubclient.value == ""
      ) {
        subclient = "0";
        subclientname = "";
      } else {
        subclient = this.fbcSubclient.value;
        subclientname = this.SubclientList.find(
          x => x.id == this.fbcSubclient.value
        ).subclientname;
      }

      if (this.validateProvidermapping()) {
        let currentDateTime = this.clsUtility.currentDateTime();
        //var strPayer = this.ProvidermappingName.value;
        if (this.newProvidermapping) {
          let arrProvidermapping = {
            proivdersubclientmapping: []
          };
          for (var i in this.NPISelected) {
            // for (var j in this.selectedSubclientValues) {
            this.providermapping = new Providermapping();
            this.providermapping.mappingid = "";
            this.providermapping.firstname = this.NPISelected[i].sfirstname;
            this.providermapping.middlename = this.NPISelected[i].smiddlename;
            this.providermapping.lastname = this.NPISelected[i].slastname;
            this.providermapping.gender = this.NPISelected[i].sgender;
            this.providermapping.dob = this.NPISelected[i].dtdob;
            this.providermapping.providernpi = this.NPISelected[i].npi;
            this.providermapping.sname = this.NPISelected[i].fullname;
            this.providermapping.mailingaddress = this.NPISelected[
              i
            ].mailingaddress;
            this.providermapping.npitype = this.NPISelected[i].npitype;
            this.providermapping.status = this.updatestatus;
            this.providermapping.groupid = "";
            this.providermapping.subgroupid = "";
            this.providermapping.clientid = this.selectedclients.toString();
            this.providermapping.subclientId = this.selectedsubclients.toString();
            this.providermapping.subclientcode = "";
            this.providermapping.subclientname = subclientname;
            this.providermapping.createdby = this.loginGCPuserid;
            this.providermapping.createdon = currentDateTime;
            arrProvidermapping.proivdersubclientmapping.push(
              this.providermapping
            );
            // }
          }

          this.postProvidermapping(arrProvidermapping);
        } else if (!this.newProvidermapping) {
          let arrProvidermapping = {
            proivdersubclientmapping: []
          };
          for (var i in this.NPISelected) {
            // for (var j in this.selectedSubclientValues) {
            this.providermapping = new Providermapping();
            this.providermapping.mappingid = this.ProvidermappingEditid;
            this.providermapping.firstname = this.NPISelected[i].sfirstname;
            this.providermapping.middlename = this.NPISelected[i].smiddlename;
            this.providermapping.lastname = this.NPISelected[i].slastname;
            this.providermapping.gender = this.NPISelected[i].sgender;
            this.providermapping.dob = this.NPISelected[i].dtdob;
            this.providermapping.providernpi = this.NPISelected[i].npi;
            this.providermapping.sname = this.NPISelected[i].fullname;
            this.providermapping.mailingaddress = this.NPISelected[
              i
            ].mailingaddress;
            this.providermapping.npitype = this.NPISelected[i].npitype;
            this.providermapping.status = this.updatestatus;
            this.providermapping.groupid = "";
            this.providermapping.subgroupid = "";
            this.providermapping.clientid = this.selectedclients.toString();
            this.providermapping.subclientId = this.selectedsubclients.toString();
            this.providermapping.subclientcode = "";
            this.providermapping.subclientname = subclientname;
            this.providermapping.createdby = this.loginGCPuserid;
            this.providermapping.createdon = currentDateTime;

            arrProvidermapping.proivdersubclientmapping.push(
              this.providermapping
            );
            // }
          }
          this.updateProvidermapping(arrProvidermapping);
        } else {
          this.OutputprovidermappingEditResult(false);
          this.disabledsave = false;
          $("#addprovidermappingModal").modal("hide");
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  setStatus(Status: string) {
    try {
      this.disablesubclient = true;
      this.selectedclients = 0;
      this.SubclientList = [];
      this.SelectAllsubClients = [];
      this.selectedsubclients = 0;

      const StatusIndividual = document.getElementById(
        "StatusIndividual"
      ) as HTMLInputElement;
      const StatusOrganizational = document.getElementById(
        "StatusOrganizational"
      ) as HTMLInputElement;
      if (Status == "Individual") {
        StatusIndividual.checked = true;
        StatusOrganizational.checked = false;
        this.Statusid = 0;
        this.fbcFilterSearch.setValue("");
        this.ProvidermappingGroup.reset();
        this.AddprovidermappinggridView = null;
        this.Addprovidermappingitems = null;
        this.NPISelected = [];
        this.selectedSubclientValues = [];
      } else if (Status == "Organizational") {
        StatusIndividual.checked = false;
        StatusOrganizational.checked = true;
        this.Statusid = 1;
        this.fbcFilterSearch.setValue("");
        this.ProvidermappingGroup.reset();
        this.AddprovidermappinggridView = null;
        this.Addprovidermappingitems = null;
        this.NPISelected = [];
        this.selectedSubclientValues = [];
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  FillProvidermappingGroup() {
    try {
      let Providermapping: Providermapping;
      Providermapping = this.Providermappingdetail;

      //this.fbcType.setValue(this.)
      if (
        this.Providermappingdetail[0].npitype.toLocaleLowerCase() ==
        "individual"
      ) {
        this.Statusid = 1;
        this.setStatus("Individual");
      } else {
        this.Statusid = 2;
        this.setStatus("Organizational");
      }

      // this.selectedSubclientValues.push(
      //   this.SubclientItemList.find(x => x.id == Providermapping[0].subclientid)
      // );
      // console.log(this.Providermappingdetail[0].npitype.toLocaleLowerCase());

      this.selectedclients = Number(Providermapping[0].clientid);
      this.getSubclient(this.selectedclients, Providermapping[0].subclientid);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  CheckNPISelected() {
    try {
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnClose() {
    try {
      this.disabledsave = false;
      this.OutputprovidermappingEditResult(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ResetComponents() {
    try {
      this.ProvidermappingGroup.reset();
      this.submitted = false;
      this.InputProvidermappingEditid = null;
      // this.clsPayer = null;
      // this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeAddprovidermapping(event: PageChangeEvent): void {
    try {
      this.Addprovidermappingskip = event.skip;
      this.loadAddprovidermappingitems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getClientlist() {
    try {
      // this.loading = true;
      let getclient: { clientid: string; clientstatus: boolean } = {
        clientid: "0",
        clientstatus: false
      };
      let seq = this.api.post("GetClient", getclient);
      this.subscription.add(
        seq.subscribe(
          res => {
            this.clientList = res;
            if (
              this.clientList != null &&
              this.clientList != undefined &&
              this.clientList.length > 0
            ) {
              this.SelectAllClients = this.clientList;
              // this.loading = false;
            } else {
              this.clientList = [];
              this.SelectAllClients = [];
              // this.loading = false;
              this.clsUtility.showInfo("No group is active");
            }
          },
          err => {
            // this.loading = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  cmbclientchange() {
    try {
      if (this.fbcClient.value == undefined || this.fbcClient.value == "") {
        this.disablesubclient = true;
        this.selectedclients = 0;
        this.SubclientList = [];
        this.selectedsubclients = 0;
      } else {
        this.disablesubclient = false;
        this.SubclientList = [];
        this.selectedsubclients = 0;
        this.getSubclient(this.selectedclients, 0);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleClientFilter(value) {
    this.clientList = this.SelectAllClients.filter(
      s => s.clientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  cmbsubclientchange() {
    try {
      if (
        this.fbcSubclient.value == undefined ||
        this.fbcSubclient.value == ""
      ) {
        this.selectedsubclients = 0;
        this.selectedSubclientValues = [];
      } else {
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handlesubClientFilter(value) {
    this.SubclientList = this.SelectAllsubClients.filter(
      s => s.subclientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  btnsave() {
    try {
      // console.log(this.clientList);

      if (this.validateProvidermapping()) {
        let clientstatus = this.clientList.find(
          x => x.clientid == this.fbcClient.value
        ).clientstatus;

        let subclientstatus = this.SubclientList.find(
          x => x.id == this.fbcSubclient.value
        ).subclientstatus;

        if (clientstatus == false || subclientstatus == false) {
          if (this.newProvidermapping) {
            this.confirmationMappingMessage =
              "Selected group or practice is inactive.\n Do you want to add provider mapping ?";
          } else {
            this.confirmationMappingMessage =
              "Selected group or practice is inactive.\n Do you want to update provider mapping ?";
          }
          $("#confirmationModal").modal("show");
        } else {
          this.saveProvidermapping();
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  StatusConfirmation(status: boolean) {
    try {
      if (status) {
        $("#confirmationModal").modal("hide");
        this.saveProvidermapping();
      } else {
        $("#confirmationModal").modal("hide");
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
}
