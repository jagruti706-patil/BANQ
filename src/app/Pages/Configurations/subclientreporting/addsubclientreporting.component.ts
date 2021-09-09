import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Api } from "./../../../Services/api";
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
import { AllConfigurationService } from "src/app/Services/all-configuration.service";
import { SubSink } from "subsink";
import { isNullOrUndefined } from "util";
import { clsSubclientReporting }from "./clsSubclientReporting";
import { DatePipe } from "@angular/common";
import { DatatransaferService } from "src/app/Services/datatransafer.service";

@Component({
  selector: 'app-addsubclientreporting',
  templateUrl: './addsubclientreporting.component.html',
  styleUrls: ['./addsubclientreporting.component.css']
})
export class AddsubclientreportingComponent implements OnInit, OnDestroy {

  private clsUtility: Utility;
  public toggleme: any;
  public subscription = new SubSink();
  frmreporting: FormGroup;
  
  formtitle: string = "Add Practice Reporting";
  buttonCaption: string = "Add Practice Reporting";
  isaddmode: boolean = true;
  public loading = false;
  subClientList: any = [];
  SelectAllSubClients: any = [];
  selectedsubclientid: number = 0;
  selectedsubclientcode: string = "";
  selectedsubclientname: string = "";
  selectedbillinglocationcode: string = "";
  public sAllDivision: any;
  public SelectAllDivision: any;
  public sSelectedDivisionID: string = "";
  spliteparameterslist: any = [];
  Allspliteparameterslist: any = [];
  selectedsplitparameter: string = "";
  selectedsplitparametervalue: string = "";
  selectedsplitparametervaluename: string = "";
  selectedsplitparamid: string = "";
  disablesubclient: boolean = true;
  disablesplitparametername: boolean = true;
  disablesplitparametervalue: boolean = true;
  disablesavebutton: boolean = false;
  arrSplitParameter: any;
  AllarrSplitParameter: any = [];
  objaddreporting = new clsSubclientReporting();
  public currentuserid: string = "0";
  public currentusername: string = "";
  public defaultItemsplitparametervalue: { splitparametervalue: string, splitparameterid: string } =  { splitparametervalue: "Select", splitparameterid: "" };
  public defaultItemsplitparametername: { text: string, value: string } = { text: "Select", value: "" };
  public defaultItemsubClient: { subclientname: string, subclientid: number } = { subclientname: "Select", subclientid: 0 };
  public defaultItemdivision: { subclientdivisioncode: string } = { subclientdivisioncode: "Select" };

  public ssplitparamtername: any = [
    // { value: "", text: "All" },
    { value: "Claim Prefix", text: "Claim Prefix" },
    { value: "Claim Suffix", text: "Claim Suffix" },
    { value: "Claim Pattern", text: "Claim Pattern" },
    { value: "RenderingNPI", text: "RenderingNPI" },
    { value: "RenderingName", text: "RenderingName" },    
    { value: "NA", text: "NA" }
  ];

  // Received Input from parent component
  @Input() InputPracticeReportingid: any;

  // Send Output to parent component
  @Output() OutputPracticeReportingEditResult = new EventEmitter<boolean>();

  OutputpracticereportingEditResult(data: any) {
    let outpracticereportingEditResult = data;
    this.OutputPracticeReportingEditResult.emit(outpracticereportingEditResult);
  }

  constructor(fb: FormBuilder,
    private _router: Router,
    private _routeParams: ActivatedRoute,
    public api: Api,   
    private toaster: ToastrService, private allConfigService: AllConfigurationService,    private dataService: DatatransaferService) {
      this.clsUtility = new Utility(toaster);

      this.frmreporting = fb.group({        
        fcSubClient: [""],    
        fcDivision: [""],    
        fcSplitparametername: [""],  
        fcSplitparametervalue: [""],  
        fcGroup: [""],
        fcGroupName: [""],  
      });
    }

  ngOnInit() {
    try {
      this.currentuserid = this.dataService.SelectedUserid;
      this.currentusername = this.dataService.loginName["_value"];      
      // this.getsubClientlist();
      this.getAllDivision();     

      if (
        this.InputPracticeReportingid != null &&
        this.InputPracticeReportingid != 0
      ) {
        this.formtitle = "Edit Practice Reporting";
        this.buttonCaption = "Update Practice Reporting";
        this.isaddmode = false;        
      } else {
        this.formtitle = "Add Practice Reporting";
        this.buttonCaption = "Add Practice Reporting";
        this.isaddmode = true;                 
      }

      this.subscription.add(
        this.allConfigService.toggleSidebar.subscribe(isToggle => {
          this.toggleme = isToggle;
        })
      );
    } catch (error) {
      this.clsUtility.LogError("ngOnInit " + error);
    }
  }

