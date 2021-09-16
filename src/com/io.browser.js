    /*
    ************
    ** Browser
    ************
    */

    var tracing = true;
    var stderr_fun = function (str) { console.log(str); };
    var stdout_fun = function (str) { console.log(str); };
    var args=[];

    module.exports = {
        config: {
            columns:undefined,
            rows:undefined
        },
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
        /**
         *
         * @returns {*} RSS HEAP in kBytes {data,heap}
         */
        mem: function () {
            return {data:0,heap:0};
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
        }
    };
