/*****************************************************************************
                         Synchronet 3 Command Shell
------------------------------------------------------------------------------
FILE NAME : s3.js
VERSION   : 1.0
CREATED BY: Michael J. Ryan (tracker1[at]theroughnecks.net)
CREATED ON: 2002-11-15
LAST MOD  : 2002-11-29
------------------------------------------------------------------------------
This file requires Synchronet v3.10k or newer.
Version 3.10k requires sh_s3.src/bin as the shell to call sh_s3.js
------------------------------------------------------------------------------
most menus use the bbs.menu.show_simple() function added via inc_menu.js

bbs.menu.show_simple(strMenu,strPrompt,arrOptions,arrCommands,iAction)
	strMenu    = The menu asc/ans to display
	strPrompt  = The menu's prompt
	arrOptions = an array of strings for commands that can be entered
	iAction    = the action status to set the node to.
*****************************************************************************/

print("\1n\1lLoading S3 Command Shell...\r\n\r\n");


bbs.replace_text(563,"@EXEC:SYS_PAUSE@");
bbs.replace_text(71,"@EXEC:SYS_READP@");

load("sbbsdefs.js"); //load helper functions
load("inc_menu.js"); //load helper functions
load("mods.vanguard.ansislow.js");
bbs.timeout_warn = 180; //180 second default timeout warning
bbs.timeout_hangup = 300; //300 second default timeout hangup

bbs.replace_text(331,"\r\nEnter a different password");
bbs.replace_text(332,"_\r\n\1y\1hNew password (4-8 chars): \1n");
bbs.replace_text(333,"\1_\1y\1hVerify (enter again): \1n");
bbs.replace_text(519,"\r\n_yhPassword: ");
bbs.replace_text(371,"l-gYour password is h%s\r\n");
bbs.replace_text(372,"\r\n_whWrite down your password and keep it confidential.\r\n\r\nyhEnter this password for verification: w");

bbs.menu.chat = function() {
	var options = new Array();
	options['M'] = "bbs.exec('*chat_sec');";
	options['C'] = "bbs.multinode_chat();";
	options['T'] = "bbs.exec_xtrn('TRIVCHAT');console.clear();";
	options['Q'] = "return;";
	options['\r'] = "return;";
	
	bbs.menu.show_simple("rn/chat","Chat: ",options,NODE_CHAT,true);	
}

bbs.menu.doors = function() {
	var options = new Array();
	options['1'] = "bbs.exec_xtrn('LORD');console.pause();";
	options['2'] = "bbs.exec_xtrn('DOORMUD');console.pause();";
	options['3'] = "bbs.exec_xtrn('BRE777');console.pause();";
	options['4'] = "bbs.exec_xtrn('OO2');console.pause();";
        options['5'] = "bbs.exec_xtrn('AMB');console.pause();";
	options['6'] = "bbs.exec_xtrn('BJ');console.pause();";
	options['7'] = "bbs.exec_xtrn('POKER');console.pause();";
	options['8'] = "bbs.exec_xtrn('SBL');console.pause();";
	options['9'] = "bbs.exec_xtrn('SMM');console.pause();";
	options['0'] = "bbs.exec_xtrn('ONELINER');console.pause();";
	options['Q'] = "return;";
	options['\r'] = "return;";

//	bbs.menu.show_simple("rn/door","Doors: ",options,NODE_XTRN,true);
	bbs.xtrn_sec();
}

bbs.menu.email = function() {
	//options and commands to perform
	var options = new Array();
	options['R'] = "bbs.read_mail();";
	options['W'] = "bbs.send_mail();";
	options['S'] = "console.clear();console.ungetstr('Feedback');bbs.email(1,null,null,'feedback:\\r\\n\\r\\n');";
	options['Q'] = "return;";
	options['\r'] = "return;";

	//basic menu, will display the menu text & prompt
	//  then get the available input, and execute the associated command.
	bbs.menu.show_simple("rn/email","Email: ",options,NODE_RMAL);
}

bbs.menu.message_scan_config = function() {
	//options and commands to perform
	var options = new Array();
	options['S'] = "bbs.cfg_msg_scan();";
	options['Y'] = "bbs.cfg_msg_scan(SCAN_TOYOU);";
	options['I'] = "bbs.reinit_msg_ptrs();";
	options['P'] = "bbs.cfg_msg_ptrs();";
	options['Q'] = "return;";
	options['\r'] = "return;";

	//basic menu, will display the menu text & prompt
	//  then get the available input, and execute the associated command.
	bbs.menu.show_simple("s3/message_scan_config","Message Scan Config: ",options,NODE_RMSG);
}

