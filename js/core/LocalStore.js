(function(G){
 "use strict";
 class LocalStore {
  constructor(prefix="shining-farce.",storage){this.prefix=prefix;this.error=null;try{this.storage=storage===undefined?window.localStorage:storage;}catch(e){this.storage=null;this.error=e.message;}}
  read(key){this.error=null;try{if(!this.storage)throw Error('BROWSER STORAGE UNAVAILABLE - IMPORT A JSON BACKUP');const value=this.storage.getItem(this.prefix+key);return value===null?null:JSON.parse(value);}catch(e){this.error=e.message;return null;}}
  write(key,value){try{if(!this.storage)throw Error("BROWSER STORAGE UNAVAILABLE - EXPORT A BACKUP");const text=JSON.stringify(value);this.storage.setItem(this.prefix+key,text);if(this.storage.getItem(this.prefix+key)!==text)throw Error('BROWSER SAVE READ-BACK FAILED - EXPORT A JSON BACKUP');this.error=null;return true;}catch(e){this.error=e.message;return false;}}
  workingCopyNotice(){return['PROJECT / SHIPPING FILES ARE UNCHANGED.','SAVE WAS READ BACK IN THIS BROWSER SESSION.','BROWSER STORAGE IS NOT A PORTABLE FILE BACKUP.',...(window.location?.protocol==='file:'?['FILE:// STORAGE CAN DIFFER BY BROWSER AND FILE PATH.']:[]),'USE THE SAME FILE PATH AND NORMAL BROWSER PROFILE.','PRIVATE WINDOWS OR CLEARING BROWSER DATA CAN LOSE IT.','EXPORT JSON BEFORE CLOSING OR RESTARTING.'];}
  missingWorkingCopy(){return 'NO WORKING COPY AT THIS BROWSER / FILE LOCATION. CHECK THE ORIGINAL INDEX.HTML PATH AND BROWSER PROFILE, OR IMPORT YOUR JSON BACKUP. PRIVATE MODE OR CLEARED BROWSER DATA MAY REMOVE IT.';}
 }
 G.core.LocalStore=LocalStore;
}(window.GBTRPG));
