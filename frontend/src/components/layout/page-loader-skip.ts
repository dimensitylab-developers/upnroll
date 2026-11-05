type FlaggedWindow = Window & { __upnrollSkipPageLoader?: boolean };

export function setSkipPageLoader(skip: boolean) {
  (window as FlaggedWindow).__upnrollSkipPageLoader = skip;
}

export function isPageLoaderSkipped() {
  return (window as FlaggedWindow).__upnrollSkipPageLoader === true;
}
