/*************************************************************************
oneliners.js - For Synchronet BBS v3.10h or newer

CREATED ON  : 2001-04-21 20:00
CREATED BY  : Michael J. Ryan (Tracker1 - Sysop - theroughnecks.net)

MODIFIED ON : 2001-04-21 20:00
MODIFIED BY : Michael J. Ryan (Tracker1 - Sysop - theroughnecks.net)
MODIFICATION: Finished Creation.. :)
*************************************************************************/

//Load Definition files
load("sbbsdefs.js");
var System = eval("s" + "ystem"); //crimson editor autocap's System
var bDone = false; //done with oneliners
var bAnsi = ((user.settings&USER_ANSI) != 0) //user has ansi
var cDelim = "	"; //data delimiter
var strHeaderFile = "..\\text\\oneliner\\oneliner" + ((bAnsi)?".ans":".asc");
var strDataFile = "..\\text\\oneliner\\oneliner.dat"; //Data File

//Formats DateTime for logging "YYYY-MM-DD HH:NN"
function formatDT(inDate) {
	var y = inDate.getYear();
	var m = inDate.getMonth() + 1;
	var d = inDate.getDate();
	var h = inDate.getHours();
	var n = inDate.getMinutes();

	var strRet = "" +
		((y<1900)?(y+1900):y) + "-" +
		((m<10)?"0":"") + m + "-" +
		((d<10)?"0":"") + d + " " +
		((h<10)?"0":"") + h + ":" +
		((n<10)?"0":"") + n;
	return strRet;
}

//use the filesystem to display a file, with a
function fileShowFast(fname) {
	f = new File(fname);
	if(!f.open("r")) {
		alert("Error opening file: " + fname);
		return;
	}

	console.print("\10\1h\1n");
	console.clear();
	text = f.readAll();
	for (var i=0;i<text.length;i++) {
		console.print(text[i]);
		if (i<text.length-1)
			console.print("\r\n")
		console.line_counter = 0;
	}
	f.close();
}

//oneliner object
function oneliner(line) {
	var data = line.split(cDelim);
	this.when = data[0];
	this.user = data[1];
	this.text = data[2];
	this.data = line;
}

//retrieve oneliner data from datafile
function getOneliners(strDataFile) {
	var arrRet = new Array();

	f = new File(strDataFile);
	if(!f.open("r")) {
		alert("Error opening file: " + strDatafile);
		return;
	}

	text = f.readAll();
	for (var i=0;i<text.length;i++) {
		var line = text[i];
		if (line.indexOf(cDelim) > 0)
			arrRet[arrRet.length] = new oneliner(line);
	}
	f.close();

	return arrRet;
}

function showOnelinersAscii(arrIn) {
	console.print("\r\n컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴�\r\n");
	for (var i=0; i<arrIn.length; i++) {
		var username = (arrIn[i].user + "          ").substring(0,10);
		console.print("   " + username + ": " + arrIn[i].text + "\r\n");
	}
	console.print("컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴�\r\n");
}

function showOnelinersAnsi(arrIn) {
	console.print("\r\n");
	for (var i=0; i<arrIn.length; i++) {
		var username = (arrIn[i].user + "          ").substring(0,10);
		console.ansi_gotoxy(4,8+i);
		console.print("" +
			"\1h\1c" + username.substr(0,1) + "\1n\1c" + username.substr(1) +
			"\1n\1h\1k: \1n\1w" + arrIn[i].text)
	}
	console.ansi_gotoxy(1,24);
}

function showOneliners() {
	//clear screen.
	console.clear();

	//show header file
	fileShowFast(strHeaderFile);

	var arrOneliners = getOneliners(strDataFile);
	if (bAnsi) {
		showOnelinersAnsi(arrOneliners);
	}else{
		showOnelinersAscii(arrOneliners);
	}
}

function saveOneliners(arrIn) {
	var first,last;
	first = 0;
	last = arrIn.length;
	if (arrIn.length >= 15) first=arrIn.length-15;

	var bOpen = false;
	var start = new Date();
	var quit = start.setSeconds(start.getSeconds() + 5);

	f = new File(strDataFile);
	if (!f.open("w")) {
		alert("Error opening file: " + strDatafile);
		bDone = true;
		return;
	}
	for (var i=first; i<last; i++) {
		f.writeln(arrIn[i].data);
	}
	f.close();
}

function addOneliner() {
	console.print("\r\n\r\n");
	console.print("\1n\1h\1rWARNING !!! WARNING !!! WARNING !!! WARNING !!! WARNING\r\n\r\n");
	console.print("\1n\1h\1yPOSTING BBS ADS IN ONELINERS WILL GET YOUR ACCOUNT DELETED!!!\r\n\r\n");
	console.print("\1n\1h\1rWARNING !!! WARNING !!! WARNING !!! WARNING !!! WARNING\r\n\r\n");
	console.pause();
	console.print("\r\n");
	console.print("\1n\1h\1wDo NOT use the oneliners for BBS Ads.\r\n");
	console.print("\1n\1wEnter your text, enter a blank line to abort.\r\n");
	console.print("\r\n\1n\1h\1y   " +
		(user.alias + "          ").substring(0,10) +
		"\1k: \1n");

	var text = console.getstr(60).replace(/[\000-\040]/g," ");
	if (text.length > 0) {
		var when = formatDT(new Date());
		var arrOneliners = getOneliners(strDataFile);
		arrOneliners[arrOneliners.length] = new oneliner(when + cDelim + user.alias + cDelim + text);
		saveOneliners(arrOneliners);
	}
	console.line_counter = 0;
}

while(bbs.online && (!bDone)) {
	showOneliners();
	if (user.security.restrictions&UFLAG_W) {
		console.pause();
		bDone = true;
	} else {
		bDone = console.noyes("Add a oneliner");
		if (!bDone) {
			addOneliner();
		}
	}
}

console.print("\1h\10\1n\1w");
console.line_counter = 0;
console.clear();