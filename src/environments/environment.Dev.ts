export const environment = {
  production: false,
  currentEnvironment: "Development",
  offset: new Date().getTimezoneOffset(),
  version: "1.0",
  baseServiceUrl: "https://banq-dev.myqone.com/banq/",
  coreServiceUrl: "https://banq-dev.myqone.com/banq/Client/",
  emailServiceUrl: "https://banq-dev.myqone.com/banq/Email/",
  fileServiceUrl: "https://banq-dev.myqone.com/banq/EraHub/",
  logServiceUrl: "https://dev53:9096/Logger/",
  configBANQEDIServiceUrl: "https://banq-dev.myqone.com/editranslator/",
  configParserServiceUrl:
    "https://banqstaging.triarqclouds.com/Q835Parser-0.1.0staging/BANKQParserScheduler/",
  configRivenServiceUrl:
    "https://banqstaging.triarqclouds.com/Q835Riven-1.1staging/BANKQRivenScheduler/",
  // authServiceUrl: "https://microservices.qpathways.com/auth/",
  authServiceUrl: "https://qore-dev.myqone.com/auth/",
  ssoServiceLoginUrl:
    "https://accounts-dev.myqone.com/#/login?continue=https://banq-dev.myqone.com/puthash/setSID",
  ssoServiceLogoutUrl:
    "https://accounts-dev.myqone.com/#/logout?continue=https://banq-dev.myqone.com/puthash/setSID",

  //qinsight service url
  RestService_url: "https://qinsight-dev.myqone.com/restservice/"
};
