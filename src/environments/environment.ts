//local urls setup

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  currentEnvironment: "Local",
  offset: new Date().getTimezoneOffset(),
  version: "1.0",
  //local
  //  coreServiceUrl: "http://localhost:8090/BANQRegistrationService/Client/",
  //  fileServiceUrl: "http://localhost:8090/BANQRegistrationService/EraHub/",
  //  emailServiceUrl: "http://localhost:8090/BANQRegistrationService/Email/",
  //  logServiceUrl: "https://dev53:9096/Logger/",
  //  configBANQEDIServiceUrl: "http://localhost:5000/editranslator/",

  //  authServiceUrl: "https://microservices.qpathways.com/auth/",
  //  ssoServiceLoginUrl:
  //    "https://accounts-dev.myqone.com/#/login?continue=https://banq-dev.myqone.com",
  //  ssoServiceLogoutUrl: "https://accounts-dev.myqone.com/#/logout",
  //  // Qinsight service.....
  //  RestService_url: "https://qinsight-dev.myqone.com/restservice/"

  //DEV
  baseServiceUrl: "https://banq-dev.myqone.com/banq/",
  coreServiceUrl: "https://banq-dev.myqone.com/banq/Client/",
  emailServiceUrl: "https://banq-dev.myqone.com/banq/Email/",
  fileServiceUrl: "https://banq-dev.myqone.com/banq/EraHub/",
  logServiceUrl: "https://dev53:9096/Logger/",
  configBANQEDIServiceUrl: "https://banq-dev.myqone.com/editranslator/",
  // configBANQEDIServiceUrl: "http://localhost:5000/editranslator/",
  configParserServiceUrl:
    "https://banqstaging.triarqclouds.com/Q835Parser-0.1.0staging/BANKQParserScheduler/",
  configRivenServiceUrl:
    "https://banqstaging.triarqclouds.com/Q835Riven-1.1staging/BANKQRivenScheduler/",
  //authServiceUrl: "https://microservices.qpathways.com/auth/",
  authServiceUrl: "https://qore-dev.myqone.com/auth/",
  ssoServiceLoginUrl:
    "https://accounts-dev.myqone.com/#/login?continue=http://localhost:4200/puthash/setSID",
  ssoServiceLogoutUrl:
    "https://accounts-dev.myqone.com/#/logout?continue=http://localhost:4200/puthash/setSID",

  //qinsight service url
  RestService_url: "https://qinsight-dev.myqone.com/restservice/"

  //QA
  // baseServiceUrl: "https://banq-qa.myqone.com/banq/",
  // coreServiceUrl: "https://banq-qa.myqone.com/banq/Client/",
  // emailServiceUrl: "https://banq-qa.myqone.com/banq/Email/",
  // fileServiceUrl: "https://banq-qa.myqone.com/banq/EraHub/",
  // logServiceUrl: "http://dev53:9096/Logger/",
  // configBANQEDIServiceUrl: "https://banq-qa.myqone.com/editranslator/",
  // configParserServiceUrl:
  //   "https://banqstaging.triarqclouds.com/Q835Parser-0.1.0staging/BANKQParserScheduler/",
  // configRivenServiceUrl:
  //   "https://banqstaging.triarqclouds.com/Q835Riven-1.1staging/BANKQRivenScheduler/",
  // authServiceUrl: "https://qore-qa.myqone.com/auth/",
  // ssoServiceLoginUrl:
  //   "https://accounts-qa.myqone.com/#/login?continue=https://banq-qa.myqone.com",
  // ssoServiceLogoutUrl: "https://accounts-qa.myqone.com/#/logout",

  // // qinsight service url
  // RestService_url: "https://qinsight-dev.myqone.com/restservice/"

  //PRODUCTION
  // baseServiceUrl: "https://hub.myqone.com/banq/",
  // coreServiceUrl: "https://hub.myqone.com/banq/Client/",
  // emailServiceUrl: "https://hub.myqone.com/banq/Email/",
  // fileServiceUrl: "https://hub.myqone.com/banq/EraHub/",
  // configBANQEDIServiceUrl: "https://hub.myqone.com/editranslator/",
  // logServiceUrl: "http://dev53:9096/Logger/",
  // configParserServiceUrl:
  //   "https://banqstaging.triarqclouds.com/Q835Parser-0.1.0staging/BANKQParserScheduler/",
  // configRivenServiceUrl:
  //   "https://banqstaging.triarqclouds.com/Q835Riven-1.1staging/BANKQRivenScheduler/",
  // authServiceUrl: "https://qore.myqone.com/auth/",
  // ssoServiceLoginUrl:
  //   "https://accounts.myqone.com/#/login?continue=https://hub.myqone.com/puthash/setSID",
  // ssoServiceLogoutUrl:
  //   "https://accounts.myqone.com/#/logout?continue=https://hub.myqone.com/puthash/setSID",

  // //qinsight service url
  // RestService_url: "https://qinsight-dev.myqone.com/restservice/"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
