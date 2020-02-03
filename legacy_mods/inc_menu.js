/*****************************************************************************
                       Synchronet 3 Menu Include
------------------------------------------------------------------------------
FILE NAME : inc_menu.js
VERSION   : 1.1
CREATED BY: Michael J. Ryan (tracker1[at]theroughnecks.net)
CREATED ON: 2002-11-15
LAST MOD  : 2002-11-29
------------------------------------------------------------------------------
Requires Synchronet v3.10k or newer.

This file includes helper functions for menu input processing.
---
1.1
changes, a few fixes, and additions for better support of ansi, without
a separate prompt.
---
1.0
initial release.
*****************************************************************************/

load("sbbsdefs.js"); //load SBBS Definitions

//ansi keys
var	  KEY_UP		='\x1e'		/* ctrl-^ (up arrow)						*/
var	  KEY_DOWN		='\x0a'		/* ctrl-j (dn arrow)						*/
var   KEY_RIGHT		='\x06'		/* ctrl-f (rt arrow)						*/
var	  KEY_LEFT		='\x1d'		/* ctrl-] (lf arrow)						*/
var	  KEY_HOME		='\x02'		/* ctrl-b (home)							*/
var   KEY_END       ='\x05'		/* ctrl-e (end)								*/
var	  KEY_BACK		='\x08'		/* ctrl-h (back) aka '\b'					*/
var   KEY_DEL       ='\x7F'		/* (del)	  								*/

if (!bbs.menu)
	bbs.menu = {}; //holds static variables.

bbs.menu.version = 1.0; //bbs.menu version.
bbs.menu.jumps = new Array(); //array to hold jump-to commands
bbs.menu.jumpto = ""; //string to hold the next jump
bbs.menu.jumpdefault = ""; //string to hold the last jump point
bbs.timeout_warn = 180; //180 second default timeout warning
bbs.timeout_hangup = 300; //300 second default timeout hangup

bbs.menu.shell = user.command_shell; /*
set shell reference, used for menu fallout for shell change
	If the user.command_shell is different from THIS setting, it will drop out
	of any loaded menus.  used for a config change.                         */
	
bbs.menu.findUser = function(inName) {
//	finds username(s) from the inputed string
//
//	if a single match returns the user_id
//	...or...
//	displays matches found, returns 0
	
	var arrMatches = new Array();

	if ((inName.indexOf("#") == 0)&&(!isNaN(inName.substring(1,inName.length)))) {
		var iUser = parseInt(inName.substring(1,inName.length));
		if ((iUser > 0)&&(iUser <= system.stats.total_users))
			return iUser;
	}


	var iRet = system.matchuser(inName);
	if (iRet == 0) {
		console.print("\1nExact match not found.\r\n");
		if (inName.length < 3) {
			console.print("\1h\1yEntry too short to search for.\r\n");
			return 0;
		}else{
			console.print("Searching.")
		}


		var oUser = new User(1);
		var sUser = "";
		for (var i=0; i <= system.stats.total_users; i++) {
			if (((system.node_list[bbs.node_num-1].misc&NODE_NMSG) != 0)||((system.node_list[bbs.node_num-1].misc&NODE_MSGW) != 0)) {
				console.print("\r\n");
				sleep(100);
				bbs.nodesync();
				sleep(100);
				console.print("\1h\1nContinuing search...")
			}
			if ((i%5) == 0) {
				console.print(".")
			}
			oUser.number = i; //change to next user.

			if (oUser.alias.toLowerCase().indexOf(inName.toLowerCase()) >= 0) {
				arrMatches[arrMatches.length] = i;
				sUser = oUser.alias;
			}else if (oUser.name.toLowerCase().indexOf(inName.toLowerCase()) >= 0) {
				arrMatches[arrMatches.length] = i;
				sUser = oUser.name;
			}else if (oUser.handle.toLowerCase().indexOf(inName.toLowerCase()) >= 0) {
				arrMatches[arrMatches.length] = i;
				sUser = oUser.handle;
			}
		}
		console.print("\r\n");
		if (arrMatches.length < 1) {
			//No matches found
			console.print("\1h\1yNo matches found.\r\n");
		} else if (arrMatches.length == 1) {
			//1 match found, use that match
			console.print("\1h\1c1 match found: \1w"+sUser+"\1n\r\n");
			iRet = arrMatches[0];
		} else {
			//Multiple Matches, Display Matches, still returns 0
			console.print("" +
				"\1n\1h\1w\r\n" +
				(arrMatches.length + 1) +
				"\1n\1c matches found:" +
				"\r\n");
			for (var i=0; i<arrMatches.length; i++) {
				oUser.number = arrMatches[i];
				var s = "                                                                               "
				console.print("" +
					"     \1n\1h\1c" + (oUser.alias + s).substring(0,25) +
					" \1n\1c" + (oUser.handle + s).substring(0,8) +
					"  \1h\1b" + (oUser.name + s).substring(0,35) +
					"\r\n");
			}
			console.print("\r\n");
		}
	}
	return iRet
}
	
