import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NavbarComponent } from "./navbar/navbar.component";
import { DashboardComponent } from "./Pages/dashboard/dashboard.component";
import { ArchwizardModule } from "angular-archwizard";
import {
  GridModule,
  ExcelModule,
  PDFModule,
} from "@progress/kendo-angular-grid";
import { RegistrationComponent } from "./Pages/registration/registration.component";
import { FtpmasterComponent } from "./Pages/ftpmaster/ftpmaster.component";
import { SubclientregistrationComponent } from "./Pages/subclientregistration/subclientregistration.component";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DropDownsModule } from "@progress/kendo-angular-dropdowns";
import { DatePipe } from "@angular/common";

import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { DialogsModule } from "@progress/kendo-angular-dialog";
import { SubclientComponent } from "./Pages/subclient/subclient.component";
import { PreviewdetailsComponent } from "./Pages/previewdetails/previewdetails.component";
import { ClientstatusComponent } from "./Pages/clientstatus/clientstatus.component";
import { FiledetailsComponent } from "./Pages/filedetails/filedetails.component";
import {
  DatePickerModule,
  DateInputsModule,
} from "@progress/kendo-angular-dateinputs";

import { Api } from "./Services/api";
import { Ng2GoogleChartsModule } from "ng2-google-charts";
import { ClientchartComponent } from "./Pages/clientchart/clientchart.component";
import { NotfoundComponent } from "./Pages/notfound/notfound.component";
import { ExternalUrlDirective } from "./external-url.directive";
import { ServiceoperationsComponent } from "./Pages/serviceoperations/serviceoperations.component";
import { LoginComponent } from "./Pages/login/login.component";
import { PhonePipe } from "./phone.pipe";
import { ActivateDeactivatestatusComponent } from "./Pages/activate-deactivatestatus/activate-deactivatestatus.component";
import { LogsComponent } from "./Pages/logs/logs.component";
import { ToastrModule } from "ngx-toastr";
// import { NgxChartsModule } from "@swimlane/ngx-charts";
// import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { EditorModule } from "@progress/kendo-angular-editor";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
// import { NgxSelectModule } from 'ngx-select-ex';

import { LoadingModule } from "ngx-loading";
import { SetsessionidComponent } from "./Pages/setsessionid/setsessionid.component";
import { CookieService } from "ngx-cookie-service";
import { AuthGuard } from "src/app/Guard/auth-guard";
import { NavbarlinksComponent } from "./Pages/navbarlinks/navbarlinks.component";
import { EditconfirmationComponent } from "./Pages/confirmation/editconfirmation/editconfirmation.component";
import { DeleteconfirmationComponent } from "./Pages/confirmation/deleteconfirmation/deleteconfirmation.component";
import { FileSideBarComponent } from "./Pages/file-side-bar/file-side-bar.component";
import { SidebarModule } from "ng-sidebar";
import { jwtInterceptor } from "./Services/jwtinterceptor";
import { HomeLayoutComponent } from "./Pages/Layout/home-layout/home-layout.component";
import { LoginLayoutComponent } from "./Pages/Layout/login-layout/login-layout.component";
import { AllClientsComponent } from "./Pages/all-clients/all-clients.component";
import { ConfigurationComponent } from "./Pages/configuration/configuration.component";
import { ProviderComponent } from "./Pages/Configurations/Provider/provider/provider.component";
import { AddproviderComponent } from "./Pages/Configurations/Provider/addprovider/addprovider.component";
import { UserclientmappingComponent } from "./Pages/Configurations/userclientmapping/userclientmapping.component";
//import { UserclientmappinglistComponent } from './pages/Configurations/userclientmapping/userclientmappinglist.component';
import { UserclientmappinglistComponent } from "./Pages/Configurations/userclientmapping/userclientmappinglist.component";

import { ClientmasterComponent } from "./Pages/clientmaster/clientmaster.component";
import { ClientmasterlistComponent } from "./Pages/clientmaster/clientmasterlist.component";
import { ClientftpmasterComponent } from "./Pages/clientftpmaster/clientftpmaster.component";
import { ClientftplistComponent } from "./Pages/clientftpmaster/clientftplist.component";

