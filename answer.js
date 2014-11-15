load("mods.vanguard.ansislow.js");

var last = 6;
var j = parseInt(Math.random() * last) + 1;
var s = j.toString();
s = "000".substring(0,3 - s.length) + s
var f = "answer/answer_" + s + ".asc"

console.line_counter = 0;
console.clear();
bbs.ver();
sleep(1000);
console.line_counter = 0;
console.clear();
console.print("\r\n\r\n");
console.line_counter = 0;

bbs.mods.vanguard.ansislow(f);

console.line_counter = 0;
console.print("\r\n\r\n");

//console.print("" +
//	"\1hYou may now login, if you have to login as new, sorry, I have\r\n" +
//	"a lot to do, and recover, most is now re-setup.\r\n\r\n");
sleep(2000);
//console.pause()
