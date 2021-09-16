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
 **    $CREATED:     1-4-17 by sbosse.
 **    $VERSION:     1.1.6
 **
 **    $INFO:
 **
 **  JavaScript Type+ Compiler: Type definitions
 **
 **    $ENDOFINFO
 */

var Estprima = Require('parser/estprima');


var T = {
    integer:'T.integer',
    float:'T.float',
    number:'T.number',  // integer|float
    string:'T.string',
    char:'T.char',
    boolean:'T.boolean',
    identifier:'T.identifier',   // of string
    regex:'T.regex',
    value:'T.value',        // polymorphic value
    function:'T.function',
    array:'T.array',
    object:'T.object',
    record:'T.record',
    sum:'T.sum',
    enum:'T.enum',
    export:'T.export',
    print: function (t) {
      switch (t) {
        case T.integer: return 'integer';
        case T.float: return 'float';
        case T.number: return 'number';
        case T.string: return 'string';
        case T.char: return 'char';
        case T.boolean: return 'boolean';
        case T.identifier: return 'identifier';
        case T.regex: return 'regex';
        case T.value: return 'value';
        case T.function: return 'func';
        case T.array: return 'array';
        case T.object: return 'object';
        case T.record: return 'record';      
        case T.export: return 'export';      
      }
    }
}

var Type = {
  Integer: function (next,range) {var o={tag:T.integer}; if (range) o.range=range; if (next) o.next=next; return o;},
  Float: function (next,range)   {var o={tag:T.float}; if (range) o.range=range; if (next) o.next=next; return o;},
  Number: function (next,range)  {var o={tag:T.number}; if (range) o.range=range; if (next) o.next=next; return o;},
  Record: function (elements,next) {var o={tag:T.record, elements:elements}; if (next) o.next=next; return o;},  
}

var Node = {
  AssignmentExpression: function (operator, left, right) { return new Estprima.Node().finishAssignmentExpression(operator, left, right)},
  BlockStatement: function (block) { return new Estprima.Node().finishBlockStatement(block)},
  ExpressionStatement: function (expression) { return new Estprima.Node().finishExpressionStatement(expression)},
  FunctionExpression: function (id, params, defaults, body, generator, Type) { return new Estprima.Node().finishFunctionExpression(id, params, defaults, body, generator, Type)},
  Identifier: function (id) { return new Estprima.Node().finishIdentifier(id)},
  Literal: function (v) { return new Estprima.Node().finishLiteralValue(v)},
  MemberExpression: function (accessor, object, property) { return new Estprima.Node().finishMemberExpression(accessor, object, property)},
  Program: function (body,sourceType) { return new Estprima.Node().finishProgram(body,sourceType)},
  VariableDeclaration: function (declarations) {  return new Estprima.Node().finishVariableDeclaration(declarations)},
  VariableDeclarator: function (id, init, type) {return new Estprima.Node().finishVariableDeclarator(id, init, type)},
}
module.exports = {
  Node:Node,
  T:T,
  Type:Type
}
