// $Id: logonlist.js,v 1.5 2019/10/30 19:27:24 rswindell Exp $

// Logon List module (replaces old hard-coded logon.lst)

// Install with 'jsexec logonlist install'
// ... also, for all command shells (exec/*.src files), replace:
//     userlist_logons
// with:
//     exec_bin logonlist
//
// ... and then run 'jsexec update'

"use strict";

function install()
{
	var maint_event = "?logonlist -m";
	var cnflib = load({}, "cnflib.js");
	var main_cnf = cnflib.read("main.cnf");
	if(!main_cnf)
		return "Failed to read main.cnf";
	if(main_cnf.sys_daily == maint_event)
		return true;
	if(main_cnf.sys_daily)
		return format("System daily event already set to: '%s'", main_cnf.sys_daily);
	main_cnf.sys_daily = maint_event;
	if(!cnflib.write("main.cnf", undefined, main_cnf))
		return "Failed to write main.cnf";
	return true;
}

if(argv.indexOf('install') >= 0)
{
	var result = install();
	if(result !== true)
		alert(result);
	exit(result === true ? 0 : 1);
}

if(!js.global.bbs) {
	alert("This module must be run from the BBS");
	exit(1);
}

if(!bbs.mods.logonlist_lib)
	bbs.mods.logonlist_lib = load({}, 'logonlist_lib.js');
var options = load("modopts.js", "logonlist");
if(!options)
	options = {};
if(options.last_few_callers === undefined)
	options.last_few_callers = 4;
if(options.backup_level === undefined)
	options.backup_level = 10;

if(argv.indexOf('-m') >= 0) { // maintenance (daily)
	bbs.mods.logonlist_lib.maint(options.backup_level);
	exit();
}

var days_ago = 0;
var day = options.today || "Today";
if(argv.indexOf('-y') >= 0)
	days_ago = 1, day = options.yesterday || "Yesterday";

// Returns true on success, string on error
function print(hdr, num, days_ago)
{
	var list = bbs.mods.logonlist_lib.get(num, days_ago);
	if(typeof list != 'object' || !list.length)
		return false;
	console.print(hdr);
	for(var i in list) {
		var record = list[i];
		var date = new Date(record.time * 1000);
		console.print(format(options.last_few_callers_fmt || 
			"\r\n\x01n\x01h\x01m%-3s\x01n\x01m%-6s \x01w\x01h%-25.25s \x01m%-25.25s" +
			"\x01n\x01m%2u:%02u \x01h%-8.8s \x01n\x01m%3d"
			,record.total ? record.node : ""
			,record.total ? record.total : ""
			,record.user.alias
			,record.user.location
			,date.getHours()
			,date.getMinutes()
			,record.user.connection
			,record.user.stats.logons_today
			));
	}
	return true;
}

if(argv.indexOf('-l') >= 0) { // Last few callers?
	if(!this.print(options.last_few_callers_msg || "\x01n\x01g\x01hLast few callers:\x01n\r\n"
		,-options.last_few_callers))
		console.print(options.first_caller_msg || "\x01n\x01g\x01hYou are the first caller of the day!");
	console.crlf();
} else {
	if(!this.print(format(options.logons_header_fmt || "\x01n\x01h\x01y\r\nLogons %s:\r\n", day)
		,/* all: */0, days_ago))
		console.print(format(options.nobody_logged_on_fmt || "\r\nNo one logged on %s.", day.toLowerCase()));
	console.crlf();
}