bbs.send_mail = function() {
	//will get an email address from the user, and call netmail,
	//or email as appropriate.
	
	var found = false; //input check
	while (bbs.online && (!found)) {
		//show input prompt.
		console.print("\1n\r\n\1h\1yEnter username, or email address.\r\n\1n: ");
		
		//get email address
		if (!bbs.menu.input) bbs.menu.input = "";
		bbs.menu.input = console.getstr(bbs.menu.input,65,K_EDIT|K_LINE|K_AUTODEL).toLowerCase();
		
		var iUser = false; //for bbs email
		if (bbs.menu.input == "")
			found = true; //if blank, abort
		else if (bbs.menu.input.match(/[^@]+@[^@]+/)) //if @ sign, netmail
			found = true; //internet address
		else {
			iUser = bbs.menu.findUser(bbs.menu.input); //match user
			if (iUser >= 1)
				found = true; //user found.
		}
	}
	
	if (found) {
		console.print("\r\n"); //spacer
		if (iUser) {
			bbs.email(iUser); //local email
		}else if(bbs.menu.input.match(/[^@]+@[^@]+/)) {
			bbs.netmail(bbs.menu.input);
		}
	}
}

bbs.menu.msg_prev_group = function() {
	var iTries = 0;
	var x = bbs.curgrp - 1;
	while (iTries < grp_list.length && (!(user.compare_ars(msg_area.grp_listgrp_list[x].ars)) && (!msg_area.grp_listgrp_list[x].sub_list.length))) {
		iTries++;
		if (x < 0)
			x = grp_list.length - 1;
		else
			x--;
	}
	bbs.curgrp = x;
}

bbs.menu.msg_next_group = function() {
	var iTries = 0;
	var x = bbs.curgrp + 1;
	while (iTries < grp_list.length && (!(user.compare_ars(msg_area.grp_listgrp_list[x].ars)) && (!msg_area.grp_listgrp_list[x].sub_list.length))) {
		iTries++;
		if (x >= grp_list.length)
			x = 0;
		else
			x++;
	}
	bbs.curgrp = x;
}

bbs.menu.msg_select_subboard = function() {
	//list and select a subboard for the current group
	console.print("\1n\1l\1r" +
		"ßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßß\r\n\1h\1y" + 
		"  Sub-boards of " + msg_area.grp_list[bbs.curgrp].name + "\r\n\1n" + 
		"ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ\r\n");
	var grp_subs = msg_area.grp_list[bbs.curgrp].sub_list;
	for (var i=0; i<grp_subs.length; i++)
		if (grp_subs[i].can_read)
			console.print("\1h\1y" + ((i==bbs.cursub)?"* ":"  ") + ((i+1)+"   ").substr(0,3) +  "\1k - \1b" + grp_subs[i].name + "\r\n");

	console.print("\1n\1h\1kÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ\r\n");
	console.print('\1nSelect a Sub-Board: ');
	bbs.cursub = parseInt(console.getnum(grp_subs.length)) - 1;
}

