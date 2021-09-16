#!/usr/bin/node
// Make a standalone and self-contained JS application for jvm/webview
// Version 1.5.5

var TOP='/home/sbosse/proj/jam/js';
var INSTALL='/opt/JAM';

global.PATH=[process.cwd(),TOP];
global.MODE='makeapp';
global.TARGET='node'; // | 'browser'


var Fs = require('fs');

var Modules = []; // modu.Modules;
var Objects = []; // modu.Objects;
var Files = []; // modu.Files;
var FilesEmbedded = {};
var Main = undefined;
var Bundle = 'bundle.js';
var shift=0;

function FileExtension(filename) {
  return filename.split('.').pop();
}

function search(index,module) {
  if (module.indexOf('/')==-1) return module;
  if (PATH.length==index) return module;
  var path=PATH[index];
  if (Fs.existsSync(path+'/'+module+'.js')) return path+'/'+module+'.js';
  else if (Fs.existsSync(path+'/'+module)) return path+'/'+module;
  else return search(index+1,module);
}

var CoreModule={};
CoreModule['com/io']='com/io.app';
CoreModule['com/pwgen']='com/pwgen.lw';
CoreModule['assert']='os/assert';
CoreModule['crypto']='os/crypto.rand';
CoreModule['events']='os/events';
CoreModule['path']='os/path';
CoreModule['string_decoder']='os/string_decoder';
CoreModule['util']='util';
CoreModule['http']='http';
CoreModule['os']='os';
CoreModule['net']='net';
CoreModule['fs']='fs';
CoreModule['stream']='';
CoreModule['url']='';
CoreModule['stream']='';
CoreModule['zlib']='';
CoreModule['child_process']='';

Require = function (module) {
 var file,filepath;
 try {
  if (CoreModule[module]!=undefined) module=CoreModule[module];
  if (module=='') return undefined; 
  if (Modules[module]) return Modules[module];
  else if (Objects[module]) return Objects[module];
  file=search(0,module);
  try {
    filepath=Fs.realpathSync(file);
    Files.push([module,filepath]);
  } catch (e) {filepath=''};
  if (FileExtension(filepath)=='json') {
    var Object = require(file);
    Objects[module]=Object;
    return Object;    
  } else {
    console.log('Require: Loading '+module);
    var Module = require(file);
    Modules[module]=Module;
    return Module;
  }
 } catch (e) {
  var more='';
   if (e.name==='SyntaxError' && filepath) {
      var src=Fs.readFileSync(filepath,'utf8');
      var Esprima = Require('parser/esprima');
      try {
        var ast = Esprima.parse(src, { tolerant: true, loc:true });
        if (ast.errors && ast.errors.length>0) more = ', '+ast.errors[0];
      } catch (e) {
        if (e.lineNumber) more = ', in line '+e.lineNumber; 
      }
   }
   if (e.stack) console.log(e.stack);
   console.log('Require import of '+module+' failed: '+e+more);
   process.exit(-1);
 }
}
global.Require=Require;

FileEmbedd = function (path,format) {
  var fullpath=search(0,path);
  console.log('*'+path);
  try {
    FilesEmbedded[path]=Fs.readFileSync(fullpath,format);
    console.log('#'+path+':'+FilesEmbedded[path].length+' bytes');
  } catch (e) {
    console.log('FileEmbedd failed for: '+fullpath)
    FilesEmbedded[path]=undefined};
}
global.FileEmbedd=FileEmbedd;

FileEmbedded = function (path,format) {
  if (FilesEmbedded[path]) return FilesEmbedded[path];
  else {
    FileEmbedd(path,format);
    return FilesEmbedded[path];
  }
}
global.FileEmbedded = FileEmbedded;

var Base64 = require(TOP+'/os/base64');
var Comp = require(TOP+'/com/compat');

var exit=false;
var argv=[];

Comp.args.parse(process.argv,[
  ['-exit',0,function (arg) {
    if (!Main) exit=true;
    else argv.push(arg);}],
  ['-o',1,function (arg) {
    if (!Main) Bundle=arg;
    else argv.push(arg);}],
  [function (arg) {
    if (!Main) Main=arg;
    argv.push(arg);
  }]
],2);


if (!Main) {
  console.log('usage: makeapp [-o <bundle.js>] <main.js>  [<program args>]');
  process.exit();
}

process.argv=Comp.array.concat(['node'],argv);


