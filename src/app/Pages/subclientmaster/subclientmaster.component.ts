import { clsftp } from "./clsftp";
import { clssplitpara } from "./clssplitpara";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Api } from "./../../Services/api";
import { clssubclient } from "./clssubclient";
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from "@angular/forms";
import { Router, NavigationEnd } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import {
  GridDataResult,
  PageChangeEvent,
  SelectableSettings,
  RowArgs
} from "@progress/kendo-angular-grid";
import { DatePipe } from "@angular/common";
import { AllConfigurationService } from "src/app/Services/all-configuration.service";
import { Ftpmaster } from "src/app/Model/ftpmaster";
import { CoreoperationsService } from "src/app/Services/coreoperations.service";
import { ThrowStmt } from "@angular/compiler";
import { SubSink } from "subsink";
import { isNullOrUndefined } from "util";
declare var $: any;
import { clsPermission } from "src/app/Services/settings/clspermission";

@Component({
  selector: "app-subclientmaster",
  templateUrl: "./subclientmaster.component.html",
  styleUrls: ["./subclientmaster.component.css"]
})
export class SubclientmasterComponent implements OnInit, OnDestroy {
  hide: boolean =  true;
  public clsPermission: clsPermission;
  public groupList: any;
  public subscription = new SubSink();
  public copygroupList: any;
  public toggleme: any;
  loginGCPUserID: string = "";
  private clsUtility: Utility;
  frmclient: FormGroup;
  frmsplitpara: FormGroup;
  frmftp: FormGroup;
  formtitle: string = "Add Practice";
  buttonCaption: string = "Add Practice";
  isaddmode: boolean = true;
  public loading = false;
  objclient = new clssubclient();
  objsplit = new clssplitpara();
  objftp = new clsftp();
  public mask: string = "000-000-0000";
  public arrFTPType: Array<string> = ["FTP", "SFTP"];
  currentsubclient: any;
  currentsubclientcode: any;
  arrSplitParameter: any;
  subclientcode: string = "";
  subclientid: number = 0;
  getftpinfo: any;

  splitparalist: clssplitpara[] = [];
  objadd: clssplitpara;
  ftpConnectionMsg: string;
  makeModalDisabled: boolean = false;
  billingCompanies: Array<string> = ["TRIARQ", "3rd Party"];
  companyName: string = "";
  current_splitparaname: string = "";
  public disableSave: boolean = false;
  public updatemessage: string = "";
  public currentsplitepara: any = [];
  public InputConfirmationMessage: string;
  duplicateFtpConfirmationYesClicked: boolean = false;
  private originalSubclientdetails: any;
  private originalSubclientFTPdetails: any;
  private originalSplitparameterdetails: any;
  public confirmationmessage: string = "";
  public filetransferoption: string = "";
  public SubclientList: any = []; 
  public SelectAllsubClients: any = [];
  public selectedsubclients: number = 0;

  constructor(
    fb: FormBuilder,
    private _router: Router,
    private _routeParams: ActivatedRoute,
    public api: Api,
    private datatransfer: DatatransaferService,
    private toaster: ToastrService,
    private allConfigService: AllConfigurationService,
    private coreService: CoreoperationsService
  ) {
    this.clsUtility = new Utility(toaster);
    this.frmclient = fb.group({
      fcClientid: ["", Validators.required],
      fcSubClientID: [1],
      fcSubClientCode: ["", Validators.required],
      fcSubClientDevisionCode: [
        "",
        [Validators.required, Validators.maxLength(10)]
      ],
      fcSubClientName: ["", [Validators.required, Validators.maxLength(100)]],
      fcSubContactName: [""], //, [Validators.required, Validators.maxLength(100)]
      fcSubContactEmail: ["", Validators.email], //, Validators.maxLength(50) Validators.required,
      fcSubContactPhone: ["", Validators.pattern("^[0-9]*$")], //Validators.required,
      fcSubClientStatus: [false, Validators.required],
      billingCompany: [""],
      companyTypes: [""],
      companyName: [""],
      fcbillingloccode: [""],
      fcFTPoption: ["", Validators.required],
      fccopytoftpsubclientid: [""]
    });

    this.frmsplitpara = fb.group({
      fcSplitParameterName: ["", Validators.required],
      fcSplitParameterValue: [
        "",
        [Validators.required, Validators.maxLength(100)]
      ]
    });

    this.frmftp = fb.group({
      fcFTPUrl: ["", [Validators.required, Validators.maxLength(100)]],
      fcFTPcode: ["", Validators.required],
      fcFTPPort: [
        "",
        [
          Validators.required,
          Validators.pattern("^[0-9]*$"),
          Validators.maxLength(4)
        ]
      ],
      fcFTPUsername: ["", [Validators.required, Validators.maxLength(50)]],
      fcFTPPassword: ["", [Validators.required, Validators.maxLength(50)]],
      fcFTPName: ["", [Validators.required, Validators.maxLength(50)]],
      fcFTPType: ["SFTP", Validators.required],
      fcFTPStatus: [false, Validators.required],
      fcFTP835Outbound: ["", [Validators.required, Validators.maxLength(150)]]
    });
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.datatransfer.newpermission.subscribe(
          value => (this.clsPermission = value)
        )
      );
      
      this.getSplitParameters();
      this.getClientlist();
      this.subscription.add(
        this.datatransfer.loginGCPUserID.subscribe(data => {
          this.loginGCPUserID = data;
        })
      );

