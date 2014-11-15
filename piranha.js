/*****************************************************************************
                         Synchronet 3 Command Shell
------------------------------------------------------------------------------
FILE NAME : s3.js
VERSION   : 1.1
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

print("\1n\1lLoading Piranha Command Shell...\r\n\r\n");

//dissable inactivity warning.
console.status |= CON_NO_INACT;

load("inc_menu.js"); //load helper functions
bbs.timeout_warn = 180; //180 second default timeout warning
bbs.timeout_hangup = 300; //300 second default timeout hangup

bbs.menu.email = function() {
	//options and commands to perform
	var options = new Array();
	options['R'] = "bbs.read_mail();";
	options['W'] = "bbs.send_mail();";
	options['S'] = "bbs.email(1,null,null,'feedback');";
	options['Q'] = "return;";
	options['\r'] = "return;";

	//basic menu, will display the menu text & prompt
	//  then get the available input, and execute the associated command.
	bbs.menu.show_simple("piranha/email","Email: ",options,NODE_RMAL,true);
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
	bbs.menu.show_simple("piranha/message_scan_config","Message Scan Config: ",options,NODE_RMSG);
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
	bbs.menu.show_simple("piranha/message_scan","Message Scan: ",options,NODE_RMSG);
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
	bbs.menu.show_simple("piranha/message","[@GRP@ - @SUB@] Message: ",options,NODE_RMSG,true);
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
	bbs.menu.show_simple("piranha/files_search_config","File Search Config: ",options,NODE_XFER);
}

bbs.menu.file_search = function() {
	//options and commands to perform
	var options = new Array();
	options['N'] = "bbs.scan_dirs(FL_ULTIME);";
	//doesn't work   options['D'] = "console.print('\\r\\n\\1c\\1hFind Text in File Descriptions (no wildcards)\\r\\n\\1n: ');bbs.cmdstr(console.getstr(40));bbs.scan_dirs(FL_EXFIND);";
	//doesn't work   options['F'] = "bbs.cmdstr(bbs.get_filespec());bbs.scan_dirs(0);";
	options['D'] = "console.print('\\r\\n\\1c\\1hFind Text in File Descriptions (no wildcards)\\r\\n\\1n: ');bbs.menu.baja('file_find_text');";
	options['F'] = "console.print('\\r\\n\\1n\\1c\\1hSearch for Filename(s)\\r\\n');bbs.menu.baja('file_find_name');";
	options['C'] = "bbs.menu.file_search_config();";
	options['Q'] = "return;";
	options['\r'] = "return;";
	
	//basic menu, will display the menu text & prompt
	//  then get the available input, and execute the associated command.
	bbs.menu.show_simple("piranha/files_search","File Search: ",options,NODE_XFER);
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
	bbs.menu.show_simple("piranha/files_info","Info: ",options,NODE_XFER);
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
	//doesn't work....  options['V'] = "bbs.list_files(file_area.lib_list[bbs.curlib].dir_list[bbs.curdir].code);";
	//doesn't work....  options['E'] = "bbs.list_file_info(file_area.lib_list[bbs.curlib].dir_list[bbs.curdir].code);";
	options['V'] = "bbs.menu.baja(\"setstr *.*\\r\\nfile_list\");";
	options['E'] = "console.print(\"l\\r\\n\1c\1hList Extended File Information\\r\\n\");bbs.menu.baja(\"getfilespec\\r\\nif_true\\r\\nfile_list_extended\\r\\nend_if\\r\\n\");";
	options['T'] = "bbs.temp_xfer();";
	options['A'] = "console.print('\\r\\n\\1c\\1hView File(s)\\r\\n'); bbs.list_files(bbs.curdir,FL_VIEW);";
	options['R'] = "console.print('\\r\\n\\1c\\1hRemove/Edit File(s)\\r\\n'); file_remove(bbs.get_filespec());";
	options['I'] = "bbs.menu.file_info();";
	options['G'] = "console.print('l\\r\\n\\1w\\1hDownload File(s)\\r\\n');bbs.menu.baja('\\r\\nfile_download_batch\\r\\nif_true\\r\\ngoto end\\r\\nend_if\\r\\ngetfilespec\\r\\nif_true\\r\\nfile_download\\r\\nend_if\\r\\n:end');";
	options['/G'] = "console.print('l\\r\\n\\1w\\1hDownload File(s) from User(s)\\r\\n');bbs.menu.baja('FILE_DOWNLOAD_USER');";
	options['U'] = "console.print('l\\r\\n\\1w\\1hUpload File.\\r\\n');bbs.upload_file('UPLOADS');";
	options['/U'] = "console.print('l\\r\\n\\1w\\1hUpload File to User.\\r\\n');bbs.upload_file('USER');";
	options['//U'] = "console.print('l\\r\\n\\1w\\1hUpload File to Sysop.\\r\\n');bbs.upload_file('SYSOP');";
	options['B'] = "bbs.batch_menu();";
	options['Q'] = "return;";

	//basic menu, will display the menu text & prompt
	//  then get the available input, and execute the associated command.
	bbs.menu.show_simple("piranha/files","[@LIB@ - @DIR@] Files: ",options,NODE_XFER,true);
}

bbs.menu.system = function() {
	//options and commands to perform
	var options = new Array();
	options['C'] = "bbs.user_config();";
	options['Y'] = "bbs.user_info();";
	options['S'] = "bbs.sys_info();";
	options['V'] = "bbs.ver();";
	options['M'] = "bbs.sub_info();";
	options['U'] = "bbs.list_users();";
	options['L'] = "bbs.list_logons();";
	options['Q'] = "return;";
	options['\r'] = "return;";
	
	bbs.menu.show_simple("piranha/system","System: ",options,NODE_DFLT);
}

bbs.menu.main = function() {
	//options and commands to perform
	var options = new Array();
	options['E'] = "bbs.menu.email();";
	options['R'] = "bbs.read_mail();"; //READ EMAIL - Hidden
	options['W'] = "bbs.send_mail();"; //WRITE EMAIL - Hidden
	options['M'] = "bbs.menu.message();";
	options['A'] = "bbs.exec('?pa_automsg.js');";
	options['F'] = "bbs.menu.file();";
	options['T'] = "bbs.text_sec();";
	options['X'] = "bbs.xtrn_sec();";
	options['C'] = "bbs.exec('*chat_sec');";
	options['Q'] = "bbs.qwk_sec();";
	options['S'] = "bbs.menu.system();";
	options[';'] = "if (user.compare_ars('SYSOP')) {console.print('\\r\\n\1nSysop Command: ');  bbs.exec('*str_cmds ' + console.getstr(40));}";
	options['O'] = "bbs.logoff();";
	options['/O'] = "bbs.hangup();";
	
	//run basic menu processor
	bbs.menu.show_simple("piranha/main","Main: ",options,NODE_MAIN,true);
}

//add jump points / globals
//  note =XTRNCODE are added in bbs.menu.show_simple
//
// bbs.menu.jumps["CODE"] = "COMMAND";
//     command is  =CODE  at a menu prompt
bbs.menu.jumps["MAIN"] = "bbs.menu.main();";
bbs.menu.jumps["MESSAGE"] = "bbs.menu.message();";
bbs.menu.jumps["MSG"] = "bbs.menu.message();";
bbs.menu.jumps["FILE"] = "bbs.menu.file();";
bbs.menu.jumps["SYSTEM"] = "bbs.menu.system();";
bbs.menu.jumps["CONFIG"] = "bbs.user_config();";
bbs.menu.jumps["CFG"] = "bbs.user_config();";
bbs.menu.jumps["XTRN"] = "bbs.xtrn_sec();";
bbs.menu.jumps["GAMES"] = "bbs.xtrn_sec();";
bbs.menu.jumps["EMAIL"] = "bbs.menu.email();";
bbs.menu.jumps["CHAT"] = "bbs.exec('*chat_sec');";
bbs.menu.jumps["QWK"] = "bbs.exec('*chat_sec');";
bbs.menu.jumps["X"] = "bbs.logoff();";
bbs.menu.jumps["HELP"] = "bbs.menu('piranha/jumphelp');";
bbs.menu.jumps["EXPERT"] = "user.settings^=USER_EXPERT;";
bbs.menu.jumps["?"] = "bbs.menu('piranha/jumphelp');";

console.line_counter=0;
bbs.menu.jump("MAIN"); //launch main menu's Jump point.
