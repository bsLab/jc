// Make a standalone and self-contained JS library OR application for jvm/node/jxcore - 
// library provides module.exports

// Version 1.6.1


var Esprima = Require('parser/esprima');

var options = {
  bundle:true,
  builtinModules:{},
  CoreModules:{},
  log:console.log,
  main:null,
  mode:'lib',       // | 'app'
  paths:[],
  target:'node',    // | 'jvm' | 'browser'
  top:null,
  version:'1.6.1'
}; 


var Fs = require('fs');

var Modules = []; // modu.Modules;
var Builtin = []; // modu.Modules;
var Objects = []; // modu.Objects;
var Files = []; // modu.Files;
var FilesEmbedded = {};
var shift=0;

function FileExtension(filename) {
  return filename.split('.').pop();
}

function search(index,module) {
  if (options.paths.length==index) return module;
  var path=options.paths[index];
  if (Fs.existsSync(path+'/'+module+'.js')) return path+'/'+module+'.js';
  else if (Fs.existsSync(path+'/'+module)) return path+'/'+module;
  else return search(index+1,module);
}

var level=0;

function _Require(module) {
 function spaces(n) {var s=''; n--; while(n) s+=' ',n--; return s;}
 var Module,iscore=false,file,filepath;
 try {
  if (options.CoreModules[module]!=undefined) iscore=true,module=options.CoreModules[module];
  if (module=='') return undefined; 
  if (Modules[module]) return Modules[module];
  else if (Objects[module]) return Objects[module];
  if (!iscore) file=search(0,module); else file=module;
  level++;
  
  try {
    filepath=Fs.realpathSync(file);
    Files.push([module,filepath]);
  } catch (e) {filepath=file};
  if (filepath==module && module.charAt(0) != '.' && module.charAt(0) != '/') iscore=true;

  if (FileExtension(filepath)=='json') {
    options.log(spaces(level)+'Require: '+module+' [JSON]');
    var Object = require(filepath);
    Objects[module]=Object;
    level--;
    return Object;    
  } else {
    if (options.builtinModules[module]) {
      options.log(spaces(level)+'Require: '+module+' [Builtin]');
      Builtin[module] = Module = options.builtinModules[module];
    } else {
      options.log(spaces(level)+'Require: '+module+' ['+(iscore?'Core':'File')+']');
      Module = require(filepath);
    }
    Modules[module]=Module;
    level--;
    return Module;
  }
 } catch (e) {
  var more='';
   if (e.name==='SyntaxError' && filepath) {
      var src=Fs.readFileSync(filepath,'utf8');
      try {
        var ast = Esprima.parse(src, { tolerant: true, loc:true });
        if (ast.errors && ast.errors.length>0) more = ', '+ast.errors[0];
      } catch (e) {
        if (e.lineNumber) more = ', in line '+e.lineNumber; 
      }
   }
   // if (e.stack) console.log(e.stack);
   options.log(spaces(level)+'Require import of '+module+' failed: '+e+more);
   process.exit(-1);
 }
}

function _FileEmbedd(path,format) {
  var fullpath=search(0,path);
  console.log('*'+path);
  try {
    FilesEmbedded[path]=Fs.readFileSync(fullpath,format);
    options.log('#'+path+':'+FilesEmbedded[path].length+' bytes');
  } catch (e) {
    options.log('FileEmbedd failed for: '+fullpath)
    FilesEmbedded[path]=undefined};
}

function _FileEmbedded(path,format) {
  if (FilesEmbedded[path]) return FilesEmbedded[path];
  else {
    _FileEmbedd(path,format);
    return FilesEmbedded[path];
  }
}

function _Import (files,exports) {
  new Function("SourceMap", "exports", function() {
   var code = files.map(function(file) {
     return FileEmbedded(file, "utf8");
   });
   return code.join("\n\n");
 }())({}, exports);
}