      var id = this._routeParams.params.subscribe(params => {
        var isnew = params["new"];
        var id = "";
        if (isnew == "new") {
          id = "new";
        } else {
          id = String(params["id"]);
          var subclientcode = String(params["subclientcode"]);
          this.currentsubclient = id;
          this.currentsubclientcode = subclientcode;
        }

        if (id == "new") {
          this.formtitle = "Add Practice";
          this.buttonCaption = "Add Practice";
          this.isaddmode = true;
          this.frmftp.controls["fcFTPType"].setValue("SFTP");
          this.frmclient.controls["fcFTPoption"].setValue("2");          
        } else {
          this.formtitle = "Edit Practice";
          this.buttonCaption = "Update Practice";
          this.isaddmode = false;
        }

        if (id == "new") {
          let seq = this.api.get("SubClient/FTP/GetOutboundId");
          this.subscription.add(
            seq.subscribe(
              res => {
                let code = String(res);
                this.frmftp.controls["fcFTPcode"].setValue(code);
              },
              err => {
                this.clsUtility.LogError(err);
              }
            )
          );

          this.loading = true;
          let seq2 = this.api.post("SubClient/GetDefaultSubClientFTP", null);
          this.subscription.add(
            seq2.subscribe(
              res2 => {
                if (res2 != null && res2 != undefined) {
                  if (res2[0] != null && res2[0] != undefined) {
                    this.frmftp.controls["fcFTPName"].setValue(
                      String(res2[0].ftpname)
                    );
                    this.frmftp.controls["fcFTP835Outbound"].setValue(
                      String(res2[0].ftp835outboundfolder)
                    );
                    this.frmftp.controls["fcFTPUrl"].setValue(res2[0].ftpurl);
                    this.frmftp.controls["fcFTPPort"].setValue(res2[0].ftpport);
                    this.frmftp.controls["fcFTPType"].setValue(res2[0].ftptype);
                  }
                  this.loading = false;
                }
              },
              err => {
                this.loading = false;
                this.clsUtility.LogError(err);
              }
            )
          );

          return;
        } else {
          this.loading = true;
          let getclient: { subclientcode: string } = {
            subclientcode: subclientcode
          };
          let seq = this.api.post("SubClient/GetSubClient", getclient);
          this.subscription.add(
            seq.subscribe(
              res2 => {
                if (res2[0] != undefined && res2[0] != null) {
                  this.originalSubclientdetails = null;
                  this.originalSubclientdetails = { ...res2[0] };
                  this.objclient = <clssubclient>res2[0];
                  if (this.objclient.ftpoption == "1") {
                    this.frmclient.controls.fcFTPoption.setValue("1");                    
                  } else if (this.objclient.ftpoption == "2") {
                    this.frmclient.controls.fcFTPoption.setValue("2");                    
                  }

                  if (this.objclient.billingcompany == "3rd Party") {
                    this.companyName = this.objclient.companytype;
                    this.objclient.companytype = "";
                    this.f.companyName.setValidators(Validators.required);
                  }
                }

                // Get Split Para Start
                let getsplitpara: {
                  splitparameterid: string;
                  subclientcode: string;
                } = {
                  splitparameterid: "0",
                  subclientcode: subclientcode
                };
                let seq2 = this.api.post(
                  "SubClient/GetSplitParameter",
                  getsplitpara
                );
                this.subscription.add(
                  seq2.subscribe(
                    res => {
                      if (res != null && res != undefined) {
                        // this.objsplit = <clssplitpara>res[0];
                        this.originalSplitparameterdetails = null;
                        this.originalSplitparameterdetails = { ...res };
                        this.splitparalist = <clssplitpara[]>res;

                        this.frmsplitpara.controls[
                          "fcSplitParameterName"
                        ].setValue(this.objsplit.splitparameterid);
                      }
                    },
                    err => {
                      this.clsUtility.LogError(err);
                    }
                  )
                );
                // Get FTP INfo Start
                let getftp: { ftpid: string; subclientcode: string } = {
                  ftpid: "0",
                  subclientcode: subclientcode
                };
                let seq3 = this.api.post("SubClient/GetSubClientFTP", getftp);
                this.subscription.add(
                  seq3.subscribe(
                    res3 => {
                      if (res3 != null && res3 != undefined) {
                        this.getftpinfo = res3;
                        if (this.getftpinfo.length > 0) {
                          this.originalSubclientFTPdetails = null;
                          this.originalSubclientFTPdetails = { ...res3[0] };

                          this.objftp = <clsftp>res3[0];
                          this.objftp.ftppassword = this.clsUtility
                            .decryptAES(this.objftp.ftppassword)
                            .toString();
                        }
                      }
                    },
                    err => {
                      this.loading = false;
                      this.clsUtility.LogError(err);
                    }
                  )
                );
                this.getSubclient(this.objclient.clientid, 0);
              },
              err => {
                this.loading = false;
                this.clsUtility.LogError(err);
              }
            )
          );
          this.loading = false;          
        }
      });

