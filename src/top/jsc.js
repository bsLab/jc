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
 **    $INITIAL:     (C) 2006-2018 BLAB
 **    $CREATED:     1-4-16 by sbosse.
 **    $VERSION:     1.7.1
 **
 **    $INFO:
 **
 **  JavaScript Make Tool, Analyzer, Type+ Compiler: Front End
 **
 **    $ENDOFINFO
 */
var Io = Require('com/io');
var Comp = Require('com/compat');
var Estprima = Require('parser/estprima');
var Estcode = Require('printer/estcodegen');
var Json = Require('json/jsonfn');
var Types = Require('types/types');
var Gen = Require('generator/generator');
var Fs = Require('fs');
var util = Require('util');
var doc = Require('doc/doc');
var renderer = doc.Renderer({lazy:true});
var makelib = Require('make/makelib');

//console.log(Types.Type.Number())
//console.log(Types.Node.AssignmentExpression())

//console.log(process.argv)
var options = {
  astDump:false,
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
  debug:false,
  depth:1,
  explorer:false,
  generateConstructorType:true,
  jstComments:false,
  openKeyword:['import','open','Require'],
  typeInterface:false,
  lib:false,
  make:false, // legacy; no compiler, just built one library or program
  map:false,
  output:undefined,
  parse:'',
  paths:[process.cwd()],
  print:false,
  top:'',
  verbose:0
};

var out = function (msg) { Io.out('[JSC] '+msg)};

function search(index,file) {
  if (options.paths.length==index) return file;
  var path=options.paths[index];
  if (Fs.existsSync(path+'/'+file+'.js')) return path+'/'+file+'.js';
  else if (Fs.existsSync(path+'/'+file)) return path+'/'+file;
  else return search(index+1,file);
}

var jsc = function(options) {
  var self=this;
  this.options=options||{};
  this.out=out;
  this.err=function (msg,err) {
    out('Error: '+msg);
    throw (err||'Error');
  }
  this.warn=function (msg) {
    out('Warning: '+msg);
  }
  this.verbose=options.verbose||0;
  this.modules=[];
};

var Explorer = Require('analyzer/explorer');
jsc.prototype.explorer = Explorer.jsc.prototype.explorer;

jsc.prototype.make = function (src,dst) {

}


jsc.prototype.generate = function (ast,file) {
  var output;
  if (this.options.verbose>0) this.out('Generating '+
                                      (this.options.typeInterface?'interface':'code')+
                                      ', writing to '+file+'.');

  output=Estcode.generate(ast,{
    sourceMap: !this.options.typeInterface,         // Settings source in esprima's options gives us filenames already.
    sourceMapWithCode: true,                        // Get both code and source map
    generateConstructorType:this.options.generateConstructorType,       // Generate JS constructor variable from type (enum/sum)
    jstComments:this.options.jstComments,           // Embedd type comments
    typeInterface:this.options.typeInterface,       // Generate type interface
    verbose:this.options.verbose
  });
  //console.log(text)
  if (file) {
    Io.write_file(file,output.code);
    if (this.options.map) Io.write_file(file+'.map',output.map.toString());
  } else Io.out(output.code);
}

jsc.prototype.init = function () {
  var p,file,ast;
  for(p in options.builtinModules) {
    // file=search(0,p);
    if (this.options.verbose) out('Parsing embedded module '+p);
    ast=this.parseText(options.builtinModules[p],{sourceType:'script'});
    // console.log(options.builtinModules[p])
    this.modules[p]=ast;
  }
}
jsc.prototype.openFile = function (file) {
  var text;
  // TODO: resolve include paths
  function resolve (file) {
    if (!Io.exists(file) && Io.exists(file+'.js')) return file+'.js';
    return file; 
  }
  file=resolve(file);
  if (this.options.verbose>0) this.out('Reading file '+file+' ..');
  try {
    text=Io.read_file(file);
  } catch (e) {
    this.err('Reading '+file+' failed: '+e);
  }
  if (text==undefined) this.err('Reading '+file+' failed.');
  return text;
}

