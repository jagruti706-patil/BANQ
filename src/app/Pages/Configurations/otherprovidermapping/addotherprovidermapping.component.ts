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
import { Otherprovidermapping } from "../../../Model/Configuration/otherprovidermapping";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { isNullOrUndefined } from "util";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { SubSink } from "subsink";

//import { SubSink } from "../../../../../../../../node_modules/subsink";
declare var $: any;

@Component({
  selector: "app-addotherprovidermapping",
  templateUrl: "./addotherprovidermapping.component.html",
  styleUrls: ["./addotherprovidermapping.component.css"]
})
export class AddotherprovidermappingComponent implements OnInit, OnDestroy {
  public newProvidermapping = true;
  public Providermappingdetail: any = [];
  public ProvidermappingEditid: any;
  public selectedProvidermappingValue: string;
  //private clsPayer: Payer;
  private subscription = new SubSink();
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
  public selectableSettings: SelectableSettings;
  public NPISelected: any = [];
  public checkboxOnly = true;
  public selectedCallback = args => args.dataItem;
  private otherprovidermapping: Otherprovidermapping;
  public otherprovidermappingbyid: Otherprovidermapping;
  private loginGCPuserid: string;
  public clientList: any = [];
  public SelectAllClients: any = [];
  public selectedclients: number = 0;
  public SelectAllsubClients: any = [];
  public selectedsubclients: number = 0;
  public disablesubclient: boolean = true;
  public updatestatus: boolean = true;
  public disabledsave: boolean = false;
  public fcidtype: string = "";
  public fcidvalue: string = "";
  public providernpiList: any = [];
  public SelectAllProvidernpiList: any = [];
  public selectedprovidernpi: string = "";
  public displaynpititle: string = "";
  public disableprovidernpi: boolean = true;
  public displaynpi: string = "";
  public displayprovidername: string = "";
  public disableprovidername: boolean = false;
  public clsPermission: clsPermission;
  private originalOtherProvdermappingdetails: any;

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
    // fcSearch: [""],
    fcsubclient: [""],
    fcclient: [""],
    fcidtype: [""],
    fcidvalue: [""],
    fcprovidernpi: [""],
    fcprovidername: [""]
  });

  get fbidType() {
    return this.ProvidermappingGroup.get("fcidtype");
  }

  get fbidValue() {
    return this.ProvidermappingGroup.get("fcidvalue");
  }

  get fbcSubclient() {
    return this.ProvidermappingGroup.get("fcsubclient");
  }

  get fbcClient() {
    return this.ProvidermappingGroup.get("fcclient");
  }

  get fbProvidernpi() {
    return this.ProvidermappingGroup.get("fcprovidernpi");
  }

  get fbProvidername() {
    return this.ProvidermappingGroup.get("fcprovidername");
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
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.datatransfer.loginGCPUserID.subscribe(data => {
          this.loginGCPuserid = data;
        })
      );

      this.getClientlist();

      if (
        this.InputProvidermappingEditid != null &&
        this.InputProvidermappingEditid != 0
      ) {
        this.newProvidermapping = false;
        this.ProvidermappingEditid = this.InputProvidermappingEditid;
        this.getotherProvidermappingById();
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

      if (
        this.InputProvidermappingEditid != null &&
        this.InputProvidermappingEditid != 0
      ) {
        this.newProvidermapping = false;
        this.ProvidermappingEditid = this.InputProvidermappingEditid;
        this.getotherProvidermappingById();
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
        subclientstatus: true
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
            this.clsUtility.showInfo("No practice is active");
          }
        })
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  validateProvidermapping() {
    try {
      if (this.newProvidermapping) {
        if (
          this.selectedsubclients != null &&
          this.selectedsubclients != undefined &&
          this.selectedsubclients != 0 &&
          this.selectedclients != 0 &&
          this.selectedclients != null &&
          this.selectedclients != undefined &&
          this.fbProvidername.value != null &&
          this.fbProvidername.value != undefined &&
          this.fbProvidername.value != "" &&
          // this.selectedprovidernpi != null &&
          // this.selectedprovidernpi != undefined &&
          // this.selectedprovidernpi != "" &&
          this.fbidType.value != null &&
          this.fbidType.value != undefined &&
          this.fbidValue.value != null &&
          this.fbidValue.value != undefined
        ) {
          if (
            this.fbidType.value.trim() != "" &&
            this.fbidValue.value.trim() != "" &&
            this.fbProvidername.value.trim() != ""
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        if (
          this.fbidType.value != null &&
          this.fbidType.value != undefined &&
          this.fbidValue.value != null &&
          this.fbidValue.value != undefined
        ) {
          if (
            this.fbidType.value.trim() != "" &&
            this.fbidValue.value.trim() != ""
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
      return false;
    }
  }

  postProvidermapping(arrProvidermapping) {
    try {
      let seq = this.api.post(
        "SubClient/AdditionalProviderMapping/Save",
        arrProvidermapping
      );
      this.subscription.add(
        seq.subscribe(
          data => {
            if (data != null || data != undefined) {
              let response: { message: string; status: string };
              response = <any>data;
              if (data == "1") {
                this.clsUtility.showSuccess(
                  "Provider other mapping saved successfully"
                );
                this.disabledsave = false;
                this.OutputprovidermappingEditResult(true);
              } else if (data == "2") {
                this.clsUtility.showWarning("Duplicate provider other mapping");
                this.disabledsave = false;
              } else if (response.status == "0") {
                this.clsUtility.showError(
                  "Error while saving provider other mapping"
                );
                this.disabledsave = false;
                this.OutputprovidermappingEditResult(false);
              }

              this.api.insertActivityLog(
                "Added Provider Other Mapping for NPI :" +
                  arrProvidermapping.npi +
                  ", IdType : " +
                  arrProvidermapping.idtype +
                  ", IdValue : " +
                  arrProvidermapping.idvalue,
                "Provider Other Mapping",
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

      let oldotherprovidermappingchangeditems = {};
      let ModifiedOtherProviderMappingItems = "";
      let changedotherprovidermappingitems: any = this.clsUtility.jsondiff(
        this.originalOtherProvdermappingdetails,
        JSON.parse(JSON.stringify(arrProvidermapping))
      );

      if (
        !isNullOrUndefined(changedotherprovidermappingitems) &&
        changedotherprovidermappingitems != {}
      ) {
        if (changedotherprovidermappingitems.hasOwnProperty("sname")) {
          delete changedotherprovidermappingitems.sname;
        }

        if (changedotherprovidermappingitems.hasOwnProperty("subclientname")) {
          delete changedotherprovidermappingitems.subclientname;
        }

        if (changedotherprovidermappingitems.hasOwnProperty("smappingid")) {
          delete changedotherprovidermappingitems.smappingid;
        }

        for (let key of Object.keys(changedotherprovidermappingitems)) {
          let oldvalue: string = this.originalOtherProvdermappingdetails[key];
          oldotherprovidermappingchangeditems[key] = oldvalue;
        }
        if (
          !isNullOrUndefined(changedotherprovidermappingitems) &&
          JSON.stringify(changedotherprovidermappingitems) != "{}"
        ) {
          ModifiedOtherProviderMappingItems =
            "OLD : " +
            JSON.stringify(oldotherprovidermappingchangeditems) +
            ",NEW : " +
            JSON.stringify(changedotherprovidermappingitems);
        }
      }

      //#endregion "Get Modified Items of Subclient"

      let seq = this.api.post(
        "SubClient/AdditionalProviderMapping/Update",
        arrProvidermapping
      );
      this.subscription.add(
        seq.subscribe(
          data => {
            if (data != null || data != undefined) {
              let response: { message: string; status: string };
              response = <any>data;
              if (data == "1") {
                this.clsUtility.showSuccess(
                  "Provider other mapping updated successfully"
                );
                this.disabledsave = false;
                this.OutputprovidermappingEditResult(true);
              } else if (data == "2") {
                this.clsUtility.showWarning("Duplicate provider other mapping");
                this.disabledsave = false;
              } else if (response.status == "0") {
                this.clsUtility.showError(
                  "Error while updating provider other mapping"
                );
                this.disabledsave = false;
                this.OutputprovidermappingEditResult(false);
              }

              this.api.insertActivityLogPostcall(
                "Updated Provider Other Mapping for NPI :" +
                  arrProvidermapping.npi +
                  ", IdType : " +
                  arrProvidermapping.idtype +
                  ", IdValue : " +
                  arrProvidermapping.idvalue +
                  ModifiedOtherProviderMappingItems,
                "Provider Other Mapping",
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

      if (this.validateProvidermapping()) {
        let currentDateTime = this.clsUtility.currentDateTime();
        let providername = "";
        if (
          !isNullOrUndefined(this.fbProvidernpi.value) &&
          this.fbProvidernpi.value != ""
        ) {
          providername = this.providernpiList.find(
            x => x.providernpi == this.fbProvidernpi.value
          ).sname;
        }

        if (this.newProvidermapping) {
          this.otherprovidermapping = new Otherprovidermapping();
          this.otherprovidermapping.additionalmappingid = "";
          this.otherprovidermapping.smappingid = "";
          this.otherprovidermapping.createdby = this.loginGCPuserid;
          this.otherprovidermapping.createdon = currentDateTime;
          this.otherprovidermapping.idtype = this.fbidType.value.trim();
          this.otherprovidermapping.idvalue = this.fbidValue.value.trim();
          this.otherprovidermapping.status = this.updatestatus;
          this.otherprovidermapping.npi = this.selectedprovidernpi;
          this.otherprovidermapping.clientid = this.selectedclients.toString();
          this.otherprovidermapping.subclientid = this.selectedsubclients.toString();
          this.otherprovidermapping.providername = this.fbProvidername.value.trim();

          this.postProvidermapping(this.otherprovidermapping);
        } else if (!this.newProvidermapping) {
          this.otherprovidermapping = new Otherprovidermapping();
          this.otherprovidermapping.additionalmappingid = this.otherprovidermappingbyid.additionalmappingid;
          this.otherprovidermapping.createdby = this.otherprovidermappingbyid.createdby;
          this.otherprovidermapping.createdon = this.otherprovidermappingbyid.createdon;
          this.otherprovidermapping.idtype = this.fbidType.value.trim();
          this.otherprovidermapping.idvalue = this.fbidValue.value.trim();
          this.otherprovidermapping.smappingid = this.otherprovidermappingbyid.additionalmappingid;
          this.otherprovidermapping.status = this.otherprovidermappingbyid.status;
          this.otherprovidermapping.npi = this.otherprovidermappingbyid.npi;
          // this.otherprovidermapping.clientid = this.providernpiList.clientid;
          // this.otherprovidermapping.subclientid = this.selectedsubclients.toString();
          // this.otherprovidermapping.providername = providername.toString();

          this.updateProvidermapping(this.otherprovidermapping);
        } else {
          this.OutputprovidermappingEditResult(false);
          this.disabledsave = false;
          $("#addotherprovidermappingModal").modal("hide");
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  FillProvidermappingGroup() {
    try {
      let Providermapping: Otherprovidermapping;
      Providermapping = this.Providermappingdetail;

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
      this.disablesubclient = true;
      this.selectedclients = 0;
      this.SubclientList = [];
      this.selectedsubclients = 0;
      this.selectedprovidernpi = "";
      this.providernpiList = [];
      this.SelectAllProvidernpiList = [];
      this.disableprovidernpi = true;
      this.disableprovidername = false;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getClientlist() {
    try {
      // this.loading = true;
      let getclient: { clientid: string; clientstatus: boolean } = {
        clientid: "0",
        clientstatus: true
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
            } else {
              this.clientList = [];
              this.SelectAllClients = [];
              this.clsUtility.showInfo("No group is active");
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

  cmbclientchange() {
    try {
      if (this.fbcClient.value == undefined || this.fbcClient.value == "") {
        this.disablesubclient = true;
        this.selectedclients = 0;
        this.SubclientList = [];
        this.selectedsubclients = 0;
        this.selectedprovidernpi = "";
        this.providernpiList = [];
        this.SelectAllProvidernpiList = [];
        this.disableprovidernpi = true;
      } else {
        this.disablesubclient = false;
        this.SubclientList = [];
        this.selectedsubclients = 0;
        this.providernpiList = [];
        this.SelectAllProvidernpiList = [];
        this.selectedprovidernpi = "";
        this.disableprovidernpi = true;
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
        this.selectedprovidernpi = "";
        this.providernpiList = [];
        this.SelectAllProvidernpiList = [];
        this.disableprovidernpi = true;
      } else {
        this.selectedprovidernpi = "";
        this.disableprovidernpi = false;
        this.getProvidermappingById(
          this.selectedclients,
          this.selectedsubclients
        );
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

  getProvidermappingById(clientid: any, subclientid: any) {
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
        clientid: clientid,
        subclientId: subclientid,
        npitype: "All",
        searchtext: "",
        sstatus: "true",
        pageno: 0,
        pagesize: 1000
      };
      let seq = this.api.post("SubClient/ProviderMapping", mappingid);
      this.subscription.add(
        seq.subscribe(
          data => {
            if (data != null || data != undefined) {
              this.Providermappingdetail = data;
              if (
                this.Providermappingdetail != null &&
                this.Providermappingdetail != undefined
              ) {
                this.SelectAllProvidernpiList = this.Providermappingdetail[
                  "content"
                ];
                if (
                  this.SelectAllProvidernpiList != null &&
                  this.SelectAllProvidernpiList != undefined
                ) {
                  this.providernpiList = this.SelectAllProvidernpiList;
                } else {
                  this.SelectAllProvidernpiList = [];
                  this.providernpiList = [];
                  this.selectedprovidernpi = "";
                  this.clsUtility.showInfo("No provider is active");
                }
              } else {
                this.SelectAllProvidernpiList = [];
                this.providernpiList = [];
                this.selectedprovidernpi = "";
                this.clsUtility.showInfo("No provider is active");
              }
            } else {
              this.SelectAllProvidernpiList = [];
              this.providernpiList = [];
              this.selectedprovidernpi = "";
              this.clsUtility.showInfo("No provider is active");
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

  cmbprovidernpichange() {
    try {
      if (
        this.newProvidermapping &&
        (this.fbProvidernpi.value == undefined ||
          this.fbProvidernpi.value == "")
      ) {
        this.disableprovidername = false;
      } else if (
        this.fbProvidernpi.value == undefined ||
        this.fbProvidernpi.value == ""
      ) {
        this.disableprovidername = true;
      }
      if (
        this.fbProvidernpi.value == undefined ||
        this.fbProvidernpi.value == ""
      ) {
        this.selectedprovidernpi = "";
        this.displaynpititle = "";
        this.fbProvidername.setValue("");
        this.disableprovidername = false;
      } else {
        this.displaynpititle = this.providernpiList.find(
          x => x.providernpi == this.fbProvidernpi.value
        ).providerdisplayname;

        let providername = this.providernpiList.find(
          x => x.providernpi == this.fbProvidernpi.value
        ).sname;

        this.fbProvidername.setValue(providername);
        this.disableprovidername = true;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleproviderNPIFilter(value) {
    try {
      this.providernpiList = this.SelectAllProvidernpiList.filter(
        s =>
          s.providernpi.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
          s.sname.toLowerCase().indexOf(value.toLowerCase()) !== -1
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getotherProvidermappingById() {
    try {
      let mappingid: {
        smappingid: string;
      } = {
        smappingid: this.ProvidermappingEditid
      };
      let seq = this.api.post("SubClient/AdditionalProviderMapping", mappingid);
      this.subscription.add(
        seq.subscribe(
          data => {
            if (data != null || data != undefined) {
              let sdata = data;
              if (sdata != null && sdata != undefined) {
                this.originalOtherProvdermappingdetails = null;
                this.originalOtherProvdermappingdetails = { ...sdata[0] };
                this.otherprovidermappingbyid = <any>sdata[0];
                this.displaynpi = this.otherprovidermappingbyid.npi;
                this.displayprovidername = this.otherprovidermappingbyid.sname;
                this.fbidType.setValue(this.otherprovidermappingbyid.idtype);
                this.fbidValue.setValue(this.otherprovidermappingbyid.idvalue);
              } else {
                this.otherprovidermappingbyid = new Otherprovidermapping();
                this.displaynpi = "";
                this.displayprovidername = "";
                this.fbidType.setValue("");
                this.fbidValue.setValue("");
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
  ngOnDestroy() {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
