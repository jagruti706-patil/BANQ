import { Component, OnInit } from "@angular/core";
import { clssubclient } from "../subclientmaster/clssubclient";
import { Observable } from "rxjs";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { FormBuilder } from "@angular/forms";
// import { StringMapWithRename } from "@angular/core/src/render3/jit/compiler_facade_interface";
import { ActivatedRoute } from "@angular/router";
import { AccountVerification } from "src/app/Model/account-activation";
import { Utility } from "src/app/Model/utility";
import { clssplitpara } from "../subclientmaster/clssplitpara";
import { clsftp } from "../subclientmaster/clsftp";
import { AccountactivationService } from "src/app/Services/accountactivation.service";
import { SubSink } from "subsink";
import { Api } from "src/app/Services/api";

@Component({
  selector: "app-account-activation",
  templateUrl: "./account-activation.component.html",
  styleUrls: ["./account-activation.component.css"]
})
export class AccountActivationComponent implements OnInit {
  objclientinfo: any = [];
  objftpinfo: any = [];
  objclaimidentifier: any = [];
  objrederingprovider: any = [];
  public view: Observable<GridDataResult>;
  public viewForm: Observable<GridDataResult>;
  public viewClaimIdentifier: GridDataResult;
  public viewRederingProvider: GridDataResult;
  todaydate: Date = new Date();

  public pageSizeClaimIdentifier = 10;
  public skipClaimIdentifier = 0;
  private itemsClaimIdentifier: any[];

  public pageSizeRederingProvider = 10;
  public skipRederingProvider = 0;
  private itemsRederingProvider: any[];

  currentsubclient: any;
  currentsubclientcode: any;
  currentsubclientexternalid: any;
  subclientcode: string;
  loading: boolean = false;
  arrSplitParameter: any;
  private clsUtility: Utility;
  objclient: clssubclient = new clssubclient();
  splitparalist: clssplitpara[];
  getftpinfo: any;
  objftp: clsftp;
  getproviderinfo: any = null;
  public clientid: any;
  public subclientid: any;
  ClientInfo: any = [
    {
      status: true,
      serialno: 0,
      text: "TRIARQ Health on behalf of Lynda Glasser, CPA",
      value: ""
    },
    {
      status: true,
      serialno: 1,
      text: "Sub Client Information",
      value: ""
    },
    {
      status: true,
      serialno: 2,
      text: "Hub SFTP Account Details",
      value: ""
    },
    {
      status: true,
      serialno: 3,
      text: "",
      value: ""
    }
    // {
    //   status: true,
    //   serialno: 2,
    //   text: "Claim Identifier Information",
    //   value: ""
    // }
  ];

  VerificationFormInfo: any = [
    {
      status: true,
      serialno: 0,
      text: "",
      value: ""
    }
  ];
  constructor(
    public api: Api,
    private fb: FormBuilder,
    private _routeParams: ActivatedRoute,
    private activationService: AccountactivationService
  ) {}

  VerificationSFTPGroup = this.fb.group({
    fcVerifictionDate: [],
    fcIsFTPInfoCorrect: false,
    fcFTPComment: [""]
  });

  VerificationIdentifierGroup = this.fb.group({
    fcIsIdentifierInfoCorrect: false,
    fcIdentifierComment: [""]
  });

  VerificationProviderGroup = this.fb.group({
    fcIsProviderInfoCorrect: false,
    fcProviderComment: [""]
  });

  // VerificationFormGroup = this.fb.group({
  //   fcVerifictionDate: [],
  //   fcIsFTPInfoCorrect: [false],
  //   fcIsIdentifierInfoCorrect: [false],
  //   fcIsProviderInfoCorrect: [false],

  //   fcFTPComment: [""],
  //   fcIdentifierComment: [""],
  //   fcProviderComment: [""]
  // });

  get fbcVerifictionDate() {
    return this.VerificationSFTPGroup.get("fcVerifictionDate");
  }
  get fbcIsFTPInfoCorrect() {
    return this.VerificationSFTPGroup.get("fcIsFTPInfoCorrect");
  }
  get fbcIsIdentifierInfoCorrect() {
    return this.VerificationIdentifierGroup.get("fcIsIdentifierInfoCorrect");
  }
  get fbcIsProviderInfoCorrect() {
    return this.VerificationProviderGroup.get("fcIsProviderInfoCorrect");
  }
  get fbcFTPComment() {
    return this.VerificationSFTPGroup.get("fcFTPComment");
  }
  get fbcIdentifierComment() {
    return this.VerificationIdentifierGroup.get("fcIdentifierComment");
  }
  get fbcProviderComment() {
    return this.VerificationProviderGroup.get("fcProviderComment");
  }