      this.subscription.add(
        this.allConfigService.toggleSidebar.subscribe(isToggle => {
          this.toggleme = isToggle;
        })
      );
    } catch (error) {
      this.loading = false;
      this.clsUtility.LogError(error);
    }
  }

  togglesidebar() {
    this.allConfigService.toggleSidebar.next(!this.toggleme);
  }

  onSplitParameterChange(evnt: any) {}

  getClientlist() {
    try {
      this.loading = true;
      let getclient: { clientid: string; clientstatus: boolean } = {
        clientid: "0",
        clientstatus: false
      };
      let seq = this.api.post("GetClient", getclient);
      this.subscription.add(
        seq.subscribe(
          res => {
            this.groupList = res;

            if (
              this.groupList != null &&
              this.groupList != undefined &&
              this.groupList.length > 0
            ) {
              this.loading = false;
              this.copygroupList = this.groupList.slice();
            } else {
              this.groupList = [];
            }
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

  getSplitParameters() {
    try {
      this.loading = true;
      let seq = this.api.get("SplitParameter");
      this.subscription.add(
        seq.subscribe(
          res => {
            this.loading = false;
            this.arrSplitParameter = res;
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

  handleFilter(value) {
    this.copygroupList = this.groupList.filter(
      s =>
        s.clientname
          .toString()
          .toLowerCase()
          .indexOf(value.toLowerCase()) !== -1
    );
  }
  updateSubclient() {
    try {
      const datepipe = new DatePipe("en-US");
      const currentDate = datepipe.transform(
        Date.now(),
        "yyyy-MM-ddTHH:mm:ss.SSSZ"
      );
      this.loading = true;

      //#region "Get Modified Items of Subclient"
      let ModifiedSubclientFTPItems = "";
      let oldsubclientchangeditems = {};
      let ModifiedSubclientItems = "";
      let changedsubclientitems: any = this.clsUtility.jsondiff(
        this.originalSubclientdetails,
        this.objclient
      );

      if (
        !isNullOrUndefined(changedsubclientitems) &&
        changedsubclientitems != {}
      ) {
        // if (changedsubclientitems.hasOwnProperty("ftpoption")) {
        //   delete changedsubclientitems.ftpoption;
        // }

        for (let key of Object.keys(changedsubclientitems)) {
          let oldvalue: string = this.originalSubclientdetails[key];
          oldsubclientchangeditems[key] = oldvalue;
        }
        if (
          !isNullOrUndefined(changedsubclientitems) &&
          JSON.stringify(changedsubclientitems) != "{}"
        ) {
          ModifiedSubclientItems =
            "OLD SubclientDetails: " +
            JSON.stringify(oldsubclientchangeditems) +
            ",NEW SubclientDetails: " +
            JSON.stringify(changedsubclientitems);
        }
      }

      //#endregion "Get Modified Items of Subclient"

      let seq = this.api.post("SubClient/UpdateSubClient", this.objclient);
      this.subscription.add(
        seq.subscribe(
          res => {
            if (res != null || res != undefined) {
              if (res == 1) {
                let arrUsers = {
                  splitparameter: []
                };

                for (var i in this.splitparalist) {
                  var item = this.splitparalist[i];
                  arrUsers.splitparameter.push({
                    id: this.splitparalist[i].id,
                    subclientid: this.objclient.subclientid,
                    subclient_id: this.objclient.id,
                    subclientcode: this.objclient.subclientcode,
                    splitparameterid: this.splitparalist[i].splitparameterid,
                    splitparametername: this.splitparalist[i]
                      .splitparametername,
                    splitparametervalue: this.splitparalist[i]
                      .splitparametervalue,
                    splitparameterstatus: this.splitparalist[i]
                      .splitparameterstatus
                  });
                }

                //#region "Get Modified Items of Splitparameter"

                let oldsplitparameterchangeditems;
                let ModifiedSplitparameterItems = "";
                let changedsplitparameteritems: any = this.clsUtility.jsondiff(
                  this.originalSplitparameterdetails,
                  arrUsers.splitparameter
                );

                if (
                  !isNullOrUndefined(changedsplitparameteritems) &&
                  changedsplitparameteritems != {}
                ) {
                  let count = Object.keys(changedsplitparameteritems).length;
                  for (let i = 0; i < count; i++) {
                    if (
                      !isNullOrUndefined(changedsplitparameteritems) &&
                      JSON.stringify(changedsplitparameteritems[i]) != "{}"
                    ) {
                      oldsplitparameterchangeditems =
                        changedsplitparameteritems[i];
                    } else {
                      delete changedsplitparameteritems[i];
                    }
                  }

                  if (
                    !isNullOrUndefined(oldsplitparameterchangeditems) &&
                    JSON.stringify(oldsplitparameterchangeditems) != "{}"
                  ) {
                    ModifiedSplitparameterItems =
                      "Added new Splitparameter: " +
                      JSON.stringify(oldsplitparameterchangeditems);
                  }
                }

                //#endregion "Get Modified Items of Splitparameter"

                let seq = this.api.post(
                  "SubClient/SaveSplitParameter",
                  arrUsers
                );
                this.subscription.add(
                  seq.subscribe(
                    res => {},
                    err => {
                      this.clsUtility.LogError(err);
                    }
                  )
                );

                this.objftp.createdby = this.loginGCPUserID;
                this.objftp.createdon = currentDate;

                if (this.objftp.ftpid) {
                  this.objftp.subclient_id = this.objclient.id;
                  this.objftp.subclientcode = this.objclient.subclientcode;
                  this.objftp.subclientid = this.objclient.subclientid.toString();

                  //#region "Get Modified Items of SubclientFTP"

                  let oldsubclientftpchangeditems = {};
                  ModifiedSubclientFTPItems = "";
                  let changedsubclientftpitems: any = this.clsUtility.jsondiff(
                    this.originalSubclientFTPdetails,
                    this.objftp
                  );

                  if (
                    !isNullOrUndefined(changedsubclientftpitems) &&
                    changedsubclientftpitems != {}
                  ) {
                    if (
                      changedsubclientftpitems.hasOwnProperty("subclientid")
                    ) {
                      delete changedsubclientftpitems.subclientid;
                    }

                    for (let key of Object.keys(changedsubclientftpitems)) {
                      let oldvalue: string = this.originalSubclientFTPdetails[
                        key
                      ];
                      oldsubclientftpchangeditems[key] = oldvalue;
                    }
                    if (
                      !isNullOrUndefined(changedsubclientftpitems) &&
                      JSON.stringify(changedsubclientftpitems) != "{}"
                    ) {
                      ModifiedSubclientFTPItems =
                        "OLD SubclientFTP: " +
                        JSON.stringify(oldsubclientftpchangeditems) +
                        ",NEW SubclientFTP : " +
                        JSON.stringify(changedsubclientftpitems);
                    }
                  }

                  //#endregion "Get Modified Items of SubclientFTP"

                  let seq = this.api.post(
                    "SubClient/UpdateSubClientFTP",
                    this.objftp
                  );
                  this.subscription.add(
                    seq.subscribe(
                      res => {
                        this._router.navigate(["/Configuration/subclientlist"]);
                      },
                      err => {
                        this.loading = false;
                        this.clsUtility.LogError(err);
                      }
                    )
                  );
                } else {
                  this.objclient.ftpoption = this.frmclient.controls.ftpoption.value;
                  this.objftp.subclient_id = String(res);
                  this.objftp.subclientcode = this.objclient.subclientcode;
                  this.objftp.subclientid = String(this.subclientid);

                  let seq = this.api.post(
                    "SubClient/SaveSubClientFTP",
                    this.objftp
                  );
                  this.subscription.add(
                    seq.subscribe(
                      res => {
                        this._router.navigate(["/Configuration/subclientlist"]);
                      },
                      err => {
                        this.loading = false;
                        this.clsUtility.LogError(err);
                      }
                    )
                  );
                }
                this.clsUtility.showSuccess("Practice updated successfully.");
                this.api.insertActivityLogPostcall(
                  "Practice Modified (Practice name : " +
                    this.objclient.subclientname +
                    ", PracticeCode : " +
                    this.objclient.subclientcode +
                    ")" +
                    ModifiedSubclientItems +
                    ModifiedSplitparameterItems +
                    ModifiedSubclientFTPItems,
                  "Practice",
                  "UPDATE"
                );
                this.disableSave = false;
              } else if (res == 2) {
                this.objftp.ftppassword = this.clsUtility
                  .decryptAES(this.objftp.ftppassword)
                  .toString();
                this.duplicateFtpConfirmationYesClicked = false;
                this.toaster.warning("Practice name is duplicate");
                this.disableSave = false;
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
      this.clsUtility.showError(error);
    }
  }
  addSubclient() {
    try {
      const datepipe = new DatePipe("en-US");
      const currentDate = datepipe.transform(
        Date.now(),
        "yyyy-MM-ddTHH:mm:ss.SSSZ"
      );
      // No Duplicate
      this.loading = true;
      let seq = this.api.post("SubClient/SaveSubClient", this.objclient);
      this.subscription.add(
        seq.subscribe(
          res => {
            if (res != null || res != undefined) {
              if (res == 2) {
                this.objftp.ftppassword = this.clsUtility
                  .decryptAES(this.objftp.ftppassword)
                  .toString();
                this.duplicateFtpConfirmationYesClicked = false;
                this.toaster.warning("Practice name is duplicate");
                this.disableSave = false;
              } else if (res != 2 && res != 0) {
                let arrUsers = {
                  splitparameter: []
                };
                for (var i in this.splitparalist) {
                  var item = this.splitparalist[i];
                  arrUsers.splitparameter.push({
                    id: this.splitparalist[i].id,
                    subclientid: this.subclientid,
                    subclient_id: String(res), // Primary Key
                    subclientcode: this.objclient.subclientcode,
                    splitparameterid: this.splitparalist[i].splitparameterid,
                    splitparametername: this.splitparalist[i]
                      .splitparametername,
                    splitparametervalue: this.splitparalist[i]
                      .splitparametervalue,
                    splitparameterstatus: this.splitparalist[i]
                      .splitparameterstatus
                  });
                }

                let seq = this.api.post(
                  "SubClient/SaveSplitParameter",
                  arrUsers
                );
                this.subscription.add(
                  seq.subscribe(
                    res => {},
                    err => {
                      this.loading = false;
                      this.clsUtility.LogError(err);
                    }
                  )
                );

                this.objftp.createdby = this.loginGCPUserID;
                this.objftp.createdon = currentDate;
                this.objftp.subclient_id = String(res);
                this.objftp.subclientcode = this.objclient.subclientcode;
                this.objftp.subclientid = String(this.subclientid);

                let seq2 = this.api.post(
                  "SubClient/SaveSubClientFTP",
                  this.objftp
                );
                this.subscription.add(
                  seq2.subscribe(
                    res2 => {
                      this._router.navigate(["/Configuration/subclientlist"]);
                    },
                    err => {
                      this.loading = false;
                      this.clsUtility.LogError(err);
                    }
                  )
                );
                this.clsUtility.showSuccess("Practice saved successfully.");
                this.api.insertActivityLog(
                  "Practice Added (" + this.objclient.subclientname + ")",
                  "Practice",
                  "ADD"
                );
              } else if (res == 0) {
                this.toaster.error("Error while saving subclient");
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
      this.clsUtility.LogError(error);
    }
  }
  addupdateclient() {
    try {
      this.frmclient.patchValue({
        fcSubClientDevisionCode: this.f.fcSubClientDevisionCode.value
          ? this.f.fcSubClientDevisionCode.value.trim()
          : this.f.fcSubClientDevisionCode.value,
        fcSubClientName: this.f.fcSubClientName.value
          ? this.f.fcSubClientName.value.trim()
          : this.f.fcSubClientName.value,
        fcSubContactName: this.f.fcSubContactName.value
          ? this.f.fcSubContactName.value.trim()
          : this.f.fcSubContactName.value,
        fcSubContactEmail: this.f.fcSubContactEmail.value
          ? this.f.fcSubContactEmail.value.trim()
          : this.f.fcSubContactEmail.value,
        companyName: this.f.companyName.value
          ? this.f.companyName.value.trim()
          : this.f.companyName.value,
        fcbillingloccode: this.f.fcbillingloccode.value
          ? this.f.fcbillingloccode.value.trim()
          : this.f.fcbillingloccode.value,
        fcFTPoption: this.f.fcFTPoption.value
      });

      this.frmclient.updateValueAndValidity();

      this.frmftp.patchValue({
        fcFTPUrl: this.ft.fcFTPUrl.value
          ? this.ft.fcFTPUrl.value.trim()
          : this.ft.fcFTPUrl.value,
        fcFTPUsername: this.ft.fcFTPUsername.value
          ? this.ft.fcFTPUsername.value.trim()
          : this.ft.fcFTPUsername.value,
        fcFTPPassword: this.ft.fcFTPPassword.value
          ? this.ft.fcFTPPassword.value.trim()
          : this.ft.fcFTPPassword.value,
        fcFTPName: this.ft.fcFTPName.value
          ? this.ft.fcFTPName.value.trim()
          : this.ft.fcFTPName.value,
        fcFTP835Outbound: this.ft.fcFTP835Outbound.value
          ? this.ft.fcFTP835Outbound.value.trim()
          : this.ft.fcFTP835Outbound.value
      });

      this.frmftp.updateValueAndValidity();

      if (!this.frmclient.valid || !this.frmftp.valid) {
        this.disableSave = false;
        return;
      }

      const datepipe = new DatePipe("en-US");
      const currentDate = datepipe.transform(
        Date.now(),
        "yyyy-MM-ddTHH:mm:ss.SSSZ"
      );

      if (this.objclient.id) {
        //// Subclient Update Call
        this.objclient.ftpoption = this.frmclient.controls.fcFTPoption.value;
        this.objclient.createdby = this.loginGCPUserID;
        this.objclient.createdon = currentDate;
        // this.objclient.billingcompany = this.f.billingCompany.value;
        // this.objclient.companytype = this.f.companyTypes.value;
        if (this.objclient.billingcompany == "3rd Party") {
          this.objclient.companytype = this.companyName;
        }
        this.objftp.ftppassword = this.clsUtility
          .encryptAES(this.ft.fcFTPPassword.value.trim())
          .toString();
        let getsubclient: {
          ftpid: string;
          ftpurl: string;
          ftpport: string;
          ftptype: string;
          ftp835outboundfolder: string;
          ftppassword: string;
          ftpusername: string;
        } = {
          ftpid: this.objftp.ftpid,
          ftpurl: this.objftp.ftpurl,
          ftpport: this.objftp.ftpport,
          ftptype: this.objftp.ftptype,
          ftp835outboundfolder: this.objftp.ftp835outboundfolder,
          ftppassword: this.objftp.ftppassword,
          ftpusername: this.objftp.ftpusername
        };
        if (!this.duplicateFtpConfirmationYesClicked) {
          let seq5 = this.api.post("SubClient/CheckDuplicateFTP", getsubclient);
          this.subscription.add(
            seq5.subscribe(res5 => {
              if (res5 != null || res5 != undefined) {
                if (res5 == 1) {
                  this.updateSubclient();
                } else if (res5 == 2) {
                  // Duplicate FTP Configuration
                  this.objftp.ftppassword = this.clsUtility
                    .decryptAES(this.objftp.ftppassword)
                    .toString();
                  // this.toaster.warning("FTP Configuration Getting Duplicate.");
                  this.InputConfirmationMessage =
                    "FTP Configuration getting duplicate.\n Are you sure you want to save?";
                  $("#duplicateFtpConfirmation").modal("show");
                  this.disableSave = false;
                } else {
                  this.objftp.ftppassword = this.clsUtility
                    .decryptAES(this.objftp.ftppassword)
                    .toString();
                  this.toaster.error("Failed in Duplicate FTP configuration.");
                  this.disableSave = false;
                }
              }
            })
          );
        } else {
          this.updateSubclient();
        }
      } else {
        this.objftp.ftppassword = this.clsUtility
          .encryptAES(this.ft.fcFTPPassword.value.trim())
          .toString();
        //// Subclient Add Call
        this.objclient.ftpoption = this.frmclient.controls.fcFTPoption.value;
        this.objclient.createdby = this.loginGCPUserID;
        this.objclient.createdon = currentDate;
        this.objclient.subclientid = this.subclientid;
        if (this.objclient.billingcompany == "3rd Party") {
          this.objclient.companytype = this.companyName;
        }
        // this.objclient.billingcompany = this.f.billingCompany.value;
        // this.objclient.companytype = this.f.companyTypes.value;
        if (!this.duplicateFtpConfirmationYesClicked) {
          let seq5 = this.api.post("SubClient/CheckDuplicateFTP", this.objftp);
          this.subscription.add(
            seq5.subscribe(
              res5 => {
                if (res5 != null || res5 != undefined) {
                  if (res5 == 1) {
                    this.addSubclient();
                  } else if (res5 == 2) {
                    // Duplicate FTP Configuration
                    this.objftp.ftppassword = this.clsUtility
                      .decryptAES(this.objftp.ftppassword)
                      .toString();
                    // this.toaster.warning(
                    //   "FTP Configuration Getting Duplicate."
                    // );
                    this.InputConfirmationMessage =
                      "FTP Configuration getting duplicate.\n Are you sure you want to save?";
                    $("#duplicateFtpConfirmation").modal("show");
                    this.disableSave = false;
                  } else {
                    this.objftp.ftppassword = this.clsUtility
                      .decryptAES(this.objftp.ftppassword)
                      .toString();
                    this.toaster.error(
                      "Failed in Duplicate FTP configuration."
                    );
                    this.disableSave = false;
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
        } else {
          this.addSubclient();
        }
      }
    } catch (error) {
      this.loading = false;
      this.clsUtility.LogError(error);
    }
  }

  opensplitparamodal() {
    try {
      this.frmsplitpara.reset();
      if (String(this.frmclient.controls.fcSubClientCode.value) != "") {
        $("#splitparamodal").modal("show");
      } else {
        this.toaster.warning("Please Select Client First");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  addsplitpara() {
    try {
      this.frmsplitpara.patchValue({
        fcSplitParameterValue: this.frmsplitpara.controls.fcSplitParameterValue
          .value
          ? this.frmsplitpara.controls.fcSplitParameterValue.value.trim()
          : this.frmsplitpara.controls.fcSplitParameterValue.value
      });
      this.frmsplitpara.updateValueAndValidity();
      if (!this.frmsplitpara.valid) {
        return;
      }
      let filterResult: any = this.splitparalist.filter(
        s =>
          s.splitparameterid ==
            this.frmsplitpara.controls.fcSplitParameterName.value &&
          s.splitparametervalue ==
            this.frmsplitpara.controls.fcSplitParameterValue.value
      );

      if (filterResult.length > 0) {
        this.toaster.warning("Duplicate Split parmeter Not Allowed");
      } else {
        try {
          // console.log('fcSubClientCode - ', this.frmclient.controls.fcSubClientCode.value);
          // console.log('fcSplitParameterName - ', this.frmsplitpara.controls.fcSplitParameterName.value);
          // console.log('fcSplitParameterValue - ', this.frmsplitpara.controls.fcSplitParameterValue.value);
          // call to Check Duplicate SplitParameter
          let strsplitparaname = this.arrSplitParameter.filter(
            s =>
              s.splitparameterid
                .toString()
                .indexOf(
                  this.frmsplitpara.controls.fcSplitParameterName.value
                ) !== -1
          )[0].splitparametername;

          this.loading = true;
          let checksplitpara: {
            clientid: string;
            subclientcode: string;
            splitparametername: string;
            splitparametervalue: string;
          } = {
            clientid: this.frmclient.controls.fcClientid.value,
            subclientcode: this.frmclient.controls.fcSubClientCode.value,
            splitparametername: strsplitparaname,
            splitparametervalue: this.frmsplitpara.controls
              .fcSplitParameterValue.value
          };

          let seq = this.api.post(
            "SubClient/CheckDuplicateSplitParameter",
            checksplitpara
          );
          this.subscription.add(
            seq.subscribe(
              res => {
                this.loading = false;
                // console.log('res for CheckDuplicateSplitParameter');
                // console.log(res);
                if (res != null || res != undefined) {
                  if (res == 2) {
                    this.toaster.warning(
                      "Split parameter combination already used for other practice."
                    );
                  } else if (res == 1) {
                    this.objadd = new clssplitpara();
                    this.objadd.splitparameterid = this.frmsplitpara.controls.fcSplitParameterName.value;
                    this.objadd.splitparametername = this.arrSplitParameter.filter(
                      s =>
                        s.splitparameterid
                          .toString()
                          .indexOf(
                            this.frmsplitpara.controls.fcSplitParameterName
                              .value
                          ) !== -1
                    )[0].splitparametername;
                    this.objadd.splitparametervalue = this.frmsplitpara.controls.fcSplitParameterValue.value;
                    this.splitparalist.push(this.objadd);
                    this.api.insertActivityLog(
                      "Added splitparameter for Practice (Practice name : " +
                        this.objclient.subclientname +
                        ", PracticeCode : " +
                        this.objclient.subclientcode +
                        ", SplitParameter : Name - " +
                        this.objadd.splitparametername +
                        " ,Value - " +
                        this.objadd.splitparametervalue +
                        ")",
                      "Practice",
                      "ADD"
                    );
                    this.frmsplitpara.reset();
                    $("#splitparamodal").modal("hide");
                  }
                }
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
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  removeitem() {
    try {
      let revertstatus = false;
      this.current_splitparaname = this.currentsplitepara.splitparametervalue;

      let strMessage = "";
      if (this.currentsplitepara.id == "") {
      } else {
        if (Boolean(this.currentsplitepara.splitparameterstatus)) {
          revertstatus = false;
        } else {
          revertstatus = true;
        }
      }

      var index = this.splitparalist.indexOf(this.currentsplitepara);
      if (this.currentsplitepara.id == "") {
        var index = this.splitparalist.indexOf(this.currentsplitepara);
        this.splitparalist.splice(index, 1);
      } else {
        let remove: { id: string; splitparameterstatus: boolean } = {
          id: this.currentsplitepara.id,
          splitparameterstatus: revertstatus
        };
        let seq = this.api.post("SubClient/DeleteSplitParameter", remove);
        this.subscription.add(
          seq.subscribe(
            res => {
              if (res == 1) {
                //this.splitparalist.splice(index, 1);
                this.splitparalist[index].splitparameterstatus = revertstatus;

                this.clsUtility.showSuccess(
                  "Split parameter status updated successfully."
                );

                this.api.insertActivityLog(
                  "Practice (Practice name : " +
                    this.objclient.subclientname +
                    ", PracticeCode : " +
                    this.objclient.subclientcode +
                    ", Split Para : " +
                    this.current_splitparaname +
                    ") " +
                    (revertstatus == true ? "Activated" : "Deactivated") +
                    "",
                  "Practice",
                  revertstatus == true ? "ACTIVATE" : "DEACTIVATE"
                );

                this.currentsplitepara = [];
              } else {
                this.currentsplitepara = [];
              }
              this.currentsplitepara = [];
            },
            err => {
              //this.splitparalist.splice(index, 0, product);
              this.toaster.error("Error While Removing Split Para");
            }
          )
        );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  valueChange(event: any) {
    try {
      if (
        this.frmclient.controls.fcClientid.value != null &&
        this.frmclient.controls.fcClientid.value != undefined &&
        this.frmclient.controls.fcClientid.value != ""
      ) {
        this.loading = true;

        //let clientcode = this.groupList.filter((s) => s.clientid.toString().indexOf(this.frmclient.controls.fcClientid.value) !== -1);
        let clientcode = this.groupList.find(
          s => s.clientid == this.frmclient.controls.fcClientid.value
        );
        // let clientcode = this.groupList.filter(
        //   s => s.clientid.indexOf(this.frmclient.controls.fcClientid.value) !== -1
        // );
        let objclientcode = "";
        if (clientcode != null && clientcode != undefined) {
          objclientcode = clientcode.clientcode;
        }
        let seq2 = this.api.get("Subclient/GetSubClientId");
        this.subscription.add(
          seq2.subscribe(
            res => {
              this.loading = false;
              if (res != null || res != undefined) {
                this.subclientcode = objclientcode + "S" + res;
                this.subclientid = Number(res);
                this.frmclient.controls["fcSubClientCode"].setValue(
                  this.subclientcode
                );
              }
              this.subclientcode = objclientcode + "S" + 1;
            },
            err => {
              this.loading = false;
              this.clsUtility.LogError(err);
            }
          )
        );
        this.getSubclient(this.objclient.clientid, 0);
      }
    } catch (error) {
      this.loading = false;
      this.clsUtility.LogError(error);
    }
  }

  IsConnectionExists = -1;
  OnCheckFTPConnection() {
    try {
      var strFTPId = this.objclient.id;
      var strFTPCode: string = this.objclient.subclientcode.trim();
      var strURL: string = this.objftp.ftpurl.trim();
      var strPort: string = this.objftp.ftpport.trim();
      var strUserName: string = this.objftp.ftpusername.trim();
      var strPassword: string = this.clsUtility
        .encryptAES(this.objftp.ftppassword.trim())
        .toString();
      // var strPassword: string = this.clsUtility
      //   .encryptAES(this.FTPPassword.value)
      //   .toString();
      var str835FtpFolder: string = this.objftp.ftp835outboundfolder.trim();
      // var str837FtpFolder: string = this.objftp.ftp837outboundfolder.trim();
      var clsFtpdetails: Ftpmaster = new Ftpmaster();
      clsFtpdetails.ftpid = strFTPId;
      clsFtpdetails.ftpcode = strFTPCode;
      clsFtpdetails.ftpurl = strURL;
      clsFtpdetails.ftpport = strPort;
      clsFtpdetails.ftpusername = strUserName;
      clsFtpdetails.ftppassword = strPassword;
      // this.clsFtpdetails.ftppassword = window.btoa(this.FTPPassword.value);
      clsFtpdetails.ftp835inboundfolder = str835FtpFolder;
      // clsFtpdetails.ftp837inboundfolder = str837FtpFolder;
      clsFtpdetails.status =
        this.objftp.status === null ? false : this.objftp.status;
      const jsonqsuite = JSON.stringify(clsFtpdetails);
      // for (let i = 0; i < 3; )
      {
        let seq = this.api.post_edi(
          "ClientInboundFTP/CheckConnection",
          clsFtpdetails
        );
        // this.subscription.add(
        //   seq.subscribe(
        //     res => {
        this.subscription.add(
          this.coreService.CheckFtpExists(jsonqsuite).subscribe(
            (data: {}) => {
              if (data != null || data != undefined) {
                if (data == 0) {
                  // i++;
                  this.objclient.subclientstatus = false;
                  this.objftp.status = false;
                  this.clsUtility.showError(
                    "Unable to establish ftp connection."
                  );
                  this.IsConnectionExists = 1;
                } else if (data == 1) {
                  // i++;
                  this.objclient.subclientstatus = false;
                  this.objftp.status = false;
                  this.clsUtility.showError(
                    "FTP connection established but folder not found."
                  );
                  this.IsConnectionExists = 1;
                } else if (data == 2) {
                  this.clsUtility.showSuccess("FTP connection  established.");
                  this.IsConnectionExists = 1;
                  // return;
                }
              } else {
                // i++;
                this.objclient.subclientstatus = false;
                this.objftp.status = false;
                this.clsUtility.showError(
                  "Unable to establish ftp connection."
                );
                this.IsConnectionExists = 1;
              }
              this.api.insertActivityLog(
                "Checkconnection for Practice (Practice name : " +
                  this.objclient.subclientname +
                  ", PracticeCode : " +
                  this.objclient.subclientcode +
                  ")",
                "Practice",
                "READ"
              );
            },
            err => {
              // i++;
              this.objclient.subclientstatus = false;
              this.objftp.status = false;
              this.clsUtility.showError("Unable to establish ftp connection.");
              this.IsConnectionExists = 1;
              //this.loadingFtpdetails = false;
            }
          )
        );
        //     },
        //     err => {
        //       this.clsUtility.LogError(err);
        //     }
        //   )
        // );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  // onSubClientFtpChange(event: any) {
  //   try {
  //     if (this.objftp.ftptype == "SFTP") {
  //       this.objftp.ftpport = "22";
  //     } else if (this.objftp.ftptype == "FTP") {
  //       this.objftp.ftpport = "21";
  //     }
  //   } catch (error) {
  //     this.clsUtility.LogError(error);
  //   }
  // }

  onSaveorUpdateClick() {
    try {
      if (!this.objftp.status) {
        this.disableSave = true;
        this.addupdateclient();
      } else {
        this.frmclient.patchValue({
          fcSubClientDevisionCode: this.f.fcSubClientDevisionCode.value
            ? this.f.fcSubClientDevisionCode.value.trim()
            : this.f.fcSubClientDevisionCode.value,
          fcSubClientName: this.f.fcSubClientName.value
            ? this.f.fcSubClientName.value.trim()
            : this.f.fcSubClientName.value,
          fcSubContactName: this.f.fcSubContactName.value
            ? this.f.fcSubContactName.value.trim()
            : this.f.fcSubContactName.value,
          fcSubContactEmail: this.f.fcSubContactEmail.value
            ? this.f.fcSubContactEmail.value.trim()
            : this.f.fcSubContactEmail.value,
          companyName: this.f.companyName.value
            ? this.f.companyName.value.trim()
            : this.f.companyName.value,
          fcbillingloccode: this.f.fcbillingloccode.value
            ? this.f.fcbillingloccode.value.trim()
            : this.f.fcbillingloccode.value,
          fcFTPoption: this.f.fcFTPoption.value
        });

        this.frmclient.updateValueAndValidity();

        this.frmftp.patchValue({
          fcFTPUrl: this.ft.fcFTPUrl.value
            ? this.ft.fcFTPUrl.value.trim()
            : this.ft.fcFTPUrl.value,
          fcFTPUsername: this.ft.fcFTPUsername.value
            ? this.ft.fcFTPUsername.value.trim()
            : this.ft.fcFTPUsername.value,
          fcFTPPassword: this.ft.fcFTPPassword.value
            ? this.ft.fcFTPPassword.value.trim()
            : this.ft.fcFTPPassword.value,
          fcFTPName: this.ft.fcFTPName.value
            ? this.ft.fcFTPName.value.trim()
            : this.ft.fcFTPName.value,
          fcFTP835Outbound: this.ft.fcFTP835Outbound.value
            ? this.ft.fcFTP835Outbound.value.trim()
            : this.ft.fcFTP835Outbound.value
        });
        this.frmftp.updateValueAndValidity();

        if (!this.frmclient.valid || !this.frmftp.valid) {
          return;
        }
        this.loading = true;
        var strFTPId = this.objclient.id;
        var strFTPCode: string = this.objclient.subclientcode.trim();
        var strURL: string = this.objftp.ftpurl.trim();
        var strPort: string = this.objftp.ftpport.trim();
        var strUserName: string = this.objftp.ftpusername.trim();
        var strPassword: string = this.clsUtility
          .encryptAES(this.objftp.ftppassword.trim())
          .toString();
        var str835FtpFolder: string = this.objftp.ftp835outboundfolder.trim();
        // var str837FtpFolder: string = this.objftp.ftp837outboundfolder.trim();
        var clsFtpdetails: Ftpmaster = new Ftpmaster();
        clsFtpdetails.ftpid = strFTPId;
        clsFtpdetails.ftpcode = strFTPCode;
        clsFtpdetails.ftpurl = strURL;
        clsFtpdetails.ftpport = strPort;
        clsFtpdetails.ftpusername = strUserName;
        clsFtpdetails.ftppassword = strPassword;
        clsFtpdetails.ftp835inboundfolder = str835FtpFolder;
        // clsFtpdetails.ftp837inboundfolder = str837FtpFolder;
        clsFtpdetails.status =
          this.objftp.status === null ? false : this.objftp.status;
        const jsonqsuite = JSON.stringify(clsFtpdetails);
        {
          let seq = this.api.post_edi(
            "ClientInboundFTP/CheckConnection",
            clsFtpdetails
          );
          this.subscription.add(
            seq.subscribe(
              res => {
                this.coreService.CheckFtpExists(jsonqsuite).subscribe(
                  (data: {}) => {
                    if (data) {
                      if (data == 0) {
                        this.ftpConnectionMsg =
                          "Unable to establish ftp connection.";
                        $("#confirmationModal").modal("show");
                      } else if (data == 1) {
                        this.ftpConnectionMsg =
                          "FTP connection established but folder not found.";
                        $("#confirmationModal").modal("show");
                      } else if (data == 2) {
                        this.disableSave = true;
                        this.addupdateclient();
                      }
                      this.loading = false;
                    } else {
                      this.ftpConnectionMsg =
                        "Unable to establish ftp connection.";
                      $("#confirmationModal").modal("show");
                      this.loading = false;
                    }
                  },
                  err => {
                    this.ftpConnectionMsg =
                      "Unable to establish ftp connection.";
                    $("#confirmationModal").modal("show");
                    this.loading = false;
                  }
                );
              },
              err => {
                this.clsUtility.LogError(err);
                this.loading = false;
              }
            )
          );
        }
      }
    } catch (error) {
      this.loading = false;
      this.clsUtility.LogError(error);
    }
  }
  // selectionChange(event:any) {
  ////(selectionChange)="selectionChange($event)"
  //   console.log('selectionChange');
  //   console.log('selectionChange Form Control - ',this.frmclient.controls.fcClientid.value);
  //   console.log(event);
  // }
  onYes() {
    this.disableSave = true;
    this.addupdateclient();
  }

  //returns subclient form controls.
  get f() {
    return this.frmclient.controls;
  }

  //returns ftp controls
  get ft() {
    return this.frmftp.controls;
  }

  onCompanyChange(val: any) {
    try {
      if (val == "TRIARQ" && !this.objclient.companytype) {
        this.objclient.companytype = "QComplete";
        this.companyName = "";
        this.f.companyName.setValue("");
        this.f.companyName.clearValidators();
        this.f.companyName.reset();
      } else if (val == "3rd Party" && !this.companyName) {
        this.objclient.companytype = "";
        this.companyName = "";
        this.f.companyName.setValue("");
        this.f.companyName.setValidators(Validators.required);
      }
      this.frmclient.updateValueAndValidity();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  activeinactiveConfiratmion(item: any) {
    try {
      this.currentsplitepara = item;
      let revertstatus = false;
      this.current_splitparaname = item.splitparametervalue;

      this.updatemessage = "";
      if (item.id == "") {
        this.updatemessage =
          "Do you want to delete Split Parameter " +
          item.splitparametername +
          " Split value " +
          item.splitparametervalue +
          "?";
      } else {
        if (Boolean(item.splitparameterstatus)) {
          this.updatemessage =
            "Do you want to deactivate Split Parameter " +
            item.splitparametername +
            " Split value " +
            item.splitparametervalue +
            "?";
          revertstatus = false;
        } else {
          this.updatemessage =
            "Do you want to activate Split Parameter " +
            item.splitparametername +
            " Split value " +
            item.splitparametervalue +
            "?";
          revertstatus = true;
        }
      }

      $("#updatestatusmodal").modal("show");
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

  OutputConfirmationResult(event: any) {
    try {
      if (event) {
        this.duplicateFtpConfirmationYesClicked = true;
        this.addupdateclient();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  filetransferConfiratmion() {
    try {    
        this.confirmationmessage = "Do you want to change File Transfer Option ? "
        $("#changefiletransfermodal").modal("show");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  updatefiletransferoption(status: string){    
    if(status == 'Yes'){
      if (this.frmclient.controls.fcFTPoption.value == "1") {
        this.frmclient.controls.fcFTPoption.setValue("1");        
      } else if (this.frmclient.controls.fcFTPoption.value == "2") {
        this.frmclient.controls.fcFTPoption.setValue("2");      
      }
    } else if(status == 'No') {
      if (this.frmclient.controls.fcFTPoption.value == "1") {
        this.frmclient.controls.fcFTPoption.setValue("2");       
      } else if (this.frmclient.controls.fcFTPoption.value == "2") {
        this.frmclient.controls.fcFTPoption.setValue("1");       
      }
    }   
  }

  getSubclient(clientid: any, subclientid: any) {
    try {    
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
            if(this.objclient.subclientid != null && this.objclient.subclientid != undefined && this.objclient.subclientid != 0){              
              let index = this.SubclientList.findIndex(x=> x.subclientid == this.objclient.subclientid);
              this.SubclientList.splice(index, 1);
            }
            let para: {subclientid: number, subclientname: string} = {subclientid: 0, subclientname: 'Select'};
            this.SubclientList.unshift(para);
            this.SelectAllsubClients = this.SubclientList;
            if (              
              this.SubclientList.length > 0              
            ) {
              this.selectedsubclients = 0;             
              if(this.objclient.copytoftpsubclientid != null && this.objclient.copytoftpsubclientid != undefined && this.objclient.copytoftpsubclientid != 0){
                this.selectedsubclients = Number(this.objclient.copytoftpsubclientid);
              }
            } else {
              this.selectedsubclients = 0;
              this.objclient.copytoftpsubclientid = 0
            }
          } else {
            this.SubclientList = [];
            this.SelectAllsubClients = [];
            this.selectedsubclients = 0;
            this.objclient.copytoftpsubclientid = 0;
            this.clsUtility.showInfo("No practice is available for this group");
          }
        })
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  cmbsubclientchange() {
    try {
      if (
        this.frmclient.controls.fccopytoftpsubclientid.value == undefined ||
        this.frmclient.controls.fccopytoftpsubclientid.value == ""
      ) {
        this.selectedsubclients = 0;      
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

}

// splitparalist: splilpara[] = [];
// objadd: splilpara;

// addsplitpara() {
//   console.log(this.splitparalist.filter((s) => s.splitparameterid.indexOf(this.frmsplitpara.controls.fcSplitParameterName.value) !== -1));
//   console.log('Lenght  - ', this.splitparalist.filter((s) => s.splitparameterid.indexOf(this.frmsplitpara.controls.fcSplitParameterName.value) !== -1).length);

//   if (this.splitparalist.filter((s) => s.splitparameterid.indexOf(this.frmsplitpara.controls.fcSplitParameterName.value) !== -1).length > 0) {
//     this.toaster.warning('Duplicate Splitparmeter Not Allowed')
//   }
//   else {
//     this.objadd = new splilpara();
//     this.objadd.splitparameterid = this.frmsplitpara.controls.fcSplitParameterName.value;
//     this.objadd.splitparametername = this.arrSplitParameter.filter((s) => s.splitparameterid.indexOf(this.frmsplitpara.controls.fcSplitParameterName.value) !== -1)[0].splitparametername;
//     this.objadd.splitparametervalue = this.frmsplitpara.controls.fcSplitParameterValue.value;
//     this.splitparalist.push(this.objadd);
//     this.frmsplitpara.reset();
//   }
// }

// removeitem(item: any) {
//   if (confirm("Are you sure you want to delete Split Parameter " + item.splitparametername + "?")) {
//     var index = this.splitparalist.indexOf(item);
//       this.splitparalist.splice(index, 1);
//   }
// }

// let arrUsers = {
//   userclientmapping: []
// };

// for (var i in this.mySelection) {
//   console.log(this.mySelection[i]);
//   var item = this.mySelection[i];

//   arrUsers.userclientmapping.push({
//     "userid": this.mySelection[i].userid,
//     "firstname": this.mySelection[i].firstname,
//     "lastname": this.mySelection[i].lastname,
//     "username": this.mySelection[i].email,
//     "clientid": Number(client),
//     "subclientcode": subclient,
//     "createdon":currentDate,
//     "createdby": this.loginGCPUserID
//   });
// }

// console.log(arrUsers);
