/**
 **      ==============================
 **       O           O      O   OOOO
 **       O           O     O O  O   O
 **       O           O     O O  O   O
 **       OOOO   OOOO O     OOO  OOOO
 **       O   O       O    O   O O   O
 **       O   O       O    O   O O   O
 **       OOOO        OOOO O   O OOOO
 **      ==============================
 **      Dr. Stefan Bosse http://www.bsslab.de
 **
 **      COPYRIGHT: THIS SOFTWARE, EXECUTABLE AND SOURCE CODE IS OWNED
 **                 BY THE AUTHOR(S).
 **                 THIS SOURCE CODE MAY NOT BE COPIED, EXTRACTED,
 **                 MODIFIED, OR OTHERWISE USED IN A CONTEXT
 **                 OUTSIDE OF THE SOFTWARE SYSTEM.
 **
 **    $AUTHORS:     Stefan Bosse
 **    $INITIAL:     (C) 2006-2017 bLAB
 **    $CREATED:     sbosse on 23-12-15
 **    $VERSION:     1.3.1
 **    $RCS:         $Id: module.js,v 1.2 2017/05/27 18:20:44 sbosse Exp $
 **
 **    $INFO:
 *
 *      Module management for bundled applications.
 *
 *     $ENDINFO
 */

var CoreModule={};
CoreModule['buffer']='buffer';
CoreModule['events']='events';
CoreModule['util']='util';
CoreModule['http']='http';
CoreModule['fs']='fs';
CoreModule['os']='os';
CoreModule['net']='net';
CoreModule['http']='http';
CoreModule['dgram']='dgram';
CoreModule['path']='path';
CoreModule['zlib']='zlib';
CoreModule['assert']='assert';
CoreModule['child_process']='child_process';
CoreModule['string_decoder']='string_decoder';

module.exports= function (paths) {
  var Fs = require('fs');
  var Modules = [];
  var Files = [];
  var Objects = [];
  global.FilesEmbedded = [];
  /*
  ** Search paths
  */
  global.PATH=paths;
  function FileExtension(filename) {
    return filename.split('.').pop();
  }
  /*
  ** Search a file
  */
  function search(index,file) {
    if (PATH.length==index) return file;
    var path=PATH[index];
    if (Fs.existsSync(path+'/'+file+'.js')) return path+'/'+file+'.js';
    else if (Fs.existsSync(path+'/'+file)) return path+'/'+file;
    else return search(index+1,file);
  }
  /*
  ** Load either an embedded (tried first) or an external module.
  */
  global.Require = function (module) {
   try {
    //console.log(module)
    if (CoreModule[module]) return require(module);
    if (Modules[module]) return Modules[module];
    var file=search(0,module);
    var filepath=Fs.realpathSync(file);
    Files.push([module,filepath]);
    if (FileExtension(filepath)=='json') {
      var Object = require(file);
      Objects[module]=Object;
      return Object;    
    } else {
      var Module = require(file);
      Modules[module]=Module;
      return Module;
    }
   } catch (e) {
      console.log('Require import of module '+module+' ['+filepath+']  failed: '+e);
      if (e.name==='SyntaxError' && filepath) {
         var src=Fs.readFileSync(filepath,'utf8');
         var Esprima = Require('parser/esprima');
         try {
           var ast = Esprima.parse(src, { tolerant: true, loc:true });
           if (ast.errors && ast.errors.length>0) console.log(" .. "+ast.errors[0]);
         } catch (e) {
           if (e.lineNumber) console.log('.. in line '+e.lineNumber) 
         }
      }
      if (e.stack) console.log(e.stack);
   }
  };
  /*
  ** Look-up an embedded file
  */
  global.FileEmbedded = function (path,format) {
    return FilesEmbedded[path];
  };
  /*
  ** Embedd a file.  Only performed in makeapp...
  */
  global.FileEmbedd = function (path,format) {};

  global.open = function(name,context,as) {
    var module = Require(name);
    if (!context) context=global;
    for (var p in module) {
      context[p] = module[p];
    };
    if (as) context[as]=module;
  }
  
  return {
    Files:Files,
    FilesEmbedded:FilesEmbedded,
    Modules:Modules,
    Objects:Objects
  }
}