bbs.menu.message_scan = function() {
	//command to perform, must match order/length with options.
	var options = new Array();
	options['N'] = "bbs.scan_subs(SCAN_NEW);";
	options['Y'] = "bbs.scan_subs(SCAN_TOYOU);";
	options['T'] = "bbs.scan_subs(SCAN_FIND);";
	options['C'] = "bbs.menu.message_scan_config();";
	options['Q'] = "return;";
	options['\r'] = "return;";

	//basic menu, will display the menu text & prompt
	//  then get the available input, and execute the associated command.
	bbs.menu.show_simple("s3/message_scan","Message Scan: ",options,NODE_RMSG);
}

bbs.menu.message = function() {
	//options and commands to perform
	var options = new Array();
	options['['] = "bbs.lastgrp=bbs.curgrp;bbs.curgrp--;if (bbs.lastgrp == bbs.curgrp) bbs.curgrp = msg_area.grp_list.length-1",
	options['{'] = "bbs.lastgrp=bbs.curgrp;bbs.curgrp--;if (bbs.lastgrp == bbs.curgrp) bbs.curgrp = msg_area.grp_list.length-1",
	options[']'] = "bbs.lastgrp=bbs.curgrp;bbs.curgrp++;if (bbs.lastgrp == bbs.curgrp) bbs.curgrp = 0",
	options['}'] = "bbs.lastgrp=bbs.curgrp;bbs.curgrp++;if (bbs.lastgrp == bbs.curgrp) bbs.curgrp = 0",
	options['G'] = "bbs.menu.msg_select_group();",
	options['<'] = "bbs.lastsub=bbs.cursub;bbs.cursub--;if (bbs.lastsub == bbs.cursub) bbs.cursub = msg_area.grp_list[bbs.curgrp].sub_list.length-1",
	options[','] = "bbs.lastsub=bbs.cursub;bbs.cursub--;if (bbs.lastsub == bbs.cursub) bbs.cursub = msg_area.grp_list[bbs.curgrp].sub_list.length-1",
	options['>'] = "bbs.lastsub=bbs.cursub;bbs.cursub++;if (bbs.lastsub == bbs.cursub) bbs.cursub = 0",
	options['.'] = "bbs.lastsub=bbs.cursub;bbs.cursub++;if (bbs.lastsub == bbs.cursub) bbs.cursub = 0",
	options['B'] = "bbs.menu.msg_select_subboard();",
	options['A'] = "bbs.menu.msg_select_subboard();",
	options['R'] = "bbs.scan_posts(msg_area.grp_list[bbs.curgrp].sub_list[bbs.cursub].code,0);",
	options['P'] = "bbs.post_msg(msg_area.grp_list[bbs.curgrp].sub_list[bbs.cursub].code);",
	options['O'] = "bbs.qwk_sec();";
	options['N'] = "bbs.scan_subs(SCAN_NEW);",
	options['Y'] = "bbs.scan_subs(SCAN_TOYOU);",
	options['T'] = "bbs.scan_subs(SCAN_FIND);",
	options['S'] = "bbs.menu.message_scan();",
	options['C'] = "bbs.menu.message_scan_config();",
	options['E'] = "bbs.menu.email();",
	options['!'] = "bbs.qwk_sec();",
	options['Q'] = "return;";

	//basic menu, will display the menu text & prompt
	//  then get the available input, and execute the associated command.
	bbs.menu.show_simple("rn/message","[@GRP@ - @SUB@] Message: ",options,NODE_RMSG,true);
}

bbs.menu.file_search_config = function() {
	//options and commands to perform
	var options = new Array();
	options['P'] = "bbs.new_file_time = bbs.get_newscantime(bbs.new_file_time);";
	options['B'] = "user.settings^=USER_BATCHFLAG;console.print('\\r\\n\\1nBatch flagging is now \\1h\\1b' + ((user.settings&USER_BATCHFLAG)?'ON':'OFF') + '\\1n.\\r\\n');";
	options['E'] = "user.settings^=USER_EXTDESC;console.print('\\r\\n\\1nExtended descriptions are now \\1h\\1b' + ((user.settings&USER_EXTDESC)?'ON':'OFF') + '\\1n.\\r\\n');";
	options['Q'] = "return;";
	options['\r'] = "return;";

	//basic menu, will display the menu text & prompt
	//  then get the available input, and execute the associated command.
	bbs.menu.show_simple("s3/files_search_config","File Search Config: ",options,NODE_XFER);
}