import { SubclientmasterComponent } from "./Pages/subclientmaster/subclientmaster.component";
import { SubclientmasterlistComponent } from "./Pages/subclientmaster/subclientmasterlist.component";
import { FilesummaryComponent } from "./Pages/filesummary/filesummary.component";
import { ChecksummaryComponent } from "./Pages/checksummary/checksummary.component";
import { ClaimsummaryComponent } from "./Pages/claimsummary/claimsummary.component";
import { BreadcrumbComponent } from "./Pages/breadcrumb/breadcrumb.component";
import { ClientinformationComponent } from "./Pages/clientmaster/clientinformation.component";
import { SummarydashboardComponent } from "./Pages/summarydashboard/summarydashboard.component";
// import { FilesummaryComponent } from './pages/filesummary/filesummary.component';
// import { ChecksummaryComponent } from './pages/checksummary/checksummary.component';
// import { ClaimsummaryComponent } from './pages/claimsummary/claimsummary.component';
// import { ChartsModule } from "ng2-charts";
import { SplitfiledetailsComponent } from "./Pages/splitfiledetails/splitfiledetails.component";
import { MenuModule } from "@progress/kendo-angular-menu";
import { ContextMenuModule } from "@progress/kendo-angular-menu";
import { UnmatchedclaimdetailsComponent } from "./Pages/unmatchedclaimdetails/unmatchedclaimdetails.component";
import { SubclientinformationComponent } from "./Pages/subclientmaster/subclientinformation.component";
//import { ProvidermappingComponent } from "./Pages/Configurations/providermapping/providermapping.component";
//import { ProvidermappinglistComponent } from "./Pages/Configurations/providermapping/providermappinglist.component";
// import { HttpModule } from "@angular/http";
import { ZeromenupermissionComponent } from "./Pages/zeromenupermission/zeromenupermission.component";
import { FileclaimdetailsComponent } from "./Pages/fileclaimdetails/fileclaimdetails.component";
// import { ComboSeriesVerticalComponent } from "./Pages/combo-chart/combo-series-vertical.component";
// import { ComboChartComponent } from "./Pages/combo-chart/combo-chart.component";
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { EmailconfigurationlistComponent } from "./Pages/Configurations/emailconfiguration/emailconfigurationlist.component";
import { AddemailconfigurationComponent } from "./Pages/Configurations/emailconfiguration/addemailconfiguration.component";
import { ProvidermappingComponent } from "./Pages/Configurations/Provider-Mapping/providermapping/providermapping.component";
import { AddprovidermappingComponent } from "./Pages/Configurations/Provider-Mapping/addprovidermapping/addprovidermapping.component";
import { UserclientmappingoldComponent } from "./Pages/Configurations/userclientmappingold/userclientmappingold.component";
import { UserclientmappinglistoldComponent } from "./Pages/Configurations/userclientmappingold/userclientmappinglistold.component";
import { AllUnmatchedclaimsComponent } from "./Pages/Unmatched/all-unmatchedclaims/all-unmatchedclaims.component";
import { UnprocessmasterfilesComponent } from "./Pages/Unprocess/unprocessmasterfiles/unprocessmasterfiles.component";
import { UnprocessComponent } from "./Pages/Unprocess/unprocess/unprocess.component";
import { UnprocesssplitfilesComponent } from "./Pages/Unprocess/unprocesssplitfiles/unprocesssplitfiles.component";
import { NgCircleProgressModule } from "ng-circle-progress";
import { PlbsummaryComponent } from "./Pages/plbsummary/plbsummary.component";
import { DivisionalsplitfiledetailsComponent } from "./Pages/divisionalsplitfiledetails/divisionalsplitfiledetails.component";
import { SubclientsplitparameterlistComponent } from "./Pages/subclientmaster/subclientsplitparameterlist.component";
import { AllSplitfilesdataComponent } from "./Pages/all-splitfilesdata/all-splitfilesdata.component";
import { SelectsubclientComponent } from "./Pages/selectsubclient/selectsubclient.component";
import { PayeridentifierComponent } from "./Pages/Configurations/Payer Identifier/payeridentifier/payeridentifier.component";
import { AddpayeridentifierComponent } from "./Pages/Configurations/Payer Identifier/addpayeridentifier/addpayeridentifier.component";
import { OtherprovidermappingComponent } from "./Pages/Configurations/otherprovidermapping/otherprovidermapping.component";
import { AddotherprovidermappingComponent } from "./Pages/Configurations/otherprovidermapping/addotherprovidermapping.component";
import { AccountActivationComponent } from "./Pages/account-activation/account-activation.component";
import { HubCardsComponent } from "./Pages/Cards/hub-cards/hub-cards.component";