bbs.menu.msg_select_group = function() {
	//list and select a group, then a subboard.
	console.print("\1n\1l\1r" +
		"ßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßß\r\n\1h\1y" + 
		"  MESSAGE GROUPS                        \r\n\1n" + 
		"ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ\r\n");
	
	var last_grp = bbs.cursub;	
	var grp_list = msg_area.grp_list;
	for (var i=0; i<grp_list.length; i++)
		if (user.compare_ars(grp_list[i].ars) && grp_list[i].sub_list.length)
			console.print("\1h\1y" + ((i == bbs.curgrp)?"* ":"  ") + ((i+1)+"   ").substr(0,3) +  "\1k - \1b" + grp_list[i].name + "\r\n");
	
	console.print("\1n\1h\1kÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ\r\n");
	console.print("\1nSelect a Group: ");
	
	var iTries = 0;
	var x = parseInt(console.getnum(grp_list.length)) - 1;
	while (iTries < grp_list.length && (!(user.compare_ars(grp_list[x].ars)) && (!grp_list[x].sub_list.length))) {
		iTries++;
		if (x >= grp_list.length)
			x = 0;
		else
			x++;
	}
	bbs.curgrp = x;
	if (bbs.curgrp != last_grp) bbs.cursub = 0;
		
	console.print(msg_area.grp_list[bbs.curgrp].name + " " + bbs.cursub  + "\r\n");
	console.pause();
	
//	bbs.menu.msg_select_subboard();
}

bbs.menu.file_select_directory = function() {
	//list and select a directory for the current library
	//list and select a subboard for the current group
	console.print("\1n\1l\1r" +
		"ßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßß\r\n\1h\1y" + 
		"  Directories of " + file_area.lib_list[bbs.curlib].name + "\r\n\1n" + 
		"ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ\r\n");
	var lib_dirs = file_area.lib_list[bbs.curlib].dir_list;
	for (var i=0; i<lib_dirs.length; i++)
		console.print("\1h\1y" + ((i==bbs.curdir)?"* ":"  ") + ((i+1)+"   ").substr(0,2) +  "\1k - \1b" + lib_dirs[i].name + "\r\n");

	console.print("\1n\1h\1kÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ\r\n");
	console.print('\1nSelect a Directory: ');
	bbs.curdir = console.getnum(lib_dirs.length)-1;
}
	
bbs.menu.file_select_library = function() {
	//list and select a group, then a subboard.
	console.print("\1n\1l\1r" +
		"ßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßßß\r\n\1h\1y" + 
		"  FILE LIBRARIES                        \r\n\1n" + 
		"ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ\r\n");
		
	var lib_list = file_area.lib_list;
	for (var i=0; i<lib_list.length; i++)
		console.print("\1h\1y" + ((i==bbs.curlib)?"* ":"  ") + ((i+1)+"   ").substr(0,2) +  "\1k - \1b" + lib_list[i].name + "\r\n");
	
	console.print("\1n\1h\1kÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ\r\n");
	console.print("\1nSelect a Library: ");
	bbs.curlib = console.getnum(lib_list.length)-1;
	bbs.menu.file_select_directory();
}

bbs.menu.baja = function(input) {
	// input is written to a temp file in the exec folder, compiled, run, then deleted
	
	var f = new File(system.exec_dir+"/temp_" + bbs.node_num + ".src")
	if (!f.open("w")) { //should NEVER happen
	    var errmsg = "!ERROR: Unable to write to temp file. (eval_baja:" + strFileName + ")";
	    log(errmsg);
	    console.print(errmsg);
	    return false;
	}else{
		f.write(input + "\r\n");
		f.close();
		
/*************************
TODO: Add EX_NATIVE attribute for exec call...
*****************************/
		if (system.os_version.toLowerCase().indexOf("windows") >= 0)
			bbs.exec("baja /o temp_" + bbs.node_num + ".src",0,system.exec_dir);
		else
			bbs.exec("baja /o temp_" + bbs.node_num + ".src",0,system.exec_dir);
			
		bbs.exec("*temp_" + bbs.node_num);
		
		file_remove(system.exec_dir+"/temp_" + bbs.node_num + ".src");
		file_remove(system.exec_dir+"/temp_" + bbs.node_num + ".bin");
	}
	f = null;
}