  ngOnChanges() {
    try {
      if (
        this.InputPracticeReportingid != null &&
        this.InputPracticeReportingid != 0
      ) {
        this.formtitle = "Edit Practice Reporting";
        this.buttonCaption = "Update Practice Reporting";
        this.isaddmode = false;        
      } else {
        this.formtitle = "Add Practice Reporting";
        this.buttonCaption = "Add Practice Reporting";
        this.isaddmode = true;                 
      }
    } catch (error) {
      this.clsUtility.LogError("ngOnChanges " + error);
    }
  }

  togglesidebar() {
    this.allConfigService.toggleSidebar.next(!this.toggleme);
  }

  ngOnDestroy() {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError("ngOnDestroy " + error);
    }
  }

  getAllDivision(client: string = "0") {
    try {
      class division {
        subclientdivisioncode: string;
      }
      let getdivision: { clientid: string; } = {
        clientid: client       
      };
      let seq = this.api.post("GetDivisionCode", getdivision);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.sAllDivision = res;
            if (
              !isNullOrUndefined(this.sAllDivision) &&
              this.sAllDivision.length > 0
            ) {
              const Alldiv = new division();             
              this.SelectAllDivision = this.sAllDivision;            
            } else {
              this.sAllDivision = [];  
              this.disablesubclient = true; 
              this.loading = false;              
              this.clsUtility.showInfo("No Divisioncode/Practice is available");
            }
          },
          (err) => {
            this.loading = false;         
            this.clsUtility.LogError("getAllDivision " + err);
          }
        )
      );
    } catch (error) {
      this.loading = false;   
      this.clsUtility.LogError("getAllDivision " + error);
    }
  }

  onDivisionChange(event: any) {
    try {      
      if (event == undefined || event == "" || event == "Select") {
        this.clsUtility.showWarning("Please Select Division");
        
        this.disablesubclient = true;
        this.subClientList = [];
        this.SelectAllSubClients = this.subClientList; 
        this.frmreporting.controls.fcSubClient.reset(); 
        this.disablesplitparametername = true;
        this.disablesplitparametervalue = true;
        this.selectedsplitparameter = "";
        this.frmreporting.controls.fcSplitparametername.reset();
        this.selectedsplitparametervalue = "";
        this.selectedsplitparametervaluename = "";
        this.selectedsplitparamid = "";
        this.frmreporting.controls.fcSplitparametervalue.reset();
        this.disablesplitparametervalue = true;
        this.arrSplitParameter = [];
        this.AllarrSplitParameter = [];        
      } else {
        this.sSelectedDivisionID = event;   
        this.disablesubclient = true;     
        this.getsubClientlist();
      }
    } catch (error) {
      this.clsUtility.LogError("onDivisionChange " + error);
    }
  }

  handleDivisionFilter(value) {
    try {
      if(value != null && value != undefined){
        this.sAllDivision = this.SelectAllDivision.filter(
          (s) =>
            s.subclientdivisioncode.toLowerCase().indexOf(value.toLowerCase()) !==
            -1
        );
      }
    } catch (error) {
      this.clsUtility.LogError("onDivisionChange " + error);
    }
  }

  getsubClientlist() {
    try {
      let getsubclient: {
        subclientcode: string;
        clientid: string;
        subclientdivisioncode: string;
        subclientstatus: boolean;    
      } = {
        subclientcode: "",
        clientid: "0",
        subclientdivisioncode: this.sSelectedDivisionID,
        subclientstatus: true     
      };
      let seq = this.api.post("SubClient/GetSubClient", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            if (res != null || res != undefined) {
              this.disablesubclient = false;
              this.subClientList = res;
              this.frmreporting.controls.fcSubClient.reset(); 
              if(this.subClientList.length > 0){
                this.SelectAllSubClients = this.subClientList;  
                this.disablesplitparametername = false;
                this.disablesplitparametervalue = true;
                this.selectedsplitparameter = "";
                this.frmreporting.controls.fcSplitparametername.reset();
                this.selectedsplitparametervalue = "";
                this.selectedsplitparametervaluename = "";
                this.selectedsplitparamid = "";
                this.frmreporting.controls.fcSplitparametervalue.reset();
                this.disablesplitparametervalue = true;
                this.arrSplitParameter = [];
                this.AllarrSplitParameter = [];
              }              
            } else {
              this.disablesubclient = true;
              this.subClientList = [];
              this.SelectAllSubClients = this.subClientList; 
              this.frmreporting.controls.fcSubClient.reset(); 
              this.disablesplitparametername = true;
              this.disablesplitparametervalue = true;
              this.selectedsplitparameter = "";
              this.frmreporting.controls.fcSplitparametername.reset();
              this.selectedsplitparametervalue = "";
              this.selectedsplitparametervaluename = "";
              this.selectedsplitparamid = "";
              this.frmreporting.controls.fcSplitparametervalue.reset();
              this.disablesplitparametervalue = true;
              this.arrSplitParameter = [];
              this.AllarrSplitParameter = [];
              this.clsUtility.showInfo("No group/practice is mapped to user");
            }
          },
          (err) => {
            this.clsUtility.LogError("getsubClientlist " + err);
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError("getsubClientlist " + error);
    }
  }

  handleFilter(value) {
    try {
      if(value != null && value != undefined ){
        if(this.SelectAllSubClients != null && this.SelectAllSubClients != undefined){
          if(this.SelectAllSubClients.length > 0){
            this.subClientList = this.SelectAllSubClients.filter(
              (s) => s.subclientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
            );
          }
        }
      }
    } catch (error) {
      this.clsUtility.LogError("handleFilter " + error);
    }
  }

  OnchangePractice(event: any){
    try { 
      if(event != null && event != undefined && event != 0)  {
        this.selectedsubclientid = event;

        if(this.selectedsubclientid != null && this.selectedsubclientid != undefined && this.selectedsubclientid != 0){                
          this.selectedsubclientcode = this.subClientList.find(obj => obj.subclientid == this.selectedsubclientid).subclientcode;
          this.selectedsubclientname = this.subClientList.find(obj => obj.subclientid == this.selectedsubclientid).subclientname;
          this.selectedbillinglocationcode = this.subClientList.find(obj => obj.subclientid == this.selectedsubclientid).billinglocationcode;

          this.selectedsplitparameter = "";
          this.frmreporting.controls.fcSplitparametername.reset();
          this.selectedsplitparametervalue = "";
          this.selectedsplitparametervaluename = "";
          this.selectedsplitparamid = "";
          this.frmreporting.controls.fcSplitparametervalue.reset();
          this.disablesplitparametervalue = true;
          this.arrSplitParameter = [];
          this.AllarrSplitParameter = [];
        }
      } else {
          this.selectedsplitparameter = "";
          this.frmreporting.controls.fcSplitparametername.reset();
          this.selectedsplitparametervalue = "";
          this.selectedsplitparametervaluename = "";
          this.selectedsplitparamid = "";
          this.frmreporting.controls.fcSplitparametervalue.reset();
          this.disablesplitparametervalue = true;
          this.arrSplitParameter = [];
          this.AllarrSplitParameter = [];
      }
    } catch (error) {
      this.clsUtility.LogError("OnchangePractice " + error);
    }    
  }

  onSaveorUpdateClick(){
    try {
      if(this.validatePracticeReporting()){
        this.disablesavebutton = true;
        this.objaddreporting = new clsSubclientReporting();

        this.objaddreporting.id = "";
        this.objaddreporting.splitparmid = this.selectedsplitparamid;
        this.objaddreporting.subclientid = this.selectedsubclientid;
        this.objaddreporting.subclientcode = this.selectedsubclientcode;
        this.objaddreporting.subclientdivisioncode = this.sSelectedDivisionID;
        this.objaddreporting.billinglocationcode = this.selectedbillinglocationcode;
        this.objaddreporting.subclientname = this.selectedsubclientname;
        this.objaddreporting.splitparametername = this.selectedsplitparameter;

        if(this.selectedsplitparameter == "Claim Prefix" || this.selectedsplitparameter == "Claim Suffix" || this.selectedsplitparameter == "Claim Pattern") {
          this.objaddreporting.splitparametervalue = this.selectedsplitparametervaluename;
        } else {
          this.objaddreporting.splitparametervalue = this.selectedsplitparametervalue;
        }   
             
        this.objaddreporting.reportinggroup = this.frmreporting.controls.fcGroup.value.trim();
        this.objaddreporting.reportinggroupname = this.frmreporting.controls.fcGroupName.value.trim();

        const datepipe = new DatePipe("en-US");
        const currentDate = datepipe.transform(
          Date.now(),
          "yyyy-MM-ddTHH:mm:ss.SSSZ"
        );      
        this.objaddreporting.dtcreateddate = currentDate;      
        this.objaddreporting.dtmodifieddate = currentDate;

        this.objaddreporting.createduserid = this.currentuserid;
        this.objaddreporting.createdbyusername = this.currentusername;      

        let seq = this.api.post("SubClient/SaveSubClientReporting", this.objaddreporting);
        this.subscription.add(
          seq.subscribe(
            (res) => {
              if (res != null || res != undefined) {
                if(res == 1){
                  this.clsUtility.showSuccess("Practice Reporting saved successfully.");
                  this.disablesavebutton = false;
                  this.api.insertActivityLog(
                    "Practice Reporting Added for (" + this.selectedsubclientname + ")",
                    "Practice Reporting",
                    "ADD"
                  );

                  this.OutputpracticereportingEditResult(true);

                } else if (res == 2 ){
                  this.clsUtility.showInfo("Duplicate Practice Reporting");
                  // this.OutputpracticereportingEditResult(false);
                } else if ( res == 0 ) {
                  this.clsUtility.showError("Error while saving Practice Reporting");
                  this.OutputpracticereportingEditResult(false);
                } 
              }
            },
            (err) => {
              this.clsUtility.LogError("onSaveorUpdateClick " + err);
            }
          )
        );
      } else {

      }
    } catch (error) {
      this.clsUtility.LogError("onSaveorUpdateClick " + error);
    }
  }

  ResetComponents() {
    try {     
      this.disablesubclient = true;
      this.disablesplitparametername = true;
      this.disablesplitparametervalue = true;
      this.selectedsubclientid = 0;
      this.selectedsplitparametervalue = "";            
      this.selectedsubclientcode = "";
      this.sSelectedDivisionID = "";
      this.selectedbillinglocationcode = "";
      this.selectedsubclientname = "";
      this.selectedsplitparameter = "";
      this.selectedsplitparametervaluename = "";   
      this.selectedsplitparamid = "";
      this.defaultItemsplitparametervalue = {splitparametervalue: "Select", splitparameterid: ""};            
      this.frmreporting.reset();     
      this.InputPracticeReportingid = null;
      this.disablesavebutton = false;
    } catch (error) {
      this.clsUtility.LogError("ResetComponents " + error);
    }
  }

  OnClose() {
    try {
      this.frmreporting.reset();     
      this.OutputpracticereportingEditResult(false);
    } catch (error) {
      this.clsUtility.LogError("OnClose " + error);
    }
  }

  handleFilterSplitParameter(value) {
    try {
    
    } catch (error) {
      this.clsUtility.LogError("handleFilterSplitParameter " + error);
    }
  }

  OnchangeSplitParameter(event: any){
    try {
      if(this.selectedsubclientid != 0){ 
        if(event != null && event != undefined && event != ""){
          this.selectedsplitparameter = event;
          if(this.selectedsplitparameter != 'NA'){
            this.getSplitParametersValue();
          } else if(this.selectedsplitparameter == 'NA') {
            this.getSplitParametersValue();
            this.arrSplitParameter = [];
            this.disablesplitparametervalue = true;
            this.AllarrSplitParameter = this.arrSplitParameter;
            this.selectedsplitparametervalue = "";
            this.frmreporting.controls.fcSplitparametervalue.reset();
          } else {
            this.arrSplitParameter = [];
            this.disablesplitparametervalue = true;
            this.AllarrSplitParameter = this.arrSplitParameter;
            this.selectedsplitparametervalue = "";
            this.frmreporting.controls.fcSplitparametervalue.reset();
          }       
        }
      } else {
        this.clsUtility.showInfo("Please select practice");
        this.selectedsplitparameter = "";
        this.frmreporting.controls.fcSplitparametername.reset();
        this.selectedsplitparametervalue = "";
        this.selectedsplitparametervaluename = "";
        this.selectedsplitparamid = "";
        this.frmreporting.controls.fcSplitparametervalue.reset();
        this.disablesplitparametervalue = true;
        this.arrSplitParameter = [];
        this.AllarrSplitParameter = [];
      }
    } catch (error) {
      this.clsUtility.LogError("OnchangeSplitParameter " + error);        
    }
  }

  getSplitParametersValue() {
    try {
      let para: {        
        subclientid: number, splitparametervalue: string     
      } = {
        subclientid: this.selectedsubclientid, splitparametervalue: this.selectedsplitparameter
      };
      let seq = this.api.post("SubClient/GetSubclientSplitparametervalue", para);
      this.subscription.add(
        seq.subscribe(
          (res) => {             
            this.arrSplitParameter = res;
            
            if (
              this.arrSplitParameter != null &&
              this.arrSplitParameter != undefined &&
              this.arrSplitParameter.length > 0
            ) {
              if(this.selectedsplitparameter != 'NA') {
                this.disablesplitparametervalue = false;
                this.AllarrSplitParameter = this.arrSplitParameter;
                this.selectedsplitparametervalue = "";
                this.defaultItemsplitparametervalue = {splitparametervalue: "Select", splitparameterid: ""};
                this.frmreporting.controls.fcSplitparametervalue.reset();
              } else if(this.selectedsplitparameter == 'NA') { 
                this.frmreporting.controls.fcSplitparametervalue.reset();                                       
                this.disablesplitparametervalue = true;                
                this.selectedsplitparametervalue = this.selectedsubclientname;
                this.defaultItemsplitparametervalue = {splitparametervalue: this.selectedsplitparametervalue, splitparameterid: this.selectedsplitparametervalue};                
                this.selectedsplitparamid = this.arrSplitParameter[0].splitparmid;
                this.arrSplitParameter = [];   
                this.AllarrSplitParameter = this.arrSplitParameter;
              }
            } else {
              this.arrSplitParameter = [];
              this.disablesplitparametervalue = true;
              this.AllarrSplitParameter = this.arrSplitParameter;
              this.selectedsplitparametervalue = "";
              this.frmreporting.controls.fcSplitparametervalue.reset();
              this.clsUtility.showInfo("No split parameter value present");
            }
          },
          (err) => {
            this.clsUtility.LogError("getSplitParametersValue " + err);
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError("getSplitParametersValue " + error);
    }
  }

  handleFilterSplitParametervalue(value) {
    try {
      if(value != null && value != undefined){
        if(this.AllarrSplitParameter != null && this.AllarrSplitParameter != undefined){
          if(this.AllarrSplitParameter.length > 0){
            this.arrSplitParameter = this.AllarrSplitParameter.filter(
              (s) => s.splitparametervalue.toLowerCase().indexOf(value.toLowerCase()) !== -1
            );
          }
        }
      }
    } catch (error) {
      this.clsUtility.LogError("handleFilterSplitParametervalue " + error);
    }
  }

  OnchangeSplitParametervalue(event: any){
    try {  
      if (event != null && event != undefined && event != ""){ 
        if(this.selectedsubclientid != 0){
          this.selectedsplitparametervalue = event;

          if(this.selectedsplitparametervalue != null && this.selectedsplitparametervalue != undefined){
            this.selectedsplitparametervaluename = this.arrSplitParameter.find(x => x.splitparameterid == this.selectedsplitparametervalue).splitparametervalue;
            this.selectedsplitparamid = this.arrSplitParameter.find(x => x.splitparameterid == this.selectedsplitparametervalue).splitparmid;
          }
        } else {

        }
      }      
    } catch (error) {
      this.clsUtility.LogError("OnchangeSplitParametervalue " + error);        
    }
  }

  validatePracticeReporting() {
    try { 
      if (    
        this.sSelectedDivisionID != "" &&
        this.sSelectedDivisionID != null &&
        this.sSelectedDivisionID != undefined &&    
        this.sSelectedDivisionID != "Select" && 
        this.selectedsubclientid != 0 &&
        this.selectedsubclientid != null &&
        this.selectedsubclientid != undefined &&
        this.selectedsplitparameter != "" &&
        this.selectedsplitparameter != null &&
        this.selectedsplitparameter != undefined &&
        this.selectedsplitparametervalue != "" &&
        this.selectedsplitparametervalue != null &&
        this.selectedsplitparametervalue != undefined &&
        this.frmreporting.controls.fcGroup.value != null &&
        this.frmreporting.controls.fcGroup.value != undefined && 
        this.frmreporting.controls.fcGroupName.value != null &&
        this.frmreporting.controls.fcGroupName.value != undefined 
      ) {
        if(
            this.frmreporting.controls.fcGroup.value.trim() != "" &&
            this.frmreporting.controls.fcGroupName.value.trim() != ""
          ) {
            return true;
          } else {
            return false;
          }        
      } else {
        return false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

}
