import { Component, OnInit, OnDestroy } from "@angular/core";
import { Api } from "src/app/Services/api";
import { ToastrService } from "ngx-toastr";
import { Utility } from "src/app/Model/utility";
import { clssubclient } from "./clssubclient";
import { clssplitpara } from "./clssplitpara";
import { clsftp } from "./clsftp";
import { SubSink } from "subsink";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { DatatransaferService } from "src/app/Services/datatransafer.service";

@Component({
  selector: "app-subclientinformation",
  templateUrl: "./subclientinformation.component.html",
  styleUrls: ["./subclientinformation.component.css"]
})
export class SubclientinformationComponent implements OnInit, OnDestroy {
  subclientcode: string;
  public subscription = new SubSink();
  loading: boolean = false;
  arrSplitParameter: any;
  private clsUtility: Utility;
  objclient: clssubclient;
  splitparalist: clssplitpara[];
  getftpinfo: any;
  objftp: clsftp;
  getproviderinfo: any = null;
  public clientid: any;
  public subclientid: any;
  public clsPermission: clsPermission;

  constructor(public api: Api, private toaster: ToastrService, private datatransfer: DatatransaferService,) {
    this.clsUtility = new Utility(toaster);
  }

  ngOnInit() {
    this.subscription.add(
      this.datatransfer.newpermission.subscribe(
        value => (this.clsPermission = value)
      )
    ); 

    this.getSubClientDetails();
  }

  getSubClientDetails() {
    try {
      this.loading = true;
      let getclient: { subclientcode: string } = {
        subclientcode: this.subclientcode
      };
      let seq = this.api.post("SubClient/GetSubClient", getclient);
      this.subscription.add(
        seq.subscribe(
          res1 => {
            if (res1[0] != undefined && res1[0] != null) {
              this.objclient = <clssubclient>res1[0];
              // console.log(this.objclient);
              // console.log(this.objclient["clientid"]);
              this.clientid = this.objclient["clientid"];
              this.subclientid = this.objclient["id"];
            }
            this.GetSplitParameters();
            this.GetFtpDetails();
            this.GetProviderMappingDetails();
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

  GetSplitParameters() {
    // Get Split Para Start
    try {
      let getsplitpara: {
        splitparameterid: string;
        subclientcode: string;
      } = {
        splitparameterid: "0",
        subclientcode: this.subclientcode
      };
      let seq2 = this.api.post("SubClient/GetSplitParameter", getsplitpara);
      this.subscription.add(
        seq2.subscribe(
          res => {
            if (res) {
              // this.objsplit = <clssplitpara>res[0];
              this.splitparalist = <clssplitpara[]>res;
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

  GetFtpDetails() {
    // Get FTP INfo Start
    try {
      let getftp: { ftpid: string; subclientcode: string } = {
        ftpid: "0",
        subclientcode: this.subclientcode
      };
      let seq3 = this.api.post("SubClient/GetSubClientFTP", getftp);
      this.subscription.add(
        seq3.subscribe(
          res3 => {
            if (res3) {
              this.getftpinfo = res3;
              // if (this.getftpinfo.length > 0) {
              //   this.objftp = <clsftp>res3[0];
              // }
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

  GetProviderMappingDetails() {
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
        clientid: this.clientid,
        subclientId: this.subclientid,
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
            if (data != null || data != undefined) {
              let sdata = data;
              if (data["content"] != null && data["content"] != undefined) {
                this.getproviderinfo = data["content"];
              } else {
                this.getproviderinfo = null;
              }
            }
          },
          error => {
            this.loading = false;
            this.clsUtility.LogError(error);
          }
        )
      );
    } catch (error) {
      this.loading = false;
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