bbs.menu.mnu_number = function(inNumber,iMax) {
	//gets numeric input for a menu prompt
	
	var sRet = "" + inNumber; //string to return
	var bDone = false; //check for completion of input
	
	//show the starting number	
	console.print(inNumber);
	while (bbs.online && (!bDone)) {
		//if the length of the input matches a max value's length
		if ((sRet.length >= iMax.toString().length)||((sRet.length == iMax.toString().length-1)&&(parseInt(sRet.substr(0,1)) > parseInt(iMax.toString().substr(0,1))))) {
			bDone = true;
			continue;
		}

		//get input
		var c = console.getkey();
		
		//if no input, sleep then continue
		if (c == "") {
			sleep(200);
			continue;
		} else {
			//determin input - only numeric keys allowed
			switch (c.toString()) {
				case KEY_BACK:
				case KEY_DEL:
					//cut the length of the string.
					sRet = sRet.substr(0,sRet.length-1);
					
					console.ansi_left(1);
					console.print(" ");
					console.ansi_left(1);
					if (sRet.length <= 0)
						bDone = true;
					break;
				case "\r":
				case "\n":
					//return input on cr or lf.
					bDone = true;
					break;
				default:
					if (!isNaN(c)) {
						sRet += "" + c;
						console.print(c);
						break;
					}
					//sleep on bad input.
					sleep(200);
			}
		}
	}
	
	if (sRet != "") {
		//clear visible input, if needed, will be redrawn, by calling function.
		console.ansi_left(sRet.length);
		console.print("                                             ".substr(0,sRet.length));
		console.ansi_left(sRet.length);
	}
	
	//return input, or empty string.
	return "" + sRet;
}

bbs.menu.checkTimeout = function(reset) {
	//checks for a timeout display
	//	reset = boolean, if true, will reset the clock.
	if (reset) {
		console.timeout = parseInt((new Date()).valueOf()/1000);
		return;
	}
	if (console.status&CON_NO_INACT)
		return true; //no inactivity timeout set
		
	if (((console.timeout+bbs.timeout_warn)*1000) < (new Date()).valueOf()) {
		console.line_counter = 0;
		console.ansi_left(80);
		console.clearline();
		console.putmsg(bbs.text(668));
		while (bbs.online && (console.inkey() == "") && ((bbs.sys_status & SS_ABORT) == 0)) {
			if (((console.timeout+bbs.timeout_hangup)*1000) < (new Date()).valueOf()) {
				console.putmsg("\r\n" + bbs.text(558) + "\r\n");
				bbs.hangup();
			}
				
			sleep(250); //sleep 1/4 second
		}
		if (bbs.sys_status & SS_ABORT)
			bbs.sys_status ^= SS_ABORT;
			
		bbs.menu.reprompt = true; //redraw menu prompt
		console.line_counter = 0;
		console.ansi_left(80);
		console.clearline();
	}
}

