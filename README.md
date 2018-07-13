# jc

## Synopsis

JavaScript Make Tool

```
jc <options> <main file>

-o <file>
 Output file of bundled program or library file
-lib
  Create a library that can be loaded by require
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

## Description

This tool can be used to merge multiple single JS files (aka. modules) in one bundled file. This file can be either executed standalone or can be embedded in another JS application using `require('bundle')`.

The *jc* tool includes a code minifier (adapted from *uglify*). 

In contrast to *uglify*, *jc* creates a bundled code file by using a main file passed as the only file to the make tool. *Jc* creates a bundled program or library by *executing* the code! Additional files to be included in the bundled file must be added by using special functions (Require). The module files are searched based on the current working directory path, a specified top level path, and additional include paths. Include paths can be relative to the current working directory.



## Functions

`Require(<module>)`


The function is the operational equivalent *require* function used in *node.js* to include (import) modules. In all modules to be included all *require* calls should be replaced by respective *Require* calls. In contrast to *require* no path qualifiers has to be added. E.g., `require('./../lib/file')` &rArr; `Require('lib/file')`.


## Example


```javascript
File A (main):

var fs = Require('fs')
var B = Require('B')
var C = Require('C')

File B:

var path = Require('path')
--
module.exports = { x:x,y:y, ..}

File C:
..
module.exports = { .. }



# jc -top /home/user/proj/X -I /home/user/proj/X/lib -lib A.js
```