  ngOnInit() {
    this.view = this.ClientInfo;
    this.viewForm = this.VerificationFormInfo;

    var id = this._routeParams.params.subscribe(params => {
      var id = "";
      id = String(params["id"]);
      this.currentsubclientexternalid = id;
    });

    //////this.getAccountSubClientDetails(this.currentsubclientexternalid);

    // this.objclient = new clssubclient();
    // this.objclientinfo.id = "220";
    // this.objclientinfo.clientid = "219";
    // this.objclientinfo.createdby = "20190514004";
    // this.objclientinfo.createdon = "2020-01-08T11:51:34.173+00:00";
    // // this.objclient.client = "Triarq Health Alliance";
    // this.objclientinfo.companytype = "QPro";
    // // this.objclient.displayname = "Triarq Health Alliance - TLC(Alliance)";
    // this.objclientinfo.subclientid = 59;
    // this.objclientinfo.subclientcode = "THG130S59";
    // this.objclientinfo.subclientname = "TLC(Alliance)";
    // this.objclientinfo.billingcompany = "TRIARQ";
    // this.objclientinfo.subclientstatus = true;
    // this.objclientinfo.billinglocationcode = "location";
    // this.objclientinfo.subclientcontactname = "Triarq Alliance";
    // this.objclientinfo.subclientcontactemail = "triarq@triarqhealth.com";
    // this.objclientinfo.subclientcontactphone = "1111111111";
    // this.objclientinfo.subclientdivisioncode = "TLC";

    // this.objftpinfo.subclientid = 67;
    // this.objftpinfo.subclient_id = 237;
    // this.objftpinfo.subclientcode = "THG130S67";
    // this.objftpinfo.subclientname = "ABC";
    // this.objftpinfo.clientname = "Triarq Health Alliance";
    // this.objftpinfo.ftpid = 239;
    // this.objftpinfo.ftpcode = "163";
    // this.objftpinfo.ftpname = "TRIARQ ERAHub";
    // this.objftpinfo.ftpurl = "edihub.triarqclouds.com";
    // this.objftpinfo.ftpusername = "banqdev";
    // this.objftpinfo.ftppassword = "XXKwRFZH8WBzJyZbXhfbFQ==";
    // this.objftpinfo.ftpport = "22";
    // this.objftpinfo.ftptype = "SFTP";
    // this.objftpinfo.status = true;
    // this.objftpinfo.ftp835outboundfolder = "gbgfbbfb";
    // this.objftpinfo.ftp837outboundfolder = "";
    // this.objftpinfo.createdby = "20190514005";
    // this.objftpinfo.createdon = "14:22:52.954+00";
  }
  /*  private subscription = new SubSink();
  clsAccountVerification: AccountVerification;
  getAccountSubClientDetails(externalid: string) {
    try {
      if (externalid != "") {
        let getsubclientexternalidpara: {
          subclientexternalid: string;
        } = {
          subclientexternalid: externalid
        };
        this.subscription.add(
          this.activationService
            .getSubClientAndClientIDs(getsubclientexternalidpara)
            .subscribe(
              data => {
                if (data) {
                  this.clsAccountVerification = <AccountVerification>data[0];

                  this.clientid = this.clsAccountVerification.clientid;
                  this.subclientid = this.clsAccountVerification.subclientid;
                  this.getSubClientDetails();
                  this.GetSplitParameters();
                  this.GetFtpDetails();
                  this.GetProviderMappingDetails();
                  this.loading = false;
                }
              },
              err => {
                this.loading = false;
              }
            )
        );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
  getSubClientDetails() {
    this.loading = true;
    let getclient: { subclientcode: string } = {
      subclientcode: this.subclientcode
    };
    let seq = this.api.post("SubClient/GetSubClient", getclient);
    seq.subscribe(
      res1 => {
        if (res1[0] != undefined && res1[0] != null) {
          this.objclient = <clssubclient>res1[0];
          console.log(this.objclient);
          console.log(this.objclient["clientid"]);
          this.clientid = this.objclient["clientid"];
          this.subclientid = this.objclient["id"];
        }
  
      },
      err => {
        this.loading = false;
        this.clsUtility.LogError(err);
      }
    );
  }
  GetSplitParameters() {
    let getsplitpara: {
      splitparameterid: string;
      subclientcode: string;
    } = {
      splitparameterid: "0",
      subclientcode: this.subclientcode
    };
    let seq2 = this.api.post("SubClient/GetSplitParameter", getsplitpara);
    seq2.subscribe(
      res => {
        if (res) {
          this.splitparalist = <clssplitpara[]>res;
          this.loadItemsClaimIdentifier();
        }
      },
      err => {
        this.clsUtility.LogError(err);
      }
    );
  }

  GetFtpDetails() {
    let getftp: { ftpid: string; subclientcode: string } = {
      ftpid: "0",
      subclientcode: this.subclientcode
    };
    let seq3 = this.api.post("SubClient/GetSubClientFTP", getftp);
    seq3.subscribe(
      res3 => {
        if (res3) {
          this.getftpinfo = res3;
        
        }
      },
      err => {
        this.loading = false;
        this.clsUtility.LogError(err);
      }
    );
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
      seq.subscribe(
        data => {
          if (data != null || data != undefined) {
            let sdata = data;
            if (data["content"] != null && data["content"] != undefined) {
              this.getproviderinfo = data["content"];
            } else {
              this.getproviderinfo = null;
            }
            this.loadItemsRederingProvider();
          }
        },
        error => {
          this.loading = false;
          this.clsUtility.LogError(error);
        }
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeClaimIdentifier(event: PageChangeEvent): void {
    this.skipClaimIdentifier = event.skip;
    this.loadItemsClaimIdentifier();
  }
  loadItemsClaimIdentifier() {
    this.objclaimidentifier = this.splitparalist;
    this.itemsClaimIdentifier = this.objclaimidentifier;
    this.viewClaimIdentifier = {
      data: this.itemsClaimIdentifier.slice(
        this.skipClaimIdentifier,
        this.skipClaimIdentifier + this.pageSizeClaimIdentifier
      ),
      total: this.itemsClaimIdentifier.length
    };
  }

  public pageChangeRederingProvider(event: PageChangeEvent): void {
    this.skipRederingProvider = event.skip;
    this.loadItemsRederingProvider();
  }
  loadItemsRederingProvider() {
    this.objrederingprovider = this.getproviderinfo;

    this.itemsRederingProvider = this.objrederingprovider;
    this.viewRederingProvider = {
      data: this.itemsRederingProvider.slice(
        this.skipRederingProvider,
        this.skipRederingProvider + this.pageSizeRederingProvider
      ),
      total: this.itemsRederingProvider.length
    };
  } */

  SubmitActivation(isSubmit: boolean) {
    if (isSubmit) {
    } else {
    }
  }
}
