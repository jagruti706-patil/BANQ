import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy, ViewChild, ViewChildren } from "@angular/core";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Api } from "src/app/Services/api";
declare var $: any;
import { clsPermission } from "src/app/Services/settings/clspermission";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Observable } from "rxjs";
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from "@angular/forms";
import { GridComponent } from '@progress/kendo-angular-grid';
import { async } from '@angular/core/testing';
// import { nextContext } from '@angular/core/src/render3';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-checkwiseeobreport',
  templateUrl: './checkwiseeobreport.component.html',
  styleUrls: ['./checkwiseeobreport.component.css']
})
export class CheckwiseeobreportComponent implements OnInit {
  
  private clsUtility: Utility;
  private subscription = new SubSink();
  public clsPermission: clsPermission;

  public EOBReportItems: any[] = [];
  public EOBReportSVC: any[] = [];
  public EOBReportSVCGridView: GridDataResult;
  public EOBReportSVClineSkip = 0;
  public EOBReportSVClinepagesize: number = 50;

  public exportfilename: string = ""; 
  public echeckno: string = "";
  public eclaimno: string = "";
  public displayreport: boolean = false;
  public disabledbutton: boolean = true;
  public sclaimno: string = ""; 
  public showreport: boolean = false;
  public reportloading: boolean = false;
  public exportloading: boolean = false;
  public patientinfo: Observable<GridDataResult>;
  public exportpatientinfo: Observable<GridDataResult>;
  public exportpatientinfoalldata: any = [];
  public exportpatientinfoalldatamaxlength: any = [];
  public exportcheckinfoalldata: any = [];
  public exportpatientinfoflag: boolean = false;
  public sSkip: number = 0;
  public spagesize: number = 50;
  public clientname: string = "";
  public subclientname: string = "";
  public pdfdownloadclick: boolean = false;
  public renderingproviderNameNpi: string = "";

  equalStr = [];  
  
  public sortMaster: SortDescriptor[] = [
    {
      field: "clientid",
      dir: "asc"
    }
  ];

  @ViewChild("pdfViewerAutoLoad") pdfViewer;
  loadingPDF: boolean = false;

  // Received Input from parent component
  @Input() InputCheckSplitfileid: any;
  @Input() InputCheckComponentname: any;
  @Input() InputCheckERAfileid: any;
  @Input() InputCheckFilename: any; 

  // Send Output to parent component
  @Output() OutputViewEobReportResultCheck = new EventEmitter<boolean>();

  OutputResult(data: any) {
    let outResult = data;
    this.OutputViewEobReportResultCheck.emit(outResult);
  }

  ExportPDFDownloadConfirmationMessage: string = "";
  IncompleteInfoGroup = this.formBuilder.group({});

  constructor(private toastr: ToastrService, 
    private filedetailService: FileDetailsService, 
    private api: Api, 
    private dataService: DatatransaferService,
    private formBuilder: FormBuilder) { 
    this.clsUtility = new Utility(toastr);
  }

  ngOnInit() {
    try{    
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          value => (this.clsPermission = value)
        )
      );