bbs.menu.file_search = function() {
	//options and commands to perform
	var options = new Array();
	options['N'] = "bbs.scan_dirs(FL_ULTIME);";
	options['D'] = "console.print('\\r\\n\\1c\\1hFind Text in File Descriptions (no wildcards)\\r\\n\\1n: ');bbs.cmdstr(console.getstr(40));bbs.scan_dirs(FL_EXFIND);";
	options['F'] = "bbs.cmdstr(bbs.get_filespec());bbs.scan_dirs(0);";
	options['C'] = "bbs.menu.file_search_config();";
	options['Q'] = "return;";
	options['\r'] = "return;";

	//basic menu, will display the menu text & prompt
	//  then get the available input, and execute the associated command.
	bbs.menu.show_simple("s3/files_search","File Search: ",options,NODE_XFER);
}

bbs.menu.file_info = function() {
	//options and commands to perform
	var options = new Array();
	options['T'] = "bbs.xfer_policy();";
	options['D'] = "bbs.dir_info();";
	options['U'] = "bbs.list_users(UL_DIR);";
	options['Y'] = "bbs.user_info();";
	options['Q'] = "return;";
	options['\r'] = "return;";

	//basic menu, will display the menu text & prompt
	//  then get the available input, and execute the associated command.
	bbs.menu.show_simple("s3/files_info","Info: ",options,NODE_XFER);
}

bbs.menu.file = function() {
	//options and commands to perform
	var options = new Array();
	options['['] = "bbs.lastlib=bbs.curlib;bbs.curlib--;if (bbs.lastlib == bbs.curlib) bbs.curlib = file_area.lib_list.length-1";
	options['{'] = "bbs.lastlib=bbs.curlib;bbs.curlib--;if (bbs.lastlib == bbs.curlib) bbs.curlib = file_area.lib_list.length-1";
	options[']'] = "bbs.lastlib=bbs.curlib;bbs.curlib++;if (bbs.lastlib == bbs.curlib) bbs.curlib = 0";
	options['}'] = "bbs.lastlib=bbs.curlib;bbs.curlib++;if (bbs.lastlib == bbs.curlib) bbs.curlib = 0";
	options['L'] = "bbs.menu.file_select_library();";
	options['<'] = "bbs.lastdir=bbs.curdir;bbs.curdir--;if (bbs.lastdir == bbs.curdir) bbs.curdir = file_area.lib_list[bbs.curlib].dir_list.length-1";
	options[','] = "bbs.lastdir=bbs.curdir;bbs.curdir--;if (bbs.lastdir == bbs.curdir) bbs.curdir = file_area.lib_list[bbs.curlib].dir_list.length-1";
	options['>'] = "bbs.lastdir=bbs.curdir;bbs.curdir++;if (bbs.lastdir == bbs.curdir) bbs.curdir = 0";
	options['.'] = "bbs.lastdir=bbs.curdir;bbs.curdir++;if (bbs.lastdir == bbs.curdir) bbs.curdir = 0";
	options['D'] = "bbs.menu.file_select_directory();";
	options['N'] = "bbs.scan_dirs(SCAN_NEW);";
	options['S'] = "bbs.menu.file_search();";
	options['C'] = "bbs.menu.file_search_config();";
	options['V'] = "bbs.list_files(file_area.lib_list[bbs.curlib].dir_list[bbs.curdir].code);";
	options['E'] = "bbs.list_file_info(file_area.lib_list[bbs.curlib].dir_list[bbs.curdir].code);";
	options['T'] = "bbs.temp_xfer();";
	options['A'] = "console.print('\\r\\n\\1c\\1hView File(s)\\r\\n'); bbs.list_files(bbs.curdir,FL_VIEW);";
	options['R'] = "console.print('\\r\\n\\1c\\1hRemove/Edit File(s)\\r\\n'); file_remove(bbs.get_filespec());";
	options['I'] = "bbs.menu.file_info();";
	options['G'] = "console.print('\\r\\n\\1c\\1hDownload File(s)\\r\\n');bbs.menu.baja('\\r\\nfile_download_batch\\r\\nif_true\\r\\ngoto end\\r\\nend_if\\r\\ngetfilespec\\r\\nif_true\\r\\nfile_download\\r\\nend_if\\r\\n:end');";
	options['/G'] = "console.print('\\r\\n\\1c\\1hDownload File(s) from User(s)\\r\\n');bbs.menu.baja('FILE_DOWNLOAD_USER');";
	options['U'] = "console.print('\\r\\n\\1c\\1hUpload File.\\r\\n');bbs.upload_file('UPLOADS');";
	options['/U'] = "console.print('\\r\\n\\1c\\1hUpload File to User.\\r\\n');bbs.upload_file('USER');";
	options['//U'] = "console.print('\\r\\n\\1c\\1hUpload File to Sysop.\\r\\n');bbs.upload_file('SYSOP');";
	options['B'] = "bbs.batch_menu();";
	options['Q'] = "return;";

	//basic menu, will display the menu text & prompt
	//  then get the available input, and execute the associated command.
	bbs.menu.show_simple("s3/files","[@LIB@ - @DIR@] Files: ",options,NODE_XFER);
}