/** Read and parse javascript top-level file
 *
 */
jsc.prototype.parse = function (file,options) {
  var text,ast,self=this,okf={};
  text=this.openFile(file);
  if (this.options.verbose>0) this.out('Parsing '+(options.sourceType=='script'?'main':options.sourceType)+
                                       ' file '+file+' ['+text.length+'].');
  for(i in options.openKeyword) 
    okf[options.openKeyword[i]]=function (file) {return self.openFile(file);};
    
  // 1. Compile main or module
  ast=Estprima.parse(text, { 
    tolerant: true, 
    loc:true,
    sourceFile:file,
    extended:true,
    compatible:true,    // Accept type keyword as idendtifier
    openKeyword:okf,
    sourceType:options.sourceType,
    verbose:this.options.verbose
  });
  if (options.sourceType=='module') ast.type='Module';
  // 2. Compile referenced modules
  if (ast.modules) {        
    ast.modules=Comp.array.map(ast.modules,function (m,i) {      
      var compiled=Comp.obj.find(self.modules,function (_m) {
                    if (_m.sourceFile == m) return true;
                  }),
          _ast;
      if (!compiled) {
        // Compile module
        _ast=self.parse(m,{sourceType:'module',openKeyword:options.openKeyword});
        self.modules[m]=_ast;
      }
      return self.modules[m];
    });
  }
  return ast;
}

jsc.prototype.parseText = function (text,options) {
  ast=Estprima.parse(text, { 
    tolerant: true, 
    loc:true,
    sourceFile:'text',
    extended:true,
    sourceType:options.sourceType,
    verbose:this.options.verbose
  });
  return ast;
}

/** ESTPRIMA/ESTCODEGEN Test
 */
jsc.prototype.print = function (obj,options) {
  var code,
      text,
      ast,
      self=this,
      file,
      okf={};
  for(i in options.openKeyword) 
    okf[options.openKeyword[i]]=function (file) {return self.openFile(file)};
  
  if (typeof obj == 'object') {
  
  } else if (Io.exists(obj)) {
    file=obj;
    if (options.verbose>=0) this.out('Parsing Javascript from file '+file+' ..');
    text=Io.read_file(file);
  } else {
    text=obj,file=_; // Is it text string?
    if (options.verbose>=0) this.out('Parsing Javascript from string "'+text+'" ..');
  }
  try {
    if (typeof obj == 'object') ast=obj;
    else ast=Estprima.parse(text, { 
      openKeyword:okf,
      tolerant: true, 
      loc:true,
      sourceFile:file,
      verbose:this.options.verbose
    });
    out('Parsed AST:');
    console.log(util.inspect(ast,{depth:this.options.depth}));
    code=Estcode.generate(ast,{
      sourceMap: !this.options.typeInterface, // Settings source in esprima's options gives us
                                              // filenames already.
      sourceMapWithCode: true,                // Get both code and source map
      jstComments:this.options.jstComments,   // Embedd type comments
      typeInterface:this.options.typeInterface,       // Generate type interface
      verbose:this.options.verbose
    });
    out('Generated Code:');
    console.log(code.code);
  } catch (e) {
    console.log(e);
  }
};

var Jsc = function(options) {
  var obj = new jsc(options);
  return obj;
}

function usage() {
  var msg=[
    '## JavaScript Type Compiler',
    '*usage*: **jsc** *<options>*',
    '',
    ' -c <file>\n: Compile a top-level JS file',
    ' -i <file>\n: Create JS interface file',
    ' -o <file>\n: Output file for code generation',
    ' -I <path>\n: Add source path',
    ' -top <path>\n: Add source root path',
    ' -v \n: Increase verbosity level',
    ' -x \n: Start AST explorer GUI',
    ' -make <file>\n: Make a bundled program or library only without compiling. The file argument is the top-level file of the program or library.',
    ' -a \n: Dump AST to file <top>.ast.json',
    ' -depth #\n: Depth of AST formatted printing',
    ' -P \n: Parse command line text or file and  print AST to stdout',
    ' -m \n: Create a source-code mapping file <top>.map',
    ' -tc \n: Create JST type comments in target code',
    ' -ti \n: Create JST type code in target code',
    ' -h -help --help\n: Print this help',
  ];
  out(renderer(msg.join('\n')));  
  onexit=true;
}