if (Main) Require(Main);
var coremodules = "";
for(var m in CoreModule) {
  coremodules = coremodules + "CoreModule['"+m+"']='"+CoreModule[m]+"';"+NL;
}
var header=
'var CoreModule = {};'+NL+
coremodules+NL+
'var BundleModuleCode=[];'+NL+
'var BundleObjectCode=[];'+NL+
'var BundleModules = [];'+NL+
'var Fs = require("fs");'+NL+
"if (typeof __dirname == 'undefined') __dirname = '';"+NL+
"if (typeof __filename == 'undefined') __filename = '"+Main+"';"+NL+
'//From compat.js'+NL+
'var any = undefined;'+NL+
'var empty = null;'+NL+
'var none = null;'+NL+
'var _ = undefined;'+NL+
'var int = function (v) {return v|0};'+NL+
'var div = function (a,b) {return a/b|0};'+NL+
'var print = function (msg) {console.log(msg)};'+NL+
"if (typeof global == 'undefined') global={};"+NL+
'PATH=[process.cwd(),".","'+TOP+'","'+INSTALL+'"];'+NL+
'function _isdir(path) {'+NL+
'  var stats=Fs.statSync(path);'+NL+
'  return stats && stats.isDirectory()};'+NL+
'function _search(index,file) {'+NL+
'  if (PATH.length==index) return file;'+NL+
'  var path=PATH[index];'+NL+
'  if (Fs.existsSync(path+"/"+file+".js")) return path+"/"+file+".js";'+NL+
'  else if (Fs.existsSync(path+"/"+file) && !_isdir(path+"/"+file)) return path+"/"+file;'+NL+
'  else return _search(index+1,file);'+NL+
' }'+NL+
'Require=global.Require=function(modupath) { '+NL+
'  var file,filepath;'+NL+
'  if (BundleModules[modupath]) return BundleModules[modupath];'+NL+
'  var exports={}; var module={exports:exports};'+NL+
'  if (CoreModule[modupath]!=undefined) modupath=CoreModule[modupath];'+NL+
"  if (modupath=='') return undefined;"+NL+
'  if (BundleModuleCode[modupath]) BundleModuleCode[modupath](module,exports,global,process);'+NL+
'  else if (BundleObjectCode[modupath]) BundleObjectCode[modupath](module,exports,global,process);'+NL+
'  else { try { file=_search(0,modupath); module = require(file)}'+NL+
'  catch (e) { var more="";'+NL+
'   if ((e.name==="SyntaxError"||e.name==="TypeError") && file) {'+NL+
'      var src=Fs.readFileSync(file,"utf8");'+NL+
'      var Esprima = Require("parser/esprima");'+NL+
'      try {'+NL+
'        var ast = Esprima.parse(src, { tolerant: true, loc:true });'+NL+
'        if (ast.errors && ast.errors.length>0) more = ", "+ast.errors[0];'+NL+
'      } catch (e) {'+NL+
'        if (e.lineNumber) more = ", in line "+e.lineNumber;'+NL+
'      }'+NL+
'   }'+NL+
'   console.log("Require import of "+modupath+" ("+file+") failed: "+e+more);'+NL+
'   // if (e.stack) console.log(e.stack);'+NL+
'   throw e; // process.exit(-1);'+NL+
'  }}'+NL+
'  BundleModules[modupath]=module.exports||module;'+NL+
'  return module.exports||module;};'+NL+
'FilesEmbedded=global.FilesEmbedded = {};'+NL+
'FileEmbedd=global.FileEmbedd = function (path,format) {};'+NL+
'FileEmbedded=global.FileEmbedded = function (path,format) {return FilesEmbedded[path](format);};'+NL+
"global.TARGET='"+global.TARGET+"';"+NL;

var trailer=
"var Base64=Require('os/base64');"+NL+
"module.exports = Require('"+Main+"');"+NL;
"if (window) for(var p in module.exports) window[p]=module.exports[p];"+NL+
"return module.exports;"+NL;
var code = '';
for (var file in Files) {
  var modupath=Files[file][0];
  var path=Files[file][1];
  console.log('+'+path);
  if (FileExtension(path)=='json')
    code=code+"BundleObjectCode['"+modupath+"']=function (module,exports){\nexports="+Fs.readFileSync(path,'utf8')+'};\n';
  else
    code=code+"BundleModuleCode['"+modupath+"']=function (module,exports,global,process){\n"+Fs.readFileSync(path,'utf8')+'};\n';
}
for (var file in FilesEmbedded) {
  var data = FilesEmbedded[file];
  if (!data) 
    code=code+"FilesEmbedded['"+file+"']=undefined";
  else {
    console.log('+'+file);
    if (typeof data == 'string')
      code=code+"FilesEmbedded['"+file+"']=function (format){return Base64.decode('"+Base64.encode(data)+"')};\n";
    else
      code=code+"FilesEmbedded['"+file+"']=function (format){return Base64.decodeBuf('"+Base64.encodeBuf(data)+"')};\n";
  }      
}

console.log('Writing bundled JS file '+Bundle);
Fs.writeFileSync(Bundle, header+NL+code+NL+trailer, 'utf8');

console.log('Finished. Exit ..');
if (exit) process.exit();


