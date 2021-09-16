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
 **    $CREATED:     31-7-17 by sbosse.
 **    $VERSION:     1.1.2
 **
 **    $INFO:
 **
 **  JavaScript Type+ Compiler: AST Explorer
 **
 **    $ENDOFINFO
 */

var Comp = Require('com/compat');
var Io = Require('com/io');
var blessed = Require('term/blessed');
var util = Require('util');

var jsc = function() {};

jsc.prototype.explorer = function (op,ast) {
  var self=this;
  // Buttons

  function but(options) {
    var obj = blessed.button({
      width: options.width||8,
      left: options.left||0,
      top: options.top||0,
      height: 3,
      align: 'center',
      content: options.content||'?',
      mouse:true,
      focus:true,
      border: {
        type: 'line'
      },
      style: {
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
        }
      }  
    });
    self.screen.append(obj);
    if (options.callback) obj.on('press',options.callback);
    if (options.key) {
      self.screen.on('keypress', function(ch, key) {
        if (key.name === options.key) options.callback();
      });    
    }
    return obj;
  }

  // Tree Viewer
  
  this.maketree = function (element,reference) {
    var content,children;
    children={};
    if (Comp.obj.isObject(element)  || Comp.obj.isArray(element)) {
      if (element && element != null && element._update) element._update(element);
      for (var p in element) {
        if (p != '_update')
           children[p]={};
      }
      content={
         children : children,
         data : element
      }
    } else if (element != undefined) {
      var name = element.toString();
      var funpat = /function[\s0-9a-zA-Z_$]*\(/i;
      var isfun=Comp.obj.isFunction(element)||funpat.test(name);
      if (isfun) {
        element=Comp.string.sub(name,0,name.indexOf('{'));
      }
      if (!isfun || (isfun && self.options.showfun)) {
        children[element]={};
        content={children : children,reference:reference};
      }
    } else {
      children[element]={};
      content={children : children};    
    }
    return content;
  };

  function treeview (options) {
    var obj = blessed.tree({
      top: 3,
      left: 2,
      width: self.screen.width-4,
      height: self.screen.height-8,
      label: options.info||'AST Explorer',
      focus:true,
      border: {
        type: 'line'
      },
      style: {
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
    });
    // Create sub-trees
    obj.on('preselect',function(node){  
      var content,children,element,data,name;  
      if (node.name != '/' && !node.extended)  {
        // Io.out(node.extended);
        data = node.data;
        if (data != none && (Comp.obj.isObject(data) || Comp.obj.isArray(data))) {
          node.children = {};
          if (Comp.obj.isArray(data) && Comp.array.empty(data) && Comp.hashtbl.empty(data)) {
            node.children={'[]' : {}};
          } else {
            if (data._update) data._update(data);
            for (var p in data) {
              if (p != '_update') {
                element = data[p];
                content=self.maketree(element,data);
                if (content) node.children[p]=content;
              }
            }
          } 
        } else if (data == none && node.reference) {
            node.children = {};
            element=node.reference[node.name];
            name=element.toString();
            var funpat = /function[\s0-9a-zA-Z_$]*\(/i;
            var isfun=Comp.obj.isFunction(element)||funpat.test(name);
            if (isfun) {
              element=Comp.string.sub(name,0,name.indexOf('{'));
            }          
            node.children[element]={};
        } 
      }
    });
    // Update preview
    obj.on('selected',function(node){
      // self.screen.render();
    });
 
    self.screen.append(obj);
    return obj;    
  }

  switch (op) {
    case 'start':
      this.screen = blessed.screen({
        smartCSR: false,
        terminal: this.options.terminal||'xterm-color'
      });
      this.screen.title = 'JSC (c) Stefan Bosse - JavaScript Type+ Explorer';
      this.screen.cursor.color='red';  
      this.but1 = but({left:1,content:'QUIT',
                       callback:function(data) {return process.exit(0);},
                       key:'q'
      });
      this.treeview = treeview({});
      this.screen.render();
      break;
    case 'stop':
      process.exit(0);
      break;
  }
  this.treeview.DATA = {
    name:'/',
    extended:true,
    children: {}
  };
  this.treeview.setData(this.treeview.DATA);
  var data = ast||{};
  for (var p in data) {
    var element=data[p];
    var content=this.maketree(element,data);
    if (content) this.treeview.DATA.children[p]=content;
  }
  this.treeview.setData(this.treeview.DATA);
}



module.exports = {
  jsc:jsc
};