if (Io.getargs().length==2) usage();

Comp.args.parse(Io.getargs(),[
  [['-h','-help','--help'],0,function () {usage()}],
  ['-v',0,function () {options.verbose++; out('Setting verbosity to level '+options.verbose);}],
  ['-o',1,function (file) {options.output=file;}],
  ['-depth',1,function (v) {options.depth=Number(v);}],
  ['-I',1,function (v) {options.paths.push(v);}],
  ['-top',1,function (v) {options.top=v;options.paths.push(v) }],
  ['-a',0,function (file) {options.astDump=true;}],
  ['-t',0,function (file) {options.test=true;}],
  ['-x',0,function (file) {options.explorer=true;}],
  ['-P',1,function (p) {options.parse=p;}],
  ['-m',0,function (file) {options.map=true;}],
  ['-d',0,function (file) {options.debug=true;}],
  ['-tc',0,function (file) {options.jstComments=true; out('Enabling JST tyoe comments')}],
  ['-ti',0,function (file) {options.typeInterface=true; out('Enabling JST type output')}]
]);



var myJsc = Jsc(options);


Comp.args.parse(Io.getargs(),[
  ['-c',1,function (file) {
    var ast,hd,body,tr,text,main,bundle;
    main=Comp.filename.removeext(file);
    myJsc.init();
    if (global.DEBUG||options.debug)
      ast=myJsc.parse(file,{sourceType:'script',openKeyword:options.openKeyword})    
    else try {
      ast=myJsc.parse(file,{sourceType:'script',openKeyword:options.openKeyword})
    } catch (e) {
      myJsc.out('Compilation failed: '+e+'.');
      Io.exit(-1);
    }
    if (ast) myJsc.modules[main]=ast;
    if (options.verbose>0) Comp.obj.iter(myJsc.modules,function (ast,o) {
      out('+ Module '+o);
    });
    if (ast && options.astDump) {
      if (options.verbose>0) out('Saving AST to '+file+'.ast.json'+'.');
      Io.write_file(file+'.ast.json',Io.inspect(ast,100))
    }    
    if (ast && options.output) {
      hd=Gen.header(options.coreModules),
      body=Gen.body(myJsc.modules),
      tr=Gen.trailer();
      bundle=Types.Node.Program(Comp.array.merge(hd,body,tr),'script');
      myJsc.generate(bundle,options.output)
    }
    options.ast=ast;
  }],
  ['-i',1,function (file) {
    var ast,text;
    options.typeInterface=true;
    if (global.DEBUG||options.debug)
      ast=myJsc.parse(file,{sourceType:'script',openKeyword:options.openKeyword})    
    else try {
      ast=myJsc.parse(file,{sourceType:'script',openKeyword:options.openKeyword})
    } catch (e) {
      myJsc.out('Compilation failed: '+e+'.');
      Io.exit(-1);
    }
    if (options.output==undefined) options.output=file+'i';
    myJsc.generate(ast,options.output);
  }],
  ['-make',1,function (file) {
    options.make=true;
    
  }]
]);

if (options.parse != '') myJsc.print(options.parse,options);
if (options.explorer) myJsc.explorer('start',options.ast);

if (0 && options.test) {
  var hd=Gen.header(options.coreModules),
      top=Types.Node.Program(hd,'script');
  console.log(Estcode.generate(top,{}))
  // console.log(util.inspect(top,_,8))
  
}