import { AllunmatchedplbComponent } from "./Pages/Unmatched/allunmatchedplb/allunmatchedplb.component";
import { UnmatchComponent } from "./Pages/Unmatched/unmatch/unmatch.component";
import { DownloadedfilesComponent } from "./Pages/downloaded/downloadedfiles/downloadedfiles.component";
import { PendingdownloadComponent } from "./Pages/downloaded/pendingdownload/pendingdownload.component";
import { MyfilesComponent } from "./Pages/downloaded/myfiles/myfiles.component";
import { MyAccountComponent } from "./Pages/my-account/my-account.component";
import { ActionConfirmationComponent } from "./Pages/confirmation/action-confirmation/action-confirmation.component";
import { PracticeFileSummaryComponent } from "./Pages/practice-file-summary/practice-file-summary/practice-file-summary.component";
import { FileSummaryInfoComponent } from "./Pages/practice-file-summary/file-summary-info/file-summary-info.component";
import { NgIdleKeepaliveModule } from "@ng-idle/keepalive";
import { PDFExportModule } from "@progress/kendo-angular-pdf-export";
import { EobreportComponent } from "./Pages/eobreport/eobreport.component";
import { FtptransferComponent } from "./Pages/downloaded/ftptransfer/ftptransfer.component";
import { ToggleSidePanelDirective } from "./toggle-side-panel.directive";
import { BottomToggleSidePanelDirective } from "./bottom-toggle-side-panel.directive";
import { HUBPendingFilesComponent } from "./Pages/Download Summary/hubpending-files/hubpending-files.component";
import { FTPPendingFilesComponent } from "./Pages/Download Summary/ftppending-files/ftppending-files.component";
import { PendingFileComponent } from './Pages/Download Summary/pending-file/pending-file.component';
import { ManuallyunmatchedclaimdetailsComponent } from './Pages/manuallyunmatchedclaimdetails/manuallyunmatchedclaimdetails.component';
import { ManuallymatchedclaimhistoryComponent } from './Pages/manuallyunmatchedclaimdetails/manuallymatchedclaimhistory.component';
import { CheckwiseeobreportComponent } from './Pages/eobreport-check/checkwiseeobreport.component';
import { DuplicatecheckpaymentComponent } from './Pages/duplicatecheckpayment/duplicatecheckpayment.component';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { DuplicatecheckpaymenthistoryComponent } from './Pages/duplicatecheckpayment/duplicatecheckpaymenthistory.component';
import { SubclientreportingComponent } from './Pages/Configurations/subclientreporting/subclientreporting.component';
import { AddsubclientreportingComponent } from './Pages/Configurations/subclientreporting/addsubclientreporting.component';
import { MatchedanypracticetoanyclaimComponent } from './Pages/matchedanypracticetoanyclaim/matchedanypracticetoanyclaim.component';
import { InprocessComponent } from './Pages/inprocess/inprocess/inprocess.component';
import { InprocessmasterfileComponent } from './Pages/inprocess/inprocessmasterfile/inprocessmasterfile.component';
import { InprocesssplitfileComponent } from './Pages/inprocess/inprocesssplitfile/inprocesssplitfile.component';
import { FiledistributionComponent } from './Pages/reports/filedistribution/filedistribution.component';
import { DivisionandpayerwiseComponent } from './Pages/reports/divisionandpayerwise/divisionandpayerwise.component';
import { UnmatchedplbdetailsComponent } from './Pages/unmatchedplbdetails/unmatchedplbdetails.component';
import { FiledistributionnotesComponent } from './Pages/reports/filedistributionnotes/filedistributionnotes.component';
import { MentionModule } from 'angular-mentions';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DashboardComponent,
    RegistrationComponent,
    FtpmasterComponent,
    SubclientregistrationComponent,
    SubclientComponent,
    PreviewdetailsComponent,
    ClientstatusComponent,
    ClientchartComponent,
    NotfoundComponent,
    ExternalUrlDirective,
    ServiceoperationsComponent,
    LoginComponent,
    FiledetailsComponent,
    PhonePipe,
    ActivateDeactivatestatusComponent,
    LogsComponent,
    SetsessionidComponent,
    NavbarlinksComponent,
    EditconfirmationComponent,
    DeleteconfirmationComponent,
    FileSideBarComponent,
    HomeLayoutComponent,
    LoginLayoutComponent,
    AllClientsComponent,
    ConfigurationComponent,
    ProviderComponent,
    AddproviderComponent,
    UserclientmappingComponent,
    UserclientmappinglistComponent,
    ClientmasterComponent,
    ClientmasterlistComponent,
    ClientftpmasterComponent,
    ClientftplistComponent,
    SubclientmasterComponent,
    SubclientmasterlistComponent,
    ClientinformationComponent,
    FilesummaryComponent,
    ChecksummaryComponent,
    ClaimsummaryComponent,
    BreadcrumbComponent,
    SummarydashboardComponent,
    SplitfiledetailsComponent,
    UnmatchedclaimdetailsComponent,
    SubclientinformationComponent,
    ProvidermappingComponent,
    //ProvidermappinglistComponent,
    ZeromenupermissionComponent,
    FileclaimdetailsComponent,
    // ComboSeriesVerticalComponent,
    // ComboChartComponent,
    EmailconfigurationlistComponent,
    AddemailconfigurationComponent,
    //ProviderMappingComponent,
    AddprovidermappingComponent,
    UserclientmappingoldComponent,
    UserclientmappinglistoldComponent,
    AllUnmatchedclaimsComponent,
    UnprocessmasterfilesComponent,
    UnprocessComponent,
    UnprocesssplitfilesComponent,
    PlbsummaryComponent,
    DivisionalsplitfiledetailsComponent,
    SubclientsplitparameterlistComponent,
    AllSplitfilesdataComponent,
    SelectsubclientComponent,
    PayeridentifierComponent,
    AddpayeridentifierComponent,
    OtherprovidermappingComponent,
    AddotherprovidermappingComponent,
    AccountActivationComponent,
    HubCardsComponent,
    AllunmatchedplbComponent,
    UnmatchComponent,
    DownloadedfilesComponent,
    PendingdownloadComponent,
    MyfilesComponent,
    MyAccountComponent,
    ActionConfirmationComponent,
    PracticeFileSummaryComponent,
    FileSummaryInfoComponent,
    EobreportComponent,
    FtptransferComponent,
    ToggleSidePanelDirective,
    BottomToggleSidePanelDirective,
    HUBPendingFilesComponent,
    FTPPendingFilesComponent,
    PendingFileComponent,    
    ManuallyunmatchedclaimdetailsComponent,
    ManuallymatchedclaimhistoryComponent,
    CheckwiseeobreportComponent,
    DuplicatecheckpaymentComponent,
    DuplicatecheckpaymenthistoryComponent,
    SubclientreportingComponent,
    AddsubclientreportingComponent,
    MatchedanypracticetoanyclaimComponent,
    InprocessComponent,
    InprocessmasterfileComponent,
    InprocesssplitfileComponent,
    FiledistributionComponent,
    DivisionandpayerwiseComponent,
    UnmatchedplbdetailsComponent,
    FiledistributionnotesComponent
  ],
  imports: [
    // HttpModule,

    // RouterModule.forRoot(
    //   [
    //     {
    //       path: '',
    //       component : DashboardComponent
    //     },
    //     {
    //       path : "dashboard",
    //       component : DashboardComponent
    //     }
    // ]
    // ),
    BrowserModule,
    AppRoutingModule,
    InputsModule,
    BrowserAnimationsModule,
    ArchwizardModule,
    GridModule,
    ButtonsModule,
    FormsModule,
    ReactiveFormsModule,
    DropDownsModule,
    HttpClientModule,
    DialogsModule,
    DatePickerModule,
    Ng2GoogleChartsModule,
    LoadingModule,
    // NgxChartsModule,
    // NgxSelectModule,
    ToastrModule.forRoot({
      closeButton: false,
      newestOnTop: true,
      progressBar: false,
      positionClass: "toast-bottom-right",
      preventDuplicates: true,
      timeOut: 4000,
      extendedTimeOut: 1000,
    }),
    SidebarModule.forRoot(),
    // ChartsModule,
    MenuModule,
    ContextMenuModule,
    ExcelModule,
    // NgMultiSelectDropDownModule.forRoot(),
    EditorModule,
    AngularMultiSelectModule,
    NgCircleProgressModule.forRoot({}),
    NgIdleKeepaliveModule.forRoot(),
    PDFModule,
    PDFExportModule,
    DateInputsModule,
    PdfJsViewerModule,
    MentionModule
  ],
  providers: [
    DatePipe,
    AuthGuard,
    Api,
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: jwtInterceptor,
      multi: true,
    },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
  entryComponents: [ClientinformationComponent, SubclientinformationComponent],
})
export class AppModule {}
