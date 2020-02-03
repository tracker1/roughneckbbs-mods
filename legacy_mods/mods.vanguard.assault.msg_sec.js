/* $Id$ */
/* Message Section Replacement. */
/* Created By tracker1(at)theroughnecks(dot)net */

/* Begin includes ************************************************************/
load("sbbsdefs.js");
load("mods.vanguard.selectList.js"); //selectList tool
load("mods.vanguard.ansislow.js"); //ansi display control

if (!bbs.mods) bbs.mods = {}
if (!bbs.mods.vanguard) bbs.mods.vanguard = {}
if (!bbs.mods.vanguard.assault) bbs.mods.vanguard.assault = {}
if (!bbs.mods.vanguard.assault.msg_sec) bbs.mods.vanguard.assault.msg_sec = {}
/* End includes **************************************************************/

/* Begin selectListSettings **************************************************/
bbs.mods.vanguard.assault.msg_sec.select_options = {};
bbs.mods.vanguard.assault.msg_sec.select_options.x1 = 53;
bbs.mods.vanguard.assault.msg_sec.select_options.y1 = 12;
bbs.mods.vanguard.assault.msg_sec.select_options.x2 = 79;
bbs.mods.vanguard.assault.msg_sec.select_options.y2 = 22;
/* End selectListSettings ****************************************************/

/* Begin Initialize selectLists **********************************************/
bbs.mods.vanguard.assault.msg_sec.options = {}

bbs.mods.vanguard.assault.msg_sec.options.mainExit = false;

bbs.mods.vanguard.assault.msg_sec.options.main = new Array();
bbs.mods.vanguard.assault.msg_sec.options.main["R"] = "Read Messages";
bbs.mods.vanguard.assault.msg_sec.options.main["P"] = "Post a Message";
bbs.mods.vanguard.assault.msg_sec.options.main["spacer1"] = "";
bbs.mods.vanguard.assault.msg_sec.options.main["N"] = "Scan New";
bbs.mods.vanguard.assault.msg_sec.options.main["Y"] = "Scan Yours";
bbs.mods.vanguard.assault.msg_sec.options.main["T"] = "Scan Text";
bbs.mods.vanguard.assault.msg_sec.options.main["spacer2"] = "";
bbs.mods.vanguard.assault.msg_sec.options.main["C"] = "Set Scan";
bbs.mods.vanguard.assault.msg_sec.options.main["K"] = "Set Scan (Yours)";
bbs.mods.vanguard.assault.msg_sec.options.main["S"] = "Set Pointers";
bbs.mods.vanguard.assault.msg_sec.options.main["spacer3"] = "";
bbs.mods.vanguard.assault.msg_sec.options.main["O"] = "Offline Mail";
bbs.mods.vanguard.assault.msg_sec.options.main["Q"] = "Quit";

bbs.mods.vanguard.assault.msg_sec.options.mainAction = new Array();
bbs.mods.vanguard.assault.msg_sec.options.mainAction["R"] = new Function("bbs.mods.vanguard.assault.msg_sec.read();");
bbs.mods.vanguard.assault.msg_sec.options.mainAction["P"] = new Function("bbs.mods.vanguard.assault.msg_sec.post();");
bbs.mods.vanguard.assault.msg_sec.options.mainAction["N"] = new Function("bbs.mods.vanguard.assault.msg_sec.scan_new();");
bbs.mods.vanguard.assault.msg_sec.options.mainAction["Y"] = new Function("bbs.mods.vanguard.assault.msg_sec.scan_yours();");
bbs.mods.vanguard.assault.msg_sec.options.mainAction["T"] = new Function("bbs.mods.vanguard.assault.msg_sec.scan_text();");
bbs.mods.vanguard.assault.msg_sec.options.mainAction["C"] = new Function("bbs.mods.vanguard.assault.msg_sec.cfg_scan();");
bbs.mods.vanguard.assault.msg_sec.options.mainAction["K"] = new Function("bbs.mods.vanguard.assault.msg_sec.cfg_yourscan();");
bbs.mods.vanguard.assault.msg_sec.options.mainAction["S"] = new Function("bbs.mods.vanguard.assault.msg_sec.cfg_pointers();");
bbs.mods.vanguard.assault.msg_sec.options.mainAction["O"] = new Function("bbs.mods.vanguard.assault.msg_sec.offline();");
bbs.mods.vanguard.assault.msg_sec.options.mainAction["Q"] = new Function("bbs.mods.vanguard.assault.msg_sec.options.mainExit = true;");

