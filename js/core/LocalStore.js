(function(G){
 "use strict";
 class LocalStore {
  constructor(prefix="shining-farce.",storage){this.prefix=prefix;try{this.storage=storage===undefined?window.localStorage:storage;}catch{this.storage=null;}this.error=null;}
  read(key){try{const value=this.storage?.getItem(this.prefix+key);return value?JSON.parse(value):null;}catch(e){this.error=e.message;return null;}}
  write(key,value){try{if(!this.storage)throw Error("BROWSER STORAGE UNAVAILABLE - EXPORT A BACKUP");this.storage.setItem(this.prefix+key,JSON.stringify(value));this.error=null;return true;}catch(e){this.error=e.message;return false;}}
 }
 G.core.LocalStore=LocalStore;
}(window.GBTRPG));
