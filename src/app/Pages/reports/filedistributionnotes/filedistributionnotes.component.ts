import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { ToastrService } from "ngx-toastr";
import { Utility } from "src/app/Model/utility";
import { SubSink } from "subsink";
import { Api } from "src/app/Services/api";
import {
  GridDataResult,
  DataStateChangeEvent,
  PageChangeEvent,
} from "@progress/kendo-angular-grid";
import { isNullOrUndefined } from "util";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { clsPermission } from "../../../Services/settings/clspermission";

@Component({
  selector: 'app-filedistributionnotes',
  templateUrl: './filedistributionnotes.component.html',
  styleUrls: ['./filedistributionnotes.component.css']
})
export class FiledistributionnotesComponent implements OnInit {

  private clsUtility: Utility;
  private subscription = new SubSink();  
  public SelectsubclientLoading = false;
  public SelectsubclientList: any;
  public SelectsubclientGridView: GridDataResult;
  public Selectedsubclient: any[] = [];
  public SelectsubclientCallback = (args) => args.dataItem;
  public mode = "single";
  public pagesize = 50;
  public percentage: number = 0;
  public isFilesProcessing: boolean = false;
  public disbablesend: boolean = true;
  public clsPermission: clsPermission;

  public historysort: SortDescriptor[] = [
    {
      field: "dtimportdate",
      dir: "desc",
    },
  ];

  // Received Input from parent component
  @Input() InputFileDistributionId: any;
  @Input() InputFileId: any;  
  @Input() InputAuditLogstr: string; 

  // Send Output to parent component
  @Output() OutputSelectFileHistoryResult = new EventEmitter<boolean>();

  OutputSelectcheckHistory(data: any) {
    let outSelecthistoryid = data;
    this.OutputSelectFileHistoryResult.emit(outSelecthistoryid);
  }

  constructor(private toastr: ToastrService,
    private api: Api,
    private dataService: DatatransaferService,
    private cdr: ChangeDetectorRef, private filedetailService: FileDetailsService) { }

  ngOnInit() {
    try {     
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );
      
      this.SelectsubclientList = null;
      this.SelectsubclientGridView = null;       
      if (
        isNullOrUndefined(this.InputFileDistributionId) &&
        isNullOrUndefined(this.InputFileId) 
      ) {
        this.ResetComponents();
      }
      this.ResetComponents();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {
    try { 
      this.SelectsubclientList = null;
      this.SelectsubclientGridView = null;       
      if (       
        isNullOrUndefined(this.InputFileDistributionId) &&
        isNullOrUndefined(this.InputFileId)  
      ) {
        this.ResetComponents();
      } else {
        this.gethistorylist();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public ResetComponents() {
    try {
      this.InputFileDistributionId = null;     
      this.InputFileId = null; 
      this.SelectsubclientList = [];
      this.SelectsubclientGridView = null;    
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  gethistorylist(){
    try {
      this.subscription.add(
        this.filedetailService
          .FileDistributionNotes(
            this.InputFileDistributionId,
            this.InputFileId                          
          )
          .subscribe(
            (data) => {                
              if (
                !isNullOrUndefined(data)
              ) {
                this.SelectsubclientGridView = null;
                this.SelectsubclientList = null;
                this.SelectsubclientList = data['content'];
               
                if (
                  this.SelectsubclientList != null &&
                  this.SelectsubclientList != undefined &&
                  this.SelectsubclientList.length > 0
                ) {
                  this.SelectsubclientLoading = false;

                  this.api.insertActivityLog(
                    this.InputAuditLogstr,
                    "File Distribution Report",
                    "READ"
                  );

                  this.SelectsubclientloadItems();
                } else {
                  this.SelectsubclientLoading = false;
                }
              } else {                 
                this.SelectsubclientLoading = false;                  
              }
            },
            (err) => {
              this.SelectsubclientLoading = false;
            }
          )
      );
    } catch (error) {
      this.SelectsubclientLoading = false;
      this.clsUtility.LogError(error);
    }
  }

  private SelectsubclientloadItems(): void { 
    this.SelectsubclientGridView = null;
    try {
      if (!isNullOrUndefined(this.SelectsubclientList)) {
        if (this.SelectsubclientList.length > 0) {
          this.SelectsubclientGridView = {
            data: orderBy(this.SelectsubclientList, this.historysort),
            total: this.SelectsubclientList.length,
          };
        }
      }
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

  OnClose() {
    try {
      this.OutputSelectcheckHistory(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

}