bbs.mods.vanguard.assault.msg_sec.options.mainList = new bbs.mods.vanguard.selectList(bbs.mods.vanguard.assault.msg_sec.options.main,bbs.mods.vanguard.assault.msg_sec.select_options.x1,bbs.mods.vanguard.assault.msg_sec.select_options.y1,bbs.mods.vanguard.assault.msg_sec.select_options.x2,bbs.mods.vanguard.assault.msg_sec.select_options.y2);
bbs.mods.vanguard.assault.msg_sec.options.mainList.showKeys = true;
bbs.mods.vanguard.assault.msg_sec.options.mainList.padText = true;
bbs.mods.vanguard.assault.msg_sec.options.mainList.ontick = null; //to be defined
bbs.mods.vanguard.assault.msg_sec.options.mainList.onkeypress = null; //to be defined
bbs.mods.vanguard.assault.msg_sec.options.mainList.onchange = null; //to be defined
/* End Initialize selectLists ************************************************/

// Method to load the ansi display.
bbs.mods.vanguard.assault.msg_sec.loadAnsi = function() {
	bbs.mods.vanguard.assault.msg_sec.options.reloadAnsi = false;
	console.line_counter = 0;
	console.clear();
	bbs.mods.vanguard.ansislow("vanguard/assault/msg_sec");
	console.line_counter = 0;
}

// handle raised/control characters
bbs.mods.vanguard.assault.msg_sec.ctrl_handler = function(k) {
	//display awaiting messages
	if (k == "" && ((system.node_list[bbs.node_num-1].misc&NODE_NMSG) != 0)||((system.node_list[bbs.node_num-1].misc&NODE_MSGW) != 0)) {
		console.line_counter = 0;
		console.print("\1"+"0\1n\1l\1cIncomming Messsage(s) \r\n\1h\1k---\1n\r\n");
		sleep(500); //sleep before to let any messages finish.
		while (((system.node_list[bbs.node_num-1].misc&NODE_NMSG) != 0)||((system.node_list[bbs.node_num-1].misc&NODE_MSGW) != 0)) {
			bbs.nodesync();
			sleep(1000); //longer wait after message (sometimes multiple msgs from logon/off).
		}
		console.print("\1h\1k---\1n\r\n");
		
		bbs.sys_status &= ~SS_ABORT;
		while (console.inkey() != "") {/*do nothing - clear buffer*/};
		console.pause();
		bbs.mods.vanguard.assault.msg_sec.options.reloadAnsi = true;
	} else if (k.charCodeAt(0) < 32) {
		console.line_counter = 0;
		console.clear();
		console.line_counter = 0;
		
		if (k.toString().length) {
			switch(k.charCodeAt(0)) {
				case 26: //ctrl-z - unfiltered input - ignore
					break;
				case 3: //ctrl-c
				case 27: //escape
					bbs.mods.vanguard.assault.msg_sec.options.mainExit = true;
					break;
				case 11: //ctrl-k - hotkey listing
				case 20: //ctrl-t - time listing
					console.handle_ctrlkey(k,0); // for now
					console.pause();
					break;
				default:
					console.handle_ctrlkey(k,0); // for now
					break;
			}
		}
		
		bbs.mods.vanguard.assault.msg_sec.options.reloadAnsi = true;
	}	
}

