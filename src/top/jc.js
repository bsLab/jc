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
 **    $INITIAL:     (C) 2006-2021 BLAB
 **    $CREATED:     1-4-16 by sbosse.
 **    $VERSION:     1.8.1
 **
 **    $INFO:
 **
 **  JavaScript Make Tool
 **
 **    $ENDOFINFO
 */
var Io = Require('com/io');
var Comp = Require('com/compat');
var Fs = Require('fs');
var util = Require('util');
var doc = Require('doc/doc');
var renderer = doc.Renderer({lazy:true});
var make = Require('make/makelib');
var Json = Require('json/jsonfn');
var onexit = false;
var minify = Require('minify/tools/minify');
var stream = Require('stream');
var execStream = Require('os/exec-stream');

var options = {
  coreModules:{
    assert:'assert',
    buffer:'buffer',
    child_process:'child_process',
    crypto:'crypto',
    dgram:'dgram',
    events:'events',
    fs:'fs',
    http:'http',
    net:'net',
    os:'os',
    path:'path',
    stream:'stream',
    string_decoder:'string_decoder',
    url:'url',
    util:'util',
    zlib:'zlib',
  },
  builtinModules:{
    'os/assert':FileEmbedded('os/assert','utf-8'),
    'os/buffer':FileEmbedded('os/buffer','utf-8'),
    'os/base64':FileEmbedded('os/base64','utf-8'),
    'os/crypto.rand':FileEmbedded('os/crypto.rand','utf-8'),
    'os/events':FileEmbedded('os/events','utf-8'),
    'os/path':FileEmbedded('os/path','utf-8'),
    'os/string_decoder':FileEmbedded('os/string_decoder','utf-8'),
  },  
  author:'Dr. Stefan Bosse',
  bundle:true,
  debug:false,
  openKeyword:['import','open','Require'],
  json:none,
  lib:false,
  main:none,
  min:none,
  minify:{
  
  },
  output:'out.js',
  paths:[],
  print:false,
  run:false,
  userargs:[],
  top:'',
  verbose:0,
  version:'1.8.1'
};

var out = function (msg) { Io.out('[JC] '+msg)};
var err = function (msg) { Io.out('[JC Error] '+msg); process.exit(-1)};

out('JavaScript Make Tool ('+options.version+', '+options.author+')');




function getErrorLines (code,line) {
  var lines=code.split('\n');
  return (lines[line-2]?(lines[line-2]+'\n'):'')+
         lines[line-1]+'\n'+'^^^^^'+
         (lines[line]?('\n'+lines[line]):'');
}


function search(index,file,paths) {
  if ((paths||options.paths).length==index) return file;
  var path=(paths||options.paths)[index];
  if (Fs.existsSync(path+'/'+file+'.js')) return path+'/'+file+'.js';
  else if (Fs.existsSync(path+'/'+file)) return path+'/'+file;
  else return search(index+1,file);
}

function usage(err) {
  var msg=[
    '---',
    '## JavaScript Make Tool ('+options.version+', '+options.author+')',
    '### Usage',
    '**jc** *<options>* *<main file>* [ -- <userargs> ]',
    '### Flags',
    ' -o <file>\n: Output file of bundled program or library file',
    ' -node\n: Set node path for standalone apps',
    ' -lib\n: Create a library that can be loaded by require',
    ' -min\n: Minify code (using builtin minifier - slow, high compression)',
    ' -jsmin\n: Minify code (using external minifer jsmin - fast, average compression)',
    ' -nobundle\n: Minification of input file only',
    ' -I <path>\n: Add source path',
    ' -top <path>\n: Add source root path',
    ' -json <file>\n: Load makefile in JSON format (see below)',
    ' -run \n: Run code only (no build)',
    ' -v \n: Increase verbosity level',
    ' -V \n: Print version number',
    ' -h -help --help\n: Print this help',
    '### JSON',
    '```',
    '{ include: string [], main:string, top:string, arguments: string [],',
    '  map: { "@module":"@modulemap"} [], output:string ',
    '  options: {min:true|"jsmin",lib:boolean, verbose:number}}',
    '```',
    '---'
  ];
  if (err) msg.push('**Error**: '+err);
  console.log(renderer(msg.join('\n')));  
  process.exit(-1);
}




if (Io.getargs().length==2) usage();

