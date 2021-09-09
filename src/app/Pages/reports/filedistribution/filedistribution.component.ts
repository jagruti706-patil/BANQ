import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Api } from "src/app/Services/api";
import { DatePipe } from "@angular/common";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { SubSink } from "subsink";
import { Utility } from "src/app/Model/utility";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { GridDataResult, DataStateChangeEvent, SelectableSettings } from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Client } from "src/app/Model/client";
import { Subclient } from "src/app/Model/subclient";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { process, State } from "@progress/kendo-data-query";
import { DivisionandpayerwiseComponent } from '../divisionandpayerwise/divisionandpayerwise.component';
declare var $: any;
import { FiledistributionnotesComponent } from "../filedistributionnotes/filedistributionnotes.component";
import { CoreauthService } from "src/app/Services/coreauth.service";
import { MailSend } from "../../Configurations/emailconfiguration/clsemail";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-filedistribution',
  templateUrl: './filedistribution.component.html',
  styleUrls: ['./filedistribution.component.css']
})
export class FiledistributionComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    public api: Api,
    private datePipe: DatePipe,
    private dataService: DatatransaferService,
    private filedetailService: FileDetailsService,
    private coreService: CoreauthService,
    private routeParams: ActivatedRoute
  ) {
    this.clsUtility = new Utility(toastr);
    this.setSelectableSettings();

    this.frmnotes = fb.group({
      fcComment: [""]      
    });
  }

  public setSelectableSettings(): void {
    this.selectableSettings = {
      enabled: true,
      checkboxOnly: this.checkboxOnly,  
      mode: 'single'  
    };
  }

  frmnotes: FormGroup;
  private subscription = new SubSink();
  private clsUtility: Utility;
  public clsPermission: clsPermission;
  public selectableSettings: SelectableSettings;
  public checkboxOnly = true;
  public selectedCallback = (args) => args.dataItem;
  public mySelection: any[] = [];

  private currentuserid: string = "0";
  public currentusername: string = "";  
  private bOninit = false;
  public GridView: GridDataResult;
  public MasterFilesGridView: GridDataResult;
  public MasterFilesItems: any[] = [];
  public MasterFilesResponse: any[] = []; 
  public MasterFilesdisplaytotalrecordscount: number = 0;  
  public MasterFilesSkip = 0;
  public MasterFilespagesize: number = 1000;
  public updatestatusresponse: any[] = [];
  public statusid: string = "0";
  public sstatus: string = "";
  public openednotes = false;
  public scomment: string = "";
  public notesresponse: any[] = [];
  public NotesConfirmationMessage: string = "";
  public openedyesno = false;
  public userlist: any;
  public items: any[] = [];
  public selectionstatus: string = "";
  public groupList: any;
  public copygroupList: any;
  public sgroupList: any;
  public selectedgroups: number = 0;
  public mentiondusers: any[] = [];
  public mentiongroups: any[] = []; 
  public resultarray: any = [];
  public result: any = [];
  public filedistributionid: any = "";
  public fileshareid: any = "";
  public fileprocessdate: any = "";
  public fileclientid: any = "";
  public recordslist: any[] = [];
  public notificationresponse: any[] = [];
  public vclientid: any = "1";;
  public vprocessdate: Date = new Date();
  public vfiledistributionid: any = "";
  public urlparametersflag: boolean = false;
  currenturl: string = "";
  public disablesavebutton: boolean = false;
  public finalemailsendarray: any[] = [];
  public globalmessage: string = "Files will be display on this screen after 1st Feb 2021.";
  public globaldate: Date = new Date();
  
  @ViewChild("SelectedfilehistoryChild")
  private SelectedfilehistoryChild: FiledistributionnotesComponent;
  public Inputfiledistributionid: any;
  public Inputdisfileid: any; 
  
  public sortMaster: SortDescriptor[] = [
    {
      field: "nstatus",
      dir: "asc"     
    },
  ];

  public state: State = {
    skip: 0,
    take: 300,
    sort: this.sortMaster
  };
  
  public nSelectedClientID: any = "1";
  public sAllClients: any;
  public SelectAllClients: any;
  public selectedClientValue: string = "0";
  
  public loadingMasterFilesGrid: boolean = false;
  public processDate: Date = new Date();
  // public processDate: Date = new Date('10/22/2020');
  public startDate: Date = new Date();
  public endDate: Date = new Date();
  public sSearchText: string = "";
  public sSelectedStatus: string = "3";
  public sFileStatus: any = [
    { value: "3", text: "All" },
    { value: "0", text: "Pending" },
    { value: "1", text: "Inprocess" },
    { value: "2", text: "Complete" },
  ];

  @ViewChild("DivisionPayerChild")
  private DivisionPayerChild: DivisionandpayerwiseComponent; 
  public inputfileid: any;
  public inputpayerid: any = "";
  public inputpayername: any = "";
  public inputeftmonth: any = "";
  public inputeftyear: any = "";
  public inputfileshareid: any = "";
  public inputpaymentmethodcode: any = "";
  public inputauditlogstr: string = ""  ;

  DropDownGroup = this.fb.group({
    fcClientName: ["", Validators.required],
    fcFileStatus: [""]
  });

  get ClientName() {
    return this.DropDownGroup.get("fcClientName");
  }

  get FileStatus() {
    return this.DropDownGroup.get("fcFileStatus");
  }


  ngOnInit() {
    try {
      this.items = [];
      this.getuser();
      this.getGroupList();

      let dateString = "2021-03-05";
      let newDate = new Date(dateString);
      // console.log("this.globaldate  : ", this.globaldate, " date : ", newDate);
      if (this.globaldate >= newDate) {
        this.globalmessage = "";
      }

      this.startDate.setDate(this.startDate.getDate() - 1);
      this.endDate.setDate(this.endDate.getDate() - 1);
      this.bOninit = true;
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );

      this.currentuserid = this.dataService.SelectedUserid;   
      this.dataService.loginName.subscribe(data => {
        this.currentusername = data;
      });

      this.routeParams.params.subscribe(params => {        
        if(params != null && params != undefined){
          this.vclientid = params["vclientid"];
          const dateString = params["vprocessdate"];
          if(dateString != null && dateString != undefined){
            const year = dateString.substr(0, 4);
            const month = dateString.substr(4, 2) - 1;
            const day = dateString.substr(6, 2);        
            this.vprocessdate = new Date(year, month, day);
          }
          this.vfiledistributionid = params["vfiledistributionid"];
  
          if((this.vclientid != null && this.vclientid != undefined) &&
          (this.vprocessdate != null && this.vprocessdate != undefined) && (this.vfiledistributionid != null && this.vfiledistributionid != undefined)
          ){ 
            // console.log("Paramerters details : ", this.vclientid + " : " + this.vprocessdate + " : " + this.vprocessdate.getDate() + " : " + this.vfiledistributionid);
            this.urlparametersflag = true;

            this.api.insertActivityLog(
              "File Distribution List Viewed From Email For File Distribution id : " + this.vfiledistributionid,
              "File Distribution Report",
              "READ"
            );

            this.RetriveAllClient(); 
          } else {
            this.urlparametersflag = false;  
            
            this.RetriveAllClient();      
            this.loadingMasterFilesGrid = true;
            // this.getFileDistributionReport();
            this.api.insertActivityLog(
              "File Distribution List Viewed",
              "File Distribution Report",
              "READ"
            );
          }          
        } 
      });      
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
              (this.sAllClients != null && this.sAllClients != undefined) &&
              this.sAllClients.length > 0
            ) {
              this.SelectAllClients = this.sAllClients;         
              if (
                this.sAllClients[0]["nclientcount"] == this.sAllClients.length
              ) {
                // const Allclt = new Client();
                // Allclt.clientid = "0";
                // Allclt.clientcode = "";
                // Allclt.clientname = "All";
                // this.sAllClients.unshift(Allclt);
                // this.selectedClientValue = "0";
                // this.nSelectedClientID = "0";
                this.selectedClientValue = this.sAllClients[0]["clientid"];
                this.nSelectedClientID = this.sAllClients[0]["clientid"];
              } else {
                this.selectedClientValue = this.sAllClients[0]["clientid"];
                this.nSelectedClientID = this.sAllClients[0]["clientid"];
              }
                            
              if(this.urlparametersflag){
                this.startDate = this.vprocessdate;
                this.endDate = this.vprocessdate;           
                if((this.sAllClients != null && this.sAllClients != undefined) && this.sAllClients.length > 0){
                  let clientindex = [];
                  clientindex = this.sAllClients.filter(v1 => v1.clientid == Number(this.vclientid));
                  if(clientindex.length > 0 ){
                    this.nSelectedClientID = Number(this.vclientid);
                  } else {
                    this.clsUtility.showInfo("Ohhh Sorry!! You are not mapped with seleted group, Please contact admin for more details.");
                  }                  
                } 
                this.getFileDistributionReport(); 
              } else {
                this.nSelectedClientID = this.sAllClients[0]["clientid"];
                this.getFileDistributionReport(); 
              }
            } else {
              this.sAllClients = [];
              this.SelectAllClients = this.sAllClients;        
              this.clsUtility.showInfo("No group is active");
              this.MasterFilesdisplaytotalrecordscount = 0;
              this.loadingMasterFilesGrid = false;
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

  ngOnDestroy() {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getFileDistributionReport() {    
    this.MasterFilesGridView = null;
    this.MasterFilesItems = [];
    try {
      this.subscription.add(
        this.filedetailService
          .getFileDistributionReport(            
            this.datePipe.transform(this.startDate, "yyyyMMdd"),  
            this.datePipe.transform(this.endDate, "yyyyMMdd"),          
            this.nSelectedClientID,
            Number(this.sSelectedStatus),           
            this.sSearchText,
            this.MasterFilespagesize,
            this.MasterFilesSkip
          )
          .subscribe(
            (data) => {              
              this.MasterFilesResponse = data;
              if (
                this.MasterFilesResponse != null &&
                this.MasterFilesResponse != undefined
              ) {
                this.MasterFilesItems = this.MasterFilesResponse["content"];
                if (this.MasterFilesItems != null) { 
                    this.MasterFilesItems.forEach(obj => {
                      obj.eftmonthyear = this.datePipe.transform(obj.eftdate, "MMMM-yyyy");
                    });    
                    
                    if(this.urlparametersflag){
                      this.MasterFilesItems = this.MasterFilesItems.filter(obj => obj.filedistributionid == this.vfiledistributionid);
                    }
                    this.loadItemsMaster();
                    this.loadingMasterFilesGrid = false;  
                  } else {
                    this.MasterFilesdisplaytotalrecordscount = 0;
                    this.loadingMasterFilesGrid = false;                 
                  } 
              } else {
                this.MasterFilesdisplaytotalrecordscount = 0;
                this.loadingMasterFilesGrid = false;                 
              } 
            },
            (err) => {
              this.loadingMasterFilesGrid = false;             
            }
          )
      );
    } catch (error) {      
      this.clsUtility.LogError(error);
      this.loadingMasterFilesGrid = false;
    }
  }

  private loadItemsMaster(): void {
    this.MasterFilesGridView = null;
    this.GridView = null;
    try {
      if(this.MasterFilesItems != null && this.MasterFilesItems != undefined){
          this.MasterFilesGridView = process(this.MasterFilesItems, this.state);          
        }
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
    this.sAllClients = this.SelectAllClients.filter(
      (s) => s.clientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  applyfilter(){
    try {
      this.urlparametersflag = false;
      this.loadingMasterFilesGrid = true;
      this.filedistributionid = "";
      this.fileshareid = "";
      this.fileprocessdate = "";
      this.fileclientid = "";
      this.mySelection = [];
      this.getFileDistributionReport();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onDateChange(value: Date, date: string): void {
    try {      
      if (value != null) {
        // this.RetriveMasterFiles();
        let vdate = new Date(value);
        let year = vdate.getFullYear();
        if(year != 0){
          if (date == "start date" && value > this.endDate) {
            this.clsUtility.showWarning("Start date must be less than end date");
            this.startDate = new Date();
          } else if (date == "end date" && value < this.startDate) {
            this.clsUtility.showWarning(
              "End date must be greater than start date"
            );
            this.endDate = new Date();
          }
        }
        else {
          this.clsUtility.LogError("Select valid date");
          this.startDate = new Date();
          this.endDate = new Date();
        }
      } else {
        if (date == "start date") {
          this.startDate = new Date();
        } else if (date == "end date") {
          this.endDate = new Date();
        }
        this.clsUtility.LogError("Select valid date");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public dataStateChange(state: DataStateChangeEvent): void { 
    try {
      this.state = state;
      if ((this.MasterFilesItems != null && this.MasterFilesItems != undefined ) && this.MasterFilesItems.length > 0) {
        if (state.filter != undefined && state.filter != null) {
          state.filter.filters.forEach((f) => {
            if (f["field"] == "filename" || f["field"] == "fileshareid" || f["field"] == "payername") {
              if (f["value"] != null) {
                f["value"] = f["value"].trim();
              }
            }
          });
        }  
        this.MasterFilesGridView = process(this.MasterFilesItems, this.state);    
      } 
    } catch (error) {
      this.clsUtility.LogError(error);
    }          
  }

  onViewReportClick(record: any) {     
    // console.log("onViewReportClick: ", record) ;
    try {   
      this.inputfileid = record.fileid;
      this.inputpayerid = record.payerid;
      this.inputpaymentmethodcode = record.paymentmethodcode;
      this.inputpayername = record.payername;
      this.inputfileshareid = record.fileshareid;
      var dt = new Date(record.eftdate);    
      this.inputeftmonth = dt.getMonth() + 1;
      this.inputeftyear = dt.getFullYear();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputResult($event) {
    try {
        let IsSaved = $event;

        if(IsSaved == true){          
          this.inputfileid = 0;
          this.inputpayerid = "";
          this.inputpaymentmethodcode = "";
          this.inputpayername = "";
          this.inputfileshareid = "";
          this.inputeftmonth = "";
          this.inputeftyear = "";
          this.DivisionPayerChild.ResetComponents();
          $("#viewDivisionPayerReportModal").modal("hide");      
        } else {
          this.inputfileid = 0;
          this.inputpayerid = "";
          this.inputpaymentmethodcode = "";
          this.inputpayername = "";
          this.inputfileshareid = "";
          this.inputeftmonth = "";
          this.inputeftyear = "";
          this.DivisionPayerChild.ResetComponents();
          $("#viewDivisionPayerReportModal").modal("hide");      
        }
       
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  opendialogcomment(status: any){
    try {
      this.statusid = status;
      if(this.statusid == '0') {
        this.sstatus = 'Pending';
      } else if(this.statusid == '1') {
        this.sstatus = 'Inprocess';
      } else if(this.statusid == '2') {
        this.sstatus = 'Complete';
      }
      this.open();
    } catch (error){
      this.clsUtility.LogError(error);
    }
  }

  UpdateStatus(status: any){
    try { 
      // console.log("record : ", this.mySelection, " status: ", status);
      if(this.mySelection != null || this.mySelection != []){
        if(this.mySelection.length != 0){
          this.mySelection.forEach(obj => {
            this.subscription.add(
              this.filedetailService
                .UpdateFileDistributionStatus(            
                  obj.filedistributionid,  
                  obj.fileid,          
                  obj.clientid,           
                  status
                )
                .subscribe(
                  (data) => {              
                    if(data != undefined || data != null){
                      this.updatestatusresponse = data;
                      // console.log("this.updatestatusresponse : ", this.updatestatusresponse);

                      if (this.statusid == '0'){ 
                        this.api.insertActivityLog(
                          "File Distribution Status updated as 'Pending' for FileShareid: " + obj.fileshareid + ", Payer: " + obj.payername + ", EFT Month-Year: " + this.datePipe.transform(obj.eftdate, "MMMM-yyyy") + " and Payment Method: " + obj.paymentmethodcode,
                          "File Distribution Report",
                          "READ"
                        );
                      } else if (this.statusid == '1') {
                        this.api.insertActivityLog(
                          "File Distribution Status updated as 'Inprocess' for FileShareid: " + obj.fileshareid + ", Payer: " + obj.payername + ", EFT Month-Year: " + this.datePipe.transform(obj.eftdate, "MMMM-yyyy") + " and Payment Method: " + obj.paymentmethodcode,
                          "File Distribution Report",
                          "READ"
                        );
                      } else if (this.statusid == '2') { 
                        this.api.insertActivityLog(
                          "File Distribution Status updated as 'Complete' for FileShareid: " + obj.fileshareid + ", Payer: " + obj.payername + ", EFT Month-Year: " + this.datePipe.transform(obj.eftdate, "MMMM-yyyy") + " and Payment Method: " + obj.paymentmethodcode,
                          "File Distribution Report",
                          "READ"
                        );
                      }
                      
                      this.sendemailnotification();
                      // setTimeout(() => {
                      //   this.getFileDistributionReport();
                      //   this.mySelection = [];  
                      //   this.scomment = "";          
                      // }, 1000);
                    }                     
                  },
                  (err) => {
                    this.loadingMasterFilesGrid = false;             
                  }
                )
            );
          });
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public open() {
    try {   
      this.disablesavebutton = false;
      this.openednotes = true;
    } catch (error) {
      this.clsUtility.LogError(error);
    }   
  }

  public close(status) {
    try { 
      if(status == 'Yes'){
        this.disablesavebutton = true;
        this.openednotes = false; 
        if (this.scomment != null && this.scomment != undefined) {          
          this.SaveComment();          
        } else {
          this.scomment = "";
          this.SaveComment();
        }   
        this.UpdateStatus(this.statusid);
      } else if(status == 'No')  {      
        this.openednotes = false;  
        this.scomment = "";
        this.mySelection = [];
        // this.openednotes = false;
        // this.openedyesno = true;
        // this.NotesConfirmationMessage = "Are you sure, you want to update status ?";        
      }      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  SaveComment(){
    try { 
      this.fileshareid = "";
           
      if (this.scomment != null && this.scomment != undefined) {
        if(this.mySelection != null && this.mySelection != undefined){
          if(this.mySelection.length != 0){            
            this.mySelection.forEach(ele => {

              this.filedistributionid = ele.filedistributionid;
              this.fileshareid = ele.fileshareid;
              this.fileprocessdate = this.datePipe.transform(ele.dtprocessdate, "yyyyMMdd");
              this.fileclientid = ele.clientid;

              this.subscription.add(
                 this.filedetailService
                  .InsertFileDistributionNotes(            
                    ele.filedistributionid,
                    ele.fileid,
                    this.scomment,
                    this.statusid,
                    this.currentuserid,
                    this.currentusername
                  )                  
                  .subscribe(
                    (data) => {              
                      if(data != undefined || data != null){
                        this.notesresponse = data;
      
                        // console.log("this.notesresponse : ", this.notesresponse);                        
                      }                     
                    },
                    (err) => {
                      this.loadingMasterFilesGrid = false;             
                    }
                  )
              );
            });
          }
        }        
      } 
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onStatusChange(event: any) {
    try {
      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onfilehistoryinfoclick(record: any){
    try {      
      this.Inputfiledistributionid = record.filedistributionid;     
      this.Inputdisfileid = record.fileid;    
      this.inputauditlogstr = "File Distribution notes history viewed for FileShareid: " + record.fileshareid + ", Payer: " + record.payername + ", EFT Month-Year: " + this.datePipe.transform(record.eftdate, "MMMM-yyyy") + " and Payment Method: " + record.paymentmethodcode;     
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputSelectFileHistoryResult($event) {
    try { 
      // console.log("OutputSelectHistoryResult : ", $event)  ;
      this.Inputfiledistributionid = null;      
      this.Inputdisfileid = null;   
      // this.mySelection = [];  
      this.SelectedfilehistoryChild.ResetComponents();      
      $("#filehistoryInfoModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public closeyesno(status) {
    try { 
      if(status == 'Yes'){
        this.openedyesno = false;     
        this.UpdateStatus(this.statusid);    
      } else if(status == 'No')  {        
        this.openedyesno = false;
        this.mySelection = [];   
      }      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getuser() {
    try {
      this.coreService.getAllUsers('1').subscribe(
        (data) => {
          if (data != null && data != undefined) {
            this.userlist = [];
            this.userlist = data;
            if (this.userlist != null || this.userlist != undefined) {
              if (this.userlist.length == 0) { 
                this.toastr.info("No user present in group");
              } else {
                this.userlist = this.userlist.filter(x2 => x2.isactive == true);               
                // console.log("Users list: ", this.userlist);                               
                this.userlist.forEach(obj => {     
                  var index = this.items.findIndex(img => img['name'] === obj.displayname);         
                  if( index == -1){
                    let insertobject: any = {
                      firstname: obj.firstname,
                      lastname: obj.lastname,
                      name: obj.displayname,
                      userid: obj.userid,
                      groupid: "",
                      useremail: obj.email
                    };                   
                    this.items.push(insertobject);                   
                  }                  
                });
                // console.log("removed duplicate Users list: ", this.items);                
              }
            }           
          }
        },
        (err) => {        
          this.clsUtility.LogError(err);
        }
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onselectionchange(state: any): void {   
    try{
      if(state.selectedRows != null && state.selectedRows != undefined){
        if(state.selectedRows.length > 0){
          this.selectionstatus = String(state.selectedRows[0].dataItem.nstatus);
        } else {
          this.selectionstatus = "";
          this.mySelection = [];
        }      
      } else {
        this.selectionstatus = "";
        this.mySelection = [];
      }      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getGroupList() {
    try {
      this.coreService.getGroupList().subscribe(
        (data) => {
          if ((data != null && data != undefined) && (data["content"] != null && data["content"] != undefined)) {
            this.groupList = data["content"];
            if (
              (this.groupList != null && this.groupList != undefined) &&
              this.groupList.length > 0
            ) {
              this.groupList = this.groupList.filter(x1 => x1.isactive == true);
              this.copygroupList = this.groupList.slice();

              if(this.items.length > 0){
                this.groupList.forEach(obj => {  
                  var index = this.items.findIndex(img => img['name'] === obj.groupname);                  
                  if(index == -1){
                    let insertobject: any = {
                      firstname: "",
                      lastname: "",
                      name: obj.groupname,
                      userid: "",
                      groupid: obj.groupid,
                      useremail: ""
                    };                    
                    this.items.push(insertobject);
                  }                  
                });
              }              
            } else {
              this.copygroupList = [];
            }
            this.selectedgroups = 0;
          }
        },
        (err) => {
          this.clsUtility.LogError(err);
        }
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sendemailnotification(){
    try {      
      if (this.scomment != null && this.scomment != undefined && this.scomment != "") {
        let strData: any;
        this.mentiondusers = [];
    
        strData = this.scomment.split("\n");
        // console.log(strData);
        strData.forEach(element => {
          if (element.includes("@")) {            
            // var name = element.replace(/(\r\n|\n|\r)/gm, "").split("@");
            var splitname = element.replace(/(\r\n|\n|\r)/gm, "").split(" ");
            // console.log(splitname);
            if(splitname.length > 0){              
              for(let i = 0; i < splitname.length; i++){
                if (splitname[i].includes("@")){ 
                  // console.log(this.items.find(x => x.name === splitname[i].replace('@', '')));
                  let index = [];
                  index = this.items.filter(
                    (s) => s.firstname.indexOf((splitname[i].replace('@', ''))) !== -1
                  );
                  // console.log(index);
                  if(index.length > 0) {
                    let obj = [] = this.items.filter(x => x.firstname === splitname[i].replace('@', ''));   
                    if(obj.length == 1) {
                      if(this.scomment.includes('@'+ obj[0].name)) 
                      {
                        this.scomment = this.scomment.replace('@'+ obj[0].name, '');
                        obj[0].email = obj[0].useremail;    
                        let index = [];
                        index = this.mentiondusers.filter(
                          (s) => s.name.indexOf((obj[0].name)) !== -1
                        );
                        if(index.length == 0){
                          this.mentiondusers.push(obj[0]);
                        }
                      }
                    } else if(obj.length > 1) {                      
                      obj.forEach(ele => {  
                        if(this.scomment.includes('@'+ ele.name)) 
                        {
                          this.scomment = this.scomment.replace('@'+ ele.name, '');
                          ele.email = ele.useremail;
                          let index = [];
                          index = this.mentiondusers.filter(
                            (s) => s.name.indexOf((ele.name)) !== -1
                          );
                          if(index.length == 0){
                            this.mentiondusers.push(ele);
                          }                          
                        }
                      });
                    }   
                  } else {
                    index = [];
                    index = this.items.filter(
                      (s) => s.name.indexOf((splitname[i].replace('@', ''))) !== -1
                    );
                    if(index.length > 0) {
                      let obj = [] = this.items.filter((s) => s.name.indexOf((splitname[i].replace('@', ''))) !== -1);                   
                      if(obj.length == 1) {
                        if(this.scomment.includes('@'+ obj[0].name)) 
                        {
                          this.scomment = this.scomment.replace('@'+ obj[0].name, '');
                          this.mentiongroups.push(obj[0]);
                        } 
                      } else if(obj.length > 1) {
                        obj.forEach(ele => {                          
                          if(this.scomment.includes('@'+ ele.name)){
                            this.scomment = this.scomment.replace('@'+ ele.name, '');
                            this.mentiongroups.push(ele);
                          }
                        });
                      }
                    }
                  }      
                }
              }
            }                       
          }
        })
        // console.log("this.mentiondusers : ", this.mentiondusers);
        // console.log("this.mentiongroups : ", this.mentiongroups);

        if(((this.mentiondusers != null && this.mentiondusers != undefined) || (this.mentiongroups != null && this.mentiongroups != undefined)) && ((this.mentiondusers.length > 0) || (this.mentiongroups.length > 0))){           
          this.getfinalemailusersarray();
        } else {
          setTimeout(() => {
            this.getFileDistributionReport();
            this.mySelection = [];  
            this.recordslist = [];
            this.scomment = "";    
            this.filedistributionid = "";
            this.fileshareid = "";
          }, 1000);
        }        
      } else {
        setTimeout(() => {
          this.getFileDistributionReport();
          this.mySelection = [];  
          this.recordslist = [];
          this.scomment = "";    
          this.filedistributionid = "";
          this.fileshareid = "";
        }, 1000);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getfinalemailusersarray(){
    try {  
      if((this.mentiondusers != null && this.mentiondusers != undefined) || (this.mentiongroups != null && this.mentiongroups != undefined)){
        if((this.mentiondusers.length > 0) || (this.mentiongroups.length > 0)) {
          let grouplength = this.mentiongroups.length;
          if(this.finalemailsendarray != null && this.finalemailsendarray != undefined){
            if(this.finalemailsendarray.length >= 0 ){
              this.finalemailsendarray = this.mentiondusers;
            }

            if(this.mentiongroups.length > 0) {
              let recordlen = 0;
              this.mentiongroups.forEach(record => {                    
                this.coreService.getgroupwiseuser(record.groupid).subscribe(
                  (data) => {                        
                    if (data != null && data != undefined) {
                      recordlen = recordlen + 1;
                      this.sgroupList = data;                    
                      if(this.sgroupList != null && this.sgroupList != undefined){
                        if(this.sgroupList.length > 0){
                          this.sgroupList.forEach(ele2 => {
                            ele2.name = ele2.firstname + " " + ele2.lastname;                                                    
                            let index = [];
                            index = this.finalemailsendarray.filter(
                              (s) => s.name.indexOf((ele2.firstname + " " + ele2.lastname)) !== -1
                            );
                            if(index.length == 0){
                              this.finalemailsendarray.push(ele2);
                            }
                          });
                          if(grouplength == recordlen){
                            // console.log("this.finalemailsendarray : ", this.finalemailsendarray);
                            this.sendNotificationEmail('Notification Email');
                          }
                        } 
                      }
                    }
                  },
                  (err) => {
                    this.clsUtility.LogError(err);
                  }
                );
              });
            } else {
              if(this.finalemailsendarray.length > 0 ) {
                // console.log("this.finalemailsendarray : ", this.finalemailsendarray);
                this.sendNotificationEmail('Notification Email');
              } else {
                setTimeout(() => {
                  this.getFileDistributionReport();
                  this.mySelection = [];  
                  this.recordslist = [];
                  this.scomment = "";    
                  this.filedistributionid = "";
                  this.fileshareid = "";
                }, 1000);
              }             
            }

          }
        }
      } else {
        setTimeout(() => {
          this.getFileDistributionReport();
          this.mySelection = [];  
          this.recordslist = [];
          this.scomment = "";    
          this.filedistributionid = "";
          this.fileshareid = "";
        }, 1000);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sendNotificationEmail(Title: String){
    try {
      var objMailSend = new MailSend();

      if(this.finalemailsendarray != null && this.finalemailsendarray != undefined){
        if(this.finalemailsendarray.length > 0) {
          let seq = this.api.get_email("EmailConfigurationByTitle/" + Title);
          this.subscription.add(
            seq.subscribe((res) => {
              let response = res;
              if (response != null && response != undefined) {                
                this.resultarray = response["content"];
    
                if (this.resultarray != null || this.resultarray != undefined) {
                  this.result = this.resultarray[0];
                  objMailSend.FromEmail = this.result.emailfrom.toString();
                  objMailSend.FromPassword = "";
    
                  // objMailSend.FromPassword = this.clsUtility
                  // .decryptAES(this.result.frompassword.toString())
                  // .toString();

                  this.finalemailsendarray.forEach(async record => {                    
                    if (
                      this.result.emailsubject == null ||
                      this.result.emailsubject == undefined ||
                      this.result.emailbody == null ||
                      this.result.emailbody == undefined
                    ) {
                      this.clsUtility.showError(
                        "Email Configuration not proper. Please contact system administrator."
                      );                    
                      return;
                    } else {           
                      objMailSend.Subject = this.result.emailsubject;
                      
                      this.currenturl = window.location.href;                      
                      if(!(this.currenturl.includes(this.filedistributionid, 0))) {
                        var array: string[] = this.currenturl.split("#/filedistribution/");
                        if(array.length > 1){
                          this.currenturl = array[0] + "#/filedistribution"; 
                        }   
                        this.currenturl = this.currenturl + "/" + this.fileclientid + "/" + this.fileprocessdate + "/" + this.filedistributionid + "/";                   
                      } else {
                        this.currenturl = this.currenturl;
                      }                     
                      
                      var semailbody = this.result.emailbody;
                      semailbody = semailbody.replace(
                        "{{mentionusername}}",
                        record.firstname
                      );

                      semailbody = semailbody.replace(
                        "{{mentionbyusername}}",
                        this.currentusername
                      );

                      semailbody = semailbody.replace(
                        "{{fileshareid}}",
                        this.fileshareid
                      );

                      semailbody = semailbody.replace(
                        "{{url}}",
                        this.currenturl
                      );

                      semailbody = semailbody.replace(
                        "{{comment}}",
                        this.scomment
                      );
                      objMailSend.Body = semailbody;
                    }

                    if (
                      this.result.emailtoreceive != null ||
                      this.result.emailtoreceive != undefined
                    ) {
                      objMailSend.To = "";
                      objMailSend.To = record.email.toString().replace(/,/g, ";");                    
                    }

                    if (
                      this.result.emailccreceive != null ||
                      this.result.emailccreceive != undefined
                    ) {
                      objMailSend.Cc = this.result.emailccreceive
                        .toString()
                        .replace(/,/g, ";");
                    }
                       
                    let v2: any ={
                      filedistributionid: this.filedistributionid,
                      mentionuser: record.name,
                      mentionuserid: record.userid,
                      mentionby: this.currentusername,
                      mentionbyuserid: this.currentuserid,
                      groupid: "0",
                      groupname: ""
                    }
                    this.recordslist.push(v2);
                    // setTimeout(() => {}, 500);
                    // console.log("objMailSend : ", objMailSend);
                    // this.subscription.add(
                     await this.coreService
                        .sendMail1(objMailSend)
                        .toPromise()
                        .then(
                          (response) => {
                            if (response) {                              
                              // this.clsUtility.showSuccess(response.status);                              
                              // this.mySelection = [];                               
                              this.api.insertActivityLog(
                                this.currentusername + " mention user: " + record.name + " in a comment for FileShareid: " + this.fileshareid,
                                "File Distribution Report",
                                "READ"
                              );                              
                            }
                          },
                          (err) => {
                            // this.clsUtility.showError("Error in mail send");   
                            console.log("Error in mail send");                          
                            // this.mySelection = [];                           
                          }
                        )
                    // );

                  });
                      
                } else {
                  this.clsUtility.showInfo(
                    "Title 'Notification Email' is not registered in email configuration."
                  );                  
                }
              }

              setTimeout(() => {
                // console.log("this.recordlist : ", this.recordslist);
                this.insertnotificationdetails(this.recordslist);
                this.getFileDistributionReport();
                this.mySelection = [];  
                this.scomment = "";    
                this.filedistributionid = "";                
                this.recordslist = [];
                this.mentiondusers = [];
                this.mentiongroups = [];
              }, 2000);
            })
          );
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  insertnotificationdetails(listarray: any[]){
    try {
      this.subscription.add(
        this.filedetailService
          .InsertNotificationDetails(            
            listarray
          )
          .subscribe(
            (data) => {  
              if (
                data != null &&
                data != undefined
              ) {
                this.notificationresponse = data;                 
              } else {
                this.notificationresponse = [];                
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

}
