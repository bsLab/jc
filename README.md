# jc

## Synopsis

**JavaScript Make Tool**

```
JavaScript Make Tool
--------------------
 
Usage:
 
jc <options> <main file> [ -- <userargs> ]
 
Flags:
 
-o <file>
  Output file of bundled program or library file
-lib
  Create a library that can be loaded by require
-min
  Minify code (using builtin minifier - slow)
-jsmin
  Minify code (using external minifer jsmin - fast)
-nobundle
  Minification of input file only
-I <path>
  Add source path
-top <path>
  Add source root path
-json <file>
  Load makefile in JSON format
-v 
  Increase verbosity level
-V 
  Print version number
-h -help --help
  Print this help
 
JSON:
 
{ include: string [], main:string, top:string, arguments: string [],
  map: { "@module":"@modulemap"} [], output:string 
  options: {min:true|"jsmin",lib:boolean, verbose:number}}
```

## Author(s)

Stefan Bosse

## Version

*1.7.7*


## Description

This tool is a JavaScript (JS) project builder (aka. compiler and linker) and can be used to bundle multiple single JS files (aka. modules) in one bundled output file (fully self-contained). This file can be either executed as a standalone program or can be embedded in another JS application as a library using `require('bundle')`.

The *jc* tool includes a code minifier (adapted from *uglify*) providing a high compression ratio. Alternatively (built-in minifier is slow), an external minifier `jsmin` can be used. The *C* source is provided in the `src` directory. 

In contrast to *uglify* or any other compiler, *jc* creates a bundled project code file by using a main (top-level) file passed as the only file to the make tool. *Jc* creates a bundled program or library by *executing* the code performing a live build! Each imported module is recorded and the file content is finally embedded in the bundled output file. 

Commonly modules are imported by using the `require` function. Files to be embedded in the bundled file using *jc* must be imported by using special functions (`Require`, `RequireIf`, `Import`) provided by the compiler. The module files are searched using the current working directory path, a specified top level path, or additional include paths. Include paths can be relative to the current working directory. The final code can still use `require` calls but the files are not embedded.

Since there is no code analysis the program to be created must import all modules that should be embedded using `Require` on module top-level. In the case there are conditional or deeper code imports (inside functions, e.g., `if (cond) m=require("m")`) a pre-loading (only executed at build time) can be performed by using `RequireIf`. Command line arguments can be passed to the project code (e.g., `-- --version`) to ensure proper execution of the project code.

If the `-lib` option is set, a bundled library is created (passing the module exports of the main file to the library file). Otherwise, a standalone JS executable file is created that can be directly executed from command line (assuming `node` is installed on the system).

Project build options can be provided by command line arguments or by providing one single JSON make file.

Although there is no traditional source code compiling the source code must be valid JS syntax. Basically ECMAScript 5 is supported, but this depends on the JS VM used to execute *jc* and the final program. Note that the built-in minifier performs syntax checking and only supports ECMAScript 5 (and versions below).


## API Functions

**`Require(<module>)`**


This function is provided by the compiler and is the operational equivalent to *require* function used in *node.js* to include (import) modules. In all modules of the project to be included all *require* calls should be replaced by respective *Require* calls. In contrast to *require* no path qualifiers has to be added (automatic search of files in project paths). E.g., `require('./../lib/file')` &rArr; `Require('lib/file')`. The *Require* function embeds the module code in the bundled target file. Without minification, the code can be easily found in the bundled file (easing debugging):

```javascript
Source file lib/X.js
--------------------

function f () {..}; 
module.exports = { f:f }

Bundled file
------------

BundleModuleCode['lib/X']=function (module,exports,global,process){
  function f() {..};
  module.exports = { f:f }
} 
```

The first time a module is imported (i.e., building the bundled file) the module file is read from the file system (e.g., by using *require*) and embedded in the program. The second time (or the first time using the final bundled file) the module is opened by the embedded code.


**`RequireIf(<module>)`**


This function only embeds the code of the module, but does not import (evaluate) the code. 


**`FileEmbedded(<path>,<format>)`**


This function can be used to embed auxiliary files (configuration, images, text, ..) in the bundled file. The function returns the content of the file (in the optionally specified format, e.g., "utf8").

**`Import([<modules>])`**


This function is used to bundle and embed a set of modules on the same context (scope) level. I.e., all modules are considered as one module. All exports of the single modules are merged. Each module file can access all functions and variables of the other module files.


## JSON Makefile

The project build options can be specified in one single makefile in JSON format. The JSON file can be used to define **module mappings** using the `map` attribute and an object of string-string mappings. A module mapping can be used to provide alternative modules, e.g., polyfill modules for browser bundles.


```javascript
{
  "include":["/opt/madoko/lib",
             "/opt/madoko/node_modules/amdefine",
             "/opt/madoko/node_modules/mkdirp"],
  "top":"/opt/madoko",
  "main":"main.js",
  "output":"madoko",
  "arguments":["--version"],
  "options":{"min":"jsmin"},
  "map":{
    "path":"os/path-polyfill",
    "net":"browser/net"
  }
}
```


## Example


```javascript
File A (main)
-------------

var fs = Require('fs')
var B = Require('B')
var C = Require('C')


File B (in lib)
---------------

var path = Require('path')
..
module.exports = { x:x,y:y, ..}


File C (in lib)
---------------

..
module.exports = { .. }
```


```
Build
-----

# jc -top /home/user/proj/X -I /home/user/proj/X/lib A.js -o myApp
[JC] JavaScript Make Tool (1.7.7, Dr. Stefan Bosse)
[JC] Main file is: A.js
[JC] Require: os/base64 [Builtin]
[JC] Include paths: /home/user/proj/X, /home/user/proj/X/lib, /tmp, .
[JC] Making A.js
[JC] Require: A.js [File]
[JC]  Require: fs [Core]
[JC]  Require: B [File]
[JC]   Require: path [Core]
[JC]  Require: C [File]
[JC] + os/base64 [3937]
[JC] + /home/user/proj/X/A.js [65]
[JC] + /home/user/proj/X/lib/B.js [90]
[JC] + /home/user/proj/X/lib/C.js [25]
[JC] Writing bundled JS file myApp [7547]

# myApp
```



