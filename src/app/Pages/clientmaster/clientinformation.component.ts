import { Component, OnInit, OnDestroy } from "@angular/core";
import { Api } from "src/app/Services/api";
import { ToastrService } from "ngx-toastr";
import { Utility } from "src/app/Model/utility";
import { clssplitpara } from "../subclientmaster/clssplitpara";
import { SubSink } from "subsink";

@Component({
  selector: "app-clientinformation",
  templateUrl: "./clientinformation.component.html",
  styleUrls: ["./clientinformation.component.css"]
})
export class ClientinformationComponent implements OnInit, OnDestroy {
  public subscription = new SubSink();
  public loading: boolean = false;
  private clsUtility: Utility;
  clientDetails: any;
  clientid: string;
  clientFtpDetails: any;
  subClientList: any;

  constructor(public api: Api, private toaster: ToastrService) {
    this.clsUtility = new Utility(toaster);
  }

  ngOnInit() {
    // console.log('Client Id on init:',this.clientid);
    try {
      this.getClientDetails();
      this.getClientFtpDetails();
      this.getsubClientlist();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
  getClientDetails() {
    try {
      this.loading = true;
      let getclient: { clientid: string; clientstatus: boolean } = {
        clientid: this.clientid,
        clientstatus: false
      };
      let seq = this.api.post("GetClient", getclient);
      this.subscription.add(
        seq.subscribe(
          res => {
            if (res) {
              if (res[0] != undefined && res[0] != null) {
                this.clientDetails = res[0];
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
    } catch (error) {
      this.loading = false;
      this.clsUtility.LogError(error);
    }
  }

  getClientFtpDetails() {
    try {
      this.loading = true;
      let getftp: { clientid: string; ftpid: number } = {
        clientid: String(this.clientid),
        ftpid: 0
      };
      if (this.clientid) {
        let seq = this.api.post("FTP/GetFTP", getftp);
        this.subscription.add(
          seq.subscribe(
            res => {
              if (res) {
                this.clientFtpDetails = res;
              }
              this.loading = false;
            },
            err => {
              this.clsUtility.LogError(err);
              this.loading = false;
            }
          )
        );
      }
    } catch (error) {
      this.loading = false;
      this.clsUtility.LogError(error);
    }
  }

  getsubClientlist() {
    try {
      this.loading = true;
      let getsubclient: { clientid: string; subclientcode: string } = {
        clientid: this.clientid,
        subclientcode: ""
      };
      let seq = this.api.post("SubClient/GetSubClient", getsubclient);
      this.subscription.add(
        seq.subscribe(
          res => {
            if (res) {
              this.subClientList = res;
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

  getSubClientFtpDetails(index: number, dataItem: any) {
    try {
      this.loading = true;
      let getftp: { ftpid: string; subclientcode: string } = {
        ftpid: "0",
        subclientcode: dataItem.subclientcode
      };
      let seq3 = this.api.post("SubClient/GetSubClientFTP", getftp);
      this.subscription.add(
        seq3.subscribe(
          res3 => {
            if (res3) {
              this.subClientList[index].subclientoutboundftp = res3[0];
            }
            this.loading = false;
          },
          err => {
            this.clsUtility.LogError(err);
            this.loading = false;
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
      if (!this.subClientList[evt.index].subclientoutboundftp) {
        this.getSubClientFtpDetails(evt.index, evt.dataItem);
      }
      if (!this.subClientList[evt.index].splitParameters) {
        this.getSplitParameters(evt.index, evt.dataItem);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getSplitParameters(index: number, dataItem: any) {
    try {
      this.loading = true;
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
              this.subClientList[index].splitParameters = <clssplitpara[]>res;
            }
            this.loading = false;
          },
          err => {
            this.clsUtility.LogError(err);
            this.loading = false;
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
