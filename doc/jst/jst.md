[INCLUDE=header.md]
[TITLE]
[TOC]

[INCLUDE=js.md]

# JavaScript Semantic Types

## Description

The JS Semantic Type System (JST) extends JS with type annotations. It provides an extension to the JS core type system, which only consists of a few basic types, functions, and objects. The JST notation cannot be processed by the JS run-time system and is therefore specified in a separate type interface file (with jsi extension) or embedded in JS comments. With an extended *estprima* parser that understands JST extensions it is possible to combine JST and JS code. The primary purpose of JST is API documentation, but the JST can be used for type checking and profiling using external tools or JS extensions. 

Originally, there is no type signature for an JS object or function. Although there is JavaDoc, but it is limited to the JS type system. Commonly, a programming language covers only types that are immediately related to the language and run-time concepts, e.g., structures. But often there is a higher abstract type level composed of core types. One example is a sum type, supported only by a few languages directly. A sum type is composed of different types, i.e., structures or objects, that can be distinguished by pattern matching or type tags using names.

JST will not convert the dynamic typed JS language in a static typed language. It is intended to provide type constraints and hints, enabling software API specification and documentation, and to enable (lazy and tolerant) program checking.

## Types and Type Composition

There are type definitions `type t = T` (equality) and type declarations of functions, objects, parameters, variables, `o : T` (type annotations). In JST, types can be composed, e.g., a number is array is typed by `number []`, an array of records is typed by `{} []`, and so on. Furthermore, types can be extended, e.g., a constructor function is typed by `constructor function`. Since JavaScript is a dynamic typed language (type assignments at run-time), type alternatives can be defined by `t1|t2|..` type composition.

### Notation

```
@  : smybolic identifier, label, or wildcard place holder
$  : type macro
?  : optional, 
.. : more (repition)
|  : alternative, type choice operator
{ }: structure object, set
```

A type macro is usually only a fragment of a type definition, e.g., `type t = { $a, .. , $b }` with `$a= x:number` and `$b = y:string`. The repetition `..` expresses more macro expansions `$a` can follow.


### Core Types


boolean
: Boolean type {true,false}

number
: Floating point number

char
: Character (string of length 1)

string
: Text string

buffer
: Byte buffer

{}
: Any procedural structure object

object
: Any object-orientated object with methods

array, []
: Array 

undefined
: The void type

\*
: Any type (polymorphic)

## Modules

The current module is declared with the `module` statement. Imported (used) modules are declared with the `use` as statement, only importing the type interface, and using the `open` statement to import the code as well.

~ Code
@module path/m
@use path/m @as M
@open path/m
~

## Type Annotation and Type-of

Any variable, function, function parameter, object, and array can be type annotated, i.e., a type casting that defines a type constraint. Additionally, the type annotation can be extended with a description text. Any function parameter, variable, or named expression can get a type annotation by using the `typeof` statement.

~ Definition [Type Annotation]
~ Code
identifier : type [ @is comment ]
&hArr;
@typeof identifier = type; 
~
~

## Function Type Signature

A function type signature consists of parameter type annotations and by specifying a return type of the function (if it is not a procedure).

~ Definition [Function Declaration with Type Signature]
~ Code
@function ( p1:typ1, p2:typ2, .. , &commat;p~i~, typ~j~, ..) &rarr; typ
~
~

~ Definition [Function Definition with Type Annotation]
~ Code
@function ( p1:typ1, p2:typ2, .., p~i~, ..) : typ {
  body statements
}
~
~

Parameters in function declarations without a type specification must have a name preceded by the `@` symbol to distinguish from types. The return type can be preceded by an optional parameter name.


## Record Types

In JavaScript, there is no distinction between pure procedural record (structure) types and object types with methods (prototypes). In JST, a record type represents an object that was created without a constructor function and do not have any methods. A record object consists of value attributes (although a value can be a function), only. 

