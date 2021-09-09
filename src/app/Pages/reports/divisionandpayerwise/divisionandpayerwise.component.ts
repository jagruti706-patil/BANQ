import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ToastrService } from "ngx-toastr";
import { Utility } from "src/app/Model/utility";
import { SubSink } from "subsink";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { DatePipe } from "@angular/common";
import { Api } from "src/app/Services/api";

@Component({
  selector: 'app-divisionandpayerwise',
  templateUrl: './divisionandpayerwise.component.html',
  styleUrls: ['./divisionandpayerwise.component.css']
})
export class DivisionandpayerwiseComponent implements OnInit {

    private clsUtility: Utility;
    private subscription = new SubSink();
    public clsPermission: clsPermission;

    public ReportItems: any[] = [];
    public exportfilename: string = "FileDistribution_" + this.datePipe.transform(new Date(), "MMddyyyy");
    public CheckSummary: any[] = [];
    public CheckDetails: any[] = [];
    public DivisionDetails: any[] = [];
    public UnmappedDetails: any[] = [];
    public UnmappedPLBDetails: any[] = [];
    public clientname: string = '';
    public filename: string = '';   
    public processdate: string = ''; 
    public ReportItemsPLB: any[] = [];
    public PLBDetails: any[] = [];
    public totalplbcnt: number = 0;
    public totalplbamt: any = 0;
    public plbmessage: string = "";
    public settingActive: number = 1;
    public totalrowsarray: any[] = [];
    public checktab: boolean = true;
    public plbtab: boolean = false;

    @ViewChild("pdfViewerAutoLoad") pdfViewer;
    loadingPDF: boolean = false;
    // Received Input from parent component
    @Input() InputFileid: any;
    @Input() InputPayerid: any;
    @Input() InputPayername: any;
    @Input() InputFileshareid: any;
    @Input() InputPaymentmethodcode: any;   
    @Input() InputEFTMonth: any; 
    @Input() InputEFTYear: any; 
  
    // Send Output to parent component
    @Output() OutputViewDivisionPayerResult = new EventEmitter<boolean>();
  
    OutputResult(data: any) {
      let outResult = data;
      this.OutputViewDivisionPayerResult.emit(outResult);
    }

  constructor(private toastr: ToastrService, private filedetailService: FileDetailsService, private dataService: DatatransaferService, private datePipe: DatePipe, public api: Api) { 
    this.clsUtility = new Utility(toastr);
  }

  ngOnInit() {
    try{    
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          value => (this.clsPermission = value)
        )
      );

