export const environment = {
  production: false,
  currentEnvironment: "Staging",
  offset: new Date().getTimezoneOffset(),
  version: "1.0",
  baseServiceUrl: "https://banq-staging.myqone.com/banq/",
  coreServiceUrl: "https://banq-staging.myqone.com/banq/Client/",
  emailServiceUrl: "https://banq-staging.myqone.com/banq/Email/",
  fileServiceUrl: "https://banq-staging.myqone.com/banq/EraHub/",
  configBANQEDIServiceUrl: "https://banq-staging.myqone.com/editranslator/",
  logServiceUrl: "http://dev53:9096/Logger/",
  configParserServiceUrl:
    "https://banqstaging.triarqclouds.com/Q835Parser-0.1.0staging/BANKQParserScheduler/",
  configRivenServiceUrl:
    "https://banqstaging.triarqclouds.com/Q835Riven-1.1staging/BANKQRivenScheduler/",
  authServiceUrl: "https://qore-staging.myqone.com/auth/",
  ssoServiceLoginUrl:
    "https://accounts-staging.myqone.com/#/login?continue=https://banq-staging.myqone.com/puthash/setSID",
  ssoServiceLogoutUrl:
    "https://accounts-staging.myqone.com/#/logout?continue=https://banq-staging.myqone.com/puthash/setSID",

  //qinsight service url
  RestService_url: "https://qinsight-dev.myqone.com/restservice/"
};