//returns a sub selection
bbs.mods.vanguard.assault.msg_sec.cursub = bbs.cursub; //default
bbs.mods.vanguard.assault.msg_sec.getsub = function(_group) {
	var iCount = 0;
	var iCurrent = 0;
	var options = new Array();
	var _grp = null;
	
	for (var i=0; i<msg_area.grp_list.length; i++)
		if (msg_area.grp_list[i].number == bbs.mods.vanguard.assault.msg_sec.curgrp)
			_grp = msg_area.grp_list[i]

	options[""] = "(back)";
	for (var i=0; i<_grp.sub_list.length; i++) {
		var _sub = _grp.sub_list[i];
		if (_sub.can_read || _sub.can_post) {
			if (_sub.number == bbs.mods.vanguard.assault.msg_sec.cursub)
				iCurrent = iCount;
				
			options[""+_sub.number] = _sub.name;
			
			iCount++;
		}
	}
	
	if (iCount == 0) {
		console.line_counter = 0;
		console.clear();
		console.print("\1n\1h\1rWarning:\1n \r\nThere are no areas in this group you can read or post to.");
		console.pause();
		bbs.mods.vanguard.assault.msg_sec.options.reloadAnsi = true;
	}	
	
	var sl = new bbs.mods.vanguard.selectList(options,bbs.mods.vanguard.assault.msg_sec.select_options.x1,bbs.mods.vanguard.assault.msg_sec.select_options.y1+3,bbs.mods.vanguard.assault.msg_sec.select_options.x2,bbs.mods.vanguard.assault.msg_sec.select_options.y2);
	sl.current = iCurrent + 1;
	sl.padText = true;
	
	bbs.mods.vanguard.assault.msg_sec.options.reloadAnsi = true;

	while (bbs.online && !bbs.mods.vanguard.assault.msg_sec.options.mainExit) {
		if (bbs.mods.vanguard.assault.msg_sec.options.reloadAnsi == true) {
			bbs.mods.vanguard.assault.msg_sec.loadAnsi();
			console.gotoxy(bbs.mods.vanguard.assault.msg_sec.select_options.x1,bbs.mods.vanguard.assault.msg_sec.select_options.y1);
			print("\1n\1"+"7\1k" + ("GROUP: \1b" + _grp.name + sl.padding).substring(0,bbs.mods.vanguard.assault.msg_sec.select_options.x2 - bbs.mods.vanguard.assault.msg_sec.select_options.x1+2));
			console.gotoxy(bbs.mods.vanguard.assault.msg_sec.select_options.x1,bbs.mods.vanguard.assault.msg_sec.select_options.y1+1);
			print("\1n\1"+"7\1k" + ("Select a sub." + sl.padding).substring(0,bbs.mods.vanguard.assault.msg_sec.select_options.x2 - bbs.mods.vanguard.assault.msg_sec.select_options.x1));
			console.gotoxy(bbs.mods.vanguard.assault.msg_sec.select_options.x1,bbs.mods.vanguard.assault.msg_sec.select_options.y1+2);
			print("\1n" + sl.padding.replace(/ /g,"-").substring(0,bbs.mods.vanguard.assault.msg_sec.select_options.x2 - bbs.mods.vanguard.assault.msg_sec.select_options.x1));
		}
		
		var k = sl.choose();
		if (sl.raised != null) {
			bbs.mods.vanguard.assault.msg_sec.ctrl_handler(sl.raised);
		} else if (k == "") {
			return "";
		} else {
			bbs.mods.vanguard.assault.msg_sec.cursub = parseInt(k);
			bbs.cursub = parseInt(k);
			for (var i=0; i<_grp.sub_list.length; i++) {
				if (_grp.sub_list[i].number == bbs.mods.vanguard.assault.msg_sec.cursub)
					return _grp.sub_list[i].code;
			}
		}
	}
}

//uses self and getsub to return a sub selection
bbs.mods.vanguard.assault.msg_sec.getgrp_subcount = function(_grp) {
	var ret = 0;
	for (var i=0; i<_grp.sub_list.length; i++)
		if (_grp.sub_list[i].can_read || _grp.sub_list[i].can_post)
			ret++
	return ret;
}