function make (main,_options) {
  var p,file;
  
  for(p in _options) options[p]=_options[p];
  options.main=main;
  
  if (!options.bundle) {
    file=search(0,main);
    return Fs.readFileSync(file,'utf8');
  }

  Require=_Require;
  Import=_Import;
  FileEmbedd=_FileEmbedd;
  FileEmbedded=_FileEmbedded;
  Resolve = function (module) { return search(0,module) };

  Require('os/base64');
  if (options.CoreModules['buffer']=='os/buffer') Require('os/buffer');

  options.log('Include paths: '+options.paths.join(', '));
  options.log('Making '+main);

  Require(main);
  
  var coremodules = "";
  for(var m in options.CoreModules) {
    coremodules = coremodules + "CoreModules['"+m+"']='"+options.CoreModules[m]+"';"+NL;
  }
  var header=
  'TOP = "'+options.top+'"'+NL+
  'var CoreModules = {};'+NL+
  coremodules+NL+
  'var BundleModuleCode=[];'+NL+
  'var BundleObjectCode=[];'+NL+
  'var BundleModules = [];'+NL+
  'var Fs = require("fs");'+NL+
  "if (typeof __dirname == 'undefined') __dirname = '';"+NL+
  "if (typeof __filename == 'undefined') __filename = '"+options.main+"';"+NL+
  '//From compat.js'+NL+
  'var any = undefined;'+NL+
  'var empty = null;'+NL+
  'var none = null;'+NL+
  'var _ = undefined;'+NL+
  'var int = function (v) {return v|0};'+NL+
  'var div = function (a,b) {return a/b|0};'+NL+
  'var print = function (msg) {console.log(msg)};'+NL+
  "if (typeof global == 'undefined') global={};"+NL+
  'PATH=[process.cwd(),".","'+options.top+'"];'+NL+
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
  '  if (CoreModules[modupath]!=undefined) modupath=CoreModules[modupath];'+NL+
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
  'Import = function (files,exports) {'+NL+
  '  new Function("SourceMap", "exports", function() {'+NL+
  '   var code = files.map(function(file) {'+NL+
  '     return FileEmbedded(file, "utf8");'+NL+
  '   });'+NL+
  '   return code.join("\\n\\n");'+NL+
  ' }())({}, exports);'+NL+
  '}'+NL+
  'global.Import = Import;'+NL+
  "global.TARGET='"+global.TARGET+"';"+NL;

  var trailer=
  "var Base64=Require('os/base64');"+NL+
  (options.mode=='lib'?"module.exports = Require('"+options.main+"');":"Require('"+options.main+"');")+NL;
  "if (window) for(var p in module.exports) window[p]=module.exports[p];"+NL+
  (options.mode=='lib'?"return module.exports;":"")+NL;
  var code = '';
  for (var module in Builtin) {
    options.log('+ '+module+ ' ['+Builtin[module].length+']');
    code=code+"BundleModuleCode['"+module+"']=function (module,exports,global,process){\n"+Builtin[module]+'};\n';
  }
  for (var file in Files) {
    var modupath=Files[file][0];
    var path=Files[file][1];
    var data = Fs.readFileSync(path,'utf8');
    options.log('+ '+path+' ['+data.length+']');
    if (FileExtension(path)=='json')
      code=code+"BundleObjectCode['"+modupath+"']=function (module,exports){\nexports="+data+'};\n';
    else
      code=code+"BundleModuleCode['"+modupath+"']=function (module,exports,global,process){\n"+data+'};\n';
  }
  for (var file in FilesEmbedded) {
    var data = FilesEmbedded[file];
    if (!data) 
      code=code+"FilesEmbedded['"+file+"']=undefined";
    else {
      options.log('+ '+file+' ['+data.length+']');
      if (typeof data == 'string')
        code=code+"FilesEmbedded['"+file+"']=function (format){return Base64.decode('"+Base64.encode(data)+"')};\n";
      else
        code=code+"FilesEmbedded['"+file+"']=function (format){return Base64.decodeBuf('"+Base64.encodeBuf(data)+"')};\n";
    }      
  }
  return header+NL+code+NL+trailer;
}

module.exports = make;