bbs.menu.show_prompt = function(strMenu,strPrompt,arrOptions,number_max,iAction,bExpertPrompt) {
	//display a menu, and promps, retrieve input, and return matching input.
	
	var cmd = "";
	var cmd_set = false;
	
	var allow_numeric = !(!number_max);

	bbs.menu.redraw = (user.settings&USER_EXPERT)?false:true; //Show Menu Text
	bbs.menu.reprompt = true; //always draw prompt
		
	if (!bbs.menu.redraw)
		/* Expert Mode Prompt */ console.print("\r\n\1n\1h\1k[\1n"+strMenu+"\1h\1k]  (\1b'\1y?\1b' help, '\1y=EXPERT\1b' toggle expert\1k)\1n\r\n");
	
	bbs.menu.checkTimeout(true); //reset timeout
		
	while (bbs.online && !cmd_set) {
		//at a dynamic prompt, no pauses needed
		bbs.menu.prompt = true;
		bbs.menu.paused = false;
		
		//reset global expert_prompt setting.
		if (bExpertPrompt)
			bbs.menu.expertprompt = true;
		else
			bbs.menu.expertprompt = false;

				
		//display menu
		if (bbs.menu.redraw) {
			log("429action: " + iAction);
			system.node_list[bbs.node_num-1].action = bbs.node_action = iAction;
			
			bbs.menu.redraw = false;
			if (!bbs.menu.expertprompt)
				bbs.menu.reprompt = true;
				
			var iTemp = console.screen_rows;
			console.screen_rows = 99;
			bbs.menu(strMenu);
			console.screen_rows = iTemp;
			continue;
		}
			
		
		//display prompt
		if (bbs.menu.reprompt) {
			if ((user.settings&USER_EXPERT)||(!bbs.menu.expertprompt)) {
				console.ansi_left(99);
				console.clearline();
				console.putmsg("\1n" + strPrompt + "\1n" + cmd);
			}
			if (system.node_list[bbs.node_num-1].action != iAction) {
				log("452action: " + iAction);
				system.node_list[bbs.node_num-1].action = bbs.node_action = iAction;
				system.node_list[bbs.node_num-1].misc|=NODE_UDAT;
				sleep(100);
			}
			bbs.menu.reprompt = false;
			
			continue;
		}
		
		//get input
		var c = console.inkey(K_NOECHO, 900).toUpperCase();
		console.line_counter = 0; //reset line counter, new input.
		
		//if nothing inputted
		if (c == "") {
			if (bbs.sys_status & SS_ABORT) {
				//ctrl-c pressed
				
				return ""; 
				
	 		} else if (((system.node_list[bbs.node_num-1].misc&NODE_NMSG) != 0)||((system.node_list[bbs.node_num-1].misc&NODE_MSGW) != 0)) {
		 		//awaiting messages, display them
				
				//clear current prompt
				console.ansi_left(80);
				console.clearline();
				
				//display awaiting messages
				console.line_counter = 0;
				console.print("\x010\1n\1l\1cIncomming Messsage(s) \r\n\r\n\1k---\1n\r\n");
				sleep(500); //sleep before to let any messages finish.
				while (((system.node_list[bbs.node_num-1].misc&NODE_NMSG) != 0)||((system.node_list[bbs.node_num-1].misc&NODE_MSGW) != 0)) {
					bbs.nodesync();
					sleep(1000); //longer wait after message (sometimes multiple msgs from logon/off).
				}
				console.print("\1h\1k---\1n\r\n");
				
				//set prompt to redraw
				if (bExpertPrompt)
					bbs.menu.redraw = true; //expert prompt, prompt in ansi otherwise
				else
					bbs.menu.reprompt = true;
					
				bbs.menu.paused = false;
				bbs.sys_status &= ~SS_ABORT;
				while (console.inkey() != "") {
					//do nothing	
				};
				console.pause();
				continue;
			} 
			/* TIMEOUT IS BROKEN!
			
			 else		
				bbs.menu.checkTimeout(); //check for timeout
			*/	
			continue;
		}
		
		bbs.menu.checkTimeout(true); //key entered, reset timeout
		
		//test for input changes, and for ?		
		switch(c) {
			//cr or lf - return existing input.
			case "\r":
			case "\n":
				return cmd;
				break;
			//help key - redraw menu
			case "?":
				if (cmd == "") {
					console.print("?");
					bbs.menu.redraw = true;
					continue;
				}
				break;
			case KEY_BACK:
			case KEY_DEL:
				if (cmd.length > 0)
					{
					cmd = cmd.substr(0,cmd.length-1);
					console.ansi_left();
					console.print(" ");
					console.ansi_left();
					}
				else
					cmd_set = true;
				break;
			default:
				//if a number is inputted, get/return numeric input
				if (allow_numeric && (!isNaN(c)) && (c > 0)) {
					cmd = mnu_number(c,number_max);
					if (cmd != "") {
						console.print("\1h\1n"+cmd);
						cmd_set = true;
					}
				}
				break;
		}
			
		//check against existing commands
		var matched = false;
		var matches = 0;
		for (i in arrOptions) {
			var cmd_tmp = i.toUpperCase();
			if (cmd_tmp.indexOf(cmd + c) == 0) {
				matches++; //increment matches count
				
				//if exact match, and user has hotkeys on.
				if ((cmd_tmp == cmd+c)&&((user.settings&USER_COLDKEYS)==0))
					cmd_set = true;
			}
		}
		if (matches > 0) {
			cmd += c;
			console.print("\1h\1n"+c);
			if (matches > 1)
				cmd_set = false; // no autoreturn when more than one match
		}
	}

	bbs.menu.prompt = false; //no longer at a dynamic prompt
	return cmd;
}

