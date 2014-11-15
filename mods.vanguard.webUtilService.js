//mods.vanguard.webUtilService.js
load("mods.vanguard.sbbsXML.js");

var debug = true;

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

function sendData(start_message,data) {
	writeln("200 - " + start_message + " - data encased in <root_package> and </root_package> lines");
	writeln('<?xml version="1.0" encoding="UTF-8"?>'); //data should already be escaped to &#...;
	writeln("<root_package>");
	writeln(encodeUTF8(data)); // *SHOULD* already be xml encoded before here.
	writeln("</root_package>");
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

function main() {
	var isAllowed = false;
	
	for (var i=0; i<AllowedHosts.length; i++)
		if (client.socket.remote_ip_address == AllowedHosts[i])
			isAllowed = true;
			
	if (!isAllowed) {
		writeln("500 ACCESS DENIED");
		client.socket.close();
		return;
	} else
		writeln("200 Vanguard Web Utility Service");
	
	var cmdline = readln();
	if (!cmdline.length || cmdline.indexOf(" ") == -1) {
		writeln("unknown command");
	} else {
		var cmd = cmdline.split(" ");
		var cmdtype = cmd[0].toLowerCase();
		var cmdcommand = cmd[1].toLowerCase();
		var cmdparams = "";
		for (var i=2; i<cmd.length; i++)
			cmdparams += cmd[i] + (i < cmd.length+1)?" ":"";
		
		if (cmdtype == "get") {
			for (x in Commands)
				if (x == cmdcommand && Commands[x].get)
					Commands[x].get(cmdparams);
		} else if (cmdtype == "set") {
			writeln("unknown command");
		} else
			writeln("unknown command");
	}
}
main();
