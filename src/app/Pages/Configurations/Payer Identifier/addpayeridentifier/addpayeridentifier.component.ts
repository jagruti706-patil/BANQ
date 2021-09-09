import {
  Component,
  OnInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Utility } from "src/app/Model/utility";
import { SubSink } from "subsink";
import { FormBuilder, Validators } from "@angular/forms";
import { Payeridentifier } from "src/app/Model/Configuration/payeridentifier";
import { Api } from "src/app/Services/api";
import { isNullOrUndefined } from "util";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
declare var $: any;

@Component({
  selector: "app-addpayeridentifier",
  templateUrl: "./addpayeridentifier.component.html",
  styleUrls: ["./addpayeridentifier.component.css"]
})
export class AddpayeridentifierComponent
  implements OnInit, OnChanges, OnDestroy {
  public newPayeridentifier = true;
  public Payeridentifierdetail: any = [];
  public PayeridentifierEditid: any;
  public selectedPayeridentifierValue: string;
  private clsPayeridentifier: Payeridentifier;
  private subscription = new SubSink();
  private clsUtility: Utility;
  public submitted = false;
  public updatestatus: string = "true";
  private loginGCPUserID: string;
  private loginGCPUserName: string;
  private originalPLBIdentifierdetails: any;

  // Loading
  loadingPayeridentifierDetails = false;

  // Received Input from parent component
  @Input() InputPayeridentifierEditid: any;

  // Send Output to parent component
  @Output() OutputPayeridentifierEditResult = new EventEmitter<boolean>();

  OutputpayeridentifierEditResult(data: any) {
    let outPayeridentifierEditResult = data;
    this.OutputPayeridentifierEditResult.emit(outPayeridentifierEditResult);
  }

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private toaster: ToastrService,
    private datatransfer: DatatransaferService
  ) {
    this.clsUtility = new Utility(toaster);
  }

  PayerGroup = this.fb.group({
    fcPayerId: ["", [Validators.required, Validators.maxLength(50)]],
    fcPayerName: ["", [Validators.required, Validators.maxLength(200)]],
    fcReasonCode: ["", [Validators.required, Validators.maxLength(5)]],
    fcSeperator: ["", [Validators.required, Validators.maxLength(50)]],
    fcIdentifier1: [""],
    fcIdentifier2: [""],
    fcIdentifier3: [""],
    fcIdentifier4: [""],
    fcIdentifier5: [""]
  });

  get PayerId() {
    return this.PayerGroup.get("fcPayerId");
  }

  get PayerName() {
    return this.PayerGroup.get("fcPayerName");
  }

  get ReasonCode() {
    return this.PayerGroup.get("fcReasonCode");
  }

  get Seperator() {
    return this.PayerGroup.get("fcSeperator");
  }

  get Identifier1() {
    return this.PayerGroup.get("fcIdentifier1");
  }

  get Identifier2() {
    return this.PayerGroup.get("fcIdentifier2");
  }

  get Identifier3() {
    return this.PayerGroup.get("fcIdentifier3");
  }

  get Identifier4() {
    return this.PayerGroup.get("fcIdentifier4");
  }

  get Identifier5() {
    return this.PayerGroup.get("fcIdentifier5");
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.datatransfer.loginGCPUserID.subscribe(data => {
          this.loginGCPUserID = data;
        })
      );
      this.loginGCPUserName = this.datatransfer.loginUserName;

      this.clsPayeridentifier = new Payeridentifier();
      if (
        this.InputPayeridentifierEditid != null &&
        this.InputPayeridentifierEditid != 0
      ) {
        this.newPayeridentifier = false;
        this.PayeridentifierEditid = this.InputPayeridentifierEditid;
        this.getPayeridentifierById(this.PayeridentifierEditid);
      } else {
        this.newPayeridentifier = true;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {
    try {
      this.subscription.add(
        this.datatransfer.loginGCPUserID.subscribe(data => {
          this.loginGCPUserID = data;
        })
      );
      this.loginGCPUserName = this.datatransfer.loginUserName;
      this.clsPayeridentifier = new Payeridentifier();
      if (
        this.InputPayeridentifierEditid != null &&
        this.InputPayeridentifierEditid != 0
      ) {
        this.newPayeridentifier = false;
        this.PayeridentifierEditid = this.InputPayeridentifierEditid;
        this.getPayeridentifierById(this.PayeridentifierEditid);
      } else {
        this.newPayeridentifier = true;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  validatePayeridentifier() {
    try {
      if (
        this.PayerId.valid &&
        !this.clsUtility.CheckEmptyString(this.PayerId.value) &&
        this.PayerName.valid &&
        !this.clsUtility.CheckEmptyString(this.PayerName.value) &&
        this.ReasonCode.valid &&
        !this.clsUtility.CheckEmptyString(this.ReasonCode.value) &&
        this.Seperator.valid &&
        !this.clsUtility.CheckEmptyString(this.Seperator.value)
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getPayeridentifierById(id: number) {
    try {
      let payeridentifierinput: {
        sid: string;
      } = {
        sid: this.PayeridentifierEditid
      };

      let seq = this.api.post_base("PayerIdentifier", payeridentifierinput);
      this.subscription.add(
        seq.subscribe(
          data => {
            if (!isNullOrUndefined(data) && data != []) {
              this.originalPLBIdentifierdetails = null;
              this.originalPLBIdentifierdetails = { ...data[0] };
              this.Payeridentifierdetail = data;
              this.updatestatus = this.Payeridentifierdetail[0].status;
              this.FillPayeridentifierGroup();
              this.loadingPayeridentifierDetails = false;
              this.api.insertActivityLog(
                "PLB Config List Viewed",
                "PLB Config",
                "READ"
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

  postPayeridentifier(payeridentifierid: any) {
    try {
      let payeridentifierinput: {
        id: string;
        status: string;
        userid: string;
        payerid: string;
        username: string;
        createdon: string;
        payername: string;
        separator: string;
        identifier_1: string;
        identifier_2: string;
        identifier_3: string;
        identifier_4: string;
        identifier_5: string;
        adjustmentreasoncode: string;
      } = {
        id: payeridentifierid,
        status: this.updatestatus,
        userid: this.loginGCPUserID,
        payerid: this.PayerId.value
          ? this.PayerId.value.trim()
          : this.PayerId.value,
        username: this.loginGCPUserName,
        payername: this.PayerName.value
          ? this.PayerName.value.trim()
          : this.PayerName.value,
        separator: this.Seperator.value
          ? this.Seperator.value.trim()
          : this.Seperator.value,
        identifier_1: this.Identifier1.value
          ? this.Identifier1.value.trim()
          : this.Identifier1.value,
        identifier_2: this.Identifier2.value
          ? this.Identifier2.value.trim()
          : this.Identifier2.value,
        identifier_3: this.Identifier3.value
          ? this.Identifier3.value.trim()
          : this.Identifier3.value,
        identifier_4: this.Identifier4.value
          ? this.Identifier4.value.trim()
          : this.Identifier4.value,
        identifier_5: this.Identifier5.value
          ? this.Identifier5.value.trim()
          : this.Identifier5.value,
        adjustmentreasoncode: this.ReasonCode.value.trim(),
        createdon: this.clsUtility.currentDateTime().toString()
      };
      let seq = this.api.post_base(
        "PayerIdentifier/Save",
        payeridentifierinput
      );
      this.subscription.add(
        seq.subscribe(
          data => {
            if (data != null || data != undefined) {
              if (data == "1") {
                this.clsUtility.showSuccess("PLB Config saved successfully");
                this.api.insertActivityLog(
                  "PLB Config (Payer: " +
                    this.PayerName.value.trim() +
                    ") saved successfully",
                  "PLB Config",
                  "ADD"
                );
                this.OutputpayeridentifierEditResult(true);
              } else if (data == "2") {
                this.clsUtility.showWarning("Payer Identifer is Duplicate");
                // this.OutputpayeridentifierEditResult(false);
              } else if (data == "0") {
                this.clsUtility.showError("Error while saving plb config");

                this.OutputpayeridentifierEditResult(false);
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

  updatePayeridentifier(payeridentifierid: any) {
    try {
      let payeridentifierinput: {
        id: string;
        status: string;
        userid: string;
        payerid: string;
        username: string;
        createdon: string;
        payername: string;
        separator: string;
        identifier_1: string;
        identifier_2: string;
        identifier_3: string;
        identifier_4: string;
        identifier_5: string;
        adjustmentreasoncode: string;
      } = {
        id: payeridentifierid,
        status: this.updatestatus,
        userid: this.loginGCPUserID,
        payerid: this.PayerId.value
          ? this.PayerId.value.trim()
          : this.PayerId.value,
        username: this.loginGCPUserName,
        payername: this.PayerName.value
          ? this.PayerName.value.trim()
          : this.PayerName.value,
        separator: this.Seperator.value
          ? this.Seperator.value.trim()
          : this.Seperator.value,
        identifier_1: this.Identifier1.value
          ? this.Identifier1.value.trim()
          : this.Identifier1.value,
        identifier_2: this.Identifier2.value
          ? this.Identifier2.value.trim()
          : this.Identifier2.value,
        identifier_3: this.Identifier3.value
          ? this.Identifier3.value.trim()
          : this.Identifier3.value,
        identifier_4: this.Identifier4.value
          ? this.Identifier4.value.trim()
          : this.Identifier4.value,
        identifier_5: this.Identifier5.value
          ? this.Identifier5.value.trim()
          : this.Identifier5.value,
        adjustmentreasoncode: this.ReasonCode.value.trim(),
        createdon: this.clsUtility.currentDateTime().toString()
      };

      //#region "Get Modified Items of PLB Identifier"

      let oldplbidentifierchangeditems = {};
      let ModifiedPLBIdentifierItems = "";
      let changedplbidentifieritems: any = this.clsUtility.jsondiff(
        this.originalPLBIdentifierdetails,
        payeridentifierinput
      );

      if (
        !isNullOrUndefined(changedplbidentifieritems) &&
        changedplbidentifieritems != {}
      ) {
        for (let key of Object.keys(changedplbidentifieritems)) {
          let oldvalue: string = this.originalPLBIdentifierdetails[key];
          oldplbidentifierchangeditems[key] = oldvalue;
        }
        if (
          !isNullOrUndefined(changedplbidentifieritems) &&
          JSON.stringify(changedplbidentifieritems) != "{}"
        ) {
          ModifiedPLBIdentifierItems =
            "OLD : " +
            JSON.stringify(oldplbidentifierchangeditems) +
            ",NEW : " +
            JSON.stringify(changedplbidentifieritems);
        }
      }

      //#endregion "Get Modified Items of PLB Identifier"

      let seq = this.api.post_base(
        "PayerIdentifier/Update",
        payeridentifierinput
      );
      this.subscription.add(
        seq.subscribe(
          data => {
            if (data != null || data != undefined) {
              if (data == "1") {
                this.clsUtility.showSuccess("PLB Config updated successfully");
                this.api.insertActivityLogPostcall(
                  "PLB Config (Payer: " +
                    this.PayerName.value.trim() +
                    ") updated successfully" +
                    ModifiedPLBIdentifierItems,
                  "PLB Config",
                  "UPDATE"
                );
                this.OutputpayeridentifierEditResult(true);
              } else if (data == "2") {
                this.clsUtility.showWarning("PLB Config is Duplicate");
                // this.OutputpayeridentifierEditResult(false);
              } else if (data == "0") {
                this.clsUtility.showError("Error while updating plb config");

                this.OutputpayeridentifierEditResult(false);
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
    // try {
    //   let seq = this.api.put(
    //     "SubClient/ProviderMapping/Update",
    //     arrProvidermapping
    //   );
    //   seq.subscribe(
    //     data => {
    //       if (data != null || data != undefined) {
    //         let clientname = this.clientList.find(
    //           x => x.clientid == this.fbcClient.value
    //         ).clientname;
    //         let subclientname = this.SubclientList.find(
    //           x => x.id == this.fbcSubclient.value
    //         ).subclientname;
    //         let subclientcode = this.SubclientList.find(
    //           x => x.id == this.fbcSubclient.value
    //         ).subclientcode;
    //         let response: { message: string; status: string };
    //         response = <any>data;
    //         if (response.message == "" && response.status == "1") {
    //           this.clsUtility.showSuccess(
    //             "Provider mapping updated successfully"
    //           );
    //           this.OutputPayeridentifierEditResult(true);
    //         } else if (response.message != "" && response.status == "1") {
    //           this.clsUtility.showWarning(response.message);
    //           this.OutputPayeridentifierEditResult(true);
    //         } else if (response.message != "" && response.status == "2") {
    //           this.clsUtility.showWarning(response.message);
    //         } else if (response.message == "" && response.status == "0") {
    //           this.clsUtility.showError("Error while saving provider mapping");
    //           this.OutputPayeridentifierEditResult(false);
    //         }
    //         this.api.insertActivityLog(
    //           "Updated Provider Mapping for Client name :" +
    //             clientname +
    //             " ,Subclient name :" +
    //             subclientname +
    //             " ,SubclientCode :" +
    //             subclientcode +
    //             " ,NPI: " +
    //             arrProvidermapping.proivdersubclientmapping[0].providernpi,
    //           "Provider Mapping",
    //           "UPDATE"
    //         );
    //       }
    //     },
    //     error => {
    //       this.clsUtility.LogError(error);
    //     }
    //   );
    // } catch (error) {
    //   this.clsUtility.LogError(error);
    // }
  }

  savePayeridentifier() {
    try {
      this.submitted = true;
      if (this.validatePayeridentifier()) {
        if (this.newPayeridentifier) {
          this.postPayeridentifier(null);
        } else {
          this.updatePayeridentifier(this.InputPayeridentifierEditid);
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
    // try {
    //   this.submitted = true;
    //   let currentDateTime = this.clsUtility.currentDateTime();
    //   let subclient = "";
    //   let subclientname = "";
    //   if (
    //     this.fbcSubclient.value == undefined ||
    //     this.fbcSubclient.value == ""
    //   ) {
    //     subclient = "0";
    //     subclientname = "";
    //   } else {
    //     subclient = this.fbcSubclient.value;
    //     subclientname = this.SubclientList.find(
    //       x => x.id == this.fbcSubclient.value
    //     ).subclientname;
    //   }
    //   if (this.validatePayeridentifier()) {
    //     let currentDateTime = this.clsUtility.currentDateTime();
    //     //var strPayer = this.ProvidermappingName.value;
    //     if (this.newPayeridentifier) {
    //       let arrProvidermapping = {
    //         proivdersubclientmapping: []
    //       };
    //       for (var i in this.NPISelected) {
    //         // for (var j in this.selectedSubclientValues) {
    //         this.providermapping = new Payeridentifier();
    //         this.providermapping.mappingid = "";
    //         this.providermapping.firstname = this.NPISelected[i].sfirstname;
    //         this.providermapping.middlename = this.NPISelected[i].smiddlename;
    //         this.providermapping.lastname = this.NPISelected[i].slastname;
    //         this.providermapping.gender = this.NPISelected[i].sgender;
    //         this.providermapping.dob = this.NPISelected[i].dtdob;
    //         this.providermapping.providernpi = this.NPISelected[i].npi;
    //         this.providermapping.sname = this.NPISelected[i].fullname;
    //         this.providermapping.mailingaddress = this.NPISelected[
    //           i
    //         ].mailingaddress;
    //         this.providermapping.npitype = this.NPISelected[i].npitype;
    //         this.providermapping.status = this.updatestatus;
    //         this.providermapping.groupid = "";
    //         this.providermapping.subgroupid = "";
    //         this.providermapping.clientid = this.selectedclients.toString();
    //         this.providermapping.subclientId = this.selectedsubclients.toString();
    //         this.providermapping.subclientcode = "";
    //         this.providermapping.subclientname = subclientname;
    //         this.providermapping.createdby = this.loginGCPuserid;
    //         this.providermapping.createdon = currentDateTime;
    //         arrProvidermapping.proivdersubclientmapping.push(
    //           this.providermapping
    //         );
    //         // }
    //       }
    //       this.postPayeridentifier(arrProvidermapping);
    //     } else if (!this.newProvidermapping) {
    //       let arrProvidermapping = {
    //         proivdersubclientmapping: []
    //       };
    //       for (var i in this.NPISelected) {
    //         // for (var j in this.selectedSubclientValues) {
    //         this.providermapping = new Payeridentifier();
    //         this.providermapping.mappingid = this.ProvidermappingEditid;
    //         this.providermapping.firstname = this.NPISelected[i].sfirstname;
    //         this.providermapping.middlename = this.NPISelected[i].smiddlename;
    //         this.providermapping.lastname = this.NPISelected[i].slastname;
    //         this.providermapping.gender = this.NPISelected[i].sgender;
    //         this.providermapping.dob = this.NPISelected[i].dtdob;
    //         this.providermapping.providernpi = this.NPISelected[i].npi;
    //         this.providermapping.sname = this.NPISelected[i].fullname;
    //         this.providermapping.mailingaddress = this.NPISelected[
    //           i
    //         ].mailingaddress;
    //         this.providermapping.npitype = this.NPISelected[i].npitype;
    //         this.providermapping.status = this.updatestatus;
    //         this.providermapping.groupid = "";
    //         this.providermapping.subgroupid = "";
    //         this.providermapping.clientid = this.selectedclients.toString();
    //         this.providermapping.subclientId = this.selectedsubclients.toString();
    //         this.providermapping.subclientcode = "";
    //         this.providermapping.subclientname = subclientname;
    //         this.providermapping.createdby = this.loginGCPuserid;
    //         this.providermapping.createdon = currentDateTime;
    //         arrProvidermapping.proivdersubclientmapping.push(
    //           this.providermapping
    //         );
    //         // }
    //       }
    //       this.updatePayeridentifier(arrProvidermapping);
    //     } else {
    //       this.OutputPayeridentifierEditResult(false);
    //       $("#addprovidermappingModal").modal("hide");
    //     }
    //   }
    // } catch (error) {
    //   this.clsUtility.LogError(error);
    // }
  }

  FillPayeridentifierGroup() {
    try {
      let Payeridentifier: Payeridentifier;
      Payeridentifier = this.Payeridentifierdetail[0];
      this.PayerId.setValue(Payeridentifier.payerid);
      this.PayerName.setValue(Payeridentifier.payername);
      this.ReasonCode.setValue(Payeridentifier.adjustmentreasoncode);
      this.Seperator.setValue(Payeridentifier.separator);
      this.Identifier1.setValue(Payeridentifier.identifier_1);
      this.Identifier2.setValue(Payeridentifier.identifier_2);
      this.Identifier3.setValue(Payeridentifier.identifier_3);
      this.Identifier4.setValue(Payeridentifier.identifier_4);
      this.Identifier5.setValue(Payeridentifier.identifier_5);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnClose() {
    try {
      this.OutputpayeridentifierEditResult(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ResetComponents() {
    try {
      this.PayerGroup.reset();
      this.submitted = false;
      this.InputPayeridentifierEditid = null;
      this.clsPayeridentifier = null;
      this.subscription.unsubscribe();
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
