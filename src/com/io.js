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
 **    $INITIAL:     (C) 2006-2016 BSSLAB
 **    $CREATED:     sbosse on 3/28/15.
 **    $VERSION:     1.6.1
 **
 **    $INFO:
 *
 * This module encapsulates all IO operations (except networking) supporting
 * node.js applications.
 *
 **    $ENDOFINFO
 */

if (global.TARGET=='node')  { 

 /*
  ************
  ** Node.js
  ************
  */
 var util = require('util');
 var GetEnv = Require('os/getenv');
 var Base64 = Require('os/base64');
 var Fs = require('fs');
 var os = require('os');
 var child = require('child_process');

 var stderr_fun = function (str) { process.stderr.write(str); };
 var stdout_fun = function (str) { process.stdout.write(str); };

 /*
  ** node.js specific
  */

 var tracefile = undefined;
 var tracing = true;

 /**
 * Open a module and append all exported properties to the current global object.
 * (top-level scope)
 */
 global.open = function(name,as) {
   var module = Require(name);
   for (var p in module) {
     global[p] = module[p];
   };
   if (as) global[as]=module;
 }

/*
 ** node.js
 */
var io = {
    config: {
        columns:undefined,
        rows:undefined
    },
    /**************
     ** FILE IO
     ***************/
    /**
     *
     * @param fd
     */
    close: function (fd) {
        Fs.closeSync(fd);
    },
    /**
     *
     * @param path
     */
    exists: function (path) {
        return Fs.existsSync(path);
    },
    /**
     *
     * @param path
     */
    file_exists: function (path) {
        return Fs.existsSync(path);
    },
    /** Search a file by iterating global PATH variable.
     *
     * @param name  File name or partial (relative) path
     */
    file_search: function (name) {
        // Expecting global PATH variable !?
        if (this.file_exists(name)) return name; 
        else if (typeof PATH !== 'undefined') {
          for (var p in PATH) {
            if (this.file_exists(PATH[p]+'/'+name)) return (PATH[p]+'/'+name);
          }
          return undefined;
        } else return undefined;
    },
    /**
     *
     * @param path
     * @returns {number}
     */
    file_size: function (path) {
        var stat = Fs.statSync(path);
        if (stat != undefined)
            return stat.size;
        else
            return -1;
    },
    /**
     *
     * @param path
     * @param timekind a c m
     * @returns {number}
     */
    file_time: function (path,timekind) {
        var stat = Fs.statSync(path);
        if (stat != undefined)
            switch (timekind) {
                case 'a': return stat.atime.getTime()/1000;
                case 'c': return stat.ctime.getTime()/1000;
                case 'm': return stat.mtime.getTime()/1000;
                default: return stat.mtime.getTime()/1000;
            }
        else
            return -1;
    },
    /**
     *
     * @param path
     * @param mode
     * @returns {*}
     */
    open: function (path, mode) {
        return Fs.openSync(path, mode);
    },
    /**
     *
     * @param fd
     * @param len
     * @param foff
     */
    read: function (fd, len, foff) {
        // TODO
    },
    /**
     *
     * @param path
     * @returns {string|undefined}
     */
    read_file: function (path) {
        try {
            return Fs.readFileSync(path,'utf8');
        } catch (e) {
            return undefined;
        }
    },
    /**
     *
     * @param path
     * @returns {*}
     */
    read_file_bin: function (path) {
        try {
            return Fs.readFileSync(path);
        } catch (e) {
            return undefined;
        }
    },
    /**
     *
     * @param fd
     */
    read_line: function (fd) {
        // TODO
    },
    /**
     *
     * @param fd
     * @param buf
     * @param boff
     * @param len
     * @param [foff]
     * @returns {number}
     */
    read_buf: function (fd, buf, boff, len, foff) {
        return Fs.readSync(fd, buf, boff, len, foff);
    },
    /**
     *
     * @param fd
     */
    sync: function (fd) {
        Fs.fsyncSync(fd);
    },
    /**
     *
     * @param fd
     * @param data
     * @param [foff]
     * @returns {number}
     */
    write: function (fd, data, foff) {
        return Fs.writeSync(fd, data, foff);
    },
    /**
     *
     * @param fd
     * @param buf
     * @param bpos
     * @param blen
     * @param [foff]
     * @returns {number}
     */
    write_buf: function (fd, buf, bpos, blen, foff) {
        return Fs.writeSync(fd, buf, bpos, blen, foff);
    },
    /**
     *
     * @param path
     * @param {string} buf
     */
    write_file: function (path,str) {
        try {
            Fs.writeFileSync(path, str, 'utf8');
            return str.length;
        } catch (e) {
            return -1;
        }
    },
    /**
     *
     * @param path
     * @param buf
     * @returns {*}
     */
    write_file_bin: function (path,buf) {
        try {
            Fs.writeFileSync(path, buf, 'binary');
            return buf.length;
        } catch (e) {
            return -1;
        }
    },
    /**
     *
     * @param fd
     * @param {string} str
     * @returns {number}
     */
    write_line: function (fd, str) {
        return Fs.writeSync(fd, str+NL);
    },

    /****************
     ** CONSOLE IO
     ****************/
    /**
     *
     * @param msg
     */
    debug: function (msg) {
        console.error('Debug: ' + msg);
    },
    /**
     *
     * @param msg
     */
    err: function (msg) {
        console.error('Error: ' + msg);
        throw Error(msg);
    },
    /**
     *
     * @param msg
     */
    fail: function (msg) {
        console.error('Fatal Error: ' + msg);
        process.exit(0);
    },
    /**
     *
     * @param obj
     */
    inspect: function (obj,depth) {return util.inspect(obj,{showHidden: false, 
                                                            depth: depth?depth:2})},

    /**
     * 
     */
    stacktrace: function () {
        var e = new Error('dummy');
        var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
            .split('\n');
        this.out('Stack Trace');
        this.out('--------------------------------');
        for(var i in stack) {
            if (i>0) {
                var line = stack[i];
                if(line.indexOf('Module.',0)>=0) break;
                this.out(line);
            }
        }
        this.out('--------------------------------');
    },
    /**
     *
     * @param e
     * @param where
     */
    printstack: function (e,where) {
        if (!e.stack) e=new Error(e);
        var stack = e.stack //.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
            .split('\n');
        if (where==undefined) this.out(e);
        else this.out(where+': '+e);
        this.out('Stack Trace');
        this.out('--------------------------------');
        for(var i in stack) {
            if (i>0) {
                var line = stack[i];
                if(line.indexOf('Module.',0)>=0) break;
                this.out(line);
            }
        }
        this.out('--------------------------------');
    },
     /**
     *
     * @param e
     * @param where
     */
    sprintstack: function (e) {
        var str='';
        if (e==_ || !e.stack) e=new Error(e);
        var stack = e.stack //.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
            .replace(/^Object.eval\s*\(/gm, '')
            .split('\n');
        for(var i in stack) {
            if (i>0) {
                var line = stack[i];
                if(line.indexOf('Module.',0)>=0) break;
                if (str!='') str += '\n';
                str += '  at '+line;
            }
        }
        return str;
    },
   /**
     *
     * @param {boolean|string} condmsg conditional message var log=X;  log((log lt. N)||(msg))
     */
    log: function (condmsg) {
        if (condmsg != true) console.warn(condmsg);
    },
    /**
     *
     * @param msg
     */
    out: function (msg) {
        console.warn(msg)
    },
    /**
     *
     * @param msg
     */
    warn: function (msg) {
        console.warn('Warning: ' + msg);
    },
    /**
     *
     * @param fun
     */
    set_stderr: function(fun) {
        stderr_fun=fun;
    },
    /**
     *
     * @param fun
     */
    set_stdout: function(fun) {
        stdout_fun=fun;
    },
    /**
     *
     * @param msg
     */
    stderr: function (msg) {
        stderr_fun(msg);
    },
    /**
     *
     * @param msg
     */
    stdout: function (msg) {
        stdout_fun(msg);
    },

    /** Write a message with a time stamp written to the trace file.
     *
     * @param {boolean|string} condmsg conditional message var trace=Io.tracing;  trace(trace||(msg))
     */
    trace: function (condmsg) {
        if (condmsg != true && tracefile != undefined) {
            var date = new Date();
            var time = date.getTime();
            Fs.writeSync(tracefile, '[' + time + '] ' + condmsg + '\n');
        }
    },
    tracing: tracing,
    /**
     *
     * @param {string} path
     */
    trace_open: function (path) {
        tracefile = Fs.openSync(path, 'w+');
        if (tracefile != undefined) this.tracing = false;
    },

    /**************
     ** Process control
     ***************/
    exit: function (n) {
        process.exit(n);
    },
    /**
     *
     * @returns {*} RSS HEAP in kBytes {data,heap}
     */
    mem: function () {
        var mem = process.memoryUsage();
        return {data:(mem.rss/1024)|0,heap:(mem.heapUsed/1024)|0};
    },
    /****************************
     ** Environment and Arguments
     ****************************/
    getenv: function (name, def) {
        return GetEnv(name, def);
    },
    workdir: function () {
        return this.getenv('PWD','');
    },

    /**
     *  @return {string []}
     */
    getargs: function () {
        return process.argv;
    },

    sleep: function(delay) {
      var start = new Date().getTime();
      while (new Date().getTime() < start + delay);
    },
    
    /**
     *  Process management
     */
    fork: child.fork,
    exec: child.exec,
    spawn: child.spawn,

    /**
     * OS
     */
    hostname: os.hostname

  };
} else {
 /*
  ************
  ** Browser
  ************
  */
  var tracing = true;
  var stderr_fun = function (str) { console.log(str); };
  var stdout_fun = function (str) { console.log(str); };
  var args=[];

  /**
  * Open a module and append all exported properties to the current global object.
  * (top-level scope)
  */
  global.open = function(name,as) {
    var module = Require(name);
    for (var p in module) {
      global[p] = module[p];
    };
    if (as) global[as]=module;
  }
  
  var io = {
    /*
    ************
    ** Browser
    ************
    */
    /*
     ** FILE IO
     * TODO WebStorage
     */
    close: function (fd) {
        return;
    },
    exists: function (path) {
        return false;
    },
    open: function (path, mode) {
        var fd = Fs.openSync(path, mode);
        return fd;
    },

    read: function (fd, len, foff) {
        // TODO
    },
    read_file: function (path) {
        return '';
    },

    read_line: function (fd) {
        // TODO
    },
    /**
     *
     * @param fd
     * @param buf
     * @param boff
     * @param len
     * @param [foff]
     * @returns {*}
     */
    read_buf: function (fd, buf, boff, len, foff) {
        return -1;
    },
    sync: function (fd) {
        return;
    },
    /**
     *
     * @param fd
     * @param data
     * @param [foff]
     * @returns {*}
     */
    write: function (fd, data, foff) {
        return -1;
    },
    /**
     *
     * @param fd
     * @param buf
     * @param bpos
     * @param blen
     * @param [foff]
     * @returns {*}
     */
    write_buf: function (fd, buf, bpos, blen, foff) {
        return -1;
    },

    /*
     ** CONSOLE IO
     */
    debug: function (msg) {
        stderr_fun('Debug: ' + msg);
    },
    err: function (msg) {
        stderr_fun('Error: ' + msg);
        throw Error(msg);
    },
    fail: function (msg) {
        stderr_fun('Fatal Error: ' + msg);
    },
    inspect: function (obj) {
        return;
    },
    stacktrace: function () {
        var e = new Error('dummy');
        var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
            .split('\n');
        stderr_fun('Stack Trace');
        stderr_fun('--------------------------------');
        for(var i in stack) {
            if (i>0) {
                var line = stack[i];
                if(line.indexOf('Module.',0)>=0) break;
                stderr_fun(line);
            }
        }
        stderr_fun('--------------------------------');
    },
    /**
     *
     * @param e
     * @param where
     */
    printstack: function (e,where) {
        if (where==undefined) stderr_fun(e);
        else stderr_fun(where+': '+e);
    },
    /**
     *
     * @param {boolean|string} condmsg conditional message var log=X;  log((log lt. N)||(msg))
     */
    log: function (condmsg) {
        if (condmsg != true) console.warn(condmsg);
    },
    out: function (msg) {
        stdout_fun(msg)
    },
    warn: function (msg) {
        stderr_fun('Warning: ' + msg);
    },


    set_stderr: function(fun) {
        stderr_fun=fun;
    },
    set_stdout: function(fun) {
        stdout_fun=fun;
    },

    stderr: function (msg) {
        stderr_fun(msg);
    },
    stdout: function (msg) {
        stdout_fun(msg);
    },

    /** Write a message with a time stamp written to the trace file.
     *
     * @param {boolean|string} condmsg conditional message var trace=Io.tracing;  trace(trace||(msg))
     */
    trace: function (condmsg) {
        if (condmsg != true && tracefile != undefined) {
            var date = new Date();
            var time = date.getTime();
            this.log('[' + time + '] ' + condmsg + '\n');
        }
    },
    tracing: tracing,
    /**
     *
     * @param {string} path
     */
    trace_open: function (path) {
        return undefined;
    },

    exit: function (n) {
        return;
    },
    getenv: function (name, def) {
        return def;
    },
    workdir: function () {
        return '';
    },
    /**
     *  @return {string []}
     */
    getargs: function () {
        return args;
    },
    set_args: function (argv) {
        args=argv;
    },
    inspect: function (o) {return '?'}
  };
}  
module.exports = io;
