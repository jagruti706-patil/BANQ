import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { DatePipe } from "@angular/common";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { Api } from "src/app/Services/api";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { SubSink } from "subsink";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Client } from "src/app/Model/client";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { isNullOrUndefined } from "util";
import { DuplicatecheckpaymenthistoryComponent } from "./duplicatecheckpaymenthistory.component";
declare var $: any;
import * as JSZip from "jszip";

@Component({
  selector: "app-duplicatecheckpayment",
  templateUrl: "./duplicatecheckpayment.component.html",
  styleUrls: ["./duplicatecheckpayment.component.css"],
})
export class DuplicatecheckpaymentComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    public api: Api,
    private dataService: DatatransaferService,
    private filedetailService: FileDetailsService,
  ) {
    this.clsUtility = new Utility(toastr);
    this.MasterFilespagesize = this.clsUtility.pagesize;
  }

  private clsUtility: Utility;
  private subscription = new SubSink();
  clsPermission: clsPermission;

  public MasterFilesGridData: {};
  public MasterFilesGridView: GridDataResult;
  private MasterFilesItems: any[] = [];
  public MasterFilesResponse: any[] = [];
  public MasterFilesSkip = 0;
  public MasterFilespagesize: number = 0;
  public MasterFilesdisplaytotalrecordscount: number = 0;
  loadingMasterFilesGrid = true;

  public startDate: Date = new Date();
  public endDate: Date = new Date();
  public currentusername: string = "";
  private currentuserid: string;

  public sAllClients: any; //Client[];
  public SelectAllClients: any;
  public nSelectedClientID: string = "0";
  public disabledclient: boolean = false;
  public holdpaymentresponse: any = []; 
  public DownloadConfirmationMessage: any;
  public openedreprocess = false;
  public selecteddataItem: any = [];

  public items: any[] = [{ text: "Reprocess Override" }];

  public sMasterSearchBy: any = [
    { value: "Check", text: "Check" },
    { value: "Payer", text: "Payer" },
    { value: "Fileshare", text: "Fileshare" }
  ];
  public sSelectedMasterSearchBy: string = "Check";
  public sSearchText: string = "";

  @ViewChild("SelectedcheckhistoryChild")
  private SelectedcheckhistoryChild: DuplicatecheckpaymenthistoryComponent;
  public InputClientid: any;
  public InputChecknumber: any; 

  public sortMaster: SortDescriptor[] = [
    {
      field: "dtimportdate",
      dir: "desc",
    },
  ];

  neraMasterFileid: any = "0";
  public sMasterfile: any;
  public stitleMasterfile = "ERA File";
  public s835erainstring: any;
  public masteropened = false;
  loading = false;
  loadingMasterFiles = true;

  DropDownGroup = this.fb.group({
    fcClientName: ["", Validators.required],
    fcMasterSearchBy: ["", Validators.required],
    fcSearch: [""],
  });

  get ClientName() {
    return this.DropDownGroup.get("fcClientName");
  }

  get MasterSearchBy() {
    return this.DropDownGroup.get("fcMasterSearchBy");
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

      this.currentusername = this.dataService.loginUserName;
      this.currentuserid = this.dataService.SelectedUserid;
      this.startDate.setMonth(this.startDate.getMonth() - 3);

      this.MasterFilesdisplaytotalrecordscount = 0;
      this.loadingMasterFilesGrid = true;

      this.RetriveAllClient();
      this.api.insertActivityLog(
        "Duplicate Check Payment Files List Viewed",
        "Hold Payment",
        "READ"
      );
    } catch (error) {
      this.loadingMasterFilesGrid = false;
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

  RetriveAllClient() {
    try {
      let getclient: {
        clientid: string;
        clientstatus: boolean;
        v_userid: string;
      } = {
        clientid: "0",
        clientstatus: true,
        v_userid: this.currentuserid,
      };
      let seq = this.api.post("GetClient", getclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.sAllClients = res;
            if (
              !isNullOrUndefined(this.sAllClients) &&
              this.sAllClients.length > 0
            ) { 
              if(this.sAllClients.length == 1)          {
                this.SelectAllClients = this.sAllClients;
                this.nSelectedClientID = this.sAllClients[0].clientid;               
              } else {
                const Allclt = new Client();
                Allclt.clientid = "0";
                Allclt.clientcode = "";
                Allclt.clientname = "All";
                this.sAllClients.unshift(Allclt);
                this.SelectAllClients = this.sAllClients;
                this.nSelectedClientID = "0";                     
              }  
              this.RetriveMasterFiles();              
            } else {
              this.sAllClients = [];     
              this.MasterFilesResponse = [];
              this.MasterFilesItems = [];             
              this.loadingMasterFilesGrid = false;                         
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

  RetriveMasterFiles(){
    this.MasterFilesGridView = null;
    this.MasterFilesItems = [];
    try {
      this.loadingMasterFilesGrid = true;
      this.subscription.add(
        this.filedetailService
          .getDuplicateCheckPaymentFiles(
            this.datePipe.transform(this.startDate, "yyyyMMdd"),
            this.datePipe.transform(this.endDate, "yyyyMMdd"),
            this.nSelectedClientID,
            this.currentuserid,
            this.sSearchText,
            this.sSelectedMasterSearchBy,
            this.MasterFilesSkip,
            this.MasterFilespagesize            
          )
          .subscribe(
            (data) => {
              if (data != null) {
                this.MasterFilesResponse = data;
                this.MasterFilesItems = this.MasterFilesResponse["content"];
                this.MasterFilesdisplaytotalrecordscount = this.MasterFilesResponse[
                  "totalelements"
                ];               
                if (this.MasterFilesItems != null) {
                  this.MasterFilesItems.forEach(obj1 => {  
                      obj1.isFilesProcessing = false;                    
                  }); 
                  this.loadItemsMaster_v2();                            
                } else {
                  this.MasterFilesdisplaytotalrecordscount = 0;  
                }
              }
              this.loadingMasterFilesGrid = false;              
            },
            (err) => {
              this.loadingMasterFilesGrid = false;             
            }
          )
      );
    } catch (error) {     
      this.clsUtility.LogError(error);
    }
  }

  private loadItemsMaster_v2(): void {
    this.MasterFilesGridView = null;
    try {
      if (this.MasterFilesItems != null && this.MasterFilesItems != undefined) {
        if (this.MasterFilesItems && this.MasterFilesItems.length > 0) {
          this.MasterFilesGridView = {
            data: orderBy(this.MasterFilesItems, this.sortMaster),
            total: this.MasterFilesResponse["totalelements"],
          };
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortMasterChange(sort: SortDescriptor[]): void {
    try {
      this.sortMaster = sort;    
      this.loadItemsMaster_v2();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onClientChange(event: any) {
    try {     
      this.nSelectedClientID = event;    
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleClientFilter(value) {
    try {
      this.sAllClients = this.SelectAllClients.filter(
        (s) => s.clientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  applyFilters() {
    try {
      if (
        this.fbcFilterSearch.value != null &&
        this.fbcFilterSearch.value != undefined
      ) {
        this.sSearchText = "";
        this.sSearchText = this.fbcFilterSearch.value.trim();        
      } else {
        this.sSearchText = "";
        this.fbcFilterSearch.setValue(this.sSearchText);
      }

      if (
        this.nSelectedClientID != null &&
        this.nSelectedClientID != undefined &&       
        this.startDate != null &&
        this.startDate != undefined &&
        this.endDate != null &&
        this.endDate != undefined
      ) {
        this.MasterFilesSkip = 0;
        this.MasterFilesdisplaytotalrecordscount = 0;
        this.loadingMasterFilesGrid = true;      
        this.RetriveMasterFiles();
      } else {
        this.MasterFilesSkip = 0;
        this.MasterFilesdisplaytotalrecordscount = 0;
        this.loadingMasterFilesGrid = false;
        this.MasterFilesResponse = [];
        this.MasterFilesItems = [];
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  clearFilters() {
    try {
      this.nSelectedClientID = "0";     
      this.startDate = new Date();
      this.startDate.setMonth(this.startDate.getMonth() - 3);
      this.endDate = new Date();

      this.MasterFilesSkip = 0;
      this.MasterFilesdisplaytotalrecordscount = 0;
      this.loadingMasterFilesGrid = true;   

      this.sSelectedMasterSearchBy = "Check";
      this.sSearchText = "";
      this.fbcFilterSearch.setValue(this.sSearchText);

      this.RetriveAllClient();    
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  pageChangeMasterFile(event: PageChangeEvent): void {
    try{
      this.loadingMasterFilesGrid = true;
      this.MasterFilesGridView = null;
      this.MasterFilesSkip = event.skip;
      this.RetriveMasterFiles();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMenuItemSelect(dataItem: any) {    
    try {
        this.onreprocessclick(dataItem);
        this.selecteddataItem = dataItem;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  reprocessfiles(){
    try {    
      if(this.selecteddataItem != null && this.selecteddataItem != undefined) {
        if(this.selecteddataItem.isFilesProcessing == false){
          this.selecteddataItem.isFilesProcessing = true;
          let reprocess: {
            mastererafileid: string;
            clientid: string;
            filename: string;
            validationoverride: boolean;
            checkduplicatepaymentoverride: boolean;
          } = {
            mastererafileid: this.selecteddataItem.nmastererafileid,
            clientid: this.selecteddataItem.clientid,
            filename: this.selecteddataItem.sfilename,
            validationoverride: false,
            checkduplicatepaymentoverride: true
          };
          let seq = this.api.post_edi("api/Parser/MasterReprocess", reprocess);
          seq.subscribe(
            (res) => {
              this.api.insertActivityLog(
                "Master File (" + this.selecteddataItem.sfilename + ") reprocessed.",
                "Hold Payment",
                "READ",
                this.selecteddataItem.nmastererafileid
              );
    
              setTimeout(() => {
                this.getHoldPaymentCount();
                this.RetriveMasterFiles();
                this.selecteddataItem = [];
              }, 2000);
            },
            (err) => {              
              this.clsUtility.LogError(err);
            }
          );
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onDateChange(value: Date, date: string): void {
    try {  
      if (value != null) {
        // this.RetriveMasterFiles();
        if (date == "start date" && value > this.endDate) {
          this.clsUtility.showWarning("Start date must be less than end date");
          this.startDate = new Date();
        } else if (date == "end date" && value < this.startDate) {
          this.clsUtility.showWarning(
            "End date must be greater than start date"
          );
          this.endDate = new Date();
        }        
      } else {
        if (date == "start date") {
          this.startDate = new Date();
        } else if (date == "end date") {
          this.endDate = new Date();
        }      
        this.RetriveMasterFiles();
        this.clsUtility.LogError("Select valid date");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getHoldPaymentCount(){
    this.holdpaymentresponse = [];
    this.dataService.holdpaymentcount = 0;
    try {           
      this.subscription.add(
        this.filedetailService
          .getBadgesHoldPayment(
            this.datePipe.transform(this.startDate, "yyyyMMdd"),
            this.datePipe.transform(this.endDate, "yyyyMMdd"),           
            this.currentuserid                      
          )
          .subscribe(
            (data) => {
              if (data != null) {                
                this.holdpaymentresponse = data;
                if(this.holdpaymentresponse != null && this.holdpaymentresponse != undefined){
                  if(this.holdpaymentresponse["ncount"] != null && this.holdpaymentresponse["ncount"] != undefined)
                  this.dataService.holdpaymentcount = this.holdpaymentresponse["ncount"];
                } else {
                  this.dataService.holdpaymentcount = 0;                 
                }
              }                          
            },
            (err) => {                         
            }
          )
      );
    } catch (error) {     
      this.clsUtility.LogError(error);
    }
  }

  onreprocessclick(dataItem: any){
    try {      
      if (dataItem != null) {               
          this.DownloadConfirmationMessage =
            "Do you want to reprocess " +
            dataItem.sfilename +
            " file?";
          this.open();  
        }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public open() {
    try {   
      this.openedreprocess = true;
    } catch (error) {
      this.clsUtility.LogError(error);
    }   
  }

  public close(status) {
    try {   
      if(status == 'Yes'){
        this.openedreprocess = false;   
        this.reprocessfiles();
      } else {
        this.openedreprocess = false;
        this.selecteddataItem = [];
      }      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  oncheckhistoryinfoclick(record: any){
    try {      
      this.InputClientid = record.clientid;     
      this.InputChecknumber = record.schecknumber;          
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputSelectCheckHistoryResult($event) {
    try { 
      // console.log("OutputSelectHistoryResult : ", $event)  ;
      this.InputClientid = null;      
      this.InputChecknumber = null;     
      this.SelectedcheckhistoryChild.ResetComponents();      
      $("#checkhistoryInfoModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterSearchByChange(event: any) {
    try {
      // console.log(event); 
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveMaster835File(nerafileid, sfilename: string, status: string) {
    try {
      this.loadingMasterFilesGrid = true;
      this.neraMasterFileid = nerafileid;
      this.subscription.add(
        this.filedetailService
          .getMaster835File(this.neraMasterFileid)
          .subscribe(
            (data) => {
              if (!isNullOrUndefined(data)) {
                this.sMasterfile = data["s835string"];
                this.stitleMasterfile = sfilename;
                if (status == "View") {
                  this.OnViewMasterFile();
                  this.loadingMasterFilesGrid = false;
                  this.api.insertActivityLog(
                    "Master File (" + this.stitleMasterfile + ") Viewed",
                    "Files",
                    "READ",
                    this.neraMasterFileid
                  );
                } else {
                  this.OnDownloadMasterFile(sfilename);
                  this.loadingMasterFilesGrid = false;
                  this.api.insertActivityLog(
                    "Master File (" + this.stitleMasterfile + ") Downloaded",
                    "Files",
                    "READ",
                    this.neraMasterFileid
                  );
                }
              } else {
                this.loading = false;
                this.loadingMasterFiles = false;
                this.loadingMasterFilesGrid = false;
              }
            },
            (err) => {
              this.loading = false;
              this.loadingMasterFiles = false;
              this.loadingMasterFilesGrid = false;
            }
          )
      );
    } catch (error) {
      this.loading = false;
      this.loadingMasterFiles = false;
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  OnViewMasterFile() {
    try {
      // this.s835erainstring = this.sMasterfile.replace(/~/g, "~\n");
      this.s835erainstring = this.sMasterfile;
      this.On835erainFile();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnDownloadMasterFile(Masterfilename) {
    try {
      var zip = new JSZip();
      zip.file(Masterfilename + ".txt", this.sMasterfile);
      zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, Masterfilename + ".zip");
      });
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  On835erainFile() {
    try {
      this.masteropened = true;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public masterclose() {
    try {
      this.masteropened = false;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

}
