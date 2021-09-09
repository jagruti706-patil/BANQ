import { NgModule, InjectionToken } from "@angular/core";
import { Routes, RouterModule, ActivatedRouteSnapshot } from "@angular/router";
import { DashboardComponent } from "./Pages/dashboard/dashboard.component";
import { RegistrationComponent } from "./Pages/registration/registration.component";
import { FiledetailsComponent } from "./Pages/filedetails/filedetails.component";
import { ClientchartComponent } from "./Pages/clientchart/clientchart.component";
import { NotfoundComponent } from "./Pages/notfound/notfound.component";
import { ServiceoperationsComponent } from "./Pages/serviceoperations/serviceoperations.component";
import { LoginComponent } from "./Pages/login/login.component";
// import { ActivateDeactivatestatusComponent } from './Pages/activate-deactivatestatus/activate-deactivatestatus.component';
import { LogsComponent } from "./Pages/logs/logs.component";
import { SetsessionidComponent } from "./Pages/setsessionid/setsessionid.component";
import { AuthGuard } from "src/app/Guard/auth-guard";
import { FileSideBarComponent } from "./Pages/file-side-bar/file-side-bar.component";
import { HomeLayoutComponent } from "./Pages/Layout/home-layout/home-layout.component";
import { AllClientsComponent } from "./Pages/all-clients/all-clients.component";
import { ConfigurationComponent } from "./Pages/configuration/configuration.component";
import { ProviderComponent } from "./Pages/Configurations/Provider/provider/provider.component";
import { AddproviderComponent } from "./Pages/Configurations/Provider/addprovider/addprovider.component";
import { UserclientmappingComponent } from "./Pages/Configurations/userclientmapping/userclientmapping.component";
import { UserclientmappinglistComponent } from "./Pages/Configurations/userclientmapping/userclientmappinglist.component";
import { ClientmasterComponent } from "./Pages/clientmaster/clientmaster.component";
import { ClientmasterlistComponent } from "./Pages/clientmaster/clientmasterlist.component";
import { ClientftpmasterComponent } from "./Pages/clientftpmaster/clientftpmaster.component";
import { SubclientmasterComponent } from "./Pages/subclientmaster/subclientmaster.component";
import { SubclientmasterlistComponent } from "./Pages/subclientmaster/subclientmasterlist.component";
import { ClientftplistComponent } from "./Pages/clientftpmaster/clientftplist.component";
const externalUrlProvider = new InjectionToken("externalUrlRedirectResolver");
// const deactivateGuard = new InjectionToken('deactivateGuard');
import { FilesummaryComponent } from "./Pages/filesummary/filesummary.component";
import { ChecksummaryComponent } from "./Pages/checksummary/checksummary.component";
import { ClaimsummaryComponent } from "./Pages/claimsummary/claimsummary.component";
import { SummarydashboardComponent } from "./Pages/summarydashboard/summarydashboard.component";
import { SplitfiledetailsComponent } from "./Pages/splitfiledetails/splitfiledetails.component";
//import { ProvidermappinglistComponent } from "./Pages/Configurations/providermapping/providermappinglist.component";
import { ProvidermappingComponent } from "./Pages/Configurations/Provider-Mapping/providermapping/providermapping.component";
import { UnmatchedclaimdetailsComponent } from "./Pages/unmatchedclaimdetails/unmatchedclaimdetails.component";
import { ZeromenupermissionComponent } from "./Pages/zeromenupermission/zeromenupermission.component";
import { FileclaimdetailsComponent } from "./Pages/fileclaimdetails/fileclaimdetails.component";
import { EmailconfigurationlistComponent } from "./Pages/Configurations/emailconfiguration/emailconfigurationlist.component";
import { AddemailconfigurationComponent } from "./Pages/Configurations/emailconfiguration/addemailconfiguration.component";
import { AddprovidermappingComponent } from "./Pages/Configurations/Provider-Mapping/addprovidermapping/addprovidermapping.component";
import { UserclientmappingoldComponent } from "./Pages/Configurations/userclientmappingold/userclientmappingold.component";
import { UserclientmappinglistoldComponent } from "./Pages/Configurations/userclientmappingold/userclientmappinglistold.component";
import { AllUnmatchedclaimsComponent } from "./Pages/Unmatched/all-unmatchedclaims/all-unmatchedclaims.component";
import { UnprocessComponent } from "./Pages/Unprocess/unprocess/unprocess.component";
import { UnprocessmasterfilesComponent } from "./Pages/Unprocess/unprocessmasterfiles/unprocessmasterfiles.component";
import { UnprocesssplitfilesComponent } from "./Pages/Unprocess/unprocesssplitfiles/unprocesssplitfiles.component";
import { PlbsummaryComponent } from "./Pages/plbsummary/plbsummary.component";
import { DivisionalsplitfiledetailsComponent } from "./Pages/divisionalsplitfiledetails/divisionalsplitfiledetails.component";
import { SubclientsplitparameterlistComponent } from "./Pages/subclientmaster/subclientsplitparameterlist.component";
import { AllSplitfilesdataComponent } from "./Pages/all-splitfilesdata/all-splitfilesdata.component";
import { PayeridentifierComponent } from "./Pages/Configurations/Payer Identifier/payeridentifier/payeridentifier.component";
import { OtherprovidermappingComponent } from "./Pages/Configurations/otherprovidermapping/otherprovidermapping.component";
import { AddotherprovidermappingComponent } from "./Pages/Configurations/otherprovidermapping/addotherprovidermapping.component";
import { AllunmatchedplbComponent } from "./Pages/Unmatched/allunmatchedplb/allunmatchedplb.component";
import { UnmatchComponent } from "./Pages/Unmatched/unmatch/unmatch.component";
import { DownloadedfilesComponent } from "./Pages/downloaded/downloadedfiles/downloadedfiles.component";
import { PendingdownloadComponent } from "./Pages/downloaded/pendingdownload/pendingdownload.component";
import { MyfilesComponent } from "./Pages/downloaded/myfiles/myfiles.component";
import { MyAccountComponent } from "./Pages/my-account/my-account.component";
import { PracticeFileSummaryComponent } from "./Pages/practice-file-summary/practice-file-summary/practice-file-summary.component";
import { FtptransferComponent } from "./Pages/downloaded/ftptransfer/ftptransfer.component";
import { HUBPendingFilesComponent } from "./Pages/Download Summary/hubpending-files/hubpending-files.component";
import { FTPPendingFilesComponent } from "./Pages/Download Summary/ftppending-files/ftppending-files.component";
import { PendingFileComponent } from "./Pages/Download Summary/pending-file/pending-file.component";
import { ManuallyunmatchedclaimdetailsComponent } from './Pages/manuallyunmatchedclaimdetails/manuallyunmatchedclaimdetails.component';
import { DuplicatecheckpaymentComponent } from './Pages/duplicatecheckpayment/duplicatecheckpayment.component';
import { SubclientreportingComponent } from './Pages/Configurations/subclientreporting/subclientreporting.component';
import { AddsubclientreportingComponent } from './Pages/Configurations/subclientreporting/addsubclientreporting.component';
import { MatchedanypracticetoanyclaimComponent } from './Pages/matchedanypracticetoanyclaim/matchedanypracticetoanyclaim.component';
import { InprocessComponent } from './Pages/inprocess/inprocess/inprocess.component';
import { InprocessmasterfileComponent } from './Pages/inprocess/inprocessmasterfile/inprocessmasterfile.component';
import { InprocesssplitfileComponent } from './Pages/inprocess/inprocesssplitfile/inprocesssplitfile.component';
import { FiledistributionComponent } from './Pages/reports/filedistribution/filedistribution.component';
import { UnmatchedplbdetailsComponent } from './Pages/unmatchedplbdetails/unmatchedplbdetails.component';

