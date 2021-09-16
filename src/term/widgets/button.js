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
 **    $REVESIO:     1.1.7
 **
 **    $INFO:
 **
 **    button.js - button element for blessed
 **
 **     Options: {mouse:boolean,content,border,style,object}
 **
 **     Events In: click keypress
 **     Events Out: press
 **
 **    $ENDOFINFO
 */

/**
 * Modules
 */

var Node = Require('term/widgets/node');
var Input = Require('term/widgets/input');

/**
 * Button
 */

function Button(options) {
  var self = this;

  if (!(this instanceof Node)) {
    return new Button(options);
  }

  options = options || {};

  if (options.autoFocus == null) {
    options.autoFocus = false;
  }

  if (!options.style) options.style = {
      fg: 'white',
      bg: 'blue',
      bold:true,
      border: {
        fg: 'black'
      },
      hover: {
        border: {
          fg: 'red'
        }
      },
      focus : {
        border: {
          fg: 'red'
        }      
      }
  }
  if (options.object) this.object=options.object;
  
  Input.call(this, options);

  this.on('keypress', function(ch, key) {
    if (key.name == 'enter' || key.name == 'return') {
      return self.press();
    }
  });

  if (this.options.mouse) {
    this.on('click', function() {
      return self.press();
    });
  }
}

Button.prototype.__proto__ = Input.prototype;

Button.prototype.type = 'button';

Button.prototype.press = function() {
  this.focus();
  this.value = true;
  var result = this.emit('press');
  delete this.value;
  return result;
};

/**
 * Expose
 */

module.exports = Button;