Sub-types of records can be declared by using type composition with a sub-set of attributes, i.e., `st {a,b,c,..}` will derive a sub-type of *st* with the attributes *a*, *b*, .., only. 

In JST, each attribute can be assigned a type (core type, user type, or composed type). Attributes can be marked optional by `?` postfix annotation, or extendable (can be added at run-time) by `+` prefix annotation.

Record types can be defined anonymously in any type expression.

~ Definition [Record Type]
~ Code
@type st = {
  e1:typ1,
  e2:typ2,
  ..
  e~i~,
  e~j~:typ~j~ @is description,
  e~k~?:typ~k~,
  +e~n~:typ~n~,
  &commat;name:typ~o~,
  e~v~ = &epsilon; &lobrk; : typ~v~ &robrk;
  .. 
}
~
~

The object attribute names are *e~x~*, their types *typ*~x~, and &epsilon; is an expression (or value).

### Attribute Flags

x?
: Optional attribute

\+x
: Attribute that can be added at run-time

@x
: Symbolic attribute name (wild-card place holder for any identifier)

..
: More attributes (with or without same type interface) follow 

&dollar;x
: A macro substitution, commonly a choice list of different attribute-type elements.

x = &epsilon; &lobrk; : typ &robrk;
: A record entry having a specific value (e.g., a type tag) with optional type annotation.

### Examples

The following example shows a sketch of a type interface (a template). The types are not always fully specified leaving room for speculation and ambiguity and are primarily intended for an API declaration.

```javascript
$pos = top:number | left:number | right:number | center:boolean
type info = { type='info', $pos?, .. , $geom?, .. ,
              label:string, value?:string, .. }
type widget = ..
 
type on = { click?:handler|string, onclick?:handler|string, 
            check?:handler1, uncheck?:handler1, 
            selected?:handlerd, change?:handler,
            show?:handlerp, hide?: handlerp }
 
$pageparam = next:string | prev:string | on: on {show,hide} | 
             show:function | hide:function
$widget = @name : widget
 
typeof content = {
  pages : { 
   main: { $widget, .. , 
           $pageparam, .. }, 
   @page2: { @widget, .. }, ..
  },
  static?: { @id:info }
}
```


## Enumeration

An enumeration type is a sum type, but also declares or defines an additional object (a record type). In JS enumeration is performed usually by defining an object consisting of constant value properties. In JST, only the enumeration symbol names are listed. Basically, an enumeration type *e* denotes a set of symbols (sub-types) and an enumeration object *E* with properties (*S*~1~,*S*~2~,..). Hence, `enum` declares an object and defines a type!
Beside constant symbols, symbol constructors with parameters can be defined. That is a seamless transition from enumerations to generic sum types. That means, an enumeration symbol can be a constant value (number or string, i.e., representing the tag) or a constructor function returning an object with a tag field (the symbol tag).

~ Definition [Enuemration Type] 
~ Code
@enum E = {
  S1,  // Symbol 1
  S2,  // Symbol 2
  S3 {tag="S3",e1,e2,..}  // Symbol Constructor
  S4 = &epsilon;,  // Concrete Symbol value assignment
  ..
} &lobrk; : typ~e~ &robrk;  &lobrk; (symtype &brvbar; Tag) &robrk;

@typeof E = e =  S1 | S2 | ..
@typeof E = e = "E.S1" | "E.S2" | ..
@function S3(e1,e2,..) &rarr; S3
Anonymous Enumeration Type Set
{ S1, S2, ..}
~
~

Optionally, the symbol value type (*symtype*) and the enumeration tag (*ET*, string prefix) can be declared, too. 


### Examples

In the JS example below the enumeration symbols have the string type and the `E.` string prefix. 

```javascript
enum E = {S1,S2,..} : e (string)
\(&hArr;\)
var E = {
  S1:'E.S1',
  S2:'E.S2',
  ..
};
var x:e = E.S1;
```