const routes: Routes = [
  {
    path: "",
    component: LoginComponent,
    canActivate: [AuthGuard],
  },

  {
    path: "",
    component: HomeLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      // { path: "", component: DashboardComponent, canActivate: [AuthGuard] },
      // { path: '*', component: LoginComponent },
      // { path: 'Status', component: ActivateDeactivatestatusComponent },
      { path: "Charts", component: ClientchartComponent },
      { path: "AllClients", component: AllClientsComponent },
      { path: "Dashboard", component: ClientchartComponent },
      { path: "Summary", component: SummarydashboardComponent },
      { path: "Registration", component: RegistrationComponent },
      { path: "Edit/:id", component: RegistrationComponent },
      { path: "Edit", component: RegistrationComponent },
      { path: "externalRedirect", component: NotfoundComponent },
      { path: "ServiceController", component: ServiceoperationsComponent },
      { path: "MyAccount", component: MyAccountComponent },
      { path: "Files", component: FiledetailsComponent },
      { path: "SplitFiles", component: SplitfiledetailsComponent },
      { path: "UnmatchedClaims", component: UnmatchedclaimdetailsComponent },
      { path: "UnmatchedPLBs", component: UnmatchedplbdetailsComponent },
      { path: "FilesClaimDetails", component: FileclaimdetailsComponent },
      { path: "Logs", component: LogsComponent },
      { path: "AddProvider", component: AddproviderComponent },
      { path: "SideBarFiles", component: FileSideBarComponent },
      { path: "filedata", component: FilesummaryComponent },
      { path: "filedata/:text", component: FilesummaryComponent },
      { path: "checksummary", component: ChecksummaryComponent },
      { path: "claimsummary", component: ClaimsummaryComponent },
      { path: "plbsummary", component: PlbsummaryComponent },
      {
        path: "allunmatchedclaimdetails",
        component: AllUnmatchedclaimsComponent,
      },
      { path: "nomenupermission", component: ZeromenupermissionComponent },
      {
        path: "unprocess",
        component: UnprocessComponent,
      },
      {
        path: "masterfilesunprocess",
        component: UnprocessmasterfilesComponent,
      },
      {
        path: "unprocesssplitfiles",
        component: UnprocesssplitfilesComponent,
      },
      {
        path: "divisionalsplitFiles",
        component: DivisionalsplitfiledetailsComponent,
      },
      {
        path: "allclaims",
        component: AllSplitfilesdataComponent,
      },
      {
        path: "allunmatchedplbdetails",
        component: AllunmatchedplbComponent,
      },
      {
        path: "tabunmatch",
        component: UnmatchComponent,
      },
      {
        path: "myfiles",
        component: MyfilesComponent,
      },
      {
        path: "pendingdownload",
        component: PendingdownloadComponent,
      },
      {
        path: "downloaded",
        component: DownloadedfilesComponent,
      },
      {
        path: "ftptransfer",
        component: FtptransferComponent,
      },
      {
        path: "practicefilesummary",
        component: PracticeFileSummaryComponent,
      },
      {
        path: "practicefilesummaryreport/:text",
        component: PracticeFileSummaryComponent,
      },
      {
        path: "pendingsummary",
        component: PendingFileComponent,
      },
      {
        path: "hubpendingsummary",
        component: HUBPendingFilesComponent,
      },
      {
        path: "ftppendingsummary",
        component: FTPPendingFilesComponent,
      },
      {
        path: "manuallymatchedclaimdetails",
        component: ManuallyunmatchedclaimdetailsComponent,
      },
      {
        path: "holdpayment",
        component: DuplicatecheckpaymentComponent,
      },
      {
        path: "rematchclaim",
        component: MatchedanypracticetoanyclaimComponent,
      },
      {
        path: "inprocess",
        component: InprocessComponent,
      },
      {
        path: "inprocessmasterfiles",
        component: InprocessmasterfileComponent,
      },
      {
        path: "inprocesssplitfiles",
        component: InprocesssplitfileComponent,
      },
      {
        path: "filedistribution",
        component: FiledistributionComponent,
      },
      {
        path: "filedistribution/:vclientid/:vprocessdate/:vfiledistributionid",
        component: FiledistributionComponent,
      },
      {
        path: "Configuration",
        component: ConfigurationComponent,
        children: [
          // { path: "", component: ClientmasterlistComponent },
          { path: "provider", component: ProviderComponent },
          { path: "clients", component: DashboardComponent },
          {
            path: "userclientmappinglistold",
            component: UserclientmappinglistoldComponent,
          },
          {
            path: "userclientmappingold",
            component: UserclientmappingoldComponent,
          },
          {
            path: "userclientmappinglist",
            component: UserclientmappinglistComponent,
          },

          { path: "userclientmapping", component: UserclientmappingComponent },
          { path: "subclientlist", component: SubclientmasterlistComponent },
          { path: "subclient/:new", component: SubclientmasterComponent },
          {
            path: "subclient/:id/:subclientcode",
            component: SubclientmasterComponent,
          },
          {
            path: "splitparameters",
            component: SubclientsplitparameterlistComponent,
          },
          { path: "clientlist", component: ClientmasterlistComponent },
          { path: "client/:id", component: ClientmasterComponent },
          { path: "client/new", component: ClientmasterComponent },
          { path: "clientftp/:id", component: ClientftpmasterComponent },
          {
            path: "clientftp/:id/:clientid",
            component: ClientftpmasterComponent,
          },
          // {
          //   path: "providermappinglist",
          //   component: ProvidermappinglistComponent
          // },
          // { path: "providermapping", component: ProvidermappingComponent },
          {
            path: "addprovidermapping",
            component: AddprovidermappingComponent,
          },
          { path: "providermapping", component: ProvidermappingComponent },
          {
            path: "addotherprovidermapping",
            component: AddotherprovidermappingComponent,
          },
          {
            path: "otherprovidermapping",
            component: OtherprovidermappingComponent,
          },
          {
            path: "emailconfigurationlist",
            component: EmailconfigurationlistComponent,
          },
          {
            path: "emailconfiguration/:id",
            component: AddemailconfigurationComponent,
          },
          {
            path: "emailconfiguration/new",
            component: AddemailconfigurationComponent,
          },
          { path: "payeridentifier", component: PayeridentifierComponent },
          { path: "subclientreportinglist", component: SubclientreportingComponent },
          { path: "subclientreporting/:id", component: AddsubclientreportingComponent },
          { path: "subclientreporting/:new", component: AddsubclientreportingComponent }
        ],
      },
    ],
  },
  { path: "setSID/:uid/:aid", component: SetsessionidComponent },
  { path: "clrSID", component: SetsessionidComponent },
  // { path: "nomenupermission", component: ZeromenupermissionComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  // providers: [
  //   {
  //     provide: externalUrlProvider,
  //     useValue: (route: ActivatedRouteSnapshot) => {
  //       const externalUrl = route.paramMap.get('externalUrl');
  //       window.open(externalUrl, '_self');
  //     },
  //   },
  // {
  //   provide: deactivateGuard,
  //   useValue: () => {
  //     console.log('Guard function is called!');
  //     return false;
  //   }
  // },
  // ],
})
export class AppRoutingModule {}