bbs.menu.show_simple = function(strMenu,strPrompt,arrOptions,iAction,bExpertPrompt) {
	//uses mnu_prompt to get input, and executes the appropriate command.
	//  does NOT allow for numeric input.
	//if bExpertPrompt, will ONLY show the prompt for users in expert mode
	//	ie, the prompt is *IN* the ans/asc file
	
	//globals to launch an xtrn
	for (var i=0; i<xtrn_area.sec_list.length; i++) {
		var xa = xtrn_area.sec_list[i];
		for (var j=0; j<xa.prog_list.length; j++) {
			var xp = xa.prog_list[j];
			if (xp.can_run)
				arrOptions["="+xp.code] = "bbs.exec_xtrn('"+xp.code+"');console.pause();";
		}
	}
	
	//globals for jump-points
	for (i in bbs.menu.jumps)
		arrOptions['='+i] = (i==bbs.menu.jumpdefault)?"bbs.menu.jumpto='"+i+"';":bbs.menu.jumps[i];
	
	while (bbs.online) {
		//set status
		if (iAction >= 0) {
			log("597action: " + iAction);
			system.node_list[bbs.node_num-1].action = bbs.node_action = iAction;
		}
		
		//show menu, and get input.
		var cmd = bbs.menu.show_prompt(strMenu,strPrompt,arrOptions,0,iAction,bExpertPrompt);
		console.print("\r\n");
		console.line_counter = 0;
		
		//ctrl-c pressed
		if (bbs.sys_status & SS_ABORT) {
			return;
		}
		
		for (i in arrOptions)
			if (cmd.replace(/^$/,"\r") == i)
				if (typeof(arrOptions[i]) != typeof(Function) && arrOptions[i].indexOf("return") == 0)
					return;
				else {
					console.line_counter = 0; //reset line counter.
					if (typeof(arrOptions[i]) == typeof(Function))
						arrOptions[i]();
					else
						eval(arrOptions[i]);
						
					if (console.line_counter) { //if line count, pause before return.
						console.print("\r\n");
						console.pause();
						console.line_counter = 0;
					}
				}

		//force any update changes active
		console.line_counter = 0;
		system.node_list[bbs.node_num-1].misc|=NODE_UDAT;
		bbs.nodesync();
		sleep(100);
		if (bbs.menu.shell.toUpperCase() != user.command_shell.toUpperCase()) {			
			//return from menu/shell
			return;
		}
		if (bbs.menu.jumpto != "") {
			//return for jump to menu
			return;
		}
	}
}

bbs.menu.jump = function(strDefault) {
	bbs.menu.jumpto = strDefault;
	bbs.menu.jumpdefault = strDefault;
	
	while ((bbs.online)&&(bbs.menu.jumpto != "")) {
		for (i in bbs.menu.jumps) {
			if (i.toUpperCase() == bbs.menu.jumpto.toUpperCase()) {
				bbs.menu.jumpto = ""; //clear for fallout/back
				eval(bbs.menu.jumps[i]);
				if (i != bbs.menu.jumpdefault)
					bbs.menu.jumpto = bbs.menu.jumpdefault;
			}
		}
		
		//ctrl-c pressed
		if (bbs.sys_status & SS_ABORT) {
			bbs.sys_status ^= SS_ABORT;
			return;
		}
		
		if (bbs.menu.shell != user.command_shell)
			return;
	}
}