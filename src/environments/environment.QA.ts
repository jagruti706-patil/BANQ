export const environment = {
  production: false,
  currentEnvironment: "QA",
  offset: new Date().getTimezoneOffset(),
  version: "1.0",
  baseServiceUrl: "https://banq-qa.myqone.com/banq/",
  coreServiceUrl: "https://banq-qa.myqone.com/banq/Client/",
  emailServiceUrl: "https://banq-qa.myqone.com/banq/Email/",
  fileServiceUrl: "https://banq-qa.myqone.com/banq/EraHub/",
  logServiceUrl: "http://dev53:9096/Logger/",
  configBANQEDIServiceUrl: "https://banq-qa.myqone.com/editranslator/",
  configParserServiceUrl:
    "https://banqstaging.triarqclouds.com/Q835Parser-0.1.0staging/BANKQParserScheduler/",
  configRivenServiceUrl:
    "https://banqstaging.triarqclouds.com/Q835Riven-1.1staging/BANKQRivenScheduler/",
  authServiceUrl: "https://qore-qa.myqone.com/auth/",
  ssoServiceLoginUrl:
    "https://accounts-qa.myqone.com/#/login?continue=https://banq-qa.myqone.com/puthash/setSID",
  ssoServiceLogoutUrl:
    "https://accounts-qa.myqone.com/#/logout?continue=https://banq-qa.myqone.com/puthash/setSID",

  //qinsight service url
  RestService_url: "https://qinsight-dev.myqone.com/restservice/"
};