      if( this.InputCheckSplitfileid != null &&
        this.InputCheckSplitfileid != 0 && 
        this.InputCheckERAfileid != null && this.InputCheckERAfileid != 0 &&      
        this.InputCheckFilename != null) { 
          this.reportloading = true;
          this.showreport = false;       
          this.getCheckEOBReport();
      } 
    } catch (error) {
      this.reportloading = false;
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {    
    try{      
      if( this.InputCheckSplitfileid != null &&
        this.InputCheckSplitfileid != 0 && 
        this.InputCheckERAfileid != null && this.InputCheckERAfileid != 0 &&      
        this.InputCheckFilename != null) {      
          this.reportloading = true;
          this.showreport = false;      
          this.getCheckEOBReport();
      }
    } catch (error) {
      this.reportloading = false;
      this.clsUtility.LogError(error);
    }
  }

  getCheckEOBReport() {
    this.EOBReportItems = [];    

    try {
      this.disabledbutton = true;
      
      this.subscription.add(
        this.filedetailService
          .getCheckEOBReport(this.InputCheckSplitfileid, this.InputCheckERAfileid)
          .subscribe(
            data => {  
              if(data != null && data != undefined && Object.keys(data).length !== 0) {
                this.EOBReportItems = data;
               
                if (this.EOBReportItems != null && this.EOBReportItems != undefined) {
                  if (this.EOBReportItems.length > 0) {  
                    this.showreport = true;
                    // this.reportloading = false;

                    this.clientname = this.EOBReportItems[0].clientname;
                    this.subclientname = this.EOBReportItems[0].subclientname;
                    
                    this.echeckno = this.EOBReportItems["0"].payerandcheck["0"].checknumber;                   
                    this.exportfilename = this.echeckno + ".pdf";

                    if (this.EOBReportItems["0"].otherdetails["0"].renderringprovider != null){
                      this.EOBReportItems["0"].otherdetails["0"].renderringprovider = this.EOBReportItems["0"].otherdetails["0"].renderringprovider.trim();
                    } else {
                      this.EOBReportItems["0"].otherdetails["0"].renderringprovider = "";
                    }                    
                    
                    if (this.EOBReportItems["0"].otherdetails["0"].renderingnpi != null) {
                      this.EOBReportItems["0"].otherdetails["0"].renderingnpi = this.EOBReportItems["0"].otherdetails["0"].renderingnpi.trim();
                    } else {
                      this.EOBReportItems["0"].otherdetails["0"].renderingnpi = "";
                    }
                    
                    if(this.EOBReportItems["0"].otherdetails["0"].renderringprovider != ''){
                      this.renderingproviderNameNpi = this.EOBReportItems["0"].otherdetails["0"].renderringprovider;
                      if(this.EOBReportItems["0"].otherdetails["0"].renderingnpi != ''){
                        this.renderingproviderNameNpi  = this.renderingproviderNameNpi  + '(' + this.EOBReportItems["0"].otherdetails["0"].renderingnpi + ')';
                      }                      
                    } else if(this.EOBReportItems["0"].otherdetails["0"].renderringprovider == ''){
                      this.renderingproviderNameNpi = this.EOBReportItems["0"].otherdetails["0"].renderingnpi;
                    }

                    this.api.insertActivityLog(
                      "ERA EOB Report Viewed for file (" + this.InputCheckFilename + ")",
                      this.InputCheckComponentname,
                      "READ"
                    );

                    for(let i = 0; i < this.EOBReportItems["0"].otherdetails.length; i++){
                      this.EOBReportItems["0"].otherdetails[i].arrayindex = i + 1;
                    }
                   
                    this.patientinfo = this.EOBReportItems["0"].otherdetails;
                    this.exportpatientinfo = this.EOBReportItems["0"].otherdetails;

                    if(this.InputCheckFilename != ""){
                      this.equalStr = this.InputCheckFilename.match(/.{1,75}/g);
                    }     
                    
                    if(this.EOBReportItems != null && this.EOBReportItems != undefined) {
                      if(this.EOBReportItems.length != 0) {
                        this.exportpatientinfoalldata = [...this.EOBReportItems["0"].otherdetails]; 
                        
                        this.exportpatientinfoalldata = this.exportpatientinfoalldata.sort(function (a, b) { 
                          if(a.charges != null && b.charges != null){
                              var nameA = a.charges.length, nameB = b.charges.length
                              if (nameA < nameB) //sort string ascending
                                return -1
                              if (nameA > nameB)
                                return 1
                            }
                          return 0
                          }
                        );    
                        
                        this.exportpatientinfoalldata.forEach((element, i) => { 
                          element.arrayindex = i + 1;            
                          element.displayitem = true;                       
              
                          if(element.charges != null){
                            if(element.charges.length > 20){
                              this.exportpatientinfoalldatamaxlength.push(element); 
                              element.displayitem = false;                 
                            }
                          }
                        });
                        
                        this.exportpatientinfoalldata = this.exportpatientinfoalldata.filter(a => a.displayitem == true);    
                        this.exportpatientinfoalldata.forEach(ele => {
                          if (ele.renderingnpi == null ) {
                            ele.renderingnpi = "";
                          }
                          if (ele.renderringprovider == null ) {
                            ele.renderringprovider = "";
                          }
                        });       
                        this.exportcheckinfoalldata = [...this.EOBReportItems["0"].payerandcheck];
                      }
                    }
                                      
                    this.generatePdf();                    
                  }
                }
              } else {
                this.showreport = false;
                this.reportloading = false;
                this.disabledbutton = true;
                this.EOBReportItems = [];
                this.clsUtility.showError("Error while showing EOB Report");
              }          
            },
            err => {
              this.clsUtility.showError(err);
            }
          )
      );
    } catch (error) {
      this.showreport = false;
      this.reportloading = false;
      this.clsUtility.LogError(error);
    }
  }

  loadsvcdetails() {
    try {
      this.EOBReportSVCGridView = {
        data: orderBy(
          this.EOBReportSVC.slice(
            this.EOBReportSVClineSkip,
            this.EOBReportSVClineSkip + this.EOBReportSVClinepagesize
          ),
          this.sortMaster
        ),
        total: this.EOBReportSVC.length
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onCloseClick() {
    try {   
      this.displayreport = false;
      this.disabledbutton = false; 
      this.showreport = false;
      this.reportloading = false;
      this.pdfViewer.pdfSrc = null;
      this.pdfViewer.refresh();     
      this.pdfdownloadclick = false; 
      this.exportpatientinfoalldata = [];
      this.exportpatientinfoalldatamaxlength = [];
      this.exportcheckinfoalldata = [];
      this.OutputResult(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ResetComponents() {
    try {          
      this.InputCheckSplitfileid = 0;
      this.InputCheckERAfileid = 0;
      this.displayreport = false;
      this.disabledbutton = false; 
      this.showreport = false;
      this.reportloading = false;
      this.pdfViewer.pdfSrc = null;
      this.pdfViewer.refresh();
      this.pdfdownloadclick = false; 
      this.exportpatientinfoalldata = [];
      this.exportpatientinfoalldatamaxlength = [];
      this.exportcheckinfoalldata = [];
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {     
      this.showreport = false;
      this.reportloading = false;
      this.exportloading = false;
      this.pdfdownloadclick = false; 
      this.exportpatientinfoalldata = [];
      this.exportpatientinfoalldatamaxlength = [];
      this.exportcheckinfoalldata = [];
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    try {
      this.sSkip = event.skip;         
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  generatePdf(){   
    try{
      this.pdfViewer.pdfSrc = "";
      this.pdfViewer.refresh();
      this.loadingPDF = true;
      this.pdfdownloadclick = false; 

      const documentDefinition = this.getDocumentDefinition();
      const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.getBase64((data) => {         
        const blobltext = this.b64toBlob(data, "application/pdf");
        var file = new Blob([blobltext], {
          type: "application/pdf",
        });  
      this.pdfViewer.pdfSrc = file;
      this.pdfViewer.refresh();  
      this.reportloading = false;
      this.disabledbutton = false;
      }); 
    } catch (error) {
      this.clsUtility.LogError(error);
    }     
  }

  b64toBlob = (b64Data, contentType = "application/pdf", sliceSize = 512) => {
    try {
      const byteCharacters = atob(b64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blobpdf = new Blob(byteArrays, { type: contentType });
      return blobpdf;
    } catch (error) {
      this.clsUtility.LogError(error);
    } 
  };


  generatePdf1(){  
    try {
      const documentDefinition = this.getDocumentDefinition();;
      pdfMake.createPdf(documentDefinition).open();
    } catch (error) {
      this.clsUtility.LogError(error);
    } 
  }

  printpdf(){
    try {
      const documentDefinition = this.getDocumentDefinition();
      pdfMake.createPdf(documentDefinition).print();
    } catch (error) {
      this.clsUtility.LogError(error);
    } 
  }

  downloadpdf(){
    try { 
      this.disabledbutton = true;
      if(this.EOBReportItems != null && this.EOBReportItems != undefined) {
        if(this.EOBReportItems.length != 0){
          this.pdfdownloadclick = true;    
          const documentDefinition = this.getDocumentDefinition();
          pdfMake.createPdf(documentDefinition).download(this.exportfilename);
          this.api.insertActivityLog(
            "ERA EOB Report Export for file (" + this.InputCheckFilename + ")",
            this.InputCheckComponentname,
            "READ"
          );
          setTimeout(() => {
            this.disabledbutton = false;
          }, 500);          
        } else {
          this.disabledbutton = false;
        }
      } else {
        this.disabledbutton = false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }     
  }
 
  getDocumentDefinition() {      
    try {
      if(this.EOBReportItems != null && this.EOBReportItems != undefined) {
        if(this.EOBReportItems.length != 0) {          
          return {
            pageOrientation: 'landscape',
            pageSize : 'A4',
            fontSize: 10,
            pageAlignment: 'center',
            width: 'auto',          
            content: [              
              this.exportpatientinfoalldata.length != null && this.exportpatientinfoalldata.length != 0 && this.exportpatientinfoalldata.length != 1 ? 
              {
                style: 'tableExample',          
                table: {
                  width: '*',
                  body: [
                    [
                      {text: (this.pdfdownloadclick==true) ? 'ERA EOB REPORT' : '', alignment:'center', border: [false, false, false, false], margin: [0, 5], fontSize: 18, bold: true}
                    ],             
                    [
                      this.equalStr.map(str => {
                        return [
                          {text:str, alignment:'center', border: [false, false, false, false], margin: [0, 0, 0, 10], fontSize: 14, bold: true}
                        ]
                      })
                    ],   
                    [
                      this.exportcheckinfoalldata.map(check => {
                        return [
                          {    
                            alignment: 'justify',     
                            border: [false, false, false, false],
                            columnGap: 20,
                            columns: [           
                              {
                                width: 200,
                                table: {                
                                  body: [                       
                                          [{text: check.payername, bold: true, fontSize: 10, border: [false, false, false, false]}],
                                          [{text: check.address, bold: true, fontSize: 10, border: [false, false, false, false]}],                          
                                          [{text: check.address1, bold: true, fontSize: 10, border: [false, false, false, false]}]                                     
                                        ],                                    
                                    }
                              },
                              {
                                width: 'auto',
                                table: {   
                                  border: [false, false, false, false],                                  
                                  body: [
                                          [{text: 'Check Date: ', bold: true, fontSize: 10, border: [false, false, false, false]}],
                                          [{text: 'Check #: ', bold: true, fontSize: 10, border: [false, false, false, false]}],                                    
                                          [{text: 'Payment Method: ', bold: true, fontSize: 10, border: [false, false, false, false]}]                                   
                                      ]                                                                     
                                    },
                              },
                              {
                                width: 'auto',
                                table: {   
                                  border: [false, false, false, false],                                  
                                  body: [
                                          [{text: (check.checkdate == null ? ' - ' : check.checkdate), fontSize: 10, border: [false, false, false, false]}],
                                          [{text: (check.checknumber == null ? ' - ' : check.checknumber), fontSize: 10, border: [false, false, false, false]}],                                    
                                          [{text: (check.paymentmethod == null ? ' - ' : check.paymentmethod), fontSize: 10, border: [false, false, false, false]}]                                    
                                      ]                                                                     
                                  },
                              },
                              {
                                width: 'auto',
                                table: {   
                                  border: [false, false, false, false],                                  
                                  body: [                                   
                                          [{text: 'Check Amount: ', bold: true, fontSize: 10, border: [false, false, false, false]}],
                                          [{text: 'Claim Total Paid: ', bold: true, fontSize: 10, border: [false, false, false, false]}],
                                          [{text: 'PLB Total Amount: ', bold: true, fontSize: 10, border: [false, false, false, false]}]
                                      ]                                                                     
                                    },
                              },
                              {
                                width: 'auto',
                                table: {   
                                  border: [false, false, false, false],                                  
                                  body: [                                   
                                          [{text: (check.checkamount == null ? ' - ' : check.checkamount), fontSize: 10, border: [false, false, false, false]}],
                                          [{text: (check.claimpaidamount == null ? ' - ' : check.claimpaidamount), fontSize: 10, border: [false, false, false, false]}],
                                          [{text: (check.plbamount == null ? ' - ' : check.plbamount), fontSize: 10, border: [false, false, false, false]}],
                                      ]                                                                     
                                  },
                              },
                            
                            ]
                          },
                          {
                            text: '',
                            margin: [0, 10]                     
                          }                                     
                        ]   
                      })
                    ], 
                    [                       
                      this.exportpatientinfoalldata.map(obj => {
                        return [
                          {    
                            unbreakable: true,    
                            border: [true, true, true, true],                     
                            stack: [
                              {
                                text: '',
                                margin: [0, 10]                     
                              },   
                              {
                                alignment: 'justify',     
                                border: [false, false, false, false],
                                columnGap: 15,
                                columns: [           
                                  {
                                    width: 'auto',
                                    table: {                
                                      body: [ 
                                              [{text:'Claim Index: ', fontSize: 10, border: [false, false, false, false]}],          
                                              [{text:'Patient: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Patient Identifier: ', fontSize: 10, border: [false, false, false, false]}],                          
                                              [{text:'Patient Group: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Claim Level Adjs: ', fontSize: 10, border: [false, false, false, false]}] 
                                            ],                                    
                                        }
                                  },
                                  {
                                    width: 'auto',
                                    table: {   
                                      border: [false, false, false, false],                                  
                                      body: [
                                              [{text: (obj.arrayindex == null ? ' - ' : obj.arrayindex), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.patient == null ? ' - ' : obj.patient), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.patientmember == null ? ' - ' : obj.patientmember), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: ' - ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.claimleveladjstment == null ? ' - ' : obj.claimleveladjstment), fontSize: 10, border: [false, false, false, false]}],
                                          ]                                                                     
                                        },
                                  },
                                  {
                                    width: 'auto',
                                    table: {                                     
                                      body: [                       
                                              [{text:'Claim #: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Remit Ref.#: ', fontSize: 10, border: [false, false, false, false]}],                          
                                              [{text:'Insured: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Rendered Provider: ', fontSize: 10, border: [false, false, false, false]}] 
                                            ],                                    
                                        }
                                  },
                                  {
                                    width: 220,
                                    table: {                                     
                                      body: [
                                              [{text: (obj.claimno == null ? ' - ' : obj.claimno), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.claimremittancerefnumber == null ? ' - ' : obj.claimremittancerefnumber), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.insured == null ? ' - ' : obj.insured), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: ((obj.renderringprovider.trim() == '' && obj.renderingnpi.trim() == "") ? ' - ' : 
                                                        (obj.renderringprovider.trim() != '' && obj.renderingnpi.trim() != "") ? obj.renderringprovider.trim() + ' ' + '(' + obj.renderingnpi.trim() + ')' : 
                                                        (obj.renderringprovider.trim() != '' && obj.renderingnpi.trim() == "" ) ? obj.renderringprovider.trim() : 
                                                        (obj.renderringprovider.trim() == '' && obj.renderingnpi.trim() != "") ? obj.renderingnpi.trim() : '-'
                                                      )                                              
                                              , fontSize: 10, border: [false, false, false, false]}],
                                          ],                                    
                                        }
                                  },
                                  {
                                    width: 'auto',
                                    table: {                                     
                                      body: [                       
                                              [{text:'Claim Billed: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Claim Paid: ', fontSize: 10, border: [false, false, false, false]}],                          
                                              [{text:'Total Claim Adjs: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Patient Responsibility: ', fontSize: 10, border: [false, false, false, false]}] 
                                            ],                                    
                                        }
                                  },
                                  {
                                    width: 'auto',
                                    table: {                                     
                                      body: [                       
                                              [{text: (obj.claimbilledamount == null ? ' - ' : obj.claimbilledamount), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.claimpaidamount == null ? ' - ' : obj.claimpaidamount), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.totalclaimleveladjstment == null ? ' - ' : obj.totalclaimleveladjstment), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.patientres == null ? ' - ' : obj.patientres), fontSize: 10, border: [false, false, false, false]}],
                                            ],                                    
                                        }
                                  }
                                ]
                              },                        
                              {
                                text: '',
                                margin: [0, 5]
                              },
                              {
                                text: (obj.status == null ? ' - ' : obj.status), alignment:'right', border: [false, false, false, false], fontSize: 10, bold: true, color: 'blue'
                              },
                              { 
                                ...obj.charges != null ? { 
                                  style: 'tableExample',
                                  table: {  
                                  widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', '*'],               
                                  body: [                       
                                          [
                                            {text:'DOS', bold:true, fillColor: '#a6a6a6', style: 'tableHeader', fontSize: 10},
                                            {text:'Unit',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},                          
                                            {text:'Proc/Mod',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Billed',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Allowed',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Deduct',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Co-Ins',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Copay',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Paid',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Adjustment',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Reason',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Remark',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10}
                                          ],
                                          ...obj.charges.map(ed => {
                                            return [
                                                    {text: ed.dos, fontSize: 10}, 
                                                    {text: ed.unit, fontSize: 10}, 
                                                    {text: (ed.cptcode == null ? '' : ed.cptcode) + ' ' + (ed.modifier1 == null ? '' : ed.modifier1) + ' ' + (ed.modifier2 == null ? '' : ed.modifier2) + ' ' + (ed.modifier3 == null ? '' : ed.modifier3) + ' ' + (ed.modifier4 == null ? '' : ed.modifier4), fontSize: 10}, 
                                                    {text: ed.billedamount, fontSize: 10}, 
                                                    {text: ed.allowed, fontSize: 10}, 
                                                    {text: ed.deduct, fontSize: 10}, 
                                                    {text: ed.coins, fontSize: 10}, 
                                                    {text: ed.copay, fontSize: 10}, 
                                                    {text: ed.payment, fontSize: 10}, 
                                                    {text: ed.adjustment, fontSize: 10},
                                                    {text: ed.reasoncodes, fontSize: 10},
                                                    {text: ed.remark, fontSize: 10}
                                                  ];
                                          }),                      
                                        ]                 
                                    }  
                                } : {},                                                                                                                
                              } ,
                              {
                                text: '',
                                margin: [0, 10]                     
                              }
                                                    
                            ]
                          },
                          {
                            text: '',
                            margin: [0, 10]                     
                          }                  
                        ]   
                      })
                    ],
                  ]
                },
              } : {},
              this.exportpatientinfoalldata.length != null && this.exportpatientinfoalldata.length != 0 && this.exportpatientinfoalldata.length == 1? 
              {
                style: 'tableExample',          
                table: {
                  width: '*',
                  body: [
                    [
                      {text: (this.pdfdownloadclick==true) ? 'ERA EOB REPORT' : '', alignment:'center', border: [false, false, false, false], margin: [0, 5], fontSize: 18, bold: true}
                    ],             
                    [
                      this.equalStr.map(str => {
                        return [
                          {text:str, alignment:'center', border: [false, false, false, false], margin: [0, 0, 0, 10], fontSize: 14, bold: true}
                        ]
                      })
                    ],   
                    [
                      this.exportcheckinfoalldata.map(check => {
                        return [
                          {    
                            alignment: 'justify',     
                            border: [false, false, false, false],
                            columnGap: 20,
                            columns: [           
                              {
                                width: 200,
                                table: {                
                                  body: [                       
                                          [{text: check.payername, bold: true, fontSize: 10, border: [false, false, false, false]}],
                                          [{text: check.address, bold: true, fontSize: 10, border: [false, false, false, false]}],                          
                                          [{text: check.address1, bold: true, fontSize: 10, border: [false, false, false, false]}]                                     
                                        ],                                    
                                    }
                              },
                              {
                                width: 'auto',
                                table: {   
                                  border: [false, false, false, false],                                  
                                  body: [
                                          [{text: 'Check Date: ', bold: true, fontSize: 10, border: [false, false, false, false]}],
                                          [{text: 'Check #: ', bold: true, fontSize: 10, border: [false, false, false, false]}],                                    
                                          [{text: 'Payment Method: ', bold: true, fontSize: 10, border: [false, false, false, false]}]                                   
                                      ]                                                                     
                                    },
                              },
                              {
                                width: 'auto',
                                table: {   
                                  border: [false, false, false, false],                                  
                                  body: [
                                          [{text: (check.checkdate == null ? ' - ' : check.checkdate), fontSize: 10, border: [false, false, false, false]}],
                                          [{text: (check.checknumber == null ? ' - ' : check.checknumber), fontSize: 10, border: [false, false, false, false]}],                                    
                                          [{text: (check.paymentmethod == null ? ' - ' : check.paymentmethod), fontSize: 10, border: [false, false, false, false]}]                                    
                                      ]                                                                     
                                  },
                              },
                              {
                                width: 'auto',
                                table: {   
                                  border: [false, false, false, false],                                  
                                  body: [                                   
                                          [{text: 'Check Amount: ', bold: true, fontSize: 10, border: [false, false, false, false]}],
                                          [{text: 'Claim Total Paid: ', bold: true, fontSize: 10, border: [false, false, false, false]}],
                                          [{text: 'PLB Total Amount: ', bold: true, fontSize: 10, border: [false, false, false, false]}]
                                      ]                                                                     
                                    },
                              },
                              {
                                width: 'auto',
                                table: {   
                                  border: [false, false, false, false],                                  
                                  body: [                                   
                                          [{text: (check.checkamount == null ? ' - ' : check.checkamount), fontSize: 10, border: [false, false, false, false]}],
                                          [{text: (check.claimpaidamount == null ? ' - ' : check.claimpaidamount), fontSize: 10, border: [false, false, false, false]}],
                                          [{text: (check.plbamount == null ? ' - ' : check.plbamount), fontSize: 10, border: [false, false, false, false]}],
                                      ]                                                                     
                                  },
                              },
                            
                            ]
                          },
                          {
                            text: '',
                            margin: [0, 10]                     
                          }                                     
                        ]   
                      })
                    ], 
                    [                      
                      this.exportpatientinfoalldata.map(obj => {
                        return [
                              {
                                text: '',
                                margin: [0, 10]                     
                              },   
                              {
                                alignment: 'justify',     
                                border: [false, false, false, false],
                                columnGap: 15,
                                columns: [           
                                  {
                                    width: 'auto',
                                    table: {                
                                      body: [ 
                                              [{text:'Claim Index: ', fontSize: 10, border: [false, false, false, false]}],          
                                              [{text:'Patient: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Patient Identifier: ', fontSize: 10, border: [false, false, false, false]}],                          
                                              [{text:'Patient Group: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Claim Level Adjs: ', fontSize: 10, border: [false, false, false, false]}] 
                                            ],                                    
                                        }
                                  },
                                  {
                                    width: 'auto',
                                    table: {   
                                      border: [false, false, false, false],                                  
                                      body: [
                                              [{text: (obj.arrayindex == null ? ' - ' : obj.arrayindex), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.patient == null ? ' - ' : obj.patient), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.patientmember == null ? ' - ' : obj.patientmember), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: ' - ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.claimleveladjstment == null ? ' - ' : obj.claimleveladjstment), fontSize: 10, border: [false, false, false, false]}],
                                          ]                                                                     
                                        },
                                  },
                                  {
                                    width: 'auto',
                                    table: {                                     
                                      body: [                       
                                              [{text:'Claim #: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Remit Ref.#: ', fontSize: 10, border: [false, false, false, false]}],                          
                                              [{text:'Insured: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Rendered Provider: ', fontSize: 10, border: [false, false, false, false]}] 
                                            ],                                    
                                        }
                                  },
                                  {
                                    width: 220,
                                    table: {                                     
                                      body: [
                                              [{text: (obj.claimno == null ? ' - ' : obj.claimno), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.claimremittancerefnumber == null ? ' - ' : obj.claimremittancerefnumber), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.insured == null ? ' - ' : obj.insured), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: ((obj.renderringprovider.trim() == '' && obj.renderingnpi.trim() == "") ? ' - ' : 
                                                        (obj.renderringprovider.trim() != '' && obj.renderingnpi.trim() != "") ? obj.renderringprovider.trim() + ' ' + '(' + obj.renderingnpi.trim() + ')' : 
                                                        (obj.renderringprovider.trim() != '' && obj.renderingnpi.trim() == "" ) ? obj.renderringprovider.trim() : 
                                                        (obj.renderringprovider.trim() == '' && obj.renderingnpi.trim() != "") ? obj.renderingnpi.trim() : '-'
                                                      )                                              
                                              , fontSize: 10, border: [false, false, false, false]}],
                                          ],                                    
                                        }
                                  },
                                  {
                                    width: 'auto',
                                    table: {                                     
                                      body: [                       
                                              [{text:'Claim Billed: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Claim Paid: ', fontSize: 10, border: [false, false, false, false]}],                          
                                              [{text:'Total Claim Adjs: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Patient Responsibility: ', fontSize: 10, border: [false, false, false, false]}] 
                                            ],                                    
                                        }
                                  },
                                  {
                                    width: 'auto',
                                    table: {                                     
                                      body: [                       
                                              [{text: (obj.claimbilledamount == null ? ' - ' : obj.claimbilledamount), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.claimpaidamount == null ? ' - ' : obj.claimpaidamount), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.totalclaimleveladjstment == null ? ' - ' : obj.totalclaimleveladjstment), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.patientres == null ? ' - ' : obj.patientres), fontSize: 10, border: [false, false, false, false]}],
                                            ],                                    
                                        }
                                  }
                                ]
                              },                        
                              {
                                text: '',
                                margin: [0, 5]
                              },
                              {
                                text: (obj.status == null ? ' - ' : obj.status), alignment:'right', border: [false, false, false, false], fontSize: 10, bold: true, color: 'blue'
                              },
                              { 
                                ...obj.charges != null ? { 
                                  style: 'tableExample',
                                  table: {  
                                  widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', '*'],               
                                  body: [                       
                                          [
                                            {text:'DOS', bold:true, fillColor: '#a6a6a6', style: 'tableHeader', fontSize: 10},
                                            {text:'Unit',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},                          
                                            {text:'Proc/Mod',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Billed',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Allowed',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Deduct',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Co-Ins',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Copay',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Paid',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Adjustment',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Reason',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Remark',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10}
                                          ],
                                          ...obj.charges.map(ed => {
                                            return [
                                                    {text: ed.dos, fontSize: 10}, 
                                                    {text: ed.unit, fontSize: 10}, 
                                                    {text: (ed.cptcode == null ? '' : ed.cptcode) + ' ' + (ed.modifier1 == null ? '' : ed.modifier1) + ' ' + (ed.modifier2 == null ? '' : ed.modifier2) + ' ' + (ed.modifier3 == null ? '' : ed.modifier3) + ' ' + (ed.modifier4 == null ? '' : ed.modifier4), fontSize: 10}, 
                                                    {text: ed.billedamount, fontSize: 10}, 
                                                    {text: ed.allowed, fontSize: 10}, 
                                                    {text: ed.deduct, fontSize: 10}, 
                                                    {text: ed.coins, fontSize: 10}, 
                                                    {text: ed.copay, fontSize: 10}, 
                                                    {text: ed.payment, fontSize: 10}, 
                                                    {text: ed.adjustment, fontSize: 10},
                                                    {text: ed.reasoncodes, fontSize: 10},
                                                    {text: ed.remark, fontSize: 10}
                                                  ];
                                          }),                      
                                        ]                 
                                    }  
                                } : {},                                                                                                                
                              } ,
                              {
                                text: '',
                                margin: [0, 10]                     
                              }
                                                    
                            ]
                      })
                    ],  
                  ]
                },
              } : {},
              ((this.exportpatientinfoalldatamaxlength.length != null && this.exportpatientinfoalldatamaxlength.length != 0) 
              && (this.exportpatientinfoalldata.length != null && this.exportpatientinfoalldata.length == 0)) ? 
              {
                style: 'tableExample',                       
                table: {
                  width: '*',
                  body: [ 
                    [
                      {text: (this.pdfdownloadclick==true) ? 'ERA EOB REPORT' : '', alignment:'center', border: [false, false, false, false], margin: [0, 5], fontSize: 18, bold: true}
                    ],             
                    [
                      this.equalStr.map(str => {
                        return [
                          {text:str, alignment:'center', border: [false, false, false, false], margin: [0, 0, 0, 10], fontSize: 14, bold: true}
                        ]
                      })
                    ],   
                    [
                      this.exportcheckinfoalldata.map(check => {
                        return [
                          {    
                            alignment: 'justify',     
                            border: [false, false, false, false],
                            columnGap: 20,
                            columns: [           
                              {
                                width: 200,
                                table: {                
                                  body: [                       
                                          [{text: check.payername, bold: true, fontSize: 10, border: [false, false, false, false]}],
                                          [{text: check.address, bold: true, fontSize: 10, border: [false, false, false, false]}],                          
                                          [{text: check.address1, bold: true, fontSize: 10, border: [false, false, false, false]}]                                     
                                        ],                                    
                                    }
                              },
                              {
                                width: 'auto',
                                table: {   
                                  border: [false, false, false, false],                                  
                                  body: [
                                          [{text: 'Check Date: ', bold: true, fontSize: 10, border: [false, false, false, false]}],
                                          [{text: 'Check #: ', bold: true, fontSize: 10, border: [false, false, false, false]}],                                    
                                          [{text: 'Payment Method: ', bold: true, fontSize: 10, border: [false, false, false, false]}]                                   
                                      ]                                                                     
                                    },
                              },
                              {
                                width: 'auto',
                                table: {   
                                  border: [false, false, false, false],                                  
                                  body: [
                                          [{text: (check.checkdate == null ? ' - ' : check.checkdate), fontSize: 10, border: [false, false, false, false]}],
                                          [{text: (check.checknumber == null ? ' - ' : check.checknumber), fontSize: 10, border: [false, false, false, false]}],                                    
                                          [{text: (check.paymentmethod == null ? ' - ' : check.paymentmethod), fontSize: 10, border: [false, false, false, false]}]                                    
                                      ]                                                                     
                                  },
                              },
                              {
                                width: 'auto',
                                table: {   
                                  border: [false, false, false, false],                                  
                                  body: [                                   
                                          [{text: 'Check Amount: ', bold: true, fontSize: 10, border: [false, false, false, false]}],
                                          [{text: 'Claim Total Paid: ', bold: true, fontSize: 10, border: [false, false, false, false]}],
                                          [{text: 'PLB Total Amount: ', bold: true, fontSize: 10, border: [false, false, false, false]}]
                                      ]                                                                     
                                    },
                              },
                              {
                                width: 'auto',
                                table: {   
                                  border: [false, false, false, false],                                  
                                  body: [                                   
                                          [{text: (check.checkamount == null ? ' - ' : check.checkamount), fontSize: 10, border: [false, false, false, false]}],
                                          [{text: (check.claimpaidamount == null ? ' - ' : check.claimpaidamount), fontSize: 10, border: [false, false, false, false]}],
                                          [{text: (check.plbamount == null ? ' - ' : check.plbamount), fontSize: 10, border: [false, false, false, false]}],
                                      ]                                                                     
                                  },
                              },
                            
                            ]
                          },
                          {
                            text: '',
                            margin: [0, 10]                     
                          }                                     
                        ]   
                      })
                    ],                                                
                    [ 
                      this.exportpatientinfoalldatamaxlength.map(obj => {
                        return [ 
                              this.exportpatientinfoalldata.length != 0 ? 
                              {text:'', pageBreak: 'before'} : {},  
                              {
                                alignment: 'justify',     
                                border: [false, false, false, false],
                                columnGap: 15,
                                columns: [           
                                  {
                                    width: 'auto',
                                    table: {                
                                      body: [ 
                                              [{text:'Claim Index: ', fontSize: 10, border: [false, false, false, false]}],          
                                              [{text:'Patient: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Patient Identifier: ', fontSize: 10, border: [false, false, false, false]}],                          
                                              [{text:'Patient Group: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Claim Level Adjs: ', fontSize: 10, border: [false, false, false, false]}] 
                                            ],                                    
                                        }
                                  },
                                  {
                                    width: 'auto',
                                    table: {   
                                      border: [false, false, false, false],                                  
                                      body: [
                                              [{text: (obj.arrayindex == null ? ' - ' : obj.arrayindex), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.patient == null ? ' - ' : obj.patient), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.patientmember == null ? ' - ' : obj.patientmember), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: ' - ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.claimleveladjstment == null ? ' - ' : obj.claimleveladjstment), fontSize: 10, border: [false, false, false, false]}],
                                          ]                                                                     
                                        },
                                  },
                                  {
                                    width: 'auto',
                                    table: {                                     
                                      body: [                       
                                              [{text:'Claim #: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Remit Ref.#: ', fontSize: 10, border: [false, false, false, false]}],                          
                                              [{text:'Insured: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Rendered Provider: ', fontSize: 10, border: [false, false, false, false]}] 
                                            ],                                    
                                        }
                                  },
                                  {
                                    width: 220,
                                    table: {                                     
                                      body: [
                                              [{text: (obj.claimno == null ? ' - ' : obj.claimno), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.claimremittancerefnumber == null ? ' - ' : obj.claimremittancerefnumber), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.insured == null ? ' - ' : obj.insured), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: ((obj.renderringprovider.trim() == '' && obj.renderingnpi.trim() == "") ? ' - ' : 
                                                        (obj.renderringprovider.trim() != '' && obj.renderingnpi.trim() != "") ? obj.renderringprovider.trim() + ' ' + '(' + obj.renderingnpi.trim() + ')' : 
                                                        (obj.renderringprovider.trim() != '' && obj.renderingnpi.trim() == "" ) ? obj.renderringprovider.trim() : 
                                                        (obj.renderringprovider.trim() == '' && obj.renderingnpi.trim() != "") ? obj.renderingnpi.trim() : '-'
                                                      )                                              
                                              , fontSize: 10, border: [false, false, false, false]}],
                                          ],                                    
                                        }
                                  },
                                  {
                                    width: 'auto',
                                    table: {                                     
                                      body: [                       
                                              [{text:'Claim Billed: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Claim Paid: ', fontSize: 10, border: [false, false, false, false]}],                          
                                              [{text:'Total Claim Adjs: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Patient Responsibility: ', fontSize: 10, border: [false, false, false, false]}] 
                                            ],                                    
                                        }
                                  },
                                  {
                                    width: 'auto',
                                    table: {                                     
                                      body: [                       
                                              [{text: (obj.claimbilledamount == null ? ' - ' : obj.claimbilledamount), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.claimpaidamount == null ? ' - ' : obj.claimpaidamount), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.totalclaimleveladjstment == null ? ' - ' : obj.totalclaimleveladjstment), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.patientres == null ? ' - ' : obj.patientres), fontSize: 10, border: [false, false, false, false]}],
                                            ],                                    
                                        }
                                  }
                                ]
                              },                        
                              {
                                text: '',
                                margin: [0, 5]
                              },
                              {
                                text: (obj.status == null ? ' - ' : obj.status), alignment:'right', border: [false, false, false, false], fontSize: 10, bold: true, color: 'blue'
                              },
                              { 
                                ...obj.charges != null ? { 
                                  style: 'tableExample',
                                  table: {  
                                  widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', '*'],               
                                  body: [                       
                                          [
                                            {text:'DOS', bold:true, fillColor: '#a6a6a6', style: 'tableHeader', fontSize: 10},
                                            {text:'Unit',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},                          
                                            {text:'Proc/Mod',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Billed',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Allowed',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Deduct',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Co-Ins',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Copay',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Paid',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Adjustment',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Reason',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Remark',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10}
                                          ],
                                          ...obj.charges.map(ed => {
                                            return [
                                                    {text: ed.dos, fontSize: 10}, 
                                                    {text: ed.unit, fontSize: 10}, 
                                                    {text: (ed.cptcode == null ? '' : ed.cptcode) + ' ' + (ed.modifier1 == null ? '' : ed.modifier1) + ' ' + (ed.modifier2 == null ? '' : ed.modifier2) + ' ' + (ed.modifier3 == null ? '' : ed.modifier3) + ' ' + (ed.modifier4 == null ? '' : ed.modifier4), fontSize: 10}, 
                                                    {text: ed.billedamount, fontSize: 10}, 
                                                    {text: ed.allowed, fontSize: 10}, 
                                                    {text: ed.deduct, fontSize: 10}, 
                                                    {text: ed.coins, fontSize: 10}, 
                                                    {text: ed.copay, fontSize: 10}, 
                                                    {text: ed.payment, fontSize: 10}, 
                                                    {text: ed.adjustment, fontSize: 10},
                                                    {text: ed.reasoncodes, fontSize: 10},
                                                    {text: ed.remark, fontSize: 10}
                                                  ];
                                          }),                      
                                        ]                 
                                    }  
                                } : {},                                                                                                                
                              } ,
                              {
                                text: '',
                                margin: [0, 10]                     
                              
                              },
                              {
                                text: '',
                                margin: [0, 10]                     
                              }                  
                            ]   
                        })
                    ]
                  ]
                },
              } : 
              ((this.exportpatientinfoalldatamaxlength.length != null && this.exportpatientinfoalldatamaxlength.length != 0) 
              && (this.exportpatientinfoalldata.length != null && this.exportpatientinfoalldata.length > 0)) ?
              {
                style: 'tableExample',                       
                table: {
                  width: '*',
                  body: [                                                    
                    [ 
                      this.exportpatientinfoalldatamaxlength.map(obj => {
                        return [ 
                              this.exportpatientinfoalldata.length != 0 ? 
                              {text:'', pageBreak: 'before'} : {},  
                              {
                                alignment: 'justify',     
                                border: [false, false, false, false],
                                columnGap: 15,
                                columns: [           
                                  {
                                    width: 'auto',
                                    table: {                
                                      body: [ 
                                              [{text:'Claim Index: ', fontSize: 10, border: [false, false, false, false]}],          
                                              [{text:'Patient: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Patient Identifier: ', fontSize: 10, border: [false, false, false, false]}],                          
                                              [{text:'Patient Group: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Claim Level Adjs: ', fontSize: 10, border: [false, false, false, false]}] 
                                            ],                                    
                                        }
                                  },
                                  {
                                    width: 'auto',
                                    table: {   
                                      border: [false, false, false, false],                                  
                                      body: [
                                              [{text: (obj.arrayindex == null ? ' - ' : obj.arrayindex), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.patient == null ? ' - ' : obj.patient), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.patientmember == null ? ' - ' : obj.patientmember), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: ' - ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.claimleveladjstment == null ? ' - ' : obj.claimleveladjstment), fontSize: 10, border: [false, false, false, false]}],
                                          ]                                                                     
                                        },
                                  },
                                  {
                                    width: 'auto',
                                    table: {                                     
                                      body: [                       
                                              [{text:'Claim #: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Remit Ref.#: ', fontSize: 10, border: [false, false, false, false]}],                          
                                              [{text:'Insured: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Rendered Provider: ', fontSize: 10, border: [false, false, false, false]}] 
                                            ],                                    
                                        }
                                  },
                                  {
                                    width: 220,
                                    table: {                                     
                                      body: [
                                              [{text: (obj.claimno == null ? ' - ' : obj.claimno), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.claimremittancerefnumber == null ? ' - ' : obj.claimremittancerefnumber), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.insured == null ? ' - ' : obj.insured), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: ((obj.renderringprovider.trim() == '' && obj.renderingnpi.trim() == "") ? ' - ' : 
                                                        (obj.renderringprovider.trim() != '' && obj.renderingnpi.trim() != "") ? obj.renderringprovider.trim() + ' ' + '(' + obj.renderingnpi.trim() + ')' : 
                                                        (obj.renderringprovider.trim() != '' && obj.renderingnpi.trim() == "" ) ? obj.renderringprovider.trim() : 
                                                        (obj.renderringprovider.trim() == '' && obj.renderingnpi.trim() != "") ? obj.renderingnpi.trim() : '-'
                                                      )                                              
                                              , fontSize: 10, border: [false, false, false, false]}],
                                          ],                                    
                                        }
                                  },
                                  {
                                    width: 'auto',
                                    table: {                                     
                                      body: [                       
                                              [{text:'Claim Billed: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Claim Paid: ', fontSize: 10, border: [false, false, false, false]}],                          
                                              [{text:'Total Claim Adjs: ', fontSize: 10, border: [false, false, false, false]}],
                                              [{text:'Patient Responsibility: ', fontSize: 10, border: [false, false, false, false]}] 
                                            ],                                    
                                        }
                                  },
                                  {
                                    width: 'auto',
                                    table: {                                     
                                      body: [                       
                                              [{text: (obj.claimbilledamount == null ? ' - ' : obj.claimbilledamount), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.claimpaidamount == null ? ' - ' : obj.claimpaidamount), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.totalclaimleveladjstment == null ? ' - ' : obj.totalclaimleveladjstment), fontSize: 10, border: [false, false, false, false]}],
                                              [{text: (obj.patientres == null ? ' - ' : obj.patientres), fontSize: 10, border: [false, false, false, false]}],
                                            ],                                    
                                        }
                                  }
                                ]
                              },                        
                              {
                                text: '',
                                margin: [0, 5]
                              },
                              {
                                text: (obj.status == null ? ' - ' : obj.status), alignment:'right', border: [false, false, false, false], fontSize: 10, bold: true, color: 'blue'
                              },
                              { 
                                ...obj.charges != null ? { 
                                  style: 'tableExample',
                                  table: {  
                                  widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', '*'],               
                                  body: [                       
                                          [
                                            {text:'DOS', bold:true, fillColor: '#a6a6a6', style: 'tableHeader', fontSize: 10},
                                            {text:'Unit',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},                          
                                            {text:'Proc/Mod',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Billed',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Allowed',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Deduct',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Co-Ins',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Copay',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Paid',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Adjustment',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Reason',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10},
                                            {text:'Remark',fillColor: '#a6a6a6', bold:true, style: 'tableHeader', fontSize: 10}
                                          ],
                                          ...obj.charges.map(ed => {
                                            return [
                                                    {text: ed.dos, fontSize: 10}, 
                                                    {text: ed.unit, fontSize: 10}, 
                                                    {text: (ed.cptcode == null ? '' : ed.cptcode) + ' ' + (ed.modifier1 == null ? '' : ed.modifier1) + ' ' + (ed.modifier2 == null ? '' : ed.modifier2) + ' ' + (ed.modifier3 == null ? '' : ed.modifier3) + ' ' + (ed.modifier4 == null ? '' : ed.modifier4), fontSize: 10}, 
                                                    {text: ed.billedamount, fontSize: 10}, 
                                                    {text: ed.allowed, fontSize: 10}, 
                                                    {text: ed.deduct, fontSize: 10}, 
                                                    {text: ed.coins, fontSize: 10}, 
                                                    {text: ed.copay, fontSize: 10}, 
                                                    {text: ed.payment, fontSize: 10}, 
                                                    {text: ed.adjustment, fontSize: 10},
                                                    {text: ed.reasoncodes, fontSize: 10},
                                                    {text: ed.remark, fontSize: 10}
                                                  ];
                                          }),                      
                                        ]                 
                                    }  
                                } : {},                                                                                                                
                              } ,
                              {
                                text: '',
                                margin: [0, 10]                     
                              
                              },
                              {
                                text: '',
                                margin: [0, 10]                     
                              }                  
                            ]   
                        })
                    ]
                  ]
                }
              } : {}                             
            ]
          };
        } else {
          return {};
        }
      }      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

}