bbs.mods.vanguard.assault.msg_sec.curgrp = bbs.curgrp; //default
bbs.mods.vanguard.assault.msg_sec.getgrp = function() {
	var iCount = 0;
	var iCurrent = 0;
	var options = new Array();
	options[""] = "(back)";
	for (var i=0; i<msg_area.grp_list.length; i++) {
		var grp = msg_area.grp_list[i];
		if (user.compare_ars(grp.ars) && bbs.mods.vanguard.assault.msg_sec.getgrp_subcount(grp)) {
			if (grp.number == bbs.mods.vanguard.assault.msg_sec.curgrp) {
				iCurrent = iCount;
			}
			options[""+grp.number] = grp.name;
			
			iCount++;
		}
	}
		
	if (iCount == 0) {
		console.line_counter = 0;
		console.clear();
		console.print("\1n\1h\1rWarning:\1n \r\nThere are no groups with areas you can read or post to.");
		console.pause();
		bbs.mods.vanguard.assault.msg_sec.options.reloadAnsi = true;
		return "";
	}
			
	var sl = new bbs.mods.vanguard.selectList(options,bbs.mods.vanguard.assault.msg_sec.select_options.x1,bbs.mods.vanguard.assault.msg_sec.select_options.y1+2,bbs.mods.vanguard.assault.msg_sec.select_options.x2,bbs.mods.vanguard.assault.msg_sec.select_options.y2);
	sl.current = iCurrent + 1;
	sl.padText = true;
	
	bbs.mods.vanguard.assault.msg_sec.options.reloadAnsi = true;

	while (bbs.online && !bbs.mods.vanguard.assault.msg_sec.options.mainExit) {
		if (bbs.mods.vanguard.assault.msg_sec.options.reloadAnsi == true) {
			bbs.mods.vanguard.assault.msg_sec.loadAnsi();
			console.gotoxy(bbs.mods.vanguard.assault.msg_sec.select_options.x1,bbs.mods.vanguard.assault.msg_sec.select_options.y1);
			print("\1n\1"+"7\1k" + ("Select a group."+sl.padding).substring(0,bbs.mods.vanguard.assault.msg_sec.select_options.x2 - bbs.mods.vanguard.assault.msg_sec.select_options.x1));
			console.gotoxy(bbs.mods.vanguard.assault.msg_sec.select_options.x1,bbs.mods.vanguard.assault.msg_sec.select_options.y1+1);
			print("\1n" + sl.padding.replace(/ /g,"-").substring(0,bbs.mods.vanguard.assault.msg_sec.select_options.x2 - bbs.mods.vanguard.assault.msg_sec.select_options.x1));
		}

		var k = sl.choose();
		if (sl.raised != null) {
			bbs.mods.vanguard.assault.msg_sec.ctrl_handler(sl.raised);
		} else if (k == "") {
			return "";
		} else {
			bbs.mods.vanguard.assault.msg_sec.curgrp = parseInt(k);
			bbs.curgrp = parseInt(k);
			return k;
		}
	}
	return "";
}

//read option from msg_sec main
bbs.mods.vanguard.assault.msg_sec.read = function() {
	console.line_counter = 0;
	console.clear();
	
	while (bbs.online && !bbs.mods.vanguard.assault.msg_sec.options.mainExit) {
		var grp = bbs.mods.vanguard.assault.msg_sec.getgrp();
		
		if (grp == "") {
			bbs.mods.vanguard.assault.msg_sec.options.mainExit = false;
			return;
		} else if (!bbs.mods.vanguard.assault.msg_sec.options.mainExit) {		
			var subcode = bbs.mods.vanguard.assault.msg_sec.getsub();
			if (subcode == "" || bbs.mods.vanguard.assault.msg_sec.options.mainExit) {
				bbs.mods.vanguard.assault.msg_sec.options.mainExit = false; //only bounce out for group selection
			} else {
				console.print("\1n ");
				console.line_counter = 0;
				console.clear()
				for (x in msg_area.sub) {
					if (x == subcode) {
						if (msg_area.sub[x].can_read) {
							bbs.scan_posts(subcode,0);
							if (console.line_counter)
								console.pause();
							return;
						} else {
							console.print("\1n\1h\1rWarning:\1n \r\nYou do not have access to read this area.\r\n\r\n");
							console.pause();
						}
					}
				}
			}
		}
	}
	
	bbs.mods.vanguard.assault.msg_sec.options.mainExit = false;
}

//post option from msg_sec main
bbs.mods.vanguard.assault.msg_sec.post = function() {
	console.line_counter = 0;
	console.clear();
	
	while (bbs.online && !bbs.mods.vanguard.assault.msg_sec.options.mainExit) {
		var grp = bbs.mods.vanguard.assault.msg_sec.getgrp();
		if (grp == "") {
			bbs.mods.vanguard.assault.msg_sec.options.mainExit = false;
			return;
		} else if (!bbs.mods.vanguard.assault.msg_sec.options.mainExit) {		
			var subcode = bbs.mods.vanguard.assault.msg_sec.getsub();
			if (subcode == "" || bbs.mods.vanguard.assault.msg_sec.options.mainExit) {
				bbs.mods.vanguard.assault.msg_sec.options.mainExit = false; //only bounce out for group selection
			} else {
				console.print("\1n ");
				console.line_counter = 0;
				console.clear()
				for (x in msg_area.sub) {
					if (x == subcode) {
						if (msg_area.sub[x].can_post) {
							bbs.post_msg(subcode);
							if (console.line_counter)
								console.pause();
							return;
						} else {
							console.print("\1n\1h\1rWarning:\1n \r\nYou do not have access to post in this area.\r\n\r\n");
							console.pause();
						}
					}
				}
			}
		}
	}
	
	bbs.mods.vanguard.assault.msg_sec.options.mainExit = false;
}

