/**
 **      ==================================
 **      OOOO   OOOO OOOO  O      O   OOOO
 **      O   O  O    O     O     O O  O   O
 **      O   O  O    O     O     O O  O   O
 **      OOOO   OOOO OOOO  O     OOO  OOOO
 **      O   O     O    O  O    O   O O   O
 **      O   O     O    O  O    O   O O   O
 **      OOOO   OOOO OOOO  OOOO O   O OOOO
 **      ==================================
 **      BSSLAB, Dr. Stefan Bosse http://www.bsslab.de
 **
 **      COPYRIGHT: THIS SOFTWARE, EXECUTABLE AND SOURCE CODE IS OWNED
 **                 BY THE AUTHOR.
 **                 THIS SOURCE CODE MAY NOT BE COPIED, EXTRACTED,
 **                 MODIFIED, OR OTHERWISE USED IN A CONTEXT
 **                 OUTSIDE OF THE SOFTWARE SYSTEM.
 **
 **    $AUTHORS:     Stefan Bosse
 **    $INITIAL:     (C) 2006-2015 BSSLAB
 **    $CREATED:     sbosse on 12/23/15.
 **    $REVESIO:     1.2.3
 **
 **    $INFO:
 *      Module management for bundled applications.
 *
 *     $ENDINFO
 */
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
    Io.err('Require import of module '+module+' failed: '+e);
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
  
  return {
    Files:Files,
    FilesEmbedded:FilesEmbedded,
    Modules:Modules,
    Objects:Objects
  }
}

