//mods.vanguard.XmlService.js
load("mods.vanguard.sbbsXML.js");

/*
This is a work in progress... don't bash me too badly for this.. :)


response codes
200	welcome
210	valid user, waiting for password
220 valid password, logged in
250 sending request data

500 access denied (not authenticated, no util_guest account, no guest account, not on allowed host list)
510 unknown command
520 unknown subcommand
530 unable to respond, invalid parameters 
*/

var debug = true;
var dStart;

// will use "util_guest" or "guest" if available, logged in hosts/users may not get *all* data
var AllowedHosts = new Array();
AllowedHosts[AllowedHosts.length] = "127.0.0.1";

function readln() {
	var ret = client.socket.recvline(4096 /*maxlen*/, 300 /*timeout*/);
	if (debug)
		log(format("rcv: %s",ret));
	return ret;
}

function write(str) {
	client.socket.send(str);
}

function writeln(str) {
	if(debug)
		log(format("rsp: %s",str));
	write(str + "\r\n");
}

// int_to_utf8() thanks to Digital Man at synchro.net
function int_to_utf8(c) {
    if(c<0x80)      /* US-ASCII */
         return String.fromCharCode(c);
        
    /* Encode into multiple octects */
    var octect = new Array();
    for(var i=0;i<3;i++)
        octect.push(0x80|((c>>(i*6))&0x3f));

    if(c<0x800)
        return String.fromCharCode(0xc0|c>>6,  octect[0]);
    if(c<0x8000)
        return String.fromCharCode(0xe0|c>>12, octect[1],octect[0]);
    if(c<0x11000)
        return String.fromCharCode(0xf0|c>>18, octect[2],octect[1],octect[0]);

    return("");     /* Illegal UTF-8 Character Number */
}
function encodeUTF8(strIn) {
	var strOut = "";
	for (var i=0; i<strIn.length; i++)
		strOut += int_to_utf8(strIn.charCodeAt(i));

	return strOut;
}


function sendOpen(start_message) {
	dStart = new Date();
	writeln("250 - " + start_message + " - USER: " + ((logged_in)?user.alias:"SYSTEM") + " - data encased in <root_package> and </root_package> lines");
	writeln('<?xml version="1.0" encoding="UTF-8"?>'); //data should already be escaped to &#...;
	writeln("<root_package>");
}
function sendClose() {
	writeln("</root_package>");
	log("output took: " + ((new Date())-dStart) + "ms")
}
function sendData(start_message,data) {
	sendOpen(start_message);
	writeln(encodeUTF8(data));
	sendClose();
}


function receiveData() {
	var finishedSend = false;
	var data;
	var row;
	while (client.socket.is_connected && (!finishedSend)) {
		row = client.socket.recvline(4096 /*maxlen*/, 300 /*timeout*/);
		data += row;
		if (row == "</root_package>")
			finishedSend = true;
	}
}

var Commands = new Array();

Commands["nodelist"] = {};
Commands["nodelist"].get = function(params) {
	sendData("Sending Node List",system.node_list.toXML());
}

Commands["xtrnlist"] = {};
Commands["xtrnlist"].get = function(params) {
	sendData("Sending Xtrn List",xtrn_area.toXML());
}

Commands["user"] = {};
Commands["user"].get = function(params) {
	var iUser = system.matchuser(params);
	if (iUser > 0)
		sendData("Sending User",userToXML(new User(iUser)));
	else
		writeln("530 - Unknown User (" + params + ")");
}

Commands["users"] = {};
Commands["users"].get = function(params) {
	sendOpen("Sending Users");
	
	var oUser = new User(1);
	for (var i=1; i<=system.lastuser; i++) {
		oUser.number = i;
		if (!(oUser.settings & (USER_DELETED | USER_INACTIVE)))
			writeln(smallUserToXML(oUser));
	}
	sendClose();
}

Commands["system"] = {};
Commands["system"].get = function(params) {
	sendData("Sending system",system.toXML());
}

function main() {
	var isAllowed = false;
	
	for (var i=0; i<AllowedHosts.length; i++)
		if (client.socket.remote_ip_address == AllowedHosts[i])
			isAllowed = true;
			
	writeln("200 Vanguard Web Utility Service");
	
	var cmdline = readln();
	if (!cmdline.length || cmdline.indexOf(" ") == -1) {
		writeln("unknown command");
	} else {
		var bQuit = false;
		var sUser;
		while (client.socket.is_connected && !bQuit) {
			bQuit = true;
			var cmd = cmdline.split(/\s/g);
			var cmdtype = cmd[0].toLowerCase();
			var cmdcommand = cmd[1].toLowerCase();
			var cmdparams = "";
			var bFound = false;
			for (var i=2; i<cmd.length; i++)
				cmdparams += cmd[i] + ((i+1 < cmd.length)?" ":"");
			
			if (cmdtype == "auth") {
				if (cmdcommand == "user") {
					if (system.matchuser(cmdparams)) {
						writeln("210 Welcome " + cmdparams + " please submit your password.");
						sUser = cmdparams;
						bQuit = false;
					} else
						writeln("531 Unknown User");
				} else if (cmdcommand == "pass") {
					if (login(sUser,cmdparams)) {
						writeln("220 Logged in as " + user.alias);
						bQuit = false;
					} else
						writeln("532 Invalid Password");
				} else
					writeln("520 - unknown subcommand");
			} else {
				if ((!isAllowed) && (!logged_in)) {
					if ((!logged_in) && system.matchuser("util_guest"))
						login("util_guest");
	
					if ((!logged_in) && system.matchuser("guest"))
						login("guest");
					
					if (!logged_in) {
						writeln("500 - ACCESS DENIED")
						return;
					}
				}
				
				if (cmdtype == "get") {
					for (x in Commands) {
						if (x == cmdcommand && Commands[x].get) {
							Commands[x].get(cmdparams);
							bFound = true;
						}
					}
					
					if (!bFound)
						writeln("520 - unknown subcommand");
				} else if (cmdtype == "set") {
					for (x in Commands) {
						if (x == cmdcommand && Commands[x].get) {
							Commands[x].get(cmdparams);
							bFound = true;
						}
					}
					if (!bFound)
						writeln("520 - unknown subcommand");
				} else
					writeln("510 - unknown command");
			}
			if (!bQuit)
				var cmdline = readln();
		}
	}
}
main();
sleep(250);