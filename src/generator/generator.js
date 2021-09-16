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
 **    $INITIAL:     (C) 2006-2017 BLAB
 **    $CREATED:     1-4-17 by sbosse.
 **    $VERSION:     1.1.6
 **
 **    $INFO:
 **
 **  JavaScript Type+ Compiler: Standalone APP Generator (returns complete AST for code generation)
 **
 **    $ENDOFINFO
 */

var Estprima = Require('parser/estprima');
var Types = Require('types/types');
var N = Types.Node;
var NL='\n';

/** Generate top-level header for current application
 **
 ** CoreModule is mapper object for required core modules
 ** type of options = {top is root source directory,target}
 */

 
function header(CoreModule,options) {
  var ast,coremodules='',m,text;
  if (!options) options={top:'',target:'any'};
  // block.push(N.VariableDeclaration([N.VariableDeclarator(N.Identifier('CoreModules'))]))
  for(m in CoreModule) {
    coremodules = coremodules + "CoreModule['"+m+"']='"+CoreModule[m]+"';"+NL;
  }
  text=
  'var CoreModule = {};'+NL+
  coremodules+NL+
  'var BundleModuleCode=[];'+NL+
  'var BundleObjectCode=[];'+NL+
  'var BundleModules = [];'+NL+
  'var Fs = require("fs");'+NL+
  'PATH=[process.cwd(),".","'+options.top+'"];'+NL+
  'function _isdir(path) {'+NL+
  '  var stats=Fs.lstatSync(path);'+NL+
  '  return stats.isDirectory()};'+NL+
  'function _search(index,file) {'+NL+
  '  if (PATH.length==index) return file;'+NL+
  '  var path=PATH[index];'+NL+
  '  if (Fs.existsSync(path+"/"+file+".js")) return path+"/"+file+".js";'+NL+
  '  else if (Fs.existsSync(path+"/"+file) && !_isdir(path+"/"+file)) return path+"/"+file;'+NL+
  '  else return _search(index+1,file);'+NL+
  ' }'+NL+
  'global.Require=function(modupath) { '+NL+
  '  var file,filepath;'+NL+
  '  if (CoreModule[modupath]!=undefined) modupath=CoreModule[modupath];'+NL+
  "  if (modupath=='') return undefined;"+NL+
  '  if (BundleModules[modupath]) return BundleModules[modupath];'+NL+
  '  var exports={}; var module={exports:exports};'+NL+
  '  if (BundleModuleCode[modupath]) BundleModuleCode[modupath](module,exports);'+NL+
  '  else if (BundleObjectCode[modupath]) BundleObjectCode[modupath](module,exports);'+NL+
  '  else { try {  file=_search(0,modupath); module = require(file)}'+NL+
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
  'global.FilesEmbedded = {};'+NL+
  'global.FileEmbedd = function (path,format) {};'+NL+
  'global.FileEmbedded = function (path,format) {return FilesEmbedded[path](format);};'+NL+
  "global.TARGET='"+options.target+"';"+NL;
  ast=Estprima.parse(text, { 
    tolerant: true, 
    loc:false,
    extended:true,
    sourceType:'module'
  });
  
  return ast.body;
}

/**
 *
 */
 
function body(Modules,Files,options) {
  var block=[],ast,mod;

  if (!options) options={};
  for(mod in Modules) {
    ast=Modules[mod];
    block.push(N.ExpressionStatement(
      N.AssignmentExpression('=',
        N.MemberExpression('[',N.Identifier('BundleObjectCode'),N.Literal(mod)),
        N.FunctionExpression(null,[
            N.Identifier('module'),
            N.Identifier('exports'),
          ],[],
          N.BlockStatement(ast.body),false,false)
        )
      ));
  }
  return block;
}

/**
 **
 ** type of options = {main is toplevel module}
*/
function trailer(options) {
  var ast,coremodules='',m,text;
  if (!options) options={main:'main'};
  text=
  "var Base64=Require('os/base64');"+NL+
  "Require('"+options.main+"');"+NL;
  
  ast=Estprima.parse(text, { 
    tolerant: true, 
    loc:false,
    extended:true,
    sourceType:'module'
  });
  
  return ast.body;
}
module.exports = {
  body:body,
  header:header,
  trailer:trailer
}
