var ast = {};
// Transform one graph into another graph structure
var co = compiler({
  "/":fucntion (node) {
    var symtab=this.SYMTAB();
    return Program({
      syms:symtab;
    })
  },
  "ExpressionStatement[expression]/AssignmentExpression": function (node) {
    if (node.operator=='=') return {
      type:'assign',
      source:this.SOURCE(),
      left:this.GET(node.left),
      right:this.GET(node.right)
    }
  },
  "VariableDeclaration":function (node) {
    this.ITER(node.declarations);    
  },
  "VariableDeclaration[declarations]/VariableDeclarator*": function (nodes) {
    this.ITER(nodes);
  },
  "VariableDeclarator": function (node) {
    this.ADDSYM({
      type:'symbol'.
      name:this.NAME(node.id),
      source:this.SOURCE(node)
    });
  }
},{
  tag:'type'
});

var xt = co.compile(ast);
