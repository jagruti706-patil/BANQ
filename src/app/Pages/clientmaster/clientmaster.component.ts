import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Api } from "./../../Services/api";
import { clsClient } from "./clsClient";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  OnChanges,
  ChangeDetectorRef
} from "@angular/core";
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
import { DatePipe } from "@angular/common";
import { clsPermission } from "src/app/Services/settings/clspermission";

import {
  GridComponent,
  GridDataResult,
  DataStateChangeEvent,
  PageChangeEvent,
  SelectableSettings,
  RowArgs
} from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { process, State } from "@progress/kendo-data-query";
import { AllConfigurationService } from "src/app/Services/all-configuration.service";
import { SubSink } from "subsink";
import { isNullOrUndefined } from "util";
declare var $: any;

@Component({
  selector: "app-clientmaster",
  templateUrl: "./clientmaster.component.html",
  styleUrls: ["./clientmaster.component.css"]
})
export class ClientmasterComponent implements OnInit, OnDestroy {
  public clsPermission: clsPermission;
  public subscription = new SubSink();
  loginGCPUserID: string = "";
  private clsUtility: Utility;
  frmclient: FormGroup;
  formtitle: string = "Add Group";
  buttonCaption: string = "Add Group";
  isaddmode: boolean = true;
  isLoading = false;
  objclient = new clsClient();
  public mask: string = "000-000-0000";
  ftplist: any;
  public gridView: GridDataResult;
  public pageSize: number = 10;
  public skip = 0;
  public pagenumber: number = 0;
  public deletemessage: string = "";
  public deleteftpname: string = "";
  public statusupdatedclientname: string = "";

  public deleteclientftpid: string = "";
  isnewclient: boolean = true;
  nextftpcode = "0";
  callfrom = "";
  callftpid = "";
  callingclientid = "";
  ftpentrymode = "";

  currentclient: any;
  currentclientcode: any;
  currentclientname: any;
  public ftpstatus: boolean;
  disableOnClick: boolean = false;
  private originalClientdetails: any;

  public sort: SortDescriptor[] = [
    {
      field: "clientname",
      dir: "asc"
    }
  ];
  public state: State = {
    skip: 0,
    take: 15
  };
  toggleme: any;
  constructor(
    fb: FormBuilder,
    private _router: Router,
    private _routeParams: ActivatedRoute,
    public api: Api,
    private datatransfer: DatatransaferService,
    private toaster: ToastrService,
    private allConfigService: AllConfigurationService,
    private cdr: ChangeDetectorRef
  ) {
    this.clsUtility = new Utility(toaster);
    this.frmclient = fb.group({
      fcClientCode: ["", Validators.required],
      fcClientName: ["", [Validators.required, Validators.maxLength(100)]],
      fcContactName: ["", [Validators.required, Validators.maxLength(100)]],
      fcContactEmail: [
        "",
        [Validators.required, Validators.email, Validators.maxLength(50)]
      ],
      fcContactPhone: [
        "",
        [Validators.required, Validators.pattern("^[0-9]*$")]
      ],
      fcClientStatus: [false, Validators.required],
      fcAnalysis: [false, Validators.required],
      fcHub: [false, Validators.required],
      fcoverridecontexterror: ['',  [Validators.pattern('^(.[A-Za-z0-9]*;)*(.[A-Za-z0-9]*;)')]],
      fcStopduplicatecheckpayment: ['']
    });
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.datatransfer.newpermission.subscribe(
          value => (this.clsPermission = value)
        )
      );

      this.datatransfer.loginGCPUserID.subscribe(data => {
        this.loginGCPUserID = data;
      });
      var id = this._routeParams.params.subscribe(params => {
        var id = String(params["id"]);
        this.currentclient = String(params["id"]);
        if (id == "new") {
          this.formtitle = "Add Group";
          this.buttonCaption = "Add Group";
          this.isaddmode = true;
          this.isnewclient = true;
        } else {
          this.formtitle = "Edit Group";
          this.buttonCaption = "Update Group";
          this.isaddmode = false;
          this.isnewclient = false;
        }

        if (id == "new") {
          let seq = this.api.get("GetClientId");
          this.subscription.add(
            seq.subscribe(
              res => {
                if (res != null && res != undefined) {
                  let code = "THG" + String(res);
                  this.frmclient.controls["fcClientCode"].setValue(code);
                  this.currentclientcode = this.objclient.clientcode;
                }
              },
              err => {
                this.clsUtility.LogError(err);
              }
            )
          );

          return;
        } else {
          this.isLoading = true;

          let getclient: { clientid: string; clientstatus: boolean } = {
            clientid: id,
            clientstatus: true
          };
          let seq = this.api.post("GetClient", getclient);
          this.subscription.add(
            seq.subscribe(
              res => {
                if (res[0] != undefined && res[0] != null) {
                  this.originalClientdetails = null;
                  this.originalClientdetails = { ...res[0] };
                  this.objclient = <clsClient>res[0];
                  this.currentclientcode = this.objclient.clientcode;
                  this.currentclientname = this.objclient.clientname;

                  if (this.isaddmode == false) {
                    if (id != "new") {
                      this.getclientftpdetails(id);
                    }
                  }
                }
              },
              err => {
                this.clsUtility.LogError(err);
                this.isLoading = false;
              }
            )
          );
          this.isLoading = false;
        }
      });