      if( (this.InputFileid != null && this.InputFileid != '') &&
        (this.InputPayerid != null && this.InputPayerid != '') && 
        (this.InputPayername != null && this.InputPayername != '') && 
        (this.InputFileshareid != null && this.InputFileshareid != '') && 
        (this.InputPaymentmethodcode != null && this.InputPaymentmethodcode != '') &&
        (this.InputEFTMonth != null && this.InputEFTMonth != '') &&
        (this.InputEFTYear != null && this.InputEFTYear != '') ) { 
          // this.reportloading = true;
          // this.showreport = false;  
          this.checktab = true;
          this.plbtab = false;     
          this.getfiledistributioncheckreport();
          this.getfiledistributionplbreport();        
      } 
    } catch (error) {
      // this.reportloading = false;
      this.clsUtility.LogError(error);
      console.log('ngOnInit : ', error);
    }
  }

  ngOnChanges() {    
    try{    
      if( (this.InputFileid != null && this.InputFileid != '') &&
        (this.InputPayerid != null && this.InputPayerid != '') && 
        (this.InputPayername != null && this.InputPayername != '') && 
        (this.InputFileshareid != null && this.InputFileshareid != '') && 
        (this.InputPaymentmethodcode != null && this.InputPaymentmethodcode != '') &&
        (this.InputEFTMonth != null && this.InputEFTMonth != '') &&
        (this.InputEFTYear != null && this.InputEFTYear != '') ) { 
          // this.reportloading = true;
          // this.showreport = false;       
          this.checktab = true;
          this.plbtab = false;
          this.getfiledistributioncheckreport();
          this.getfiledistributionplbreport();         
      } 
    } catch (error) {
      // this.reportloading = false;
      this.clsUtility.LogError(error);
      console.log('ngOnChanges : ', error);
    }
  }

  ResetComponents() {
    try {          
      this.InputFileid = 0;
      this.InputPayerid = '';
      this.InputPaymentmethodcode = '';
      this.InputPayername = '';
      this.InputFileshareid = '';
      this.InputEFTMonth = '';
      this.InputEFTYear = '';
    } catch (error) {
      this.clsUtility.LogError(error);
      console.log('ResetComponents : ', error);
    }
  }
 
  getfiledistributioncheckreport() {    
    this.ReportItems = [];    

    try {  
      this.subscription.add(
        this.filedetailService
          .getFileDistributionCheckDetailsReport(this.InputFileid, this.InputPayerid, this.InputPayername, this.InputPaymentmethodcode, this.InputEFTMonth, this.InputEFTYear)
          .subscribe(
            data => {                
              if(data != null && data != undefined && Object.keys(data).length !== 0) {                
                this.ReportItems = data;
               
                if (this.ReportItems != null && this.ReportItems != undefined) {   
                  this.clientname = this.ReportItems['clientname'];
                  this.filename = this.ReportItems['filename'];  
                  this.processdate = this.ReportItems['processdate'];

                  this.CheckSummary = this.ReportItems['summary'];
                  if(this.CheckSummary == null){
                    this.CheckSummary = [];
                  }
                 
                  var i = 1;
                  this.CheckDetails = this.ReportItems['content'];                 
                  if (this.CheckDetails == null){
                    this.CheckDetails = [];
                  } else {
                    this.CheckDetails.forEach(x1 => {
                      x1.no = i; 
                      i++;
                    })
                  }
                  
                  this.DivisionDetails = this.ReportItems['divisionwisedetails'];   
                             
                  if(this.DivisionDetails == null){
                    this.DivisionDetails = [];                    
                  } else if(this.DivisionDetails.length == 0) {
                    this.DivisionDetails[0].subclientdetails = [];
                    this.DivisionDetails[0].checkdetails = [];
                    this.DivisionDetails[0].subclientdivisioncode = "";
                    this.DivisionDetails[0].totalpaidamount = 0 
                  } else {
                    this.DivisionDetails.forEach(ele =>{                      
                      if(ele.subclientdetails.length > 1){  
                        this.totalrowsarray = [];                     
                      
                        ele.subclientdetails.forEach(ele1 => {                          
                          ele.checkdetails.forEach(ele2 => {
                            if(ele2.subclientid == ele1.subclientid && ele2.subclientname == ele1.subclientname){
                              ele1.subclientname = ele2.subclientname;
                              this.totalrowsarray.push(ele2);
                            }                            
                          })        
                          ele1.subclientdivisioncode = ele.subclientdivisioncode;                            
                          ele1.subtotal = true;
                          this.totalrowsarray.push(ele1);                        
                        })  
                        ele.checkdetails = [];
                        ele.checkdetails = this.totalrowsarray;
                        this.totalrowsarray = [];
                      }                       
                    })                   
                  }                  
                 
                  this.UnmappedDetails = this.ReportItems['unmappeddetails'];                  
                  if(this.UnmappedDetails == null){
                    this.UnmappedDetails = [];                  
                  } else if (this.UnmappedDetails[0].checkdetails == null){
                    this.UnmappedDetails[0].checkdetails = [];
                    this.UnmappedDetails[0].subclientdivisioncode = "";
                    this.UnmappedDetails[0].totalpaidamount = 0
                  }

                  this.UnmappedPLBDetails = this.ReportItems['unmappedplbdetails'];
                  if(this.UnmappedPLBDetails == null){
                    this.UnmappedPLBDetails = [];       
                  } else if(this.UnmappedPLBDetails[0].plbdetails == null){
                    this.UnmappedPLBDetails = [];  
                  }
                  // this.showreport = true;
                  // this.reportloading = false;

                  this.settingActive = 1;

                  if(this.checktab == true && this.plbtab == false){
                    this.generatePdf();
                  } else {
                    this.generatePdfPLB();
                  }
                     
                }
              } else {
                // this.showreport = false;
                // this.reportloading = false;               
                this.ReportItems = [];
                this.clsUtility.showError("Error while showing File Distribution Report");
              }          
            },
            err => {
              this.clsUtility.showError(err);
              console.log('getfiledistributionreport : ', err);
            }
          )
      );
    } catch (error) {
      // this.showreport = false;
      // this.reportloading = false;
      this.clsUtility.LogError(error);
      console.log('getfiledistributionreport : ', error);
    }
  }

  getfiledistributionplbreport() {    
    this.ReportItemsPLB = [];    

    try {  
      this.subscription.add(
        this.filedetailService
          .getFileDistributionPLBDetailsReport(this.InputFileid, this.InputPayerid, this.InputPayername, this.InputPaymentmethodcode, this.InputEFTMonth, this.InputEFTYear)
          .subscribe(
            data => {                
              if(data != null && data != undefined && Object.keys(data).length !== 0) {                
                this.ReportItemsPLB = data;
               
                if (this.ReportItemsPLB != null && this.ReportItemsPLB != undefined) {     
                  if(this.ReportItemsPLB['totaladjustmentamount'] != null){
                    this.PLBDetails = this.ReportItemsPLB['checkwisedetails'];
                    this.totalplbcnt = this.ReportItemsPLB['totalelements'];
                    this.totalplbamt = this.ReportItemsPLB['totaladjustmentamount'];
                    this.plbmessage = "";
                  } else {
                    this.plbmessage = "PLB records are not available for " + this.InputPayername;
                    this.totalplbcnt = 0;
                    this.totalplbamt = 0;
                  }
                  // this.generatePdfPLB();   
                }
              } else {
                // this.showreport = false;
                // this.reportloading = false;               
                this.ReportItems = [];
                this.clsUtility.showError("Error while showing File Distribution Report");
              }          
            },
            err => {
              this.clsUtility.showError(err);
              console.log('getfiledistributionreport : ', err);
            }
          )
      );
    } catch (error) {
      // this.showreport = false;
      // this.reportloading = false;
      this.clsUtility.LogError(error);
      console.log('getfiledistributionreport : ', error);
    }
  }

  ngOnDestroy() {
    try {  
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
      console.log('ngOnDestroy : ', error);
    }
  }

  onCloseClick() {
    try {   
      // this.displayreport = false;
      // this.disabledbutton = false; 
      // this.showreport = false;
      // this.reportloading = false;
      // this.pdfViewer.pdfSrc = null;
      // this.pdfViewer.refresh();     
      // this.pdfdownloadclick = false; 
      // this.exportpatientinfoalldata = [];
      // this.exportpatientinfoalldatamaxlength = [];
      // this.exportcheckinfoalldata = [];
      this.OutputResult(false);
    } catch (error) {
      this.clsUtility.LogError(error);
      console.log('onCloseClick : ', error);
    }
  }

  generatePdf(){       
    try{      
      this.pdfViewer.pdfSrc = "";
      this.pdfViewer.refresh();
      this.loadingPDF = true;
      // this.pdfdownloadclick = false; 

      const documentDefinition = this.getDocumentDefinition();
      const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.getBase64((data) => {    
        this.api.insertActivityLog(
          "Division - Check and Practice Totals report viewed for Group: " + this.clientname + ", FileShareid: " + this.InputFileshareid + "  and Payer: " + this.InputPayername,
          "File Distribution Report",
          "READ"
        );

        const blobltext = this.b64toBlob(data, "application/pdf");
        var file = new Blob([blobltext], {
          type: "application/pdf",
        });       
      this.pdfViewer.pdfSrc = file;
      this.pdfViewer.refresh();  
      // this.reportloading = false;
      // this.disabledbutton = false;
      }); 
    } catch (error) {
      // this.clsUtility.LogError(error);
      console.log('generatePdf : ', error);
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
      console.log('b64toBlob : ', error);
    } 
  };

  generatePdfPLB(){   
    try{     
      this.pdfViewer.pdfSrc = "";
      this.pdfViewer.refresh();
      this.loadingPDF = true;
      // this.pdfdownloadclick = false; 

      if (this.plbmessage == ""){
        const documentDefinition = this.getDocumentDefinitionPLB();
        const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
        pdfDocGenerator.getBase64((data) => {  
          this.api.insertActivityLog(
            "Provider Level Adjustment Summary viewed for Group: " + this.clientname + ", FileShareid: " + this.InputFileshareid + "  and Payer: " + this.InputPayername,
            "File Distribution Report",
            "READ"
          );

          const blobltext = this.b64toBlob(data, "application/pdf");
          var file = new Blob([blobltext], {
            type: "application/pdf",
          });  
        this.pdfViewer.pdfSrc = file;
        this.pdfViewer.refresh();
        }); 
      } else {

        const documentDefinition = this.getDocumentDefinitionPLBmessage();
        const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
        pdfDocGenerator.getBase64((data) => {         
          const blobltext = this.b64toBlob(data, "application/pdf");
          var file = new Blob([blobltext], {
            type: "application/pdf",
          });  
        this.pdfViewer.pdfSrc = file;
        this.pdfViewer.refresh();
        });
      }
      
    } catch (error) {
      // this.clsUtility.LogError(error);
      console.log('generatePdfPLB : ', error);
    }     
  }

  onChecktabselection(){
    try {   
      this.checktab = true;
      this.plbtab = false;
      this.generatePdf();
    } catch (error) {
      // this.clsUtility.LogError(error);
      console.log('onChecktabselection : ', error);
    }
  }

  onPLBtabselection(){
    try {    
      this.checktab = false;
      this.plbtab = true;
      this.generatePdfPLB();
    } catch (error) {
      // this.clsUtility.LogError(error);
      console.log('onPLBtabselection : ', error);
    }  
  }

  getDocumentDefinition() {      
    try {      
      if(this.ReportItems != null && this.ReportItems != undefined) {
        if(this.ReportItems != null) {          
          return {
            pageOrientation: 'landscape',
            pageMargins: [30, 120, 30, 0],
            pageSize : 'A4',
            fontSize: 10,
            pageAlignment: 'center',
            header: this.getpdfheader(),
            width: 'auto',          
            content: [ 
              '\n',
              '\n',
              {
                style: 'tableExample',
                table: {
                  widths: [200, 100],
                  body: [
                    [
                      {
                        text: 'ERA Paid Amount:', 
                        fontSize: 10,
                        border: [true, true, false, false]
                      },
                      {
                        text: this.CheckSummary[0].totalpayment,
                        alignment: 'right',
                        fontSize: 10,
                        border: [false, true, true, false]
                      }
                    ],
                    [                     
                      {
                        text: 'ERA Remitted:', 
                        fontSize: 10,
                        border: [true, false, false, false]
                      },
                      {
                        text: this.CheckSummary[0].totalpaidamount,
                        alignment: 'right',
                        fontSize: 10,
                        border: [false, false, true, false]
                      }
                    ],
                    [
                      {
                        text: 'ERA PLB Amount:', 
                        fontSize: 10,
                        border: [true, false, false, true]
                      },
                      {
                        text: this.CheckSummary[0].totalplbamount,
                        alignment: 'right',
                        fontSize: 10,
                        border: [false, false, true, true]
                      }
                    ]
                  ]
                }
              },
              '\n',
              '\n',              
              {
                style: 'tableExample',
                table: {     
                  widths: [30, 100, 150, 60, 60, 50, 80, 80, 80],
                  body: [
                    [
                      { text: 'Check Details', fontSize: 11, bold: true, border: [true, true, true, true], colSpan: 9}, {}, {}, {}, {}, {}, {}, {}, {},                     
                    ],
                    [
                      { text: 'No.', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                      { text: 'Check Number', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                      { text: 'Payer Name', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                      { text: 'Check Date', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                      { text: 'EFT Date', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                      { text: 'Pay Method', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                      { text: 'Remitted', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true, true]},
                      { text: 'PLB Amount', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true, true]},
                      { text: 'Paid Amount', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true, true]}
                    ],                    
                    ...this.CheckDetails.map(obj => {
                      return [
                        {text: obj.no, fontSize: 9, border: [true, true, true, true]},
                        {text: obj.checknumber, fontSize: 9, border: [true, true, true, true]},
                        {text: obj.payername, fontSize: 9, border: [true, true, true, true]},
                        {text: this.datePipe.transform(obj.checkdate, "MM/dd/yyyy"), fontSize: 9, border: [true, true, true, true]},
                        {text: this.datePipe.transform(obj.eftdate, "MM/dd/yyyy"), fontSize: 9, border: [true, true, true, true]},
                        {text: obj.paymentmethodcode, fontSize: 9, border: [true, true, true, true]},
                        {text: obj.paidamount, fontSize: 9, alignment: 'right', border: [true, true, true, true] },
                        {text: obj.plbamount, fontSize: 9, alignment: 'right',  border: [true, true, true, true] },
                        {text: obj.payment, fontSize: 9, alignment: 'right', border: [true, true, true, true] },
                      ]
                    })                                       
                  ]
                }
              },
              { text:'', pageBreak: 'before' },              
              (this.DivisionDetails.length == 0 || this.DivisionDetails[0].checkdetails.length == 0 ) ? {} :
              [
                ...this.DivisionDetails.map(obj1 => {
                  return [
                          (obj1.checkdetails.length <= 15) ? 
                          {
                            unbreakable: true,    
                            border: [true, true, true, true],                     
                            stack:
                            [
                                    '\n',
                                    {
                                      style: 'tableExample',
                                      table: {     
                                      widths: [180, 100, 50, 50, 50, 90, 90, 90],
                                      body: [
                                        [
                                          { text: obj1.subclientdivisioncode, fontSize: 11, bold: true, border: [true, true, true, true], colSpan: 6}, {}, {}, {}, {}, {}, { text: 'Division Paid:  ' + obj1.totalpaidamount, fontSize: 11, alignment: 'right', bold: true, border: [true, true, true, true], colSpan: 2 }, {}                     
                                        ],
                                        [
                                          { text: 'Practice Name', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                          { text: 'Check Number', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                          { text: 'Check Date', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                          { text: 'EFT Date', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                          { text: 'Pay Method', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                          { text: 'Remitted', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true,true]},
                                          { text: 'Adjustments', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true, true]},
                                          { text: 'Paid Amount', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true, true]}, 
                                        ],                                       
                                      ...obj1.checkdetails.map(obj2 => {
                                        return obj2.subtotal != true ? 
                                          [
                                          {text: obj2.subclientname, fontSize: 9, border: [true, true, true, true]},
                                          {text: obj2.checknumber, fontSize: 9, border: [true, true, true, true]},                                  
                                          {text: this.datePipe.transform(obj2.checkdate, "MM/dd/yyyy"), fontSize: 9, border: [true, true, true, true]},
                                          {text: this.datePipe.transform(obj2.eftdate, "MM/dd/yyyy"), fontSize: 9, border: [true, true, true, true]},
                                          {text: obj2.paymentmethodcode, fontSize: 9, border: [true, true, true, true]},
                                          {text: obj2.paidamount, fontSize: 9, alignment: 'right', border: [true, true, true, true] },
                                          {text: obj2.plbamount, fontSize: 9, alignment: 'right',  border: [true, true, true, true] },
                                          {text: obj2.payment, fontSize: 9, alignment: 'right', border: [true, true, true, true] } 
                                          ] :
                                          [                                                
                                            { text: obj2.subclientname + " SubTotal: ", fontSize: 10, bold: true, alignment: 'right', border: [true, true, true, true], colSpan: 7}, {}, {}, {}, {}, {}, {}, {text: obj2.totalpaidamount, fontSize: 10, alignment: 'right', bold: true, border: [true, true, true, true]}  
                                          ]
                                      }),
                                    ]
                                }
                              } 
                            ]
                          } 
                          :['\n', {                                
                                style: 'tableExample',
                                table: {     
                                widths: [180, 100, 50, 50, 50, 90, 90, 90],
                                body: [
                                  [
                                    { text: obj1.subclientdivisioncode, fontSize: 11, bold: true, border: [true, true, true, true], colSpan: 6}, {}, {}, {}, {}, {}, { text: 'Division Paid:  ' + obj1.totalpaidamount, fontSize: 11, alignment: 'right', bold: true, border: [true, true, true, true], colSpan: 2 }, {}                     
                                  ],
                                  [
                                    { text: 'Practice Name', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                    { text: 'Check Number', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                    { text: 'Check Date', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                    { text: 'EFT Date', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                    { text: 'Pay Method', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                    { text: 'Remitted', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true,true]},
                                    { text: 'Adjustments', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true, true]},
                                    { text: 'Paid Amount', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true, true]}, 
                                  ],                                       
                                ...obj1.checkdetails.map(obj2 => {
                                  return obj2.subtotal != true ? 
                                    [
                                    {text: obj2.subclientname, fontSize: 9, border: [true, true, true, true]},
                                    {text: obj2.checknumber, fontSize: 9, border: [true, true, true, true]},                                  
                                    {text: this.datePipe.transform(obj2.checkdate, "MM/dd/yyyy"), fontSize: 9, border: [true, true, true, true]},
                                    {text: this.datePipe.transform(obj2.eftdate, "MM/dd/yyyy"), fontSize: 9, border: [true, true, true, true]},
                                    {text: obj2.paymentmethodcode, fontSize: 9, border: [true, true, true, true]},
                                    {text: obj2.paidamount, fontSize: 9, alignment: 'right', border: [true, true, true, true] },
                                    {text: obj2.plbamount, fontSize: 9, alignment: 'right',  border: [true, true, true, true] },
                                    {text: obj2.payment, fontSize: 9, alignment: 'right', border: [true, true, true, true] } 
                                    ] :
                                    [                                                
                                      { text: obj2.subclientname + " SubTotal: ", fontSize: 10, bold: true, alignment: 'right', border: [true, true, true, true], colSpan: 7}, {}, {}, {}, {}, {}, {}, {text: obj2.totalpaidamount, fontSize: 10, alignment: 'right', bold: true, border: [true, true, true, true]}  
                                    ]
                                }),
                              ]
                            }
                          } ]                                                                           
                      ]
                    })
                ],

              (this.UnmappedDetails.length == 0 || this.UnmappedDetails[0].checkdetails.length == 0) ? {} :
              [
                ...this.UnmappedDetails.map(obj1 => {
                  return [
                    (obj1.checkdetails.length <= 15) ? 
                    {
                      unbreakable: true,    
                      border: [true, true, true, true],                     
                      stack: [
                              '\n',
                              {
                              style: 'tableExample',
                              table: {     
                              widths: [180, 100, 50, 50, 50, 90, 90, 90],
                              body: [
                                [
                                  { text: 'Unmapped Claims', fontSize: 11, bold: true, border: [true, true, true, true], colSpan: 6}, {}, {}, {}, {}, {}, { text: 'Division Paid:  ' + obj1.totalpaidamount, fontSize: 11, alignment: 'right', bold: true, border: [true, true, true, true], colSpan: 2 }, {}                     
                                ],
                                [
                                  { text: 'Practice Name', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                  { text: 'Check Number', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                  { text: 'Check Date', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                  { text: 'EFT Date', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                  { text: 'Pay Method', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                  { text: 'Remitted', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true, true]},
                                  { text: 'Adjustments', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true, true]},
                                  { text: 'Paid Amount', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true, true]}
                                ],                    
                                ...obj1.checkdetails.map(obj2 => {
                                  return [
                                    {text: obj2.subclientname, fontSize: 9, border: [true, true, true, true]},
                                    {text: obj2.checknumber, fontSize: 9, border: [true, true, true, true]},                                  
                                    {text: this.datePipe.transform(obj2.checkdate, "MM/dd/yyyy"), fontSize: 9, border: [true, true, true, true]},
                                    {text: this.datePipe.transform(obj2.eftdate, "MM/dd/yyyy"), fontSize: 9, border: [true, true, true, true]},
                                    {text: obj2.paymentmethodcode, fontSize: 9, border: [true, true, true, true]},
                                    {text: obj2.paidamount, fontSize: 9, alignment: 'right', border: [true, true, true, true] },
                                    {text: obj2.plbamount, fontSize: 9, alignment: 'right',  border: [true, true, true, true] },
                                    {text: obj2.payment, fontSize: 9, alignment: 'right', border: [true, true, true, true] },
                                  ]
                              })                                       
                            ]
                          }
                        }
                      ]
                    } 
                    : [
                      '\n',
                            {
                            style: 'tableExample',
                            table: {     
                            widths: [180, 100, 50, 50, 50, 90, 90, 90],
                            body: [
                              [
                                { text: 'Unmapped Claims', fontSize: 11, bold: true, border: [true, true, true, true], colSpan: 6}, {}, {}, {}, {}, {}, { text: 'Division Paid:  ' + obj1.totalpaidamount, fontSize: 11, alignment: 'right', bold: true, border: [true, true, true, true], colSpan: 2 }, {}                     
                              ],
                              [
                                { text: 'Practice Name', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                { text: 'Check Number', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                { text: 'Check Date', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                { text: 'EFT Date', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                { text: 'Pay Method', fontSize: 9, italics: true, bold: true, border: [true, true, true, true]},
                                { text: 'Remitted', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true, true]},
                                { text: 'Adjustments', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true, true]},
                                { text: 'Paid Amount', fontSize: 9, italics: true, bold: true, alignment: 'right', border: [true, true, true, true]}
                              ],                    
                              ...obj1.checkdetails.map(obj2 => {
                                return [
                                  {text: obj2.subclientname, fontSize: 9, border: [true, true, true, true]},
                                  {text: obj2.checknumber, fontSize: 9, border: [true, true, true, true]},                                  
                                  {text: this.datePipe.transform(obj2.checkdate, "MM/dd/yyyy"), fontSize: 9, border: [true, true, true, true]},
                                  {text: this.datePipe.transform(obj2.eftdate, "MM/dd/yyyy"), fontSize: 9, border: [true, true, true, true]},
                                  {text: obj2.paymentmethodcode, fontSize: 9, border: [true, true, true, true]},
                                  {text: obj2.paidamount, fontSize: 9, alignment: 'right', border: [true, true, true, true] },
                                  {text: obj2.plbamount, fontSize: 9, alignment: 'right',  border: [true, true, true, true] },
                                  {text: obj2.payment, fontSize: 9, alignment: 'right', border: [true, true, true, true] },
                                ]
                            })                                       
                          ]
                        }
                      }
                    ]                                       
                  ]
                })
              ],

              (this.UnmappedPLBDetails.length == 0 || this.UnmappedPLBDetails[0].plbdetails.length == 0) ? {} :
              [
                ...this.UnmappedPLBDetails.map(obj1 => {
                  return [
                    (obj1.plbdetails.length <= 15) ? 
                    {
                      unbreakable: true,    
                      border: [true, true, true, true],                     
                      stack: [
                              '\n',
                              {
                              style: 'tableExample',
                              table: {     
                              widths: [180, 100, 50, 50, 50, 90, 90, 90],
                              body: [
                                [
                                  { text: 'Unmapped Adjustments', fontSize: 11, bold: true, border: [true, true, true, true], colSpan: 6}, {}, {}, {}, {}, {}, { text: 'Total: ' + obj1.totaladjustmentamount, fontSize: 11, alignment: 'right', bold: true, border: [true, true, true, true], colSpan: 2 }, {}                
                                ],
                                [
                                  { text: 'Check Number', fontSize: 9, border: [true, true, true, true], colSpan: 6}, {}, {}, {}, {}, {}, { text: 'Adjustment Amount', fontSize: 9, alignment: 'right', border: [true, true, true, true], colSpan: 2 }, {}
                                ],                    
                                ...obj1.plbdetails.map(obj2 => {
                                  return [
                                    { text: obj2.checknumber, fontSize: 9, border: [true, true, true, true], colSpan: 6}, {}, {}, {}, {}, {}, { text: obj2.totaladjustmentamount, fontSize: 9, alignment: 'right', bold: true, border: [true, true, true, true], colSpan: 2 }, {}
                                  ]
                              })                                       
                            ]
                          }
                        }
                      ]
                    } 
                    : [
                      '\n',
                            {
                            style: 'tableExample',
                            table: {     
                            widths: [180, 100, 50, 50, 50, 90, 90, 90],
                            body: [
                              [
                                { text: 'Unmapped Adjustments', fontSize: 11, bold: true, border: [true, true, true, true], colSpan: 7}, {}, {}, {}, {}, {}, {}, { text: 'Total: ' + obj1.totaladjustmentamount, fontSize: 11, alignment: 'right', bold: true, border: [true, true, true, true] }                   
                              ],
                              [
                                { text: 'Check Number', fontSize: 9, border: [true, true, true, true], colSpan: 7}, {}, {}, {}, {}, {}, {}, { text: 'Adjustment Amount', fontSize: 9, alignment: 'right', border: [true, true, true, true] }
                              ],                    
                              ...obj1.plbdetails.map(obj2 => {
                                return [
                                  { text: obj2.checknumber, fontSize: 9, border: [true, true, true, true], colSpan: 7}, {}, {}, {}, {}, {}, {}, { text: obj2.totaladjustmentamount, fontSize: 9, alignment: 'right', bold: true, border: [true, true, true, true] }
                                ]
                            })                                       
                          ]
                        }
                      }
                    ]                                       
                  ]
                })
              ] 
            ],
            styles: {
              header: {
                fontSize: 10,
                bold: true,
                alignment: 'center'
              }
            }
          };
        } else {
          return {};
        }
      }      
    } catch (error) {
      // this.clsUtility.LogError(error);
      console.log('getDocumentDefinition : ', error);
    }
  }

  getpdfheader() {
    try{
      return [
        {
          style: 'tableExample',
          margin: [30, 10, 30, 50],
          alignment: 'center',
          table: {
            widths: [600, 150],
            body: [
              [
                {
                  text: '\n' + this.clientname + "\n\nDivision - Check and Practice Totals\n\n" + this.filename + '_' + this.InputPayername + '_' + this.InputFileshareid,                         
                  style: 'header',
                  alignment: 'center',
                  border: [true, true, false, false]
                },
                {                        
                  image: 'data:image/jpeg;base64,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',
                  width: 120,
                  margin: [0, 20, 0, 20],
                  border: [false, true, true, false]
                }                     
              ],
              [
                {                        
                  text: '',    
                  border: [true, false, false, true]                         
                },
                {
                  text: 'Process Date : ' + this.datePipe.transform(this.processdate, "MM/dd/yyyy"),                         
                  style: 'header',
                  alignment: 'center',
                  border: [false, false, true, true]
                }                     
              ]
            ]
          }
        },
      ]
    }
    catch (error) {
      // this.clsUtility.LogError(error);
      console.log('getDocumentDefinition : ', error);
    }
  }

  getDocumentDefinitionPLBmessage() {      
    try {
      if(this.ReportItemsPLB != null && this.ReportItemsPLB != undefined) {
        if(this.ReportItemsPLB != null) {          
          return {
            pageOrientation: 'landscape',
            pageSize : 'A4',
            fontSize: 10,
            pageAlignment: 'center',
            width: 'auto',          
            content: [  
              {
                text: this.plbmessage
              },              
              '\n',
              '\n' ,                                                       
            ]
          };
        } else {
          return {};
        }
      }      
    } catch (error) {
      // this.clsUtility.LogError(error);
      console.log('getDocumentDefinition : ', error);
    }
  }

  getDocumentDefinitionPLB() {      
    try {
      if(this.ReportItemsPLB != null && this.ReportItemsPLB != undefined) {
        if(this.ReportItemsPLB != null) {          
          return {
            pageOrientation: 'landscape',
            pageSize : 'A4',
            fontSize: 10,
            pageAlignment: 'center',
            width: 'auto',          
            content: [  
              {
                style: 'tableExample',                
                alignment: 'center',
                table: {
                  widths: [400, 350],
                  body: [                   
                    [
                      {
                        text: '\n' + (this.clientname == null ? '' : this.clientname) + "\n\n" + (this.filename == null ? '' : this.filename) + '_' + (this.InputPayername == null ? '' : this.InputPayername) + '_' + (this.InputFileshareid == null ? '' : this.InputFileshareid) + "\n\nProvider Level Adjustment Summary\n",                         
                        style: 'header',
                        alignment: 'center',
                        border: [true, true, true, true]
                      },
                      {                        
                        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEATgBOAAD/4QBWRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAAITAAMAAAABAAEAAAAAAAAAAABOAAAAAQAAAE4AAAAB/9sAQwAFAwQEBAMFBAQEBQUFBgcMCAcHBwcPCwsJDBEPEhIRDxERExYcFxMUGhURERghGBodHR8fHxMXIiQiHiQcHh8e/9sAQwEFBQUHBgcOCAgOHhQRFB4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4e/8AAEQgBlwUAAwEiAAIRAQMRAf/EAB0AAQACAwADAQAAAAAAAAAAAAAICQUGBwIDBAH/xABcEAABAwICBAQPCgsGAwgDAQAAAQIDBAUGEQcIEiExQVFhCRMWGCI2N1ZxdHWBlLKzFDI4QnJzkbHR0xUjQ1JVYoKVobTSFzODkqLBJDVURFNjk6OlwvA0w+El/8QAGwEBAAMBAQEBAAAAAAAAAAAAAAQFBgMBAgf/xAA7EQACAQICBgcHBAICAgMAAAAAAQIDBBExBRITITNxFTJBUVKBkQYUYaGx0fAiNMHhQmIjJBZDU3Ki/9oADAMBAAIRAxEAPwDnHXDaYu/Sb0Km+7HXDaYu/Sb0Km+7OWA0uwp+FehnttU8T9TqfXDaYu/Sb0Km+7HXDaYu/Sb0Km+7OWAbCn4V6DbVPE/U6n1w2mLv0m9Cpvux1w2mLv0m9CpvuzlgGwp+Feg21TxP1Op9cNpi79JvQqb7sdcNpi79JvQqb7s5YBsKfhXoNtU8T9TqfXDaYu/Sb0Km+7HXDaYu/Sb0Km+7OWAbCn4V6DbVPE/U6n1w2mLv0m9Cpvux1w2mLv0m9CpvuzlgGwp+Feg21TxP1Op9cNpi79JvQqb7sdcNpi79JvQqb7s5YBsKfhXoNtU8T9TqfXDaYu/Sb0Km+7HXDaYu/Sb0Km+7OWAbCn4V6DbVPE/U6n1w2mLv0m9Cpvux1w2mLv0m9CpvuzlgGwp+Feg21TxP1Op9cNpi79JvQqb7sdcNpi79JvQqb7s5YBsKfhXoNtU8T9TqfXDaYu/Sb0Km+7HXDaYu/Sb0Km+7OWAbCn4V6DbVPE/U6n1w2mLv0m9Cpvux1w2mLv0m9CpvuzlgGwp+Feg21TxP1Op9cNpi79JvQqb7sdcNpi79JvQqb7s5YBsKfhXoNtU8T9TqfXDaYu/Sb0Km+7JJ6mePsW47tOJJsWXh9zko54GwK6GOPYRzXqqdg1M88k4SDJMDoev/ACLF/jNN6shFvKUI0W0kSbSpOVVJtkpQAUhcGm6brzcsP6JcSXqz1K0tfR0TpYJka1yscipvyciovnQhB1w+mPv0m9CpvuyaGsh3CsX+Tn/WhW2W2j6cJQbksd5WX1SUZrVeB1Trh9MffpN6FTfdjrh9MffpN6FTfdnKwT9hS8K9CDtqnifqdU64fTH36TehU33Y64fTH36TehU33ZysDYUvCvQbap4n6nVOuH0x9+k3oVN92OuH0x9+k3oVN92crA2FLwr0G2qeJ+p1Trh9MffpN6FTfdn6zWJ0xtXNMZy+egpl+uM5UBsKXhXoe7ap4n6nXodZXTHGqK/FUUvM+202/wCiNDM27Wt0p0qos6WKuTknolTP/I9pwgHy7ek/8UeqvVX+TJS2TXFu0bmpesFUNQnxnUlY6HLnyc1/0ZnRcL61ujW5uZHdYrvY5F986en6bEngWNXO/wBKEFQcpWNGXZgdY3tWPbiWkYTxlhXFcHTsOYhtt0REzc2nna57flMz2m+dEM6VP0tRPS1DKilnkgmjXaZJG9WuavKipvQ7Ro11mNIeFXRU12qW4mtzckWKucvT0T9WZOyz+VtEOpo6S3weJKp38XumsCfAOb6I9NWCdI8bae11q0V22c322sVGTc6s35SJ8lc8uFEOkFfKEoPCSJ0ZRmsYsAA+T6AAAAAAAAAAAAI1a5eknGuBb3h2nwpfH22KrppnztbBFJtq1zURezauXCvAcC64bTF36TehU33Z1DohHbHhPxSo9dpFwvLSlCVFNxRTXNWaqtJs6n1w2mLv0m9CpvuzuupxpNxxjnFt8osV36S5U9NQNlhY6CKPZcsiJnmxqLwcpDckx0Pzt7xJ5MZ7Vp7dUqcaMmoo8tqs3VSbZM0AFEXQAAAAAAAAAAAAAAAAAAAAAOKa4+O+pLRTNaqSbYud/V1HFkvZNhy/HP8A8qozwyIdrK8NafHfVxpar5KWbplrtedBRZL2LkYq7b0+U/aVF5EbyEuypbSpvyRFu6uzpvDNnKTaNFGL6rAukG0YnptpyUc6LPG1f72F3YyM87VXLnyXiNXBeySksGUqbi8UWvW2sprjb6a4UUzZ6WpibNDI3gexyIrXJzKiop7yPmo9jv8AD+jyfCdbNtV9heiQ7S730r1VWeHZdtN5k2CQZm6tN05uL7DQUqiqQUkAAczoAAAAAAAAAAAAAAAAAAAAAQGxzp70tW/G19t9Hi+WKmprlUQwsSjp12WNkcjUzWPNckROEw/XD6Y+/Sb0Km+7NL0ld0bE3leq9s8180cKFPVX6V6FBKtUxf6n6nVOuH0x9+k3oVN92OuH0x9+k3oVN92crB9bCl4V6HztqnifqdU64fTH36TehU33Y64fTH36TehU33ZysDYUvCvQbap4n6nVOuH0x9+k3oVN92OuH0x9+k3oVN92crA2FLwr0G2qeJ+p1RNYfTGi9uk3oNN92e+LWR0ys4cXI9P1rbS/dnJANhS8K9D3bVPE/U7dQa0mlmnVFmrrVWZcU1A1M/8AJsm0WfXBxdCqfhfCtkrETh9zSSwKv+ZX/URpB8O1ov8AxPpXNVf5E1cN63mDKxzWX3D14tTncL4XMqY2+Fc2u+hqnW8G6WNHeLnMjsWLLdNUP97TyvWCZV5EZJk5fMilZ4OE9HU31dx3hf1FnvLZQVwaOtNmkXA7o4rXfpauhZknuGvznhy5ERV2mJ8hWkp9Ees3g/Fr4bbiRiYaur8mos0m1Syu/Vk3bCryPRE4s1UgVbKpT3reiZSvKdTc9zO8A/GuRzUc1UVqpmiou5T9IZLAAAAAAAAAAAAAAAAAAAAAAPCaWKCF800jIoo2q573uRGtROFVVeBDhGlLWgwThh8tBhxjsT3FmabUD9ilYvPLv2v2EVF5UOlOlOo8IrE+J1I01jJnejSsb6V9HuDXPiv+KaCCpZw0sTlmnReRY2ZuTzohBzSLp20kY1WWGtvj7db3/wDYrdnBHlyOVF23pzOcqHMywp6N7Zv0IFTSHgRMjFeuBh+mV8WGcLXC4uTc2atmbTs8KNbtqqeHZOX4g1rdJ1wVzbcyzWdnxVgpOmPTwrI5yL9CHBgTIWdGPYRJXdWXadCuum3SvcnK6ox1d2KvD7mkSnT/ANNG5GvVWOsbVSqtVjDEM6rw9MuUzs/pcfXhbRrj3E6MdYsJXesif72ZKZzIl/xHZN/idKsOqppSuCI6ubZrQnGlVWbbk/8AKa9P4n05UKeeCPFGtPLFnIFxPiVXI5cQ3dVTgX3bJ9p9lJjzHFI7apMZYigVOOO5zN+pxIW2anFye1FuWO6SB3G2ntzpU+lz2/UZuDU5siInT8bXF68asomN+tynJ3dv3/I6K1r93zOA2nTjpYtiotNjm6yZf9S5tR7RHG84e1sdJNArW3Omst3jT3yy0yxSL4FjcjU/yqdN6zzDHffeP/IjPkq9Ti1OavuXHVbEvEstva/6ntOTr2ks18jpGjdRyfzPvwnrfYWq1bHiXDVztT13LJSyNqY051z2HIngRTtGCNJmBMZtamHMT2+smcmaUyydLn/8t+Tv4EZrtqd4iiR34JxlaqteL3TTSQZ/5VeaLiDVq0t2ZVlgstPc2M39MoKxjlTLjRrtly+ZDk6FrU6ksPz4nWNa5h1o4/nwLAQQGw1pf00aLauKhvrLnNSNXZ9xX6nk3on5j3ZPTdwZKqcykjNFesrgTGCxUV3kXDN0fkiRVkiLA9f1Ztyf5kbzZkapZ1ILFb18CRTu6c9z3P4nbQfjXNc1HNVHNVM0VF3Kh+kUkgAAAAAAAAAAAAAAFWXUtibvdu/oUn2DqWxN3u3f0KT7C00Fn0m/CV3Ry8RVl1LYm73bv6FJ9g6lsTd7t39Ck+wtNA6TfhHRy8RVl1LYm73bv6FJ9g6lsTd7t39Ck+wtNA6TfhHRy8RVl1LYm73bv6FJ9g6lsTd7t39Ck+wtNA6TfhHRy8RVl1LYm73bv6FJ9g6lsTd7t39Ck+wtNA6TfhHRy8RVl1LYm73bv6FJ9g6lsTd7t39Ck+wtNA6TfhHRy8RU9UQTU074KiKSGaNdl8cjVa5q8iou9FPWb1rAd27GPlef11NFLWEtaKZWyWq2gZGhsd6rqdKihs9wqoVVUSSGme9qqnDvRMjHE+dSbuC0PjtT65xua2xhrYYnW3o7aWriQe6lsTd7t39Ck+wdS2Ju927+hSfYWmggdJvwk3o5eIqy6lsTd7t39Ck+wdS2Ju927+hSfYWmgdJvwjo5eIqy6lsTd7t39Ck+wdS2Ju927+hSfYWmgdJvwjo5eIqy6lsTd7t39Ck+wdS2Ju927+hSfYWmgdJvwjo5eIqy6lsTd7t39Ck+wdS2Ju927+hSfYWmgdJvwjo5eIqy6lsTd7t39Ck+wlnqD2y5W2yYsbcbfV0ayVNMrEnhdHtZNfnlmiZkmgcq186sHDA6UbNUp62IABBJpz7WQ7hWL/Jz/rQrbLJNZDuFYv8AJz/rQrbLnRvDfMqdIddcgeUbHSPaxjXOe5URrWpmqryIeJl8FduNl8oQe0QsG8EQUsWfvUrifvcvHoUn2DqVxP3uXj0KT7C00FT0m/CWfR68RVl1K4n73Lx6FJ9g6lcT97l49Ck+wtNA6TfhHR68RVl1K4n73Lx6FJ9h6ZbBfYv7yy3JnyqV6f7FqYPek34R0cvEVOyRvierJGOY5OFrkyVDwLX6ukpauPpdVTQzsX4sjEcn0KanfNFWje9NclxwRYZHP99JHRsikX9tiI7+J9R0lHtifD0e+yRWYCc2LdU/R1c2PfY6m6WGdfeJHN0+JPC2TNy/50OE6RNWLSHhlklVaIocTULN+1QoqTonPCu9V5mK4lU7ylPdjhzI87SrDsxOHg9lRDLTzvgnifFLG5WvY9qtc1U4UVF4FPWSiMeynmmp5456eV8M0bkeyRjla5rkXNFRU3oqEqtXjWZlbNT4Z0k1SPjdlHTXl25WrwI2flT/AMTi+NnvckUQcatGFWOEjrSqypPGJbJG9kkbZI3NexyIrXNXNFReBUP0hrqi6cZbPW0uAMW1ivtc7kjtlXK7fSvVckicq/k14EX4q7uBexmUUNejKjLVZd0a0asdZAAHE6gAAAAAAAAEPeiEdseE/FKj12kXCUfRCO2PCfilR67SLhoLLgRKO740gSY6H5294k8mM9q0jOSY6H5294k8mM9q09u+DI8teLEmaADPF6AAAAAAAAAAAAAAAAAAAAAcx1nMd9Qeia41lNN0u6V6e4aDJcnJI9FzenyWo52fKjeUroO565+O+qnSk+x0c23bcPNdStyXc6oVc5neZURn7C8pwwvrKjs6eLzZSXdXXqYLJAAEwim/6vuOHYA0p2q+SSKygkf7luCcS08iojlX5Ko1/hahZKxzXsR7HI5rkzRUXNFTlKmyf+p9jvqw0T09BVzbdzsKtoqjNc3OiRPxL/O1NnPjVilXpGjilURZWFXe4M7MACpLMAAAAAAAAAAAAAAAAAAAAAq60ld0bE3leq9s8182DSV3RsTeV6r2zzXzUQ6qM5LNgydJh6/1dOyppLJc6iB6ZskipHua5OZUTJTGFjeq33AcJ+Kv9q84XNd0YqWGJ2tqG2k1jgV+dSuJ+9y8ehSfYOpXE/e5ePQpPsLTQQek34SZ0evEVZdSuJ+9y8ehSfYOpXE/e5ePQpPsLTQOk34R0evEVXyYbxDH/eWG6s+VRyJ/sfBVUlVSu2ammmgVeKRit+stfPx7GSMVj2tc1eFFTNFPVpN9sfmedHLxfIqbBaHecCYKvO1+FcI2KtcvC6a3xOd/mVuaHO8T6suii8o91NaauzTO/KUFU5ERfkv2mp5kQ6x0lB9ZYHOWj5rJkAASXx7qjYlt7JKnB97pb1Gm9KWqb7nn8COzVjl8KtI+Ynw7fMM3R9rxBaqu2VjN6xVEasVU5U4nJzpmhMp1qdTqsi1KM6fWRiwAdTkdp0C6wGIdH08Fpu75rxhnNGrTPdnLSpywuXi/UXcvFs55k58JYis2KrBTX2wV8Vdb6lu1HKxfpaqcLXJwKi70KrzpmgDS1dtF+J0lastVYqt6JcKHa3OTg6YzPckiJ9Kbl4lSBdWaqLWhn9SdbXbh+mWRYyD4bBdrdfrLSXm01UdXQVkTZYJmLuc1fqXlRd6LuU+4pGsC3W8AAAAAAAAAAAAAAAHN9MumbCOjSlWK4zrXXh7NqG2UzkWV2fAr14I286714kU5RrE6ysNpdU4X0eTx1Fwaqx1N2REdHAvArYuJ7v1vepxZrvSIFfWVdfWzVtdUzVVVO9XyzTPV73uXhVVXeqljbWLn+qpuRAuL1R/TDM3/AEuaZsa6R53xXWu9x2nazjtlIqshTkV/HIvO7zIhzkGWwnhu+YqvUNmw7bKi410vvYoW55Jxucq7mtTjVVRELaMY044LciscpTeL3sxJsmBcCYtxvX+48L2OruLkVEkkY3Zij+XIuTW+dSUuiDVStNuZDc9IdSlzq9zkttM9W08fM96ZOevMmSfKQklardb7Tb4rfa6KmoaOFuzFBTxJGxiciNTchBraQjHdDeTKVjKW+e4ito91QlVsdVjvEKtXcq0VrT+DpXp9KI3wKd8wVol0d4QbGtkwrb2VDOCqnj6fPnyo9+ap5skN3BW1LmrUzZYU7enTyQABwOwAAAAAAAAB6a6jpK6lfS11LBVU8iZPimjR7HJzou5TkePNW7RjidsktLa34frHb0mtjulsz54lzZl4ERec7ED7hUnB4xeB8TpxnuksSMtowppw0KuTqbqmY+wpEubrcqq2eNn/AIbFzcxeRGK5ONWnY9FmlDDGkGlkba5pKS6026stdY3pdTTuTcubV4Uz+Mm7lyXcbuajjfR1hrFdVFcqmCW33um30t3oH9JrIFTgyenvk/Vdmm9dx0lVjU66396/k+I03T6j3dzNuBq+H63ENpe214sWKtanYwXmmj2I5uRJo/yMnOmbHLwK1VRptBxawOqeIAB4egAAAAAAAAAAAAAAAAAAAAAAAAAAFamsB3bsY+V5/XU0U3rWA7t2MfK8/rqaKaal1FyM7U675gnzqTdwWh8dqfXIDE+dSbuC0PjtT65E0hwvMlWHF8jtgAKQuAAAAAAAAAAAAAAAAAADn2sh3CsX+Tn/AFoVtlkmsh3CsX+Tn/WhW2XOjeG+ZU6Q665Ay+Cu3Gy+UIPaIYgy+Cu3Gy+UIPaIT3kyDHMtOABlzSAAAAAAAAAAAAHPNLuh3Bukiiet1om0l1RuUNzpmo2di8SO/wC8b+q7zKnCQV0v6MMS6M7/APg6+QpLSzKq0ddEi9JqGpyLxOTjau9OdFRVstMBpAwhZMcYVq8O3+mSekqG7nJufC9PeyMXicnL4UXNFVFmW13Kk8HvRFuLWNVYrcyrkG06VMEXXR9jatwzdk2nwLtwTo3JtRCuexI3w5b04lRU4jVi8jJSWKKVpxeDBPbVC0nvxzgV1mu9R0y+2RrYpXvXN1RAu6OReVUy2XLyoir74gSb9q/42fgLSraL26VWUL5Epa9M9y08iojlX5O5/hahwuqO1ptdqO9tV2U8exlk4CKipmi5oDPF6AAAAAAAAAQ96IR2x4T8UqPXaRcJR9EI7Y8J+KVHrtIuGgsuBEo7vjSBJjofnb3iTyYz2rSM5Jjofnb3iTyYz2rT274Mjy14sSZoAM8XoAAAAAAAAAAAAAAAAAANK0342iwBoyu+I1c33VHF0miY749Q/NGJlxoi9kqcjVN1IU69OO/wxjWkwVRTbVHZW9Nqkau51S9OBfkMVE8L3ISLWltaiXYcLirs6bfaR0nllnnknmkdJLI5Xve5c1c5VzVVXlPWAaIoQDt2q3oeptJa4hrbykjLdSUjqalka5zcqyROwfu4UYnZK1dy7Tc9xx292yss15rbRcYVhrKKd9PPGvxXscrVT6UOcakZScVmj7dOSipPJnxnW9U/HfUTpaom1U3S7XeMqCrzXsWq5U6W9fkvy38SOcckP3gPZwU4uL7RCbhJSRbIDm2rXjrq90T225VE3TLnRp7iuGa71ljROzX5TVa7wuVOI6SZqcHCTi+w0EJKUVJAAHyfQAAAAAAAAAAAAAAAAABV1pK7o2JvK9V7Z5r5sGkrujYm8r1Xtnmvmoh1UZyWbBY3qt9wHCfir/avK5CxvVb7gOE/FX+1eQNI8Ncybo/iPkdKABTFsAAAAAAAAADCYzwlhzGNnfacS2mmuNK7PJJW9lGv5zHJ2THc6KimbB6m08UeNJrBkDtYXV8u2j9Jr/h9811wyi5vc5M56PP/ALxETsm/rp50Tcq8LLYp4op4XwTxslikarHse1Fa5qpkqKi8KKQN1rtD7dHuImXyxQuTDV0kVImpvSkm3qsWf5qoiq3mRU4s1uLO82n6J5lVdWup+uGRw8AFiQCTOpDpPfar87R5d6hfcFxcslsc926Go4VjTkR6JmifnJyuUmYVQ2+rqaCvp66jmfBU00rZYZGLk5j2rm1yc6KiKWb6KMVw420d2XFEWyjq6mR0zG8DJm9jI3wI9HJ4Cm0hR1Za67S2sK2tFwfYbOACuJ4AAAAAAAAB+Pc1jFe9yNa1M1VVyREIa60OsJLfJKnBuBa10dpTOOuuMTsnVfEsca8UfKvxvk+++3W904Pq56rR5hCsypWKsV3rInf3ruBYGKnxU4HLxr2PAi5xYLaytMP+SfkVl3df4QABJDVl1eZcUJTYvxtBJBYlyko6F2bX1qcTncbYv4u5k3rPq1Y0o60iDTpSqS1Yml6B9BeItJc7bjMrrThxj8pK6Rmbpsl3thavvl4tr3qc6pkTk0d4EwxgKyNtOGbZHSRqidOmXspp3J8aR/C5f4JnuRENgo6amoqSKko4IqenhYjIoomI1jGomSIiJuRETiPaUde6nWe/LuLmhbRpL4gAEYkAAAAAAAAAAAAAAAAAAAAAH45Ec1WuRFRUyVF4z466aahZ0+OF01MxPxkcbc3sRPjNRPfZcbeHk37l+0HzJNrBM+otJ71ieqjqaespY6mlmZNDI3aY9i5o5D2mnYijrcK1UuILRC6e2vdt3Khbxcs0fI785OBeHnTZrPcqK726K4W+ds9PKmbXJ9SpxKnIcaVfWk6c90l813r4fQkVrbVgqsN8H29z7n8frmfWACQRQAAAAAAAAAAAAAAAAAAAAAAACtTWA7t2MfK8/rqaKb1rAd27GPlef11NFNNS6i5Gdqdd8wT51Ju4LQ+O1PrkBifOpN3BaHx2p9ciaQ4XmSrDi+R2wAFIXAAAAAAAAAAAAAAAAAABz7WQ7hWL/Jz/AK0K2yyTWQ7hWL/Jz/rQrbLnRvDfMqdIddcgZfBXbjZfKEHtEMQZfBXbjZfKEHtEJ7yZBjmWnAAy5pAAAAAAAAAAAAAAADgeuxgKPEejbqppIUW52BemOc1N76Zy5SNX5O5/MiO5SCxa5dqCmulqq7ZWM6ZTVcD4Jm/nMe1WuT6FUqwvlvmtN7rrVUf31FUyU8m74zHK1f4oXGjqmMHB9hU39PCSku0+IAFkQCyfV3xG7FGhfDN1lk250o0pp3KuarJCqxOVeddjPzm/Ed9Qi5uqdFN1tr3ZrRXZ6sTkY+ONU/1I8kQZu4hqVZI0FCWtTTAAOJ1AAAAAAIe9EI7Y8J+KVHrtIuEo+iEdseE/FKj12kXDQWXAiUd3xpAkx0Pzt7xJ5MZ7VpGckx0Pzt7xJ5MZ7Vp7d8GR5a8WJM0AGeL0AAAAAAAAAAAAAAAAAA1/SPimjwXga7YnrslioKd0jWKuXTJOBjP2nK1POVjXq5Vl4vFZdrhMs1ZWzvnnkXhc97lc5fpUlBr6Y76bV2zR9QzdjDlXXFGr8dUVImL4EVzlT9Zi8RFMu9H0dSnrPNlPe1daequwHnDHJNKyKJjpJHuRrWtTNXKu5EROU8DtuptgXqs0rRXarh27bh9G1kuaZtdNnlC3/Miv/YJdSapwcn2EWnBzkoomBoJwTHgDRhacPKxqViR9PrnJ8aofvfv48tzUXkahGLXqwJ+CMaUeNqKHZpLy3pNUrU3NqWJuVflMRPOxyk1TStN+CosfaMrvhxWt91SRdNonu+JUM7Ji58SKvYqvI5SioV3CtrvtzLqtQUqWouzIrPB5zxSwTyQTRujljcrHscmStci5KipyngaEojvGpTjvqZ0nLh2sm2bdiFrYOyXc2pbmsS+fNzOdXN5CdpU/SzzUtVFU00r4p4XpJHIxcnNci5oqLyopZhoYxnDj3RtaMSsViTzw7FWxv5OdnYyJlxJmmacyoVGkaODVRdpa2FXFODNwABWFgAAAAAAAAAAAAAAAAAAVdaSu6NibyvVe2ea+bBpK7o2JvK9V7Z5r5qIdVGclmwWN6rfcBwn4q/2ryuQsb1W+4DhPxV/tXkDSPDXMm6P4j5HSgAUxbAAAAAAAAAAAAA1vSdhCgxzgW6YYuCIjKyFUikVM1hlTex6eByIvOmacZsgPYtxeKPGk1gyqS7UFVarrV2uuiWKro53wTxrwtexytcnmVFPlOy65VgZY9OtymiYjIrrTxV7URN2bkVj18743L5zjRpaU9eCl3meqQ1JOPcCZOoBiN1VhPEGF5pM1oKplXAir8SVqtcicyOjz8LyGx3/UQubqTTJVUCu7CvtMrNnlc17Hov0Nd9JxvI61GR2tJatVE5gAZ8vAAAAAAAcE1u9L64Jw8mFbBU7OIbpEu3Kxeyo6dc0V/M929G8m9d2SZ9Z0k4vtmBsFXHE91cnSaOLNkeeTppF3MjbzuXJObevAhWnjLEV0xZievxFeZ1nrq6ZZJHcTeJGtTiaiZIicSIhOsbfaS1pZIhXlfZx1VmzErvXNT8B3/VN0KdW9zTFmJaZ3U3RSZQwvTJK6VF97zxt+Nyr2P52VxVqRpxcpFXTpyqS1Ymb1VdAK35abG+NqRUtCKklvt8rf/wAteKSRP+75E+Nw+999MprWtajWojWomSIibkQRsbGxrGNa1jURGtamSIicSH6Z+vXlWliy8o0Y0o4IAA4nUAAAAAAAAAAAAAAAAAAAAAAAAAAAKiKioqIqLuVFOTXv3ZozxOlxoI3y4cuMn46nTgifxo3kXLenKmacWZ1k+DENppL3Zqm11rNqGdmznlvavE5OdF3kK9tXWhjB4TjvT+P2faWGjruNvUcaixpy3SXw7+azR7rZXUlyt8NfQzNmp5m7THt40+3mPpOGYCxBWYDxXU4avjlShdNsucvBE5feyJ+qqZZ82S8W/uaKioioqKi8CofOj75XdPFrCS3NdzPrSmjnZVUk8YS3xfegACeVoAAAAAAAAAAAAAAAAAAAABWprAd27GPlef11NFN61gO7djHyvP66mimmpdRcjO1Ou+YJ86k3cFofHan1yAxPnUm7gtD47U+uRNIcLzJVhxfI7YACkLgAAAAAAAAAAAAAAAAAA59rIdwrF/k5/wBaFbZZJrIdwrF/k5/1oVtlzo3hvmVOkOuuQMvgrtxsvlCD2iGIMvgrtxsvlCD2iE95MgxzLTgAZc0gAAAAAAAAAAAAAAAKz9PELIdNWMmMTJq3qqd53SOVf4qWYFZGmipbV6X8YVDHbTH3us2V5USZ6Iv0IWWjevIr9IdVGogAuCqJedD0lVbVjKDPsWT0j0TwtlT/AOKEqSLfQ9qdzbDi6qVOxkqqaNF52teq+uhKQz95x5F5acFAAEUkgAAAAAEPeiEdseE/FKj12kXCUfRCO2PCfilR67SLhoLLgRKO740gSY6H5294k8mM9q0jOSY6H5294k8mM9q09u+DI8teLEmaADPF6AAAAAAAAAAAAAAADHYmvNDh7Dtwvtzk6XR0FO+omdx7LUVck5VXLJE41VDIkY9fHHfuDDtvwFQzZT3JUq69GrvSBjl2Gr8p6Kv+HznWhSdWaic61RU4ORE/G+Iq7FmLrpiS5OzqrhUumemeaMRV7FiczUyanMiGGANIkksEZ9vF4sFiGqvgXqH0SUEVVD0u6XTKvrc07JqvRNhi8myxGoqcu1ykPdWTAvV3pZt1DUw9MtlAvu6vzTNqxsVMmL8pytblyKvIWLlXpGrlTRY2FLObAAKosyBmudgTqV0pvvdHDsW3EDXVTck7FtQi5TN86qj/ANvmOGlius/gTq70S3GkpoemXS3p7uoMkzc57EXaYnymK5MuXZ5CuovrKrtKWDzRSXdLZ1N2TBJXURx3+C8W12Bq2bKlu7VqKNHLubUsb2SJ8pif+micZGo+6wXWtsd8obzbZVhrKGoZUQP5Hscip5t3Ad61NVIOLONGo6c1ItXBg9H+JqLGOC7Via3qnSLhTNl2c8+lu4HsXna5FavOhnDNtNPBmgTTWKAAPD0AAAAAAAAAAAAAAAq60ld0bE3leq9s8182DSV3RsTeV6r2zzXzUQ6qM5LNgsb1W+4DhPxV/tXlchY3qt9wHCfir/avIGkeGuZN0fxHyOlAApi2AAAAAAAAAAAAAAAIY9ECiYmPsOzonZvtbmL4ElcqespGgkfr/VLX6TrHSI7N0Vma9ycm1NKn/wASOBobTgxKK64sgdf1OJXR6w2HmIu6WOrYvg9zSL/scgOx6mdO6bWDskjUzSCGqkdzJ0h7f/kh93HClyZ8UOJHmiwIAGbNAAAAADU9L+MIMC6OLziaVWrLSwKlMx35Sd3Yxt8G0qZ8yKp7GLk8EeSaisWRP13dIrr/AI1jwTbp87bY3Z1Oyu6WrVN/+Rq7PhV5HY91bU1FbWT1lXM+aonkdLLI9c3Pe5c1cq8qqqqeEEUs87III3ySyORjGMTNznKuSIicamkpU1Sgooz9Wo6k3Jm9aCdHFdpMx3T2SFXw2+HKa41TU/uYUXflxbTuBqcu/gRSxyxWq32SzUlotVLHS0NHE2GCFibmNamSJ/8A3jNB1cdG0OjfR3T0E0TPwzWo2oucqb16Yqbo0X81ibuTPaXjOlFLd3G1ngskW9rQ2UMXmwACISgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADl2nzDSVdqjxFTR/j6TKOoyT30SruX9lV+hV5D2aDMWrcrcuH66XOrpGZ07nLvki4MvC36lTkU6RWU8NXSTUtRGkkMzFjkavA5qpkqEY6xlfgrHL2wuVKi31Gcar+UZxZ8zmrv8JmtIt6PvI3cOrLdL8/MjYaIUdK2E7GfWhvi/z47uT+BKEHxWG5014s9LdKRc4amNHt5U5UXnRc08x9ppIyUkpLJmRnCUJOMlg0AAenyAAAAAAAAAAAAAAAAAAVqawHduxj5Xn9dTRTetYDu3Yx8rz+upoppqXUXIztTrvmCfOpN3BaHx2p9cgMT51Ju4LQ+O1PrkTSHC8yVYcXyO2AApC4AAAAAAAAAAAAAAAAAAOfayHcKxf5Of8AWhW2WSayHcKxf5Of9aFbZc6N4b5lTpDrrkDL4K7cbL5Qg9ohiDL4K7cbL5Qg9ohPeTIMcy04AGXNIAAAAAAAAAAAAAAAfDiK6U9kw/cbzVrlT0FLJUy78uxY1XL/AAQqvuFVLW19RWzrnLUSulevK5yqq/xUm7rvY6isOjdmE6WfK4356Ne1q72UzFzeq8m0qNbzoruQg2XOjqerByfaVN/UxmorsAB5RsfJI2ONrnvcqI1rUzVVXgRCxIBOfUUtLqHQxNcHtXO5XSaZq8rGNZGn+pjjvhq+iXDXUho0w/htzWtloqJjJ8uDpqptSKn7auU2gzVaevUlI0NGOpTUQADkdAAAAAACHvRCO2PCfilR67SLhKPohHbHhPxSo9dpFw0FlwIlHd8aQJMdD87e8SeTGe1aRnJMdD87e8SeTGe1ae3fBkeWvFiTNABni9AAAAAAAAAAAAAAAPTX1dNQUNRXVkzYaanidLNI5ckYxqKrnLzIiKpWXpbxhUY70iXfE8+0jKudUp43fk4G9jG3wo1Ez5814yXWu7jvqe0cx4Woptm4X9ysk2V3spmb3rzbS7LedFdyEGi30dRwi6j7Sqv6uMtRdgANy0LYLmx7pKtGG2tf7nmm6ZWPb8SnZ2Ui58S5JknOqFjKSim2QIxcngiX2pZgXqY0XJf6yHYuOIXNqVzTe2nTNIm+dFc/wPTkO6nrpoIaamipqeNsUMTEZGxqZI1qJkiInIiHsM3VqOpNyfaaGnBU4qKAAOZ9gru1pMCdQ2lq4QU0PS7Xc/8Aj6HJMmta9V2mJ8l6OTLk2eUsROI65WBeqvRVLeKSHbuWH1dVx5JvdAqZTN+hEf8Asc5Lsquzqb8mRbultKbwzRAgAF+UhLLUJx3vumj6um5a+3bS+BJWJ/pcifLUlmVb4AxLW4PxnasTW9V90W+pbLs55dMbwPYvM5qq1eZSzrD91or7YqG9W2VJqOup2VED+Vj2oqeBd/AUl/R1Z66yZcWNXWhqvsPuABAJoAAAAAAAAAAAAAABV1pK7o2JvK9V7Z5r5sGkrujYm8r1Xtnmvmoh1UZyWbBY3qt9wHCfir/avK5CxvVb7gOE/FX+1eQNI8Ncybo/iPkdKABTFsAAAAAAAAAAAAADWNKeL6LAuAbrietc1fckC9Ijcv8AezLujYnhcqeBM14j2KcngjxtJYsg1rcX5l908X1YnI6G39LoGLnxxt7NP86vOTHvr6uorq6orquV01RUSullkdwve5VVVXwqqnoNNThqRUe4z05a8nLvBIvUGtLqrShd7u5qrHQWpWIvI+SRiJ/pY8joTh1EsLvtOi6txDPHsy3ysVY1y3rDDmxv+tZSPez1aL+J3s4a1VfAkIACgLsAAAER9f3F6vqrHgamk7GNq3GsRF4XLtMiRfAnTFy/WaS4K0dO+JlxbpdxJe0k6ZA+tdDTLnu6TH+LYqeFrUXwqpO0fT1qmt3EK+nq08O80gkFqS6PUxJj6TFtwh27bYFa6JHJukqne8/yJm/mXY5SPzUVyojUVVXciIWUaAMEswFortFifEjK10fumvXLetRIiK5F+TuYnM1CffVtnTwWbIVnS16mLyRvgAKIugAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAca1ibLsT0F/ibuenuaZU5Uzcxfo2k8yHZTWtJ9qS74GudMjdqSOJZ4uXaZ2W7woip5yv0pb+8Ws4duGK5otNC3fut7Tn2Y4Pk939mh6vGIFX3Zhyok4P8AiKZFXzPan8Fy+UdhIoYTuz7HiWhurM/+HmRz0T4zOByedqqhK2KRksTJY3I5j2o5rk4FReBSD7PXW1t3Tecfp2Fr7V2KoXarRW6f1Wf8M8gAXxlgAAAAAAAAAAAAAAAAACtTWA7t2MfK8/rqaKb1rAd27GPlef11NFNNS6i5Gdqdd8wT51Ju4LQ+O1PrkBifOpN3BaHx2p9ciaQ4XmSrDi+R2wAFIXAAAAAAAAAAAAAAAAAABz7WQ7hWL/Jz/rQrbLJNZDuFYv8AJz/rQrbLnRvDfMqdIddcgZfBXbjZfKEHtEMQZfBXbjZfKEHtEJ7yZBjmWnAAy5pAAAAAAAAAAAAAa9pDxjY8C4VqsRX+qSGlgTJjE9/PIuezGxONy5fWq5Iiqarpf02YL0c08sNbWNuN5Rv4u2Ur0dLnxdMXgjTnXflwIpBjS1pKxLpJxCt0v1TswxqqUlFEqpDTNXianGq8bl3r4EREmW1nKq8XuREuLqNNYLez5NKWNrrpAxrXYmuy7Mk7tmGFHZtp4Uz2I28yJx8aqq8Zq4BeRiorBFM228WDsuqHgJ+MtK1NX1MG3abEra2pVU7F0iL+JZ53JtZcaMccmstsr7zdqW1Wulkq62rlbFBDGmbnvVckRCxzQNo6pNGuj+lsjNiW4S/j7jUN/KzqiZoi/mtREanMmfCqkW8r7OGCzZKtKO0ni8kb6AChLoAAAAAAAAAh70Qjtjwn4pUeu0i4Sj6IR2x4T8UqPXaRcNBZcCJR3fGkCTHQ/O3vEnkxntWkZyTHQ/O3vEnkxntWnt3wZHlrxYkzQAZ4vQAAAAAAAAAAAAfjnI1qucqI1EzVV4EP045reY76jdE1VR0k2xdL4q0NNkuTmxqn416eBvY58SvafdODqSUV2nxOahFyfYQ/1hscux/pUul5ilV9vhd7kt6Z7kgjVURyfKVXP/aOegGlhFQiorsM/KTk22CaOojgX8F4RrscVsOVVd3LT0auTe2mY7slT5T0/wDTavGRKwDhqtxhjO1YZt6L7ouFS2FHZZ9LbwuevM1qK5eZCzvD9qorFYqGy22JIqOhp2U8DORjGoiefdwkDSFXVhqLtJthS1pOb7D7gAUxbAAAA8Zo45oXwysbJG9qtexyZo5F3KipyHkACtLTpgmTAGk+7YeRjko2ydPoXL8anfmrN/Hlvaq8rVNHJs69GBPwzgelxnRQ7VZZHdLqdlN7qZ65Z8+y/JeZHOUhMaK1q7Wmn2lDcUtnUa7ATQ1Ecd/hPCddgWtmzqrS5aijRy73Uz3dkifJev8A6iJxELzcNDOM5sBaSbRiWNXrBBNsVbG/lIH9jImXGuyuac6ILmltabj2i3q7OomWag9dJUQ1dLFVU0rZYJmNkjkauaPaqZoqLyKh7DOl8AAAAAAAAAAAAAAAVdaSu6NibyvVe2ea+bBpK7o2JvK9V7Z5r5qIdVGclmwWN6rfcBwn4q/2ryuQsb1W+4DhPxV/tXkDSPDXMm6P4j5HSgAUxbAAAAAAAAAAA13HmOMLYHtK3LE94p6CLJelscucsypxMYnZOXwJu48j1JyeCPG0lizPVM8NNTS1NTNHDBExXySSORrWNRM1VVXciInGQK1qtMH9ouI2WeySvTDVskXpC7091y70WZU5Ms0ai78lVfjZJ+awOn69aRXSWWzsmtGGUdvg2vx1Xku5ZVTdlxoxM0z4VXJMuKFxZ2ez/XPMqrq61/0QyAALEgGZwRhy4YtxbbcN2pm3V187YWbs0YnxnrzNaiuXmRSzrC1locOYbt1htrNijt9MynhTj2WplmvOvCq8qnAdS7RPJh2yux5fqZY7rcotmgikTfBTLku2qcTn7vA3L85UJIFHfV9pPVWSLiyo6kdZ5sAAgk0AAA1nSvfVw1o0xHfWv2JKO3TSQr/4mwqM/wBStKwCfWutdVt2gavpmu2VuNbT0v0P6av8IiApc6NjhTb72VN/LGaR1DVawkmLtNNlpZoumUdA9bhVIqZpsRZK1F5lerGrzKWKkWuh+4bSKyYjxZKzsqidlBA5U3o1iI9+XMqvZ/lJSkO/qa1XDuJdlDVpY94ABCJYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPxzUc1WuRFRUyVF4z9ABErEVCtsv9fblRU9zVMkSc6I5URfoJD6Hrot0wBb3vdtS0yLTP/Y3N/07Jx3TXSe5dIte5EybO2OVvnYiL/FFNw1bq9Viu9rc7c10dQxPDm1y/wAGmN0S/dtIyo9jxXpvX0P0XTsffNDwuO1asvXc/qdgABsj86AAAAAAAAAAAAAAAAAAK1NYDu3Yx8rz+upopvWsB3bsY+V5/XU0U01LqLkZ2p13zBPnUm7gtD47U+uQGJ86k3cFofHan1yJpDheZKsOL5HbAAUhcAAAAAAAAAAAAAAAAAAHPtZDuFYv8nP+tCtssk1kO4Vi/wAnP+tCtsudG8N8yp0h11yBl8FduNl8oQe0QxALBrFEFPBlsoKmgVfRn+3y/ssukf8AX5/0WygqaA6M/wBvl/Y6R/1+f9Fsp65Z4Iv7yaNnynIhU8B0Z/t8v7POkf8AX5/0Wm1+KsL0Gfu7EdnpcuHp1dGzL6XGpXvTjontCOWqxxa5VbxUjnVOfg6Ujit8H3HRsO2R8vSEuxE1sWa3WDaFj48OWK63iZOB86tpoV58+yd/pQ4XpD1j9JOLGyU1PcWYfoXblhtiLG9yfrSqqv8AoVqcxx0EmnaUqeSI87qrPNnlI98j3Pe5z3uVVc5y5qq8qniASSOD30NJVV9bDRUVPLU1M70jihiYrnvcq5I1ETeqqpn9HeA8UY9vTbVhm2S1ciKnTZl7GGBv50j+BqfxXiRVJxaBNBWH9GlM241Kx3bEj2ZSVzmdjDmm9kKL71OJXe+XfwIuRGr3UKK359xIoW0qr+BhdVzQbHgCibiXEkUcuKKmPJrM0c2gjVN7GrwK9U985PAm7NXd3AKKpUlUlrSLqnTjTjqxAAOZ9gAAAAAAAAEPeiEdseE/FKj12kXCUfRCO2PCfilR67SLhoLLgRKO740gSY6H5294k8mM9q0jOSY6H5294k8mM9q09u+DI8teLEmaADPF6AAAAAAAAAAAACvjWzx31a6WqyKlm6Za7NnQUmS9i5zVXpr08L80z40a0mBrH46TAOii53SCXpdyqk9x2/Jd6TSIqbSfJajn/soVxKqquarmqlpo6jnUZW39XKCPwA+2xWutvV6orPbolmrK2dlPAxPjPe5Gon0qWuRW5kpNQnAub7ppBrodzc6C3K5OPcsr0/0tRfloS0MDo8wxRYNwTacMUCIsNvp2xK9Ey6Y/he9edzlc7zmeM5cVdrUci/oU9nBRAAOJ1AAAAAAPlvFuo7vaKy1XCFs9HWQPgnjXgex7Va5PoVSsbSThWswVjq74XrdpZKCocxj1TLpka72P/aarV85aGRU19cCdNo7ZpBoYezgVKG4q1PiKqrE9fAquaq/rNTiJ+j6upU1XkyFe0taGsuwiKAC7KcnbqUY76ptGS4drJtq44ec2BM13vpnZrEvmyczmRreU7wVx6tmOlwDpXttzqJul2yrX3FcM13JC9U7NfkuRrvA1eUscTemaFDe0dnUxWTLuzq69PB5oAAhkoAAAAAAAAAAAAq60ld0bE3leq9s8182DSV3RsTeV6r2zzXzUQ6qM5LNgsb1W+4DhPxV/tXlcgOFzb7eKjjgdbevsZN4YlsoKmgQ+jP8Ab5f2TOkf9fn/AEWygqaA6M/2+X9jpH/X5/0WxvkZGmb3tanKq5Hw1t9slEmdZeLdTInHLUsZ9alVQC0YvF8jzpH/AF+ZZfedLejO0ovu3HNhRzeFkNY2ZyfssVVOfYn1q9GVra9tqW63yVPe+56VYo1XndKrVRPA1SCIOsdHU1m2znK/qPJEhsea2ON7xFJTYat9FhyB27pqL7oqMuZzkRqf5c+c4Pfbxdb7cpLlerlV3Gtl9/PUyukevNmq8HMfCCXTowp9VYEWdWdTrMAH12e2XG8XKG22qiqK6tndsxQQRq9715kTedMjmfISW1VdAc1+qabG2NaJ0dmjVJbfQytyWsXhSR6f90nCiL775Pvtw0A6sUFqlp8RaRmQ1da3J8FpRUfDEvEsy8D1/VTseVXcCSeaiNajWoiIiZIicRV3V6sNSn6llbWf+VT0P1EREyTcgAKoswAAAAACM/RA6xWYFw3b9rdNc3zKnLsROT/9hDIlt0Q6RUgwTFxOdXO+hIPtIlNRXKjWoqqu5EQvrFYUF+dpSXj/AOZliuqtZG2PQPhqHY2ZKuB1bIv5yyvV7V/yq1PMdPMdhi3NtGGrXaWIjW0VHDToicCIxiN/2MiUlSWtJy7y5px1YpAAHwfQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwjWKgRmLaGdPylCjV8LXv+1D4tAFV0jH3Sc91TSSR5c6ZP/8AipmdZFqJc7O/jWGVPocn2moaIJlh0kWhyccj2f5o3J/uYmu9npbFeJfPA/TLSO20A0/BL5Y/Yk0ADbH5mAAAAAAAAAAAAAAAAAAVqawHduxj5Xn9dTRTetYDu3Yx8rz+upoppqXUXIztTrvmCfOpN3BaHx2p9cgMT51Ju4LQ+O1PrkTSHC8yVYcXyO2AApC4AAAAAAAAAAAAAAAAAAOfayHcKxf5Of8AWhW2WSayHcKxf5Of9aFbZc6N4b5lTpDrrkAD30FLNXV1PRU6I6aolbFGirkiucuSb/CpYEA9AO0dbBpd/Q9B+8IvtHWwaXf0PQfvCL7Tl7xS8SO2wq+FnFwdo62DS7+h6D94RfaOtg0u/oeg/eEX2j3il4kNhV8LOLg7JNqy6YGIqtw/Sy5cTbjBv+lyGFuegXS5bmq6owRXvRP+nkinX6I3OPVXpPKS9Tx0ai/xZzUGUvuHb/YpelXuyXK2Pzy2aulfCuf7SIYs6Jp5HNrAAA9PDJYYsV1xLfaWyWSkWruFW/YghR7Wq9cs+Fyoibk41JRaKtUpEdFcNIlzRyJk78GUD+Hmkl+tGJ4HEToZZIZmTQyPjkjcjmPYuTmqm9FRU4FJlarOsAuIH02CscVbUu+SR0FxkXL3XyRyL/3nIvxuBey99DvHWUMaeXzJdoqTlhP+iQ2GbBZcNWiK02C2U1toYveQwMRqZ8q8aqvGq5qvGZIAom297LpLDcgADwAAAAAAAAAAAAEPeiEdseE/FKj12kXCUfRCO2PCfilR67SLhoLLgRKO740gSY6H5294k8mM9q0jOSY6H5294k8mM9q09u+DI8teLEmaADPF6AAAAAAAAAADUNMmM4MBaN7viaRWLNTwqykY78pO7sY25cabSoq8yKexi5NJHkmorFkQ9dfHfVLpMTDdHNt27D7VhdsrufUu3yr+zk1nMrXcpwU9tXUT1dXNV1Ur5p55HSSyOXNXucuaqvOqqp6jS0qapwUV2GeqTc5OT7QSR1E8C/hbGVbjath2qSzN6TSK5NzqmRN6p8lir53tXiI5QRSzzxwQRuklkcjGMamaucq5IiJxqWW6EMFRYB0ZWjDiNb7qji6bWvb8eof2T1z40RexTmahFvqupT1VmyTZUtepi8kboACjLkAAAAAAAAAGHxth2hxZhG6YbuTc6W4UzoHrlmrFVOxenO1cnJzohmAeptPFHjWKwZVXiazV2HsQ3CxXKPpdZQVD6eZvFtNVUVU5UXLNF40UxxJzXwwJ7gxHb8e0UOVPcmpSVytTck7GrsOX5TEy/wAPnIxmkoVFVgpFBWp7ObiCwrVOx31a6JKJlVN0y6WfKgq817JyNROlvX5TMt/G5rivU7Nqf476j9LNPQ1c2xbL6jaGozXsWyKv4l/md2OfEj1U43lLaUnhmjraVdnU35Mn+ACgLsAAAAAAAAAAAAq60ld0bE3leq9s8182DSV3RsTeV6r2zzXzUQ6qM5LNgA6ng/QFpJxXhqixDZrZRy2+tYr4HvrY2KqIqpvRVzTeink5xgsZPARhKbwisTlgO0dbBpd/Q9B+8IvtHWwaXf0PQfvCL7T494peJHTYVfCzi4O0dbBpd/Q9B+8IvtPF+rFpeam6x0T/AAXGH/dw94peJDYVfCzjIOqV+rxpho2q5+DpZWpxw1lPIq+Zr1X+Bp+IMB41sDXPvWE73QRt4ZZqKRsf+bLL+J9Rqwlk0fDpzjmma2ADofAP1EzXJD8ABITRVqs4rxGyC5YqrIbBbJGtkbGxWzVMrV3pkiLssRU41VVT80llo00aYO0e0C02GbTHBK9uzNVy9nUTfKeu/L9VMm8iEQdWnT1XYDq4cOYmmmrMLyvRrHLm59Aqr75nGsfKzzpvzR056Gqpq6ihraKoiqKaeNJIpYnI5j2qmaORU3KioUl7KspYTe4uLONJxxit57gAQCaAAAAAAAAARQ6IdGqwYJly3NdXNXz9I+wjDgmlSuxnZKJUzSouNPFl8qRqf7ktOiCUavwThqvy3Q3KSFV+XGq//rIt6ImdM0sYQjX418om/TOwvbN/9f1Ka6X/ADvyLPQAURcgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFdZFyLcrMzjSGVfpVPsNH0YqqaQbLl/wBU3/c2zWLn2sWUFOi/3dCjvO57/sQ1bRUzb0iWZvJUZ/Q1V/2MLePW0o//ALL+D9R0atTQe/wy/kk+ADdH5cAAAAAAAAAAAAAAAAAAVqawHduxj5Xn9dTRTetYDu3Yx8rz+upoppqXUXIztTrvmCfOpN3BaHx2p9cgMT51Ju4LQ+O1PrkTSHC8yVYcXyO2AApC4AAAAAAAAAAAAAAAAAAOfayHcKxf5Of9aFbZZJrIdwrF/k5/1oVtlzo3hvmVOkOuuQMvgrtxsvlCD2iGIMvgrtxsvlCD2iE95MgxzLTgAZc0gAAAAAB66qngqqd9PUwxzwvTJ8cjUc1yciou5Tk2kTV20a4tiklgtKWCvdvbU2xEiTP9aL3ipy7kXnOug+4VJQeMXgfE4RmsJLErn00aFMW6M51qK6Ntxsr37MNypmrsZ8TZG8Mbl5FzReJVOZFrtzoKK526ot1xpYaujqI1jmhlYjmSNXhRUXhQghrOaEajRzc1vliZLUYWq5MmKubnUT14I3rxtX4rl8C797re0vNp+meZV3Nps/1RyOInkxzmPR7HK1zVzRUXJUXlPEFgQSdGqZpp6uLUmFMSVKdUlDFnFM9d9dCnxueRvxuVOy/Oy76VUWC7XGxXqkvFpqpKSuo5WywTMXe1yfWnKi7lTcpYzoJ0k2/SZgaG8QbENxgyhuNKi/3M2XCn6juFq8m7hRSkvbbZvXjky3s7jXWpLM34AEAnAAAAAAAAAAAAEPeiEdseE/FKj12kXCUfRCO2PCfilR67SLhoLLgRKO740gSY6H5294k8mM9q0jOSY6H5294k8mM9q09u+DI8teLEmaADPF6AAAAAAAAACGOvdjv8J4qocC0U2dNaWpU1qIu51Q9vYovyWLn/AIi8hLPHuJaLCGDLria4L/w9vpnTK3PJZHcDWJzucqNTnUrExDdq2+32uvVylWWsrqh9RO/le5yquXIm/gLHR1HWk5vsIF9V1Y6i7T4AAXJUnctTDAnVVpTbe6yHbtuH2tqnZpudUKuULfMqK/8AY5yeZXXoo044r0a4fmsuHbbYnQz1C1EstVTyPle5URN6pIiZIiJkmXLym39dtpN/R2GPQ5fvSruratWqYrIsra4pUoYPMnKCDXXbaTf0dhj0OX70ddtpN/R2GPQ5fvSN0fWO/v1InKCDXXbaTf0dhj0OX70ddtpN/R2GPQ5fvR0fWHv1InKCDXXbaTf0dhj0OX70ddtpN/R2GPQ5fvR0fWHv1InKCDXXbaTf0dhj0OX70ddtpN/R2GPQ5fvR0fWHv1InKCDXXbaTf0dhj0OX70ddtpN/R2GPQ5fvR0fWHv1Il1pewdT470dXjDE2wklVAq00jvyc7eyjd4NpEz5lVOMrLrqWooq2eiq4nw1FPI6KWNyZKx7VVFRedFRTvXXbaTf0dhj0OX7041jnElXi7FlwxJXUlFS1dfJ02eOkY5kW3kiK5Ecqrmqpmu/hVSfZ0alHGMsiFd1adXBxzMIeTHOY9HscrXNXNFRclRTxBOIZZNq+Y5bj/RZa73LIj7hGz3LcE40njREcq/KTZf4HG/kHdR/HfU/pDmwnWzbNBf2I2LaXcyqYiqzwbTdpvOuyTiM7dUtlUa7C+tqu0pp9oABHO4AAAAAAAABV1pK7o2JvK9V7Z5r5sGkrujYm8r1Xtnmvmoh1UZyWbBY3qt9wHCfir/avK5CxvVb7gOE/FX+1eQNI8Ncybo/iPkdKABTFsAAAAAAaNjrRFo8xlE/8NYYofdL8/wDi6ZnSJ0Xl22ZK7wOzTmIs6aNWG/4Vpp71g+omv9qiRXyU7mf8XC3lyamUiJytRF/V4yb4JFG6qUnue44VbanUW9byps/CY2tXoCiukFXjnBNEjLixFluNvhbuqU3q6WNE/KcatT33CnZe+h0XlCtGtHWiU1ajKlLBn4SM1RdNbsLXGHA+J6r/APwauTKiqJHbqKVy8CqvBG5fM1Vz4FcpHMH1VpRqxcZHlKpKnLWRbKCOOptpfXEtobgTEVUrrzb4s6CaR2+qp2p71V43sTzq3fxKpI4ztWlKlJxZe0qiqR1kAAczoAAAAAAcS12rWtw0EVdUjdpbbX09V4M3LFn/AOqQw0QPSLS1g+VeBl9onL5p2FiWl6xriTRdiWxsZty1VtmbC3LhlRquZ/qRpWvhSsS3YptNwcuSUtbDMq8my9F/2LewetSlEqr1atVSLUgAVBagAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKqIiqqoiJwqARw03VaVWkSuai5tp2RxJ5mIq/wAXKeOhKBZtJNudlmkTZXr/AOW5E/iqGu4mr/wniK43HNVSoqZJG/JVy5J9GRvWrtSdNxfWVap2MFGqJ8pzm5fwRxgLaXvGkVJdssfnifq93H3TQ8oPshh54YHeQAb8/KAAAAAAAAAAAAAAAAAACtTWA7t2MfK8/rqaKb1rAd27GPlef11NFNNS6i5Gdqdd8wT51Ju4LQ+O1PrkBifOpN3BaHx2p9ciaQ4XmSrDi+R2wAFIXAAAAAAAAAAAAAAAAAABz7WQ7hWL/Jz/AK0K2yyTWQ7hWL/Jz/rQrbLnRvDfMqdIddcgZfBXbjZfKEHtEMQZfBXbjZfKEHtEJ7yZBjmWnAAy5pAAAAAAAAAAfFfbVbr5Z6u0Xakjq6GriWKeGRM2vav/AN4eFF3ofaAngCuLWB0WV+jDGTqFVkqLNWbUttq3J79me9juLbbmiLy5ou7PI5uWcaW8B2nSJgmrw5dGoxz06ZS1KNzdTTIi7L0+nJU40VUK3cX4euuFMS12Hr1TrT19DKscreJeRzV42qmSovGioX1nc7aODzRS3VvspYrJmJN/0DaSK7RpjynvMXTJbbPlDcqZq/3sKrwon5zffJ9HAqmgAlSipJxeRGjJxeKLW7RcKK7WulultqY6mjq4mzQTMXNr2OTNFTzH1ERdSHSr7nqF0a3yp/FSq6WzyPXc1/C+DwLvc3n2k40Ql0Z2vRdKbiy+o1VVhrIAA4nUAAAAAAAAAh70Qjtjwn4pUeu0i4Sj6IR2x4T8UqPXaRcNBZcCJR3fGkCTHQ/O3vEnkxntWkZyTHQ/O3vEnkxntWnt3wZHlrxYkzQAZ4vQAAAAAAAfFf7rRWOx115uUqQ0dDTvqJ38jGIqr593AEsRkRb19cd5Ntmj6hm4cq+47K+FImL/AKnKnyFIlmd0gYmrcY40u2Jrgq9PuFS6XZzz6WzgYxOZrUa1PAYI0lvS2VNRKCvU2k3IAA7HEAAAAAAAAAAAAAAAAAAAAAAAA+i3VlTb7hT19FM6CqppWzQyN4WPaubXJzoqIpZronxfTY60e2jE9NstdWQJ0+Nq/wB1M3sZGeZyLlzZLxlYRKDUMx37ivtxwDXTZQ3BFrKBHLwTMROmNT5TER3+GvKQb+jr09ZZom2NXUnqvtJigAoy4AAAAAAAAAKutJXdGxN5XqvbPNfNg0ld0bE3leq9s8181EOqjOSzYLG9VvuA4T8Vf7V5XIWN6rfcBwn4q/2ryBpHhrmTdH8R8jpQAKYtgAAAAAAAAAQ21xdC7bNUzaQsL0uzbqiTO60sbd1PI5f75qcTHLwpxOXPgXdMk9NfSU1fQz0NbBHUUtRG6KaKRu017HJkrVTjRUU7UK0qM9ZHKtRVWOqyqAHUNY/RZU6M8bvp6dkklhr1dNbZ3b8m59lE5fzmZonOitXj3cvNDCanFSjkUM4OEnFn3WC7XCw3ujvNpqX0tdRzNmglZwtci5p4U5U403FkOhPSFb9JOA6TEFLsRVSfia+mRc1gnRE2k+SuaOReRU48ytA6hq2aTptGuPo6mpketiuGzBc4k35Nz7GVE/OYqqvOiuTjI15b7WGKzRItK+ylg8mWKg8KaaGpp46inlZLDKxHxyMdm1zVTNFReNFQ8yhLsAAAAAAFZmm3DS4R0sYjsKM2IYK176dMvyMn4yP/AEuaWZkQdfzCCw3Wx43povxdTGtvrHIm5HtzfEq86tV6eBiE/R9TVqaveQr6nrU8e4lFo+uqXzAlhvKP2/d1tp6hV53RtVf4qZw45qa35L1oJtkDn7U1qnmoZN/I7bZ/okanmOxkSrHUm4kqlLWgmAAcz7AAAAAAAAAAAAAAAAAAAAAAAAAPXVTwUtO+oqZWQxMTNz3uyRE8Jol80oWyle6O20ctcqbumOd0tnm3Kq/QhBvdJWtksa81HH19FvJVrY3F28KMcfp6m/g5Cul24tkzdaKVWciSORfpNgw7pUsNwlbBcI5LXK5ckdI7aiz+UnB50ROciW/tBYXEtWNTf8U19SdW0Df0o6zp4r4YP5Leb8D8Y5r2I9jkc1yZoqLmiofpclOAAADXdJV0S0YIulWjspHQrDFy7T+xRU8GefmNiOPaxN5zW32GJ/BnUzoi+FrE9ZfoIGk7j3e1nPtwwXNlpoa096vadPsxxfJb/wCjjq8J27VxoOl2S6XJW756hsLV5mNz+t/8DiK8JJ3RbbFtOA7XTOblI+Lp8nLm9drf4EVE8xlvZ2jr3Ov4V9dxuPa242djs+2TS8lv+xswANwfmYAAAAAAAAAAAAAAAAABWprAd27GPlef11NFN61gO7djHyvP66mimmpdRcjO1Ou+YJ86k3cFofHan1yAxPnUm7gtD47U+uRNIcLzJVhxfI7YACkLgAAAAAAAAAAAAAAAAAA59rIdwrF/k5/1oVtlkmsh3CsX+Tn/AFoVtlzo3hvmVOkOuuQMvgrtxsvlCD2iGIMvgrtxsvlCD2iE95MgxzLTgAZc0gAAAAAAAAAAAAI/642ihMXYWXF9kptq+2iJVmYxOyqqZM1c3ncze5ObaTeuRIAHSlUdOSkj4qU1Ui4sqaB2/W50WdQuNfw5aKfYw/enukiRrexpp96vi5kX3zebNE96cQNFTqKpFSRQVIOEnFnuoaqpoa2Cto55IKmnkbLDKxcnMe1c0ci8SoqIpYzq86SqbSXo/gub3Rsu9JlT3OBu7ZlRNz0T816dknnTiUrgOhaANJFVo00gU13zkktdRlBcoG79uFV98ifnNXsk86cCqcLu32sN2aO1rX2U9+TLIwei3VlLcaCnr6GeOopamJssMsa5texyZtci8ioqHvKAvAAAAAAAAACHvRCO2PCfilR67SLhKPohHbHhPxSo9dpFw0FlwIlHd8aQJMdD87e8SeTGe1aRnJMdD87e8SeTGe1ae3fBkeWvFiTNABni9AAAAAABGvXtx3+C8JUOBqKbKqu7kqKxGrvbTMd2KL8p6f8ApqnGSQqp4aWllqqmVkUELFkkkeuTWNRM1VV5ERCs/TPjObHukm74ler0gnm2KRjvycDOxjTLiXJM151Um2FHXqazyRDvaupTwWbNOABelMbxoKwTJj/SfacPKxy0bpOn1zk+LTs3v38We5qLyuQsXZhnDjGo1tgtSNRMkRKOPcn0HCNRbAv4GwPV4zrYdmsvb+l020m9tNGuWfNtPzXnRrVJGlHfVnOpgskXNnS1KeLzZiupvDv6BtXocf2Dqbw7+gbV6HH9hlQQtZ95LwRiupvDv6BtXocf2Dqbw7+gbV6HH9hlQNZ94wRiupvDv6BtXocf2Dqbw7+gbV6HH9hlQNZ94wRiupvDv6BtXocf2Dqbw7+gbV6HH9hlQNZ94wRiupvDv6BtXocf2Dqbw7+gbV6HH9hlQNZ94wRiupvDv6BtXocf2Dqbw7+gbV6HH9hlQNZ94wRiupvDv6BtXocf2Dqbw7+gbV6HH9hlQNZ94wRw/Ww0ZW7EGiasrrLaqSnudlVa6L3PA1jpI2ovTWbk39j2WXKxE4yBRbI9rXsVj2o5rkyVFTNFQra1gsDOwBpTutjjjVlBI/3Vb14lp5FVWonLsqis8LVLXR1bFOmysv6WGE0aAZPCt7rsN4kt1/tknS6y31DKiJeJVaueS8y8CpxoqmMBZtYrBlenhvRafgzEFDirClsxFbXbVLcKZk8aZ5q3NN7V50XNF50UyxFfUKx30+3XPR/XTdnTKtdbkcvDG5USVieByo7L9d3ISoM5XpbKo4l/RqbSCkAAcTqAAAAAAVdaSu6NibyvVe2ea+bBpK7o2JvK9V7Z5r5qIdVGclmwWN6rfcBwn4q/2ryuQsb1W+4DhPxV/tXkDSPDXMm6P4j5HSgAUxbAAAAAAAAAAAAGn6YMBW3SLgWtw5cEayR6dMo6hUzWnnRF2Hpzb1RU40VUK28TWS5YcxBXWK70zqavoZnQzxrxOTjTlReFF40VFLVCNWuxos/Ddi/tBstNncbbHs3JjG75qZOCTnVnH+qq/moWFhcaktSWTIN5Q1466zRC8AF0VBMfUj0qfhO1ro5vdRnWUTFktUj13ywJvdFzqzhT9XPiaSeKqcP3e4WG90d6tNS+mrqKZs0EreFrmrmnhTlTjTcWSaGse2/SNgKixHRbEczk6VW06LmtPO1E2meDeipyoqFLfW+pLXWTLeyr68dR5o3IAFeTgAAAadpqwZHjzRnecNKjfdM8PTKR7viTs7KNc+JFVMl5nKbiD2MnFpo8lFSTTIe6hWIZLbi3EeCK/bhkqYkqYopNytlhdsSNy/OVHIq/NkwiIOsDZZ9EusFY9Klpge203GsSWrbGm5sq5tqGf4jFc5OdXchLmjqIKykhq6WVs0E8bZIpGrmj2uTNFTmVCVd4SaqLJ/UjWuMU6b7D2gAiEoAAAAAAAAAAAAAAAAAAAAAH5I9kcbpHuRrGoqucq7kROM/TWNJ1c+jwpMyNytdUvbDmnIuar/BFTzkS/u42dtUuJf4pv85na2ouvVjTXa8DnOPcTT32udHG9zKCJ2UUf536y86/w+nPUJuM+ybhU+ObjPwud3VvK0q1Z4yf56H6laUIUKap01gkfFNxnxzcZ9k3GfHNxlnbllTN/wBDuOZrXcorBc5lfb6hyMge9f7h68CfJVd2XEu/lO7EPZVVM1TcpKfAN0fecG2u4yuV0stOiSOXje3sXL51RT9G9nL2VSDoTeOGXIw/tZo2FGUbqmsNbc+ff59pmwAaYxp66maKmppaid6RxRMV73LwNaiZqv8AAixi+8SX7ElddZM0SeRVjavxWJuanmREOv6ecSpQWVlhpn5VNcm1Nku9sSL/APJUy8CKcKUxntHebSoqEco73z/pfU/QvZHR+zpSuZrfLcuX9v6GUwdaXXzFNvtaIqtnmRJMuJib3L/lRSVjWo1qNaiI1EyRE4jjertY1dPXYhmZ2LE9zU6qnGuSvX6NlPOp2UtfZ622Vs6jzl9Fl/JTe1l5trtUo5QXzef8AAF8ZYAAAAAAAAAAAAAAAAAArU1gO7djHyvP66mim9awHduxj5Xn9dTRTTUuouRnanXfME+dSbuC0PjtT65AYnzqTdwWh8dqfXImkOF5kqw4vkdsABSFwAAAAAAAAAAAAAAAAAAc+1kO4Vi/yc/60K2yyTWQ7hWL/Jz/AK0K2y50bw3zKnSHXXIGXwV242XyhB7RDEGXwV242XyhB7RCe8mQY5lpwAMuaQAAAAAAAAAAAAAAA1rSdg22Y8wTcMMXVqJFVR/ipdnN0Eqb2SN50X6UzTgUrUxdh+54WxNcMPXiBYa6gmWKVvEuXA5OVqpkqLxoqFqBG7XY0W/h3DyY/s1PncrVFs3BjG75qZM+z51j4fkqv5qE+wuNSWo8mQr2hrx1lmiFYALspyW2pBpU22Lo0vlT2TUdLZ5Hu4U4Xwebe5v7ScSISvKo7VX1lrudNcrfUSU1ZSytmgmYuTmPaubXJ4FQsf0EaRaPSVo/pb3H0uO4RfiLjTtX+6nREzVE/NducnMuXCilNf2+q9pHJltZV9ZajzRvoAK4ngAAAAAEPeiEdseE/FKj12kXCUfRCO2PCfilR67SLhoLLgRKO740gSY6H5294k8mM9q0jOSY6H5294k8mM9q09u+DI8teLEmaADPF6AAAABwJmAcH11cd9TOjHqdo5tm44hcsHYrvbTN3yr582s50c7kIJHSdZPHXV7pXudyp5umWykX3Fb8l3LFGq9mnynK53gcicRzY0NpS2VNJ5sormrtKjfYDYdG+FqzGmObThii2kkr6hsbnomfS403vf8AstRy+Y14lzqE4F6XS3TSDXQ9lLnQW5XJ8VFRZXp4V2Wov6r0Pq4q7Km5HzQp7SaiShs1uo7RaKO02+FIaOjgZBBGnA1jGo1qfQiH1gGcL/IAAAAAAAAAAAAAAAAAAAAAEfNeDAn4f0eQ4soodqvsL1WbZTe+leuT/Dsu2XcybZIM9Fxo6a42+pt9bC2elqYnQzRu4Hscio5q8yoqodKVR05qSOdWmqkHFlUINo0rYRqcDaQbvhep2nJRzqkEjk/vYXdlG/ztVM+Rc04jVzSRaksUZ9pp4M2PRliurwTjy0Yoo9pX0NQj5GIuXTIl7GRn7TVcnnLOLRcKS62qkulBM2ekq4WTwSN4HsciOavnRUKpCbWoxjv8NYFqsG1s21W2N+3TbS73Uz1zTw7L805kc1Cv0hSxiprsJ9hVwk4PtJFgApy1AAAAAAKutJXdGxN5XqvbPNfNg0ld0bE3leq9s8181EOqjOSzYLG9VvuA4T8Vf7V5XIWN6rfcBwn4q/2ryBpHhrmTdH8R8jpQAKYtgAAAAAAAAAAAAeM0cc0T4ZWNkje1WvY5M0ci8KKnGh5AAru1mdGMmjfSBLFRxO/AVy2qi2v35MTPsoc+ViqifJVq8anKyyvTno9o9JGj6ssMvS465n4+31Dk/up2ouzv/NXNWrzLyohW9daCstdzqbbcKeSmrKWV0M8T0ycx7VVFRfAqF9Z19rDB5opLuhsp4rJnynWtV/Sg/Rxj1ja+ZyYfuitguDeKLf2EyJytVVz/AFVdx5HJQSZwU4uL7ThCbhJSRbHG9kkbZI3texyI5rmrmiovAqKeRG3Uo0qfh2wLgC9VOdytcW1b3vXfNTJ8Tncz1VT81SSRnKtJ0puLL6lUVSKkgADmdAAADV9KuC7fj7AlxwxccmJUx5wTbOawTN3skTwLw8qKqcZz/VSxDcepev0d4kasOIcIz+45I3LvfTr/AHT05WombUVN2yjF4ztBy7Srhyrs2KqDSvhmkfNcrZGsF5o4U7K4W9ffoifGkjy228uzlvyRDvTlrRdN+XP+zjOOElNefI6iD57ZW0lyt1NcaCdlRSVUTZoJWLm17HJm1ycyop9BwOwAAAAAAAAAAAAAAAAAAAAANL0vxudh2nkTgZUpn52uN0MdiW2Jd7HVUCqiOkZ2CrxOTen8UQrNNWkrywq0IZtPDnmiXYVlQuYVJZJnAJuFT45uMyFdDLTzyQTMdHJG5WvavCipwoY+bjPwugmngz9SpPFYo+KbjPjm4z7JuM+ObjLu3JtM+KXjJKaGoXwaNbQyRMlc2R/mdK9yfwVCPmH7PVX6+U1qo2qsk70RXZZoxvG5eZEzUlVbaSGgt9PQ06bMNPE2KNP1Wpkn1G99mKEtaVXsww/kyntjdRVGnb9rePkk188fke8+O93Oks9qqLlWybEEDFc5eNeRE51XJE8J9hwTTHjJL7cvwTb5c7dSPXNzV3TScG14E4E868hfaTv42VFzebyXxMpojRk9IXCprqrN/D7vsNNxPeKq/XyputWv4yd+aNz3MbwI1OZE3HwUlPNV1cVJTRrJNM9scbE4XOVckQ8FOp6A8MLU3CTElXH+JplWOlRU99Iqb3eZFy8K8xg7OhO9uFDHe3vf1Z+nXl1S0daOphuisEvojrGErNDYMO0dphyXpEaI9yfHeu9zvOqqZQA/S4QjCKjHJH5BUqSqTc5PFvewAD6PgAAAAAAAAAAAAAAAAAArU1gO7djHyvP66mim9awHduxj5Xn9dTRTTUuouRnanXfME+dSbuC0PjtT65AYnzqTdwWh8dqfXImkOF5kqw4vkdsABSFwAAAAAAAAAAAAAAAAAAc+1kO4Vi/yc/60K2yyTWQ7hWL/ACc/60K2y50bw3zKnSHXXIGXwV242XyhB7RDEGXwV242XyhB7RCe8mQY5lpwAMuaQAAAAAAAAAAAAAAAHjLHHNE+KVjZI3tVr2OTNHIvCipxoeQAK7tZnRjJo30gSxUcTvwFctqotr+JiZ9lDnysVUT5KtXjU5WWV6c9HtHpI0fVlhm6XHXM/H2+ocn9zO1F2c1/NXNWrzLyohW9daCstdzqrZcKd9NWUsroZ4npk5j2qqKi+BUL6zr7WGDzRSXdDZTxWTPlOmauWkyfRrj+Gume91lrtmnucSZr+Lz3SIn5zFXNOVNpOM5mCTOCnFxeTI8JOElJFsNJUQVdLFVUszJoJmNkikY7Nr2qmaKi8aKm89hFzUi0qe7qBdG97qc6qlYsloke7fJEm90Phbvcn6uacDUJRmdrUnSm4sv6VRVYKSAAOR0AAAIe9EI7Y8J+KVHrtIuEo+iEdseE/FKj12kXDQWXAiUd3xpAkx0Pzt7xJ5MZ7VpGckx0Pzt7xJ5MZ7Vp7d8GR5a8WJM0AGeL0AAAHJNbDHfUTokrW0s2xdLxnQUmS9k1HIvTHp8lme/iVzTrZADW/wAd9WOlipoaSbbtdiRaGnyXsXSIv45/ncmznxoxpKs6O0qLHJEa6q7Om+9nGQAaAozIYbs9diDEFBY7bF02sr6hlPC3i2nKiJnyJvzVeJCzzA2HKHCWD7Xhq3JlTW+mbC12WSvVPfPXnc7Ny86qRN1D8C/hHE9wx3Ww501ratLRK5Ny1D29m5PksXL/ABE5CZZTaQq609RdhbWFLVjrvtAAK4ngAAAAAAAAAAAAAAAAAAAAAAAEXtfLAnuyx27H9DDnNQKlHXq1OGFzl6W9fkvVW/4ichDstSxXY6HEuGbjYLnHt0dwp308qcaI5Ms0504UXiVEKw8Y2Cuwviq54duTdmrt9S+CTdudsrucnMqZKnMqFzo+rrQ1H2FTfUtWWuu0xJvOgnG8mANJ9pxCr3JRpJ0ivanxqd+5+7jy3OROVqGjAnyipJxfaQoycWmi2OGSOaJksT2yRvajmuauaOReBUXkPI4lqa476rNFUdoq5tu5YfVtHJmu90GX4l3+VFZ+xznbTNVIOnJxfYaCnNTipIAA+D7AAAKutJXdGxN5XqvbPNfNg0ld0bE3leq9s8181EOqjOSzYLG9VvuA4T8Vf7V5XIWN6rfcBwn4q/2ryBpHhrmTdH8R8jpQAKYtgAAAAAAAAAAAAAAARM14dF2St0lWWm4dmG8MY39mOf6mO/Z51JZnzXa30d1tdVbLjTsqaOridDPE9M2vY5FRUXwop2oVnSmpI5VqSqwcWVRg3rTlo9rNG+kCssE23JROXp9vqHJ/fQOVdlflJkrV50XiVDRTRRkpJSRQyi4vBmTwrfblhnEdDf7PULT19DM2aF6cGacSpxoqZoqcaKqFlGifG9t0g4GoMTW1Uak7diog2s1p5m+/jXwLwLxoqLxlYh2TVS0pro+xylBdKhW4eu7mxVe0vY08nAybmy4Hfqrnv2UIl7b7WGKzRJs6+zlg8mWAgNVHIitVFRd6KgKIugAAAAADB4ftHU/VVFFQtytNRI6eCFE3Ukjlzexv/huVVcifFVXJwK1EzgVEVMlTNFMetZ7hq2U1W7KGZ2zBMvBtfmOXl5F4/Dw86tZU8HPJ9v3PqnTct0TIAA6HyAAAAAAAAAAAAAAAAAAAAAafjvBcV8zraJzIK9E357mypz8i8/8A9TkF8tFytUyxXCjmp3Z5Irm9i7wLwL5iR5+SMZIxWPa1zV4UVM0Uy2lfZS2vqjrU3qTeeG9Pmu8vtHafrWcVTktaK9V5kV5uM+2w4WvmIJkZbaGR8arks702Ym+Fy7vMmakj22i1Nk6Y22USP/OSBuf1H2oiImSJkiEO19j1TljVqYr4Itavtc1HClT3/F/x/ZqmjzBNDhOjc5HJU3CZMpqhUy3fmt5G/Xx8SJtYOZ6U9IbLayWzWOZH1y5tnqGrmkHKjf1vq8PBpqtW20Zb790Vku/+zPUqV1pa58Unm+77I+bTHjpKeKXDlnmzncmzWTMX3iccaLyrx8nBw55cY4zze5XOVzlVVVc1VeFTw4z89vb6pe1XUn5LuR+n6N0dSsKKpU/N97MjheyVeIL5T2ujTs5Xdk/LdGxOFy8yJ9hJ+yW2ltFqprbRM2IKdiManGvKq86rvXwmo6GcNUlnw3HckkiqKy4MR75WKjka3iYi83Hz+BDejaaC0d7rR2kutL5LuMF7R6Vd5X2UOpD5vtf8L+wAC9M2AAAAAAAAAAAAAAAAAAAAAVqawHduxj5Xn9dTRTetYDu3Yx8rz+upoppqXUXIztTrvmCfOpN3BaHx2p9cgMT51Ju4LQ+O1PrkTSHC8yVYcXyO2AApC4AAAAAAAAAAAAAAAAAAOfayHcKxf5Of9aFbZZJrIdwrF/k5/wBaFbZc6N4b5lTpDrrkDL4K7cbL5Qg9ohiDL4K7cbL5Qg9ohPeTIMcy04AGXNIAAAAAAAAAAAAAAAAAACJuvDou97pKstP+bDeGMb+zHP8AUx37POpLI+a7W+jutrqrZcadlTR1cToZ4npm17HIqKi+FFO1Cs6U1JHKtSVWDiyqMG9actHtZo30gVlhm25KJ34+31Dk/voHKuz+0mStXnTkVDRTRRkpJSRQyi4vBn22K619kvNHd7XUvpq6jmbNBKzha9q5ov8A/OMsk0K4/oNI+AaPEVJsR1Kp0mup0XPpE7UTab4FzRycypzlZx1bVk0oSaN8fMdWyu/AFzVsFxZwoxM+wmROViqufK1XJw5EW8t9rDFZok2lfZSweTLDweMMkc0TJYntkje1HMe1c0ci8CovGh5FCXQAABD3ohHbHhPxSo9dpFwlH0Qjtjwn4pUeu0i4aCy4ESju+NIEmOh+dveJPJjPatIzkmOh+dveJPJjPatPbvgyPLXixJmgAzxegAAHP9YPHLcAaK7re4pEZcJGe5benGs8iKjVT5KI5/gaVuPc571e9yuc5c1VVzVVJAa7+O+qDSJFhSim2qCwNVsuyu59S/e//Kmy3mXaI+l7Y0tnTxebKW8q69TBZIHto6eerq4aSlifNPNI2OKNiZue5y5IiJyqp6jvWpPgTql0muxHWQ7duw81J02k3PqXZpEn7OTn8ytbykmrUVODk+wj04OpJRRL3Q5g2DAeji0YZiRizU8KOqpG/lJ3dlI7nTaVUTmRENuAM1KTk22aGKUVggADw9AAAAAAAAAAAAAAAAAAAAAAAABEHX0wJ7nudt0gUMP4urRKG4K1OCRqKsT18LUVuf6jeUl8a3pPwnSY3wFd8L1ey1tdTq2KRUz6XKnZRv8AM5Gqd7ersqikca9LaU3Eq+B9V1oKu13SqtlfC6CrpJnwTxu4WPaqtci+BUU+U0RQHVNVrHfUNpat89TN0u13P/gK7Nexa16psPXk2Xo1VXk2uUsRKmixXVfx31d6JbfVVM3TLpbv+Br81zc57ETZevymK1c+Xa5Cr0jRyqIs7CrnBnUAAVRZAAAFXWkrujYm8r1XtnmvmwaSu6NibyvVe2ea+aiHVRnJZsFjeq33AcJ+Kv8AavK5CxvVb7gOE/FX+1eQNI8Ncybo/iPkdKABTFsAAAAAAAAAAAAAAAAAAcr1mtGLNI+j6WOjiat+tqOqLa/jeuXZw58j0RP2kavBmV4SxvildFKxzHsVWua5MlaqcKKnKWxkK9dfRd+AcRJj2zU+zbLrLs17GJuhqlzXb5kkyVflIv5yFno+4wezfkV19QxW0XmRuABblWTf1MNKnVRhdcFXqp2rxZ4k9yvevZVFKmSJ4XM3NXmVvDvJDFWWC8R3TCWKbfiOzTdKraGZJI14nJwOa7la5FVFTkVSyrRpjC147wXb8T2l34mqj/GRKuboZE3Pjdzov0pkvAqFJfW+zlrrJlxZV9eOq80bGACATQAAAemtpYK2kkpamNJIZEyc1eM9wPmUYzi4yWKZ6m4vFGpsutVhqsZQXt8k9vkXKmrlTNW/qyc/P/8AU2qKSOWJssT2vY5M2uauaKnKinpuFFTV9HJSVcTZYZEyc1fr5lOe1SXzAlXtU7nV1me7c1/A3PiX813PwKZ6vdVtDPGonOh35yhz749zzWTx3FnSowvlhHCNTu7Jcu5/DJnSgYbDmJbXfI0Slm2J0TsoJNz08HKnOhmS8t7mlc01UoyUovtRX1aU6UnCawYAB3OYAAAAAAAAAAAAAAAAAAPGaSOGJ8s0jY42IrnPcuSNRONVMFizF9lw5Evu2oR9Tlmymi3yO5M0+KnOpxLGuNrviZ6xTP8Ac1Cjs2U0a7vC5fjL/DkQptJabt7JOOOtPuX8931LrRmg7i+alhqw73/Hf9Da9I2k107ZbVhyRzIlzbLWJuc7lRnIn63Dycq8odvVVU9iNc5yNaiucq5IiJvVTbrlo4v9FhZt6kjRz07Oalan4yKPicvLzpxfTlh61W70nOVVpvV7skvzzN/b0rLRUI0k1HWeG/Nv88jS1PHjPJTx4yFEt0bfo1xzVYVrekT7c9rmd+NhRd7F/PZz8qcZIW21tLcaGKtoZ2T08zdpkjF3Kn/3iIkKbfo2xxV4Vruky7c9rmd+Ohz3sX89nPzcf0Kml0Nph2zVGs/0fT+jL6e0ArtOvQX6+1eL+ySAPntldSXKghrqGdk9PM3aY9q7lT7eY+g3CaksUfnEouLaawaAAPTwAAAAAAAAAAAAAAAAAArU1gO7djHyvP66mim9awHduxj5Xn9dTRTTUuouRnanXfME+dSbuC0PjtT65AYnzqTdwWh8dqfXImkOF5kqw4vkdsABSFwAAAAAAAAAAAAAAAAAAc+1kO4Vi/yc/wCtCtssk1kO4Vi/yc/60K2y50bw3zKnSHXXIGXwV242XyhB7RDEGXwV242XyhB7RCe8mQY5lpwAMuaQAAAAAAAAAAAAAAAAAAAAA5XrNaMo9JGj6WKjib+HbbtVFtfxvXLs4c+R6IifKRq8pXjLHJFK+KVjo5GOVrmuTJWqnCipxKWxELNdjRd+AsQpj6zU+VtusuzXsYm6GqXNdvmSTJV+Ui/nIWej7jB7N+RXX1DFbReZG0AFuVZM/Um0qfhmyLo9vVTncLbHt21713zU6cMfOrOL9X5KkliqzDN7uWHMQUN9tFQ6nr6GZs0MicTk4lTjReBU40VULJ9EeObbpDwLQ4ltytY6VuxVQbWa087ctuNfBnmi8aKi8ZS31vqS11ky3sq+vHUeaNsABXk4h70Qjtjwn4pUeu0i4Sj6IR2x4T8UqPXaRcNBZcCJR3fGkCTHQ/O3vEnkxntWkZyTHQ/O3vEnkxntWnt3wZHlrxYkzQAZ4vQatpYxfTYF0e3fE9RsOdRwL7njcv8AezO7GNnncqZ82a8RtJDnXxx37tv9uwDQzZwW9ErK9GruWZ6L0tq/JYqr/iJyHe2pbWoonG4q7Om5EZ7hWVNwuFRX1szp6qpldNNI5c1e9yqrnLzqqqp6ADRFAfpY3q2YF6gtE9sttRD0u5Vae7bhmmSpLIidgvyWo1vhavKQ+1UMC9W2luiWqh6Za7RlX1madi7ZVOlsX5T8t3GiOLCiq0jVypos7ClnNgAFWWQAAAAAAAAAAAAAAAAAAAAAAAAAAAAABCPXkwJ+A8e02MKKHZor4zZqNlNzapiZL4NpuyvOqPUjsWV6esEMx/ouu1gaxrq3Y90UDl+LUMzVm/i2t7FXkcpWtIx8Ujo5GOY9iq1zXJkqKnCioXtjV16eDzRS3lLUqYrJnidx1Mcd9SmlNllrJti24ga2kfmvYtnRc4XedVVn7fMcOPOCWSCZk0Mjo5Y3I5j2rkrVRc0VF4lJNSmqkHF9pHpzcJKSLYgaToNxtHj/AEY2nEW01at8fSa5qfEqGbn7uJF3ORORyG7GblFxbT7DQxkpJNAAHyelXWkrujYm8r1XtnmvmwaSu6NibyvVe2ea+aiHVRnJZsFjeq33AcJ+Kv8AavK5CxvVb7gOE/FX+1eQNI8Ncybo/iPkdKABTFsAAAAAAAAAAAAAAAAAADE4ww9bMVYYuGHbxD06hr4VilbxpnwOTkci5Ki8SohlgeptPFHjWKwZV9pMwdc8CY1uOGLq3Oakk/FyomTZol3skbzKmS8y5pwoa2Tx1wNF3VrgnqitNPt36yRue1GJ2VRT71fHzqnvm/tInviBxobauq0Me3tKK4o7KeHYDuGqLpT6hcafgO71Gxh+9SNjlc9expp+BkvMi+9dzZKvvTh4OlSmqkXFnOnN05KSLZQcF1OtKnVlhBcK3ip2r7ZYmta57uyqaZMka/nc3c137K8Kqd6M7UpunJxZf06iqRUkAAcz7AAAB4TxRTwvhmjbJG9MnNcmaKnIqHmDxpNYMJ4b0cyxbgOopJHXCwLI9jV2lgRezZzsXj8HD4T4rDpButuVKa5x+7YmrkquXZlb5+Pz7+c60a/ifCVqvqOklZ7nqst08ab1+UnA76+cx177N17ao7nRM9SXbH/F/wAeT3ci/ttLU60VSvo6y7+1fnrzPbY8V2O77LaasayZfyM3YP8AAme5fNmZs4fiTB15s21I+H3TTJ+WhRVRE504U+rnPmtGKr9a0RtLcZVjT8nL2bcuREXg82RDo+2Ne0nsdJUHGXevs/qmSp+z9OvHaWlRNfH7r7HeQcwtulKZuTbja2P5XwPVv+lc/rNhodIuGqjJJZ56VV4pYV+tuZorb2k0ZcdWqlz3fXcVNbQ17Szpt8t/0NuBiabE2H6hPxV5oVXkdMjV+hcj74q2jlTOKrp3p+rIi/7ltTuaNTfCafJogzo1IdaLXke8Hj02P/vGfSemWuoov72rp2fKkRP9zo5xWbPhRbyR9AMRVYow7TIvTr3QIqcKNna5foRVUwlfpLwtTIvSqioq3JxQwqn8XZESrpK0o9erFeaJNKwuqvUpt+TNyBye66XJ3IrbXaY2cj6h6u/0ty+s0y94xxHd0c2quczYl/JQr0tmXIqJw+fMprn2rsqW6njN/DcvV/YuLb2YvKvEwivjvfy+52vEOMsPWNHNq69kk7fyEHZyZ8iom5POqHMcVaUbvcEfBaWfg2nXdtou1K5PDwN82/nNBU8Wtc5yNaiucq5IiJvVTMXvtJeXX6YPUj8M/X7YGnsfZy0tv1TWu/jl6ffETSSSyOlle6R7lzc5y5qq8qqey2W+tulayit9NJUVD17FjEz868ic6m6YS0Z3m7KyouSOtlIu/wDGN/GvTmbxeFfoU7DhrD1pw9Se57ZStj2sumSLvfIvK53+3AdtGez1xdPXq/pj8c3yX8v5nmkvaK3tE4Uv1S+GS5v+F8jWNHWjylsGxcblsVVzyzbxsg+Tyrz/AEc++AG/tbSla01TpLBH5/d3da7qOpVeL/MjjelnR50jp1+sMH4ne+qpmJ7zle1OTlTi8HByfjJeHGtLWjz3P06/WGD8TvfVUrE95yvanJypxcPBwZfTWhNXG4t1u7V/KNj7Pe0GthbXL39j/h/wzkqnip5KeKmWRuEbbo2xxWYTuHS5Nue2TO/HwZ72r+ezkd9f0Kki7VcKO6W+GvoJ2T00zdpj28f2LzERV4TbNG+N6zCdw2Xbc9smcnT6fPg/XbyO+vg5FTR6H0u7b/iq9T6f0ZjT/s+rxOvQWFRf/r+yS4PltFxorrbobhb52T00zdpj2/UvIvMfUbWLUlisj82lFxbjJYNAAHp8gAAAAAAAAAAAAAAFamsB3bsY+V5/XU0UsWxFoC0V3++1t7uuHJJ6+umdPUSJX1Ddt7lzVcmvRE8yHwdbVoc71Zf3lU/eFxDSFKMUmn+eZVTsajk3iivgnzqTdwWh8dqfXPu62rQ53qy/vKp+8OhYGwlYcFYfjsOG6JaO3xvdI2JZnyZOcuartPVV4ec4XV3CtDVimdrW1nSnrSM4ACuJ4AAAAAAAAAAAAAAAAABz7WQ7hWL/ACc/60K2y1TE1ktuI7BW2K8QLUUFbEsU8aPcxXNXizaqKnmU5j1tOhzvYm/eVT/WWFpdQoxakQbq2nVknEr5MvgrtxsvlCD2iE7+tp0Od7E37yqf6z3UOrlojoq2CspsNTMngkbLG78I1C5OauaLkr+VCU9I0msn+eZGVhUTzR1kAFKW4AAAAAAAAAAAAAAAAAAAAAMVi/D9sxThm4YevEHTqGvhWKVvGmfA5ORyLkqLxKiGVB6m08UeNYrBlX+k3B1zwHja44Yurc5aWT8XKiZNniXeyRvMqfQuacKGtFmekHRdgTHtZS1mLLBHcailjWOGVKiWFyMVc9lVjc3aTPemeeWa5cKmsdbfoY7zf/c6v70t4aRhqrWTxKudhPWeq1gV5nYdVbSk7R5jttJcp1bh67ObDWo5exgfnkybzZ5O/VVeFUQlX1t+hjvN/wDc6v70dbfoY7zf/c6v708qX1GcXFp7/wA7xCyqwkpJr88jrDXNc1HNVHNVM0VF3Kh+nx2O2UVls9JabdHJHR0cTYYGPlfIrWNTJE2nqrlyTdvVT7CoLVEPeiEdseE/FKj12kXCzLSLouwTpAqaOoxZaH18tGxzIFSqli2UcqKvvHJnwJwmqdbVoc71Zf3lU/eFpb3tOnTUWmVteznUqOSaK+CTHQ/O3vEnkxntWnb+tq0Od6sv7yqfvDaNHeirA2AK+qrsKWd9BUVUSQzOWqll2mIueWT3Kib04j2vfU6lNxSe8ULOdOak2jdgAVRZGIxpiChwrhO54juTsqW30z53pnkrsk3NTncuSJzqhWHim9V2I8SXG/XKTplZcKh9RMvFtOVVyTkROBE4kRCzbHWErHjXD8lhxFTS1VukkbJJCyd8W2rVzbmrFRVTPflwZonIc962nQ53sTfvKp/rJ1pcU6KbkniyFdUKlZrDIr5BYN1tOhzvYm/eVT/WfrNWvQ6x7XJheVclzyW41Cp9G2TOkaXc/wA8yL7hU70fLqeYF6kNE0Fxq4di535W1s+adk2LL8Sz/Ku1zK9TtB+RsZGxscbWsY1ERrWpkiInEh+lRUm6knJ9paU4KEVFdgAB8H2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA2uNgTqS0rTXSkh2LZf0dWRZJ2LZs/xzP8yo/wSIT5NY0iYBwrj+2U9uxXbEr4Kabp0OUr43MdkqLk5iouSovBnlwciEi1r7GeLyOFxR2sMFmVggsG62nQ53sTfvKp/rHW06HO9ib95VP9ZZdI0u5/nmV/uFTvRwfUWx3+Bsb1eC62bZo723plLtLubUxpnknymIqc6sahNc5VaNXrRTabrSXS3YfqKeso5mTwStuVRmx7VRWr7/iVEOqlddVIVZ60CfbU504asgACMSCrrSV3RsTeV6r2zzXyw+6au2iW5XOquNZhuWSpq5nzzPS4VCbT3OVzlyR+Sb1XgPm62nQ53sTfvKp/rLmOkKSSWD/PMqXYVG80V8ljeq33AcJ+Kv8AavMV1tOhzvYm/eVT/WdLwnYLVhfDtHYLJTrTW6jYrIIlkc9WoqqvvnKqrvVeFSNd3UK0Eoki1tp0pNyMoACvJwAAAAAAAAAAAAAAAAAAAAAIE63ei7qGxwt8tVPsWC9PdJEjU7Gnn4XxcyL75vMqonvSexhcaYVw/jKwSWLE1tjuFvke17onPcxUc1c0VHNVHNXnRU3KqcCqSLau6M8ew4XFFVYYdpVoCwzrb9DHeb/7nV/ejrb9DHeb/wC51f3pZdJUu5/nmV/R9TvX55EEdH+KrpgrF9vxLZ5NmqopUfsqvYysXc5jv1XJmi+EsqwBiq140whb8S2eTbpK2JHo1V7KN3A5jv1mqiovgND62/Qx3m/+51f3puuj/AuF8B26ot2FLdJb6Sol6dJEtXNM1X5Im0nTHO2VyRM8ss8kz4CHd3FKsk0niS7WhUotptYGyAAgkwAAAAAAAAAGvX3Bthuyuklpfc87vysHYLnzpwL50NhBHubSjdQ1K0FJfFHWjXqUJa1OTT+Bya8aMrnArn22qhrGcTH/AIt/2L9KGo3SxXi2qvu221MLU+OrFVv+ZNxIcGVu/YmyqvGjJwfqvnv+ZfW/tLc091RKXyf2+RGVTxJGVtjs1aqrV2ujmcvC50Ldr6cszD1OAMKzZr+DViVeOOZ6fwzyKWr7D3ceHUi+eK/hltT9qbd9eDXLB/Y4Qp48p2yTRjhpy7lrWfJmT/dDw/suw5nn064eDprf6SP/AOH6RXh9f6JK9prL4+n9nFOI8V4DuMWjLC7PfR1cnyp1/wBkQ++lwHhOnyVlnieqcckj3/wVciRT9jr59aUV5v7HzL2ps45Rk/Jfcj4iKu5EzVeBDM2rCWI7nl7ktFSrF4HyN6W36XZISEobXbaH/wDCt9JTc8ULW/Uh9Za2/sbFb61XHkv5eP0IFb2tllSp+r/hfc5FY9EdTIqSXm5MhbxxUybTv8y7k+hToWHcJ2Gwoi2+gjSZE3zydnIvnXg82RmwaSz0PZ2e+nDf3ve/68igu9L3d3uqT3dy3L85gAFmVoAAAAABxnS3o79z9Ov9gg/E731VKxPecr2JycqcXg4OSKTBOQ6SNFk9TX/hHC8Mf45346lV6MRq/nNVd2XNxcXNktL6EeLrW65pfVfY3WgPaNJK3u5ZZSf0f3ONLwngpvaaKcZr/wBggTw1LPtPJNEmMl/7NSJ4ahpSR0dd/wDxv0ZqemLBf+6PqjG6OMbVuErjl2U9tmcnuinz/wBbeR318C8SpJCzXKiu9thuNuqGz00zc2Pb9S8ipxocDTRBjBeFlCnhqP8A+G26N8I48wlcs0fb5rdM5PdFMtQu/wDWb2O5yfx4F4stDomd5bvZ1IPU5Zf0Zb2go6OvU61GrFVF8et/fx9TrQANOYUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0vThim44L0V3vE9pjppK2hjjdE2oYro1V0rGLmiKirucvGcC0HaxuO8a6VLJhi70Vhjoq6SRsrqemkbIiNie9MlWRUTe1OI7DrX/B8xX8zD/MRkO9U/4QeFfnp/5eQsbalCVCUmt6x+hAuKk41oxT3bvqWKAArieAAAaVpzxVcsE6Kb3ii0R00ldQsidE2oYro12pmMXNEVFXc5eM4LoL1jMd420rWTC93orDHQ1z5UldT00jZE2YXvTJVkVOFqcR1zWz+D1ir5un/mYiIOqV8IbCvzlR/LSljbUoSoTk1vWP0IFxUlGvGKe7d9SxEAFcTwAAAAAAAAAAAAcu1mtIF70b6O4MQWCGhlq5LjHTK2rjc9mw5kjl3Nc1c82Jx8p1E4Dr4dxak8tQeymO1vFSqxTOVeTjTbRxjrttJv6Owx6HL96Ou20m/o7DHocv3prOqtgbD2kDSLVWHEtPNNSMtslSxYZnRua9r42pvTiyev8CTvWtaJv+huvp7vsLKq7alLVlErqSuKsdaMjhHXbaTf0dhj0OX70ddtpN/R2GPQ5fvTu/WtaJv+huvp7vsHWtaJv+huvp7vsOe3tPCddjdeI4R122k39HYY9Dl+9MvgrWk0i3jGNltFXQYcbT11wgppVjpZUcjHyNauSrKu/JeQ7B1rWib/AKG6+nu+w+uzatei+03iiutHRXNtTRVEdRCrq5yoj2ORzc040zRDx1rTDdEKjc475HYwAVhYgAAAAAAAAAAAAAAAA+HEN2orFYa+9XKXpVHQ076id3IxjVVcufdwBLEZHAdZzT9edHuL6PDWFKe11NSym6fcHVcT5EYr1/FsRGvbkuym0uee5zTCaAtZTEWLdJNFhrF1LZ6ekuDXRU8tJC+NzZ+FiKrnuRUdkrcsuFWkY8TXW6490g1d0lYstxvVf+LiRc8nPdssjTmRNlqcyIfRj6wXDR3pMuFkZVPSrs9ajqeoRNlyomT4pE5FVFa4vI2lLU1Gv1YFO7qpr66e7Es7Bq+ijF1PjnR7Z8T0+yi1lOizsb+Tmb2MjfM5Fy5slNoKSScXgy3i1JYoAA8PQAAAAAAAAAAAAAACPetNppxZoyxPabbh6ltM0NZRLPItZA97kcj1bu2Xt3ZIbJqs6TcQaTcL3e54hgt8M1HWpBGlHE5jVarEdvRznb81OI9EC7fcOeS3e1cbx0PztBxH5Ub7JpYzpQVqp4b/AOyBCpJ3LjjuJLAArieAAAAAAAAAAAAAAADhetbpdxPoukw43DlPa5kuSVKz+7IXvy6X0rZ2dl7cvfrnw8R3Q0fSnorwlpJdbnYogq5VtySJT9IqFjy6Zs7WeXD7xp1oShGac1ijnWjKUGoPeRS67bSb+jsMehy/ejrttJv6Owx6HL96d361rRN/0N19Pd9g61rRN/0N19Pd9hP29p4SFsbrxHCOu20m/o7DHocv3o67bSb+jsMehy/env1ttE+DtG9nsE+GKarilrqiZkzp6h0m5jWqiJnwcJi9UfRphXSPc8QUuKKeplZQwwSQLDOsaornPRc8uHgQ7qNu6W11dxwxr7TZ628+3rttJv6Owx6HL96Ou20m/o7DHocv3p3frWtE3/Q3X0932DrWtE3/AEN19Pd9hw29p4TvsbrxGH1WtNeLdJuLLrasQ0tohgpKH3RGtHA9jld0xrd6ue7dkqkhjn+jDQ9gvRzdaq54Zp6yKoqoOkSrNUrIis2kduReDeiHQCDXlCU8YLBEyjGcYYTeLAAOJ1AAAAAAAAABoWsBjG6YD0U3TFFljpZa6kfA2NtSxXRrtzMYuaIqLwOXjN9OQa5HwesQfOUn8zGdaCUqkU+851W1Tk13HN9X7WFxxjzSra8L3qjscdDVMndI6mp5GyJsRPemSrIqcLU4iU5X1qbfCFsHzVV/LyFgp3vqcYVEorDd9zhZTlOm3J47wACGSwaBrBYyuuAtFdyxPZYqSWtpZIGsbUsV0ao+VrFzRFReBV4zfzjuuX8Hy+fPUv8AMMOtBKVSKfec6zapya7jner5rCY3x7pUt2GL1R2OKiqY53PdTU8jZEVkTnJkqyKnCicRKYr91M/hBWT5iq9g8sCO99TjCphFYbvucLKcp025PHeAAQyWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcv1r/g+Yr+Zh/mIyHeqf8ACDwr89P/AC8hMTWv+D5iv5mH+YjId6p/wg8K/PT/AMvIWtp+2n5/Qrbr9xDy+pYoACqLIAAA5ZrZ/B6xV83T/wAzERB1SvhDYV+cqP5aUl9rZ/B6xV83T/zMREHVK+ENhX5yo/lpS1tP20/P6Fbc/uIeX1LEQAVRZAAAAAAAAAAAAA4Dr4dxak8tQeymO/HAdfDuLUnlqD2Ux3teNHmcLnhSOL6h3dprPIk/tYScxBnUO7tNZ5En9rCTmO1/xvI5WPCAAIRMAAAAAAAAAAAAAAAAAAAAABG7Xtxx+CsF0OCqObKqvL+nVSIu9tNGuaIvynonmY5CSEj2Rxukkc1jGoquc5ckRE41K1dPGNXY90pXjEDXudRrL0ihRfi08ebWbuLPe5U5XKTbClr1MXkiJe1dSngs2bpqZYJdijS3Dd6iNXW/D7UrJFVNyzZ5Qt8O1m//AAzdNfbBLqW+2rHlJGvSK1iUNaqJubKxFWNy/KZmn+GnKdo1TcD9RmiGhfUw9LuV4yr6vNOyaj0TpbF8DNndxK5xt+mDB8GO9HF4wzKjUlqoFWme78nO3so3cybSJnzKqHSd1hc63YtxzhbY2+r2veRs1Ccc+57pdMAVs2UdWi11vRy/lGoiSsTwtRrsv1HcpL8q3wnebpgnHFDeadj4bhaKxHuid2K5sdk+N3MqZtXwqWc4bu9Ff8P0F8tsnTKOvp2VELuVr2oqZ8i796cp5pClqz11kz2xqa0NR9h94AK8nAAAAAAAAAAAAAAAEMeiBdvuHPJbvauN46H52g4j8qN9k00fogXb7hzyW72rjeOh+doOI/KjfZNLWf7NfnaVsP3bJLAAqiyAAAAAAAAAAAAAAAAAAAAAIt9EI7X8JeNVPqMMH0Pb/n+LvFab13mc6IR2v4S8aqfUYYPoe3/P8XeK03rvLWP7J/naVr/efncTAABVFkAAAAAAAAAAAAAAADkGuR8HrEHzlJ/MxnXzkGuR8HrEHzlJ/Mxna34seaOVfhy5MizqbfCFsHzVV/LyFgpX1qbfCFsHzVV/LyFgpJ0jxVy+5H0fw3zAAIBNBx3XL+D5fPnqX+YYdiOO65fwfL589S/zDDtb8WPNHKvwpciL+pn8IKyfMVXsHlgRX7qZ/CCsnzFV7B5YESdI8Xy+5H0fw3zAAIBNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOX61/wfMV/Mw/zEZXxY7vdLHco7lZrhVW+tizSOoppVjkZmmS5OTemaKqecsH1r/g+Yr+Zh/mIyG2q5S0tdp3w1RVtLBVUs8kzZYZ42yMenSJFyVrkVF3oi+Yt7GWrQk3+birvFrVopfm8w39q+k3v/wAT/vOX+of2r6Te/wDxP+85f6ixLqGwV3oYe/dsP9I6hsFd6GHv3bD/AEnx79T8B9e5VPGV2/2r6Te//E/7zl/qH9q+k3v/AMT/ALzl/qLEuobBXehh792w/wBI6hsFd6GHv3bD/SPfqfgHuVTxlcd20jY9u1untt0xlfq6inbszU9RXySRyJw5K1VyU2vVK+ENhX5yo/lpSU+s/hbDNr0EYnrrZhyzUVVHFCjJoKGJj27U8bVycjc0zRVTzkWNUr4Q2FfnKj+WlJEKsatCbisM/ocJUpU60U3jl9SxEAFGXIAAAAAAAAAAAAOA6+HcWpPLUHspjvxwHXw7i1J5ag9lMd7XjR5nC54UiFmG8RX7DdZJWYfvFdaqmRnS3y0k7onuZmi7Kq1UXLNEXLmQz/8AavpN7/8AE/7zl/qOhakVut110uVtFdLfSV9Mtnlf0mpgbKzaSWLJ2TkVM0zXfzqTQ6hsFd6GHv3bD/SWlxdQpz1XHErqFtOpDFSwK7f7V9Jvf/if95y/1D+1fSb3/wCJ/wB5y/1FiXUNgrvQw9+7Yf6R1DYK70MPfu2H+k4e/U/AdvcqnjK7f7V9Jvf/AIn/AHnL/US41JMR37Emjq81eIbzX3aoiuzo45ayodK5rOkxrsorlXJM1Vcuc611DYK70MPfu2H+kydotFqs8D6e0Wyit8L3bbo6WBsTXOyyzVGoiKuSJvONe6hUhqqOB2oW06ctZyxPtABBJgAAAAAAAAAAAAAABxvW/wAcdSGiOqoqWbYuV9VaGDJeybGqfjn+ZnY8yvQiBq74IXHule1WaaJZLfC/3XcN27pEaoqtX5Sq1n7Rset/jjqv0uVVHSzbdtsaLQU+S9i6RF/Gv87+xz40YhveqBi/Rjo/wzcrniXE9LSX25zIxYlgle6GBnvUzaxUzc5XKuS8CN40LmnCVC2xit7KmclWuMG9yJioiIiIiIiJwIgOX9cHoe79ab0Wo/oHXB6Hu/Wm9FqP6Cr2FTwv0LLbU/EvUjBrqYH6mdKS36kh2LfiFi1KKibm1Dd0qedVa/wvXkOtaiGOPwnhCvwPWTZ1NoetRRoq73U8juyRPkvVf/MQ+fWW0g6I9Imi+rtlvxfSSXije2rtyLTTt2pG5orM1Zkm01XJvXLPZVeAjZoPxpJgLSdZ8RbbkpY5elVrU+NTv7F+7jyTskTlahaRhKtbaslvRWucaNxrRe5lmAPGGSOaJk0T2yRvajmOauaOReBUXkPIpi2AAAAAAAAAAAAAAAIY9EC7fcOeS3e1cbx0PztBxH5Ub7Jpo/RAu33Dnkt3tXG8dD87QcR+VG+yaWs/2a/O0rYfu2SWABVFkAAAAAAAAAAAAAAAAAAAAARb6IR2v4S8aqfUYYPoe3/P8XeK03rvM50Qjtfwl41U+owwfQ9v+f4u8VpvXeWsf2T/ADtK1/vPzuJgAAqiyAAAAAAAAAAAAAAAByDXI+D1iD5yk/mYzr5yDXI+D1iD5yk/mYztb8WPNHKvw5cmQJsF6u9guLbjY7nV22ta1WtqKWVY5EReFEcm9MzY/wC1fSb3/wCJ/wB5y/1Gzao1HR3DTvZqG4UdNWUs0NSkkNRE2Rj8oHuTNrkVNyoi+YnZ1DYK70MPfu2H+ktrm5hSnhKOJWW9vOpHFSwK7f7V9Jvf/if95y/1D+1fSb3/AOJ/3nL/AFFiXUNgrvQw9+7Yf6R1DYK70MPfu2H+kj+/U/AdvcqnjK7f7V9Jvf8A4n/ecv8AUfHetIWOr1bZbZeMX324UU2XTaeprpJI35LmmbVVUXJURSx7qGwV3oYe/dsP9JyfW1wzhu06CL3W2vD1ooapslM1s1PQxxvRFnYiojkbmmabj7p3lOU1FQPmdpOMW3IjrqZ/CCsnzFV7B5YEV+6mfwgrJ8xVeweWBEfSPF8vud9H8N8wACATQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADl+tf8HzFfzMP8xGQ71T/hB4V+en/l5CYmtf8AB8xX8zD/ADEZDvVP+EHhX56f+XkLW0/bT8/oVt1+4h5fUsUABVFkAAAcs1s/g9Yq+bp/5mIiDqlfCGwr85Ufy0pL7Wz+D1ir5un/AJmIiDqlfCGwr85Ufy0pa2n7afn9Ctuf3EPL6liIAKosgAAAAAAAAAAAAcB18O4tSeWoPZTHfjgOvh3FqTy1B7KY72vGjzOFzwpHF9Q7u01nkSf2sJOYgjqPV1FbtL1bV3CspqOnSzzMWWeVsbNpZYskzcqJmuS7uZSafVfhPvnsnp8X9R3v03V3HGxaVIzYMJ1X4T757J6fF/UOq/CffPZPT4v6iHqvuJmsu8zYMJ1X4T757J6fF/UecOKsMTTMhhxHZ5JJHI1jGV0aucq7kRER29RqvuGsu8zAAPk9AAAAAAAAAAAABo2njGrMA6LbviBr2trUj9z0KL8aofm1m7j2d7lTkapvJCvXsxx+FcaUWCqObOlszOnVSIu51TImaIvyWZed7kJFrS2tRLsOFxV2dNs4XgnDF6xviumw/ZY0qbnWK9zEkfsouy1XuVzl4NyLvU6d1rulv9GW394RnTdQbBOxT3fH1ZF2Ui/g+gVyfFTJ0r08K7DUXmchK0nXN7KnUcYdhDt7OM4a0iAvWu6W/wBGW394RjrXdLf6Mtv7wjJ9A4dI1fgdvcKXxIC9a7pb/Rlt/eEZzzSVgLEej2+Q2bE1NFBVzU6VDEikSRqsVzmp2Sbs82qWenANd7A3VDo1jxRRw7VfYHrI/ZTe6meqJIn7Ko13MiO5TrQv5zqKM8mcq1lGMG45mU1N8cdVmiaG11U23crA5KKVFXe6HLOF3g2UVn+Gp2sr31S8cdRml2hjqZti2XnKgqs17FquVOlvXwPyTPiRziwgjXlLZ1XhkyRaVdpT+KAAIhKAAAAAAAAAAAAIY9EC7fcOeS3e1cbx0PztBxH5Ub7Jpo/RAu33Dnkt3tXG06id7stnwFfm3a8W63uluaLG2pqmRK9EiaiqiOVFVOctZrGzX52lZB4XbJSgwPVpg/vrsP7xi/qHVpg/vrsP7xi/qKzVl3FjrLvM8DA9WmD++uw/vGL+odWmD++uw/vGL+oasu4ay7zPA9VHVU1bSx1VHUQ1NPIm1HLE9HsenKipuU9p8n0AAAAAAAAAAAAAAARb6IR2v4S8aqfUYYPoe3/P8XeK03rvM50Qjtfwl41U+owwfQ9v+f4u8VpvXeWsf2T/ADtK1/vPzuJgAAqiyAAAAAAAAAAAAAAAByDXI+D1iD5yk/mYzr5yDXI+D1iD5yk/mYztb8WPNHKvw5cmRZ1NvhC2D5qq/l5CwUr61NvhC2D5qq/l5CwUk6R4q5fcj6P4b5gAEAmg47rl/B8vnz1L/MMOxHHdcv4Pl8+epf5hh2t+LHmjlX4UuRF/Uz+EFZPmKr2DywIr91M/hBWT5iq9g8sCJOkeL5fcj6P4b5gAEAmgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHL9a/4PmK/mYf5iMh3qn/CDwr89P/LyAFraftp+f0K26/cQ8vqWKAAqiyAAAOWa2fwesVfN0/8AMxEQdUr4Q2FfnKj+WlALW0/bT8/oVtz+4h5fUsRABVFkAAAAAAAAAAAADgOvh3FqTy1B7KYA72vGjzOFzwpEGAAaMoQAAAbHot7puFvLNH7ZoB8z6rPqHWRaEADLmjAAAAAAAAAAAAMRjS/U2F8I3XEVY1z4LdSSVLmN4X7LVVGp4VyTzlY9wqrpi3F01XUPSe53etVzlVckdLK/g38CZr5kALbRyShKXaVl+25RiWYaOcMUmDcDWjDFFksVvpmxOeiZdMfwvf8AtOVzvOZ8Aqm23iyySSWCAAPD0HouNHTXC31NBWwtmpamJ0M0buB7HIqOavMqKqAAFY2k7DE2CtIV6wxJJtrb6pzI5EXe6NeyjcuXAqtVqqnEpYDq9YzfjrRNZr5UK5a5sfuWtVU99NH2LnftbnftZcQBb3n6reM3nuKu0/TWlFZG/gAqC0AAAAAAAAAAAAIY9EC7fcOeS3e1cRoANDZ8GJRXXFkAASSOAAAWRatfcIwj5Pb6ynQwDM1eJLmaKl1FyAAOZ9gAAAAAAAAAAAEYeiAU01RYMJpCzaVtVU570T4rOUwfQ/6Senv2LFmj2UdS02W9F+M/kALOL/6bX5mVzX/bx/MiXQAKwsQAAAAAAAAAAAAAAAcg1yPg9Yg+cpP5mMA7W/FjzRyr8OXJkWdTb4Qtg+aqv5eQsFAJOkeKuX3I+j+G+YABAJoOO65fwfL589S/zDADtb8WPNHKvwpciL+pn8IKyfMVXsHlgQBJ0jxfL7kfR/DfMAAgE0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//9k=',
                        width: 150,
                        margin: [0, 20, 0, 20],
                      }
                    ]                   
                  ]
                }
              },              
              '\n',
              '\n' ,
              (this.PLBDetails == null) ? {} :
              [
                ...this.PLBDetails.map(obj => {
                  return [
                          (obj.plbdetails == null) ? {} :
                          {
                            style: 'tableExample',
                            table: {     
                            widths: [400, 350],
                            body: [
                              [
                                { text: "Check Number: " + (obj.checknumber == null ? '' : obj.checknumber) + " Payer Name: " + (obj.payername == null ? '' : obj.payername), fontSize: 10, alignment: 'right', bold: true, border: [true, true, true, true], colSpan: 2}, {}                     
                              ],                                               
                              ...obj.plbdetails.map(obj1 => {
                                return [
                                  {text: (obj1.adjustmentreasoncode == null ? '' : obj1.adjustmentreasoncode) + "<" + (obj1.adjustmentidentifier == null ? '' : obj1.adjustmentidentifier + "->") + (obj1.subclientdivisioncode == null ? '' : obj1.subclientdivisioncode) , fontSize: 10, border: [true, true, true, true]},
                                  {text: obj1.adjustmentamount, alignment: 'right', fontSize: 10, border: [true, true, true, true]} 
                                ]
                            })                                                                 
                          ]
                        }
                      },
                    // '\n'
                    ]
                })
              ], 
              {
                style: 'tableExample',                
                alignment: 'center',
                table: {
                  widths: [400, 350],
                  body: [                   
                    [                      
                    {text: "Total Provider Level Adjustments: " + this.totalplbcnt, alignment: 'right', fontSize: 10, border: [true, false, true, true]},
                    {text: "Total Provider Level Adjustment Amount: " + this.totalplbamt, alignment: 'right', fontSize: 10, border: [true, false, true, true]}                      
                    ]                   
                  ]
                }
              }                                                                                   
            ],
            styles: {
              header: {
                fontSize: 10,
                bold: true,
                alignment: 'center'
              }
            }
          };
        } else {
          return {};
        }
      }      
    } catch (error) {
      // this.clsUtility.LogError(error);
      console.log('getDocumentDefinition : ', error);
    }
  }

}