bbs.menu.system = function() {
	//options and commands to perform
	var options = new Array();
	options['C'] = function() {
		if (user.compare_ars("GUEST")) {
			console.clear();
			print("Can't access as guest");
			console.pause();
		} else {
			console.clear();
			bbs.user_config();
		}
	};
	options['Y'] = "console.clear();bbs.user_info();";
	options['S'] = "console.clear();bbs.sys_info();";
	options['I'] = "console.clear();bbs.ver();";
	options['M'] = "console.clear();bbs.sub_info();";
	options['P'] = "console.clear();console.print('\1h\1yunder construction.\\r\\n\\r\\n\\r\\n')";
	options['H'] = "console.clear();console.print('\1h\1yunder construction.\\r\\n\\r\\n\\r\\n')";
	options['U'] = "console.clear();bbs.list_users();console.line_counter=1;";
	options['L'] = "console.clear();load('laston.js','50'); bbs.menu.paused = false; console.line_counter = 100; console.pause();";
	options['Q'] = "return;";
	options['\r'] = "return;";

	bbs.menu.show_simple("rn/system","System: ",options,NODE_DFLT,true);
}

bbs.menu.main = function() {
	//options and commands to perform
	var options = new Array();
	options['E'] = function() {
		if (user.compare_ars("GUEST")) {
			console.clear();
			print("Can't access as guest, email tracker1@theroughnecks.net");
			console.pause();
		} else {
			bbs.menu.email();
		}
	};
	options['R'] = "bbs.read_mail();"; //READ EMAIL - Hidden
	options['W'] = function() {
		if (user.compare_ars("GUEST")) {
			console.clear();
			print("Can't access as guest, email tracker1@theroughnecks.net");
			console.pause();
		} else {
			bbs.send_mail();
		}
	}; //WRITE EMAIL - Hidden
	options['M'] = "load('mods.trn.msg_sec.js');";
	options['P'] = "load('mods.trn.msg_sec.js');";
//	options['F'] = "bbs.menu.file();";
//	options['T'] = "bbs.menu.file();";
	options['N'] = function() {
		if (user.compare_ars("GUEST")) {
			console.clear();
			print("Can't access as guest, email tracker1@theroughnecks.net");
			console.pause();
		} else {
			console.clear();
			console.ungetstr('Feedback');
			bbs.email(1,null,null,'feedback:\\r\\n\\r\\n'); //note to sysop
		}
	};
	options['G'] = "load('mods.vanguard.assault.xtrn_sec.js');"; //"bbs.xtrn_sec();";
	options['C'] = function() {
		if (user.compare_ars("GUEST")) {
			console.clear();
			print("Can't access as guest.");
			console.pause();
			return;
		}

				
		// bbs.multinode_chat();
		// bbs.exec('*chat_sec');
		// bbs.exec_xtrn('CHAT');
		// bbs.exec_xtrn('TRIVCHAT');
		// console.clear();
		
		
		console.print("\1l\1h\1bYou are about to be connected the public #bbs channel in irc.theroughnecks.net\1n \r\n\r\n");
		
		console.print("\1h\1cCommands to remember\1k:\1n \r\n");
		
		console.print("\1h\1w    /list \1c        \1n  List Channels/Rooms\r\n");
		console.print("\1h\1w    /join \1c#channel\1n  Join a Channel/Room\r\n");
		console.print("\1h\1w    /part \1c#channel\1n  Leave a Channel/Room\r\n");
		console.print("\1h\1w    /quit \1c        \1n  Quit IRC\1n \r\n");
		
		console.print("\1n \r\n\1h\1yIf you continue, say hello, and hang around for a few minutes.\r\n\1h\1mREADME README\1k: \1nSelect \"NO\" below to actually enter chat.\r\n\r\n");
		if (!confirm("Return to Main Menu instead")) {
			//system.node_list[bbs.node_num-1].action=bbs.node_action=NODE_MCHT;
			//load('irc.js','localhost','6667','#bbs');
			//load('irc.js','vert.synchro.net','6667','#bbs');
			
			bbs.exec_xtrn('irc');
		}
		console.line_counter = 0;
		console.clear();
		
		//bbs.menu.chat();
	}
	
	options['!'] = "bbs.qwk_sec();";
	options['Q'] = "bbs.qwk_sec();";
	options['S'] = "bbs.menu.system();";
	options[';'] = "if (user.compare_ars('SYSOP')) {console.print('\\r\\n\1nSysop Command: ');  bbs.exec('*str_cmds ' + console.getstr(40));}";
	options['O'] = "console.clear();load('ansislow.js','bbslist');console.pause();"; //"console.clear();load('sbbsdefs.js');bbs.show('bbslist');console.line_counter=1;"; //"bbs.exec('?otherbbs.js');";
	options['X'] = "console.clear();load('ansislow.js','bbslist');bbs.hangup();"; //"console.clear();load('sbbsdefs.js');bbs.show('bbslist');console.line_counter=1;"; //"bbs.exec('?otherbbs.js');";

	//run basic menu processor
	bbs.menu.show_simple("rn/main","Main: ",options,NODE_MAIN,true);
	bbs.sys_status |= SS_ABORT; //set ctrl-c/abort status
}