      this.subscription.add(
        this.datatransfer.clientftpsaved.subscribe(data => {
          if (data != null || data != undefined) {
            if (data == true) {
              if (
                this.currentclient != null ||
                this.currentclient != undefined ||
                this.currentclient != "new"
              ) {
                this.getclientftpdetails(this.currentclient);
                // this.datatransfer.clientftpsaved.next(false);
              }
            }
          }
        })
      );

      this.subscription.add(
        this.allConfigService.toggleSidebar.subscribe(isToggle => {
          this.toggleme = isToggle;
        })
      );
    } catch (error) {
      this.isLoading = false;
      this.clsUtility.LogError(error);
    }
  }

  togglesidebar() {
    this.allConfigService.toggleSidebar.next(!this.toggleme);
  }

  getUserClientMapping() {
    try {
      let seq = this.api.get("UserClientMapping");
      this.subscription.add(
        seq.subscribe(
          res => {},
          err => {
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
        fcClientName: this.f.fcClientName.value
          ? this.f.fcClientName.value.trim()
          : this.f.fcClientName.value,
        fcContactName: this.f.fcContactName.value
          ? this.f.fcContactName.value.trim()
          : this.f.fcContactName.value,
        fcContactEmail: this.f.fcContactEmail.value
          ? this.f.fcContactEmail.value.trim()
          : this.f.fcContactEmail.value
      });
      this.frmclient.updateValueAndValidity();

      if (!this.frmclient.valid) {
        return;
      }

      if (
        this.objclient.clienteraanalysis != true &&
        this.objclient.clienterahub != true
      ) {
        this.clsUtility.LogError("Please select ERA ANALYSIS or ERA HUB");
        return;
      }
      const datepipe = new DatePipe("en-US");
      const currentDate = datepipe.transform(
        Date.now(),
        "yyyy-MM-ddTHH:mm:ss.SSSZ"
      );
      this.disableOnClick = true;
      this.cdr.detectChanges();
      if (this.objclient.clientid) {
        this.objclient.createdby = this.loginGCPUserID;
        this.objclient.createdon = currentDate;

        //#region "Get Modified Items of Client"

        let oldchangeditems = {};
        let ModifiedItems = "";
        let changeditems: any = this.clsUtility.jsondiff(
          this.originalClientdetails,
          this.objclient
        );
        console.log(changeditems);

        if (!isNullOrUndefined(changeditems) && changeditems != {}) {
          if (changeditems.hasOwnProperty("clientid")) {
            delete changeditems.clientid;
          }
          for (let key of Object.keys(changeditems)) {
            let oldvalue: string = this.originalClientdetails[key];
            oldchangeditems[key] = oldvalue;
          }

          if (
            !isNullOrUndefined(changeditems) &&
            JSON.stringify(changeditems) != "{}"
          ) {
            ModifiedItems =
              "OLD : " +
              JSON.stringify(oldchangeditems) +
              ",NEW : " +
              JSON.stringify(changeditems);
          }
        }

        //#endregion "Get Modified Items of Client"

        let seq = this.api.post("UpdateClient", this.objclient);
        this.subscription.add(
          seq.subscribe(
            res => {
              if (res != null || res != undefined) {
                if (res == 1) {
                  this.toaster.success("Group updated successfully.");
                  this.api.insertActivityLogPostcall(
                    "Group Modified (" +
                      this.objclient.clientname +
                      ")" +
                      ModifiedItems,
                    "Group",
                    "UPDATE"
                  );
                  this._router.navigate(["/Configuration/clientlist"]);
                } else if (res == 2) {
                  this.toaster.warning("Group name is duplicate");
                } else {
                }
              }
              this.disableOnClick = false;
            },
            err => {
              // console.log(err);
              this.clsUtility.LogError(err);
              this.disableOnClick = false;
            }
          )
        );
      } else {
        this.objclient.createdby = this.loginGCPUserID;
        this.objclient.createdon = currentDate;
        let seq = this.api.post("SaveClient", this.objclient);
        this.subscription.add(
          seq.subscribe(
            res => {
              if (res != null || res != undefined) {
                if (res == 1) {
                  this.toaster.success("Group saved successfully.");
                  this.api.insertActivityLog(
                    "Group Added (" + this.objclient.clientname + ")",
                    "Group",
                    "ADD"
                  );
                  this._router.navigate(["/Configuration/clientlist"]);
                } else if (res == 2) {
                  this.toaster.warning("Group name is duplicate");
                } else {
                }
              }
              this.disableOnClick = false;
            },
            err => {
              this.clsUtility.LogError(err);
              this.disableOnClick = false;
            }
          )
        );
      }
    } catch (error) {
      this.disableOnClick = false;
      this.clsUtility.LogError(error);
    }
  }

  getclientftpdetails(id: any) {
    try {
      let getftp: { clientid: string; ftpid: number } = {
        clientid: String(id),
        ftpid: 0
      };
      if (id != "new") {
        let seq = this.api.post("FTP/GetFTP", getftp);
        this.subscription.add(
          seq.subscribe(
            res => {
              if (res) {
                this.ftplist = res;
                this.nextftpcode = "F" + this.ftplist.length + 2;
                this.gridView = process(this.ftplist, this.state);
              }
            },
            err => {
              this.clsUtility.LogError(err);
            }
          )
        );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridView = process(this.ftplist, this.state);
  }

  addnewftp() {
    try {
      // $('#addftpModal').modal('show');
      this.datatransfer.currentclientftpid.next("new");
      this.datatransfer.currentclientid.next(this.currentclient);
      this.datatransfer.currentclientcode.next(this.currentclientcode);
      this.datatransfer.currentclientname.next(this.currentclientname);
      var res_id;
      let seq_inboundid = this.api.get("FTP/GetInboundId");
      this.subscription.add(
        seq_inboundid.subscribe(
          res => {
            if (res) {
              this.datatransfer.clientnewftpcode.next(res.toString());
              $("#deferredModal").modal("show");
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
    //clientnewftpcode
  }

  openftpmodal(ftpid: any, clientid: any) {
    try {
      this.ftpentrymode = "Edit FTP";
      this.callfrom = "edit";
      this.callftpid = String(ftpid);
      this.callingclientid = String(clientid);

      this._router.navigate(
        [{ outlets: { modal: ["clientftp", ftpid, clientid] } }],
        { relativeTo: this._routeParams }
      );
      $("#addftpModal").modal("show");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  openftpmodal2(clientftpid: any, clientid: any, clientcode: any) {
    try {
      this.datatransfer.currentclientftpid.next(clientftpid);
      this.datatransfer.currentclientid.next(clientid);
      this.datatransfer.currentclientcode.next(clientcode);
      $("#deferredModal").modal("show");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  deleteConfiratmion(dataItem: any) {
    try {
      this.deleteclientftpid = dataItem.ftpid;
      this.deleteftpname = dataItem.ftpname;
      this.statusupdatedclientname = dataItem.clientname;

      if (Boolean(dataItem.status)) {
        this.deletemessage =
          "Do you want to Deactivate FTP " + dataItem.ftpname + "?";
        this.ftpstatus = false;
      } else {
        this.deletemessage =
          "Do you want to activate FTP " + dataItem.ftpname + "?";
        this.ftpstatus = true;
      }
      //this.deletemessage = "Do you want to delete FTP " + dataItem.ftpname + "?";

      $("#deletemodal").modal("show");

      //status
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  deleteftp() {
    try {
      let deleteclient: { ftpid: string; status: boolean } = {
        ftpid: this.deleteclientftpid,
        status: this.ftpstatus
      };
      let seq = this.api.post("FTP/DeleteFTP", deleteclient);
      this.subscription.add(
        seq.subscribe(
          res => {
            // this.toaster.info("FTP Removed");
            if (this.ftpstatus) {
              this.api.insertActivityLog(
                "Group (Groupname: " +
                  this.statusupdatedclientname +
                  ") FTP (FTPname: " +
                  this.deleteftpname +
                  ") Activated",
                "Group FTP",
                "ACTIVATE"
              );
            } else {
              this.api.insertActivityLog(
                "Group (Groupname: " +
                  this.statusupdatedclientname +
                  ") FTP (FTPname: " +
                  this.deleteftpname +
                  ") Deactivated",
                "Group FTP",
                "DEACTIVATE"
              );
            }

            this.getclientftpdetails(this.currentclient);
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

  get f() {
    return this.frmclient.controls;
  }
  ngOnDestroy() {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
