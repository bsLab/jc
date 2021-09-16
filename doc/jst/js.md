# JavaScript Core Types

The JavaScript core type systems consists only of six basic types and types classes: numbers (usually referred to real type numbers), Boolean values, strings (that are immutable), arrays (that can be objects, too), objects, and functions. That's all.

# JavaScript Objects

## Synopsis

```javascript
new Object()
{p1:..,p2:..,..}
o.p
```

## Description

Objects in JavaScript are a kind of two-faced. From one side, an object is an associative array (called hash in some languages). It stores key-value pairs. From the other side, objects are used for object-oriented programming, and that's a different story. In this section we start from the first side and then go on to the second one. An object consists of named properties and methods, i.e., an object is an aggregation of variables and functions.  A pure record object only have property variables.

## Creating objects

An empty object (you may also read as empty associative array) is created with one of two syntax forms: 

```javascript
1.  o = new Object()
2.  o = { } // the same
```

It stores any values by key which you can assign or delete using 'dot notation':

```javascript
 1  var obj = {} // create empty object (associative array)
 2
 3  obj.name = 'John' // add entry with key 'name' and value 'John'
 4
 5  // Now you have an associative array with single element
 6  // key:'name', value: 'John'
 7
 8  alert(obj.name) // get value by key 'name'
 9
10  delete obj.name // delete value by key 'name'
11
12  // Now we have an empty object once again
```

You can use square brackets instead of dot. The key is passed as a string:

```javascript
1  var obj = {}
2
3  obj['name'] = 'John'
4
5  alert(obj['name'])
6
7  delete obj['name']
```


There's a significant difference between dot and square brackets.
obj.prop returns the key named 'prop',
obj[prop] returns the key named by value of prop. 

```javascript
1  var prop = 'name'
2
3  // returns same as obj['name'], which is same as obj.name
4  alert(obj[prop])
```

### Literal syntax

You can also set values of multiple properties when creating an object, using a curly-bracketed list: { key1: value1, key2: value2, ... }.
Here's an example.   


Literal syntax is a more readable alternative to multiple assignments:

```javascript
 1  var menuSetup = {
 2    width: 300,
 3    height: 200,
 4    title: "Menu"
 5  }
 6
 7  // same as:
 8
 9  var menuSetup = {}
10  menuSetup.width = 300
11  menuSetup.height = 200
12  menuSetup.title = 'Menu'
It  is also possible to create nested objects:
01  var user = {
02    name: "Rose",
03    age: 25,
04    size: {
05      top: 90,
06      middle: 60,
07      bottom: 90
08    }
09  }
10
11  alert( user.name ) // "Rose"
12  alert( user.size.top ) // 90
```

### Non-existing properties, undefined

We can try to get any property from an object. There will be no error. But if the property does not exist, then undefined is returned:

```javascript
1  var obj = {}
2
3  var value = obj.nonexistant
4
5  alert(value)
```

So it's easy to check whether a key exists in the object, just compare it against undefined:

```javascript
if (obj.name !== undefined) { // strict(!) comparison
  alert(" I've got a name! ")
}
```


### Checking if a key exists

A peculiar coder (I bet you are) might have a question. What if I assign a key to undefined explicitly? How to check if whether the object got such key?

```javascript
1  var obj = { key: undefined }
2
3  alert( obj.key ) // undefined.. just if there were no key
```

Hopefully, there is a special "in" operator to check for keys. It?s syntax is "prop" in obj, like this: 

```javascript
1  var obj = { key: undefined }
2
3  alert("key" in obj) // true, key exists
4  alert("blabla" in obj) // false, no such key
```

In real life, usually null is used a ?no-value?, leaving undefined for something? truly undefined.
Iterating over keys-values
There is a special for..in syntax to list object properties: 

```javascript
for(key in obj) {
  ... obj[key] ...
}
```

The following example demonstrates it. 

```javascript
 1  var menu = {
 2    width: 300,
 3    height: 200,
 4    title: "Menu"
 5  };
 6
 7  for(var key in menu) {
 8    var val = menu[key];
 9
10    alert("Key: "+key+" value:"+val);
11  }
```


Note how it is possible to define a variable right inside for loop.
Order of iteration
In theory, the order of iteration over object properties is not guaranteed. In practice, there is a de-facto standard about it. 
IE < 9, Firefox, Safari always iterate in the order of definition.
Opera, IE9, Chrome iterate in the order of definition for string keys.
Numeric keys become sorted and go before string keys.
Try the code below in different browsers. 

```javascript
 1  var obj = {
 2    "name": "John",
 3    "1": 1,
 4    age: 25,
 5    "0": 0
 6  }
 7  obj[2] = 2 // add new numeric
 8  obj.surname = 'Smith' // add new string
 9
10  for(var key in obj) alert(key)
11  // 0, 1, 2, name, age, surname <-- in Opera, IE9, Chrome
12  // name, 1, age, 0, 2, surname <-- in IE<9, Firefox, Safari
```


Here 'numeric keys' are those which can be parsed as integers, so "1" is a numeric key. There is an issue about it in Chrome.
 
### Object variables are references

A variable which is assigned to object actually keeps reference to it. That is, a variable stores kind-of pointer to real data. You can use the variable to change this data, this will affect all other references.

```javascript
1  var user = { name: 'John' }; // user is reference to the object
2
3  var obj = user; // obj references same object
4
5  obj.name = 'Peter'; // change data in the object
6
7  alert(user.name); // now Peter
```


Same happens when you pass an object to function. The variable is a reference, not a value. Compare this: 

```javascript
1  function increment(val) {
2    val++
3  }
4
5  val = 5
6  increment(val)
7
8  alert(val) // val is still 5
```

And this (now changing val in object): 

```javascript
1  var obj = { val: 5}
2
3  function increment(obj) {
4    obj.val++
5  }
6  increment(obj)
7
8  alert(obj.val) // obj.val is now 6
```

The difference is because in first example variable val is changed, while in second example obj is not changed, but data which it references is modified instead.

### Properties and methods

You can store anything in object. Not just simple values, but also functions. 

```javascript
1  var user = {
2    name: "Guest",
3    askName: function() {
4      this.name = prompt("Your name?")
5    },
6    sayHi: function() {
7      alert('Hi, my name is '+this.name)
8    }
9  }
```
 
### Calling methods

When you put a function into an object, you can call it as method: 

```javascript
 1  var user = {
 2    name: "Guest",
 3    askName: function() {
 4      this.name = prompt("Your name?")
 5    },
 6    sayHi: function() {
 7      alert('Hi, my name is '+this.name)
 8    }
 9  }
10
11  user.askName()
12  user.sayHi()
```


Note the this keyword inside askName and askName. When a function is called from the object, this becomes a reference to this object.

### The constructor function, "new"

An object can be created literally, using obj = { ... } syntax.
Another way of creating an object in JavaScript is to construct it by calling a function with new directive. A 
simple example: 

```javascript
1  function Animal(name) {
2    this.name = name
3    this.canWalk = true
4  }
5
6  var animal = new Animal("beastie")
7
8  alert(animal.name)
```


A function takes the following steps: 
Create this = {}.
The function then runs and may change this, add properties, methods etc.
The resulting this is returned. 
So, the function constructs an object by modifying this. The result in the example above:

```javascript
1  animal = {
2    name: "beastie",
3    canWalk: true
4  }
```

Traditionally, all functions which are meant to create objects with new have uppercased first letter in the name.