//add jump points / globals
//  note =XTRNCODE are added in bbs.menu.show_simple
//
// bbs.menu.jumps["CODE"] = "COMMAND";
//     command is  =CODE  at a menu prompt
bbs.menu.jumps["MAIN"] = "bbs.menu.main();";
bbs.menu.jumps["MESSAGE"] = "load('mods.trn.msg_sec.js');";
bbs.menu.jumps["MSG"] = "bbs.menu.message();";
//bbs.menu.jumps["FILE"] = "bbs.menu.file();";
bbs.menu.jumps["SYSTEM"] = "bbs.menu.system();";
bbs.menu.jumps["CONFIG"] = function() {
	if (user.compare_ars("GUEST")) {
		console.clear();
		print("Guest access restricted. (email tracker1@theroughnecks.net)");
		return;
	}
	bbs.user_config();
}
bbs.menu.jumps["CFG"] = "bbs.user_config();";
bbs.menu.jumps["XTRN"] = "load('mods.vanguard.assault.xtrn_sec.js');";
bbs.menu.jumps["GAMES"] = "bbs.menu.doors();"; //"bbs.xtrn_sec();"
bbs.menu.jumps["EMAIL"] = function() {
	if (user.compare_ars("GUEST")) {
		console.clear();
		print("Guest access restricted. (email tracker1@theroughnecks.net)");
		return;
	}
	bbs.menu.email();
}
bbs.menu.jumps["CHAT"] = "bbs.exec('*chat_sec');"; //"bbs.menu.chat();" //"bbs.exec('*chat_sec');";
bbs.menu.jumps["QWK"] = "bbs.exec('*qwk_sec');";
bbs.menu.jumps["X"] = "bbs.logoff();";
bbs.menu.jumps["HELP"] = "bbs.menu('s3/jumphelp');";
bbs.menu.jumps["EXPERT"] = "user.settings^=USER_EXPERT;";
bbs.menu.jumps["?"] = "bbs.menu('s3/jumphelp');";

console.line_counter=0;
bbs.sys_status &= ~SS_ABORT; //clear ctrl-c/abort status
bbs.menu.jump("MAIN"); //launch main menu's Jump point.