var userargs,userargsPos = process.argv.indexOf('--');
if (userargsPos!=-1) {
  options.userargs=process.argv.slice(userargsPos+1);
  process.argv=process.argv.slice(0,userargsPos);
} else {
  options.userargs=[];  
}
Comp.args.parse(process.argv,[
  [['-h','-help','--help'],0,function () {usage()}],
  ['-v',0,function () {options.verbose++; out('Setting verbosity to level '+options.verbose);}],
  ['-V',0,function () {console.log(options.version); onexit=true;}],
  ['-lib',0,function () {options.lib=true; out('Enabling library mode.')}],
  ['-node',1,function (v) {options.node=v; out('Setting node binary to '+v)}],
  ['-o',1,function (file) {options.output=file;}],
  ['-min',0,function () {options.min='min'; out('Enabling minify mode.')}],
  ['-jsmin',0,function () {options.min='jsmin'; out('Enabling minify mode.')}],
  ['-nobundle',0,function () {options.bundle=false; out('Disabling bundle make mode.')}],
  ['-I',1,function (v) {options.paths.push(v);}],
  ['-top',1,function (v) {options.top=v;options.paths.push(v) }],
  ['-json',1,function (v) {options.json=v }],
  ['-run',0,function () {options.run=true;}],
  [function (file) {options.main=file; out('Main file is: '+file) }]
],2);

if (onexit) return;

if (options.json) {
  try {
    var _options = require(search(0,options.json,[process.cwd()]));
    for (var p in _options) {
      switch (p) {
        case 'include':
          if (!(_options[p] instanceof Array)) usage('json include not an array');
          options.paths=options.paths.concat(_options[p]);
          break;
        case 'arguments':
          if (!(_options[p] instanceof Array)) usage('json arguments not an array');
          options.userargs=options.userargs.concat(_options[p]);
          break;
        case 'top':
          options.top=_options[p];
          options.paths.push(_options[p]);
          break;
        case 'main':
          options.main=_options[p];
          break;
        case 'output':
          options.output=_options[p];
          break;
        case 'map':
          for (var o in _options[p])
            options.coreModules[o]=_options[p][o];
          break;
        case 'options':
          if (typeof _options[p] != 'object') usage('json options not an object');
          for(var o in _options[p]) {
            if (['min','jsmin','lib','verbose'].indexOf(o)==-1) usage("json options invalid");
            options[o]=_options[p][o];
          }
          break;
      }
    }
  } catch (e) {
    err(e);
  }

}
if (!options.main) usage();

out('User arguments: '+options.userargs.join(' '));
process.argv = ['NODE',options.main].concat(options.userargs);

// 1. Make Project (Bundling)
function phase1(next) {
  var code;
  try {
    options.paths.push(process.cwd());
    options.paths.push('.');
    code = make(options.main,{
      builtinModules:options.builtinModules,
      CoreModules:options.coreModules,
      bundle:options.bundle,
      log:out,
      mode:options.lib?'lib':'app',
      paths:options.paths,
      top:options.top,
    });
  } catch (e) {
    err(e);
  }
  next(code);
}

function phase2(next,code) {
  var result='';
  if (options.min) out('Minifying '+options.main);

  // 2. Optimization
  switch (options.min) {
    case 'min': 
    case true :
      result=minify.minify({code:code}, options.minify); 
      if (result.error) {
        out('Source text:\n'+getErrorLines(code,result.error.line));
        err(result.error.message+', in '+
            result.error.filename+' at line '+
            result.error.line);
        return;
      } else result = result.code;
      out('Compression ratio '+parseFloat(code.length/result.length).toFixed(2));
      next(result);
      break;
    case 'jsmin': 
      try {
        var pp = execStream('jsmin',[]);
        pp.on('data',function (chunk) { result += chunk.toString() });
        pp.on('end',function () { 
          out('Compression ratio '+parseFloat(code.length/result.length).toFixed(2));
          next(result) 
        });
        var off=0,len=code.length;
        while(len>0) {
          pp.write(code.substr(off,1000));
          len -= 1000;
          off += 1000;
        }
        pp.end();
      } catch (e) { err(e) };
      
      break;
    default: result=code; next(result); break;
  }
}

function phase3(next,code) {
  out('Writing bundled JS file '+options.output+' ['+code.length+']');

  // Additional code
  if (!options.lib) code = (options.node?'#!'+options.node:'#!/usr/bin/env node\n')+code;

  // Output
  Fs.writeFileSync(options.output, code, 'utf8');
  next();
}

function phase4(next) {
  // Post process
  if (!options.lib) Fs.chmod(options.output,0755);
  next();
}

var block = [phase1,phase2,phase3,phase4];
function schedule(arg) {
  var next=block.shift();
  if (next) next(schedule,arg);
} 
schedule();

//console.log(code)