//scan_new option from msg_sec main
bbs.mods.vanguard.assault.msg_sec.scan_new = function() {
	console.line_counter = 0;
	console.clear();
	print("\1nScanning for new messages.");
	bbs.scan_subs(SCAN_NEW);
	if (console.line_counter)
		console.pause();
}

//scan_yours option from msg_sec main
bbs.mods.vanguard.assault.msg_sec.scan_yours = function() {
	console.line_counter = 0;
	console.clear()
	bbs.scan_subs(SCAN_TOYOU);
	if (console.line_counter)
		console.pause();
}

//scan_text option from msg_sec main
bbs.mods.vanguard.assault.msg_sec.scan_text = function() {
	console.line_counter = 0;
	console.clear();
	bbs.scan_subs(SCAN_FIND);
	if (console.line_counter)
		console.pause();
}

//cfg_scan options from msg_sec main
bbs.mods.vanguard.assault.msg_sec.cfg_scan = function() {
	console.line_counter = 0;
	console.clear()
	bbs.cfg_msg_scan();
	if (console.line_counter)
		console.pause();
}

//cfg_yourscan options from msg_sec main
bbs.mods.vanguard.assault.msg_sec.cfg_yourscan = function() {
	console.line_counter = 0;
	console.clear()
	bbs.cfg_msg_scan(SCAN_TOYOU);;
	if (console.line_counter)
		console.pause();
}

//cfg_pointers from msg_sec main
bbs.mods.vanguard.assault.msg_sec.cfg_pointers = function() {
	console.line_counter = 0;
	console.clear()
	bbs.cfg_msg_ptrs();
	if (console.line_counter)
		console.pause();
}


//offline mail option from msg_sec main
bbs.mods.vanguard.assault.msg_sec.offline = function() {
	console.line_counter = 0;
	console.clear()
	bbs.qwk_sec();
	if (console.line_counter)
		console.pause();
}

//msg_sec starting point
bbs.mods.vanguard.assault.msg_sec.main = function() {
	try {
		if (console.line_counter)
			console.pause();
		
		console.status &= ~CON_RAW_IN; // no raw input
		var exit_menu = false;

		bbs.mods.vanguard.assault.msg_sec.options.mainExit = false;
		bbs.mods.vanguard.assault.msg_sec.options.reloadAnsi = true;
				
		while (bbs.online && !bbs.mods.vanguard.assault.msg_sec.options.mainExit) {
			
			//load display..
			bbs.sys_status &= ~SS_ABORT; // abort comes from selectList
			if (bbs.mods.vanguard.assault.msg_sec.options.reloadAnsi) {
				bbs.mods.vanguard.assault.msg_sec.loadAnsi();
			}
			
			var k = bbs.mods.vanguard.assault.msg_sec.options.mainList.choose();
			if (bbs.mods.vanguard.assault.msg_sec.options.mainList.raised != null) {
				//handle control character
				bbs.mods.vanguard.assault.msg_sec.ctrl_handler(bbs.mods.vanguard.assault.msg_sec.options.mainList.raised);
			} else if (bbs.mods.vanguard.assault.msg_sec.options.mainAction[k] && typeof(bbs.mods.vanguard.assault.msg_sec.options.mainAction[k])=="function") {
				print("\1n ");
				bbs.mods.vanguard.assault.msg_sec.options.mainAction[k]();
				bbs.mods.vanguard.assault.msg_sec.options.reloadAnsi = true;
			} else if (!k || k == "") {
				return;
			}
		}
	} catch(err) {
		console.print("\1n\1hERROR: \1n\r\n" + err + "\r\n\r\n");
		console.pause();
	}
	console.line_counter = 0;
	console.clear();
}
bbs.mods.vanguard.assault.msg_sec.main();
