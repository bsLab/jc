# jc

## Synopsis

**JavaScript Make Tool**

```
jc <options> <main file>

-o <file>
 Output file of bundled program or library file
-lib
  Create a library that can be loaded with require
-min
  Minify code
-nobundle
  Minification of input file only
-I <path>
  Add source path
-top <path>
  Add source root path
-v 
  Increase verbosity level
-V 
  Print version number
-h -help --help
  Print this help
```

## Author(s)

Stefan Bosse


## Description

This tool can be used to merge multiple single JS files (aka. modules) in one bundled file. This file can be either executed standalone or can be embedded in another JS application using `require('bundle')`.

The *jc* tool includes a code minifier (adapted from *uglify*). 

In contrast to *uglify*, *jc* creates a bundled code file by using a main file passed as the only file to the make tool. *Jc* creates a bundled program or library by *executing* the code! Additional files to be included in the bundled file must be added by using special functions (Require). The module files are searched based on the current working directory path, a specified top level path, and additional include paths. Include paths can be relative to the current working directory.

If the `-lib` options is set, a bundled library is created (passing the module export of the main file to the library file). Otherwise, a standalone JS executable file is created that can be directly executed from command line (assuming `node` is installed on the system).


## Functions

**`Require(<module>)`**


This function is provided by the compiler and is the operational equivalent *require* function used in *node.js* to include (import) modules. In all modules to be included all *require* calls should be replaced by respective *Require* calls. In contrast to *require* no path qualifiers has to be added. E.g., `require('./../lib/file')` &rArr; `Require('lib/file')`. The *Require* function embeds the module code in the bundled target file. Without minification, the code can be easily found in the bundled file:

```javascript
Source file lib/X.js
--------------------

function f () {..}; 
module.exports = { f:f }

Bundled file
------------

BundleModuleCode['lib/X']=function (module,exports,global,process){
  function f() {..};
  modules.exports = { f:f }
} 
```

The first time a module is imported (i.e., building the bundled file) the module file is read from the file system (e.g., by using *require*) and embedded in the program. The second time (or the first time using the final bundled file) the module is opened by the embedded code.

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


Build
-----

# jc -top /home/user/proj/X -I /home/user/proj/X/lib A.js -o myApp
# myApp
```



