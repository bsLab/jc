// Variables
var x,y,z:string;

open('test2') as M;
var M = Require('test2');
//include("test2");

type complex = {
  re:number,
  im:number
};

type Number = number|string

enum E = {
  S1,   // First symbol
  S2,   // Second symbol
  S3,
  S4=2,
  S5='tag'
} : e

type S = 
  S1 {tag='S.S1',x1:number,y1:number} |
  S2 {tag:string,x2:number,y2:number} |
  S3 {tag:string,x3:number,y3:number} |
  S4 {tag=1004,x3:number,y3:number} 

  
function f1(c:complex) -> number

function f1(c:complex) -> number {
  var t:number;
  t=c.re;
  return t+c.im;
}

function f2(a:object []):{x:number,y:number}


function f2(a:object []):{x:number,y:number} {
  return a[0];
}

function f3(a:{} []) {
  return a[0];
}

function f4(a:{x:number,y:number[]} []) {
  return a[0];
}

function f5(c:number,d:number):number {
  return c+d;
}
export {f1,f5};

// export { .. }
module.exports = {
  f1:f1,
  f5:f5
}
