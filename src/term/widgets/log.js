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
 **    $INITIAL:     (C) 2013-2016, Christopher Jeffrey and contributors
 **    $MODIFIED:    by sbosse
 **    $REVESIO:     1.2.5
 **
 **    $INFO:
 **
 **    Logging Widget with Scrollbars
 **
 **   options: {
 **       scrollOnInput:boolean -- auto scroll
 **
 **    $ENDOFINFO
 */

/**
 * Modules
 */

var util = require('util');

var nextTick = global.setImmediate || process.nextTick.bind(process);

var Node = Require('term/widgets/node');
var ScrollableText = Require('term/widgets/scrollabletext');

/**
 * Log
 */

function Log(options) {
  var self = this;

  if (!(this instanceof Node)) {
    return new Log(options);
  }

  options = options || {};

  ScrollableText.call(this, options);

  this.scrollback = options.scrollback != null
    ? options.scrollback
    : Infinity;
  this.scrollOnInput = options.scrollOnInput;
  this._updating=false;
  
  this.on('set content', function() {
    if (!self._updating && !self._userScrolled && self.scrollOnInput) {
      self._updating=true;
      setTimeout(function() {
        self.setScrollPerc(100);
        self._userScrolled = false;
        self._updating=false;
        self.screen.render();
      },20);
    }
  });
}

Log.prototype.__proto__ = ScrollableText.prototype;

Log.prototype.type = 'log';

Log.prototype.log =
Log.prototype.add = function() {
  var args = Array.prototype.slice.call(arguments);
  if (typeof args[0] === 'object') {
    args[0] = util.inspect(args[0], true, 20, true);
  }
  var text = util.format.apply(util, args);
  this.emit('log', text);
  var ret = this.pushLine(text);
 
  //if (this._clines.fake.length > this.scrollback) {
  //  this.shiftLine(0, (this.scrollback / 3) | 0);
  // }
  return ret;
};

Log.prototype.clear = function() {  
  this.setContent('');
}

Log.prototype._scroll = Log.prototype.scroll;
Log.prototype.scroll = function(offset, always) {
  if (offset === 0) return this._scroll(offset, always);
  this._userScrolled = true;
  var ret = this._scroll(offset, always);
  if (this.getScrollPerc() === 100) {
    this._userScrolled = false;
  }
  return ret;
};

/**
 * Expose
 */

module.exports = Log;



Log.prototype.logold = function(str) {  
  var i;
  this.logLines.push(str)  
  if (this.logLines.length==1) {
    this.setContent(str);
  }
  else if (this.logLines.length>this.options.bufferLength) {
    this.logLines.shift();
    this.setContent(this.logLines[0]);
    for(i=1;i<this.logLines.length;i++) {
      this.insertLine(i,this.logLines[i]);
    }
    this.scrollBottom();
  } else {
    this.scrollBottom();
    this.insertBottom(str);
    this.scrollBottom();
  }
  // this.setItems(this.logLines)
  // this.scrollTo(this.logLines.length)
}

