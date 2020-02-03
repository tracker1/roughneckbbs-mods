load("sbbsdefs.js");
load("mods.vanguard.selectlist.js"); //selectList tool
load("mods.vanguard.ansislow.js");
load("inc_dates.js");

bbs.replace_text(563,"@EXEC:SYS_PAUSE@");

//var uid = 

if (!bbs.mods.trn) bbs.mods.trn = {};

bbs.mods.trn.loggedIn = false;

bbs.mods.trn.login_clearbox = function() {
	console.line_counter = 0;
	console.ansi_gotoxy(49,18);
	console.print("\1n\1h\1wÚÄ\1cÄÄ\1n\1cÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ¿")
	console.ansi_gotoxy(49,19);
	console.print("\1h\1c³                             \1n\1c³")
	console.ansi_gotoxy(49,20);
	console.print("\1h\1c³                             \1n\1c³")
	console.ansi_gotoxy(49,21);
	console.print("\1n\1c³                             ³")
	console.ansi_gotoxy(49,22);
	console.print("\1n\1c³                             ³")
	console.ansi_gotoxy(49,23);
	console.print("\1n\1c³                             ³")
	console.ansi_gotoxy(49,24);
	console.print("\1n\1cÀÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ\1h\1cÄÙ")
	console.ansi_gotoxy(1,1);
	console.print("\1h\r\n\1n\r\n")
	console.ansi_gotoxy(80,23);
	console.line_counter = 0;
}

bbs.mods.trn.login = function() {
	bbs.mods.trn.login_clearbox();
	var loggedIn = false;

	//prompts/warnings
	console.ansi_gotoxy(1,1);
	console.print("\1h\1w\r\n\1n\r\n");
	
	console.ansi_gotoxy(51,19);
	console.print("\1h\1nUSERNAME:");

	console.ansi_gotoxy(51,21);
	console.print("\1h\1kPASSWORD:");
	
	console.ansi_gotoxy(51,20);
	console.print("\1n\1"+"6\1k                           ");
	console.ansi_gotoxy(51,20);
	
	var pw = "\033[22;51f\1n\1"+"6\1k        \033[22;51f";
	bbs.replace_text(176,"\r\1h\033[21;51f\1n\1h\1kPASSWORD:\033[23;51f\1nSYS_PASS: \1n\1"+"6\1k(hidden)\1"+"0\1n ");
	bbs.replace_text(390,"\r\033[24;52f\1n\1"+"7\1kPlease Select (New User) \1"+"0\1n");
	bbs.replace_text(391,"\r\033[24;56f\1n\1"+"7\1kInvalid Password!\1"+"0\1n");

	var user_name = console.getstr("",25,K_UPRLWR|K_LOWPRIO|K_E71DETECT|K_TAB);
	
	if (user_name.toLowerCase() == "killamb") {
		console.print("\x01n\x01lKilling Ambroshia.");
		bbs.exec("kill.exe -f amblaunch.exe", EX_NATIVE);
		console.print("\r\n\r\n");
		console.pause();
	} else if (user_name != "") {
		console.ansi_gotoxy(51,19);
		console.print("\1h\1n\1"+"0\1h\1kUSERNAME:");
	
		console.ansi_gotoxy(51,21);
		console.print("\1h\1n\1"+"0\1nPASSWORD:");
		
		loggedIn = bbs.login(user_name.toUpperCase(),pw);
	} else
		console.print("\r\033[23;51f\1n\1"+"7\1kPlease Select (New User) ");

	render_time();
	
	if (!loggedIn) {
		sleep(1800);
	}

	//put cursor at bottom of screen.
	console.ansi_gotoxy(1,1);
	console.print("\1h\r\n\1n\r\n")
	console.ansi_gotoxy(80,23);
	console.line_counter = 0;

	//restoring original prompts/warnings.
	bbs.revert_text(176);
	bbs.revert_text(390);
	bbs.revert_text(391);
	
	bbs.mods.trn.loggedIn = loggedIn;
}

bbs.mods.trn.apply = function() {
	bbs.exec("?rn_create_new_user.js");
}

bbs.mods.trn.loginGuest = function() {
	bbs.mods.trn.login_clearbox();
	var loggedIn = false;
	
	bbs.mods.trn.loggedIn = bbs.login("guest","\r\n\1nPASSWORD: ");
	return;
}

bbs.mods.trn.whoson = function() {
	console.line_counter = 0;
	console.clear();
	//bbs.whos_online();
	//console.line_counter = 0;
	//console.print("\r\n");
	load("ctrl_u.js");
	console.pause();
}
bbs.mods.trn.sysopfeedback = function() {
	console.line_counter = 0;
	console.clear();
	console.print("Send feedback to tracker1@theroughnecks.net\r\n\r\n");
	console.pause();
}

bbs.mods.lastDate = 0;
function render_time() {
	var dNow = new Date();
	
	if (dNow - bbs.mods.lastDate > 1000) {
		console.ansi_gotoxy(1,1);
		console.print("\1h\r\n\1w\1n\r\n");
		
		console.ansi_gotoxy(57,17);
		console.print("\1n" + dNow.formatDate("yyyy-mm-dd h:nn:ss").replace(/(\W)/g,"\1h\1k$1\1n"));
		
		bbs.mods.lastDate = dNow;
		console.ansi_gotoxy(80,23);
	}
}

function render_login() {
	var padding = "                                                                                  ";
	console.line_counter = 0
	console.clear();
	
	bbs.mods.vanguard.ansislow("trn/login.ans");	
	bbs.mods.trn.login_clearbox();
	
	console.ansi_gotoxy(1,1);
	console.print("\1h\r\n\1w\1n\r\n");
	console.ansi_gotoxy(57,11);
	console.print("\1w\1n" + client.ip_address.replace(/(\W)/g,"\1h\1k$1\1n"));
	
	console.ansi_gotoxy(57,12);
	var isp = (client.host_name.indexOf(".") > 0)?client.host_name.match(/(\w+)\.(\w+)$/)[0]:"unknown";
	console.print("\1n" + (isp + padding).substring(0,23).replace(/(\W)/g,"\1h\1k$1\1n"));
	
	render_time();
}

function login_main() {
	var render = true;
	
	var x1 = 50;
	var y1 = 19;
	var x2 = 79;
	var y2 = 23;
	
	var options = new Array();
	var actions = new Array();
	options["L"] = "Login";
	actions["L"] = new Function("bbs.mods.trn.login();");
	options["H"] = "Hangup (disconnect)";
	actions["H"] = new Function("bbs.mods.trn.quit = true;");
	options["spacer1"] = "";
	options["A"] = "Apply as new";
	actions["A"] = new Function("bbs.mods.trn.apply();");
	options["G"] = "Guest Login";
	actions["G"] = new Function("bbs.mods.trn.loginGuest();");
	options["spacer2"] = "";
	options["W"] = "Who's Online";
	actions["W"] = new Function("bbs.mods.trn.whoson();");
	options["E"] = "Email Sysop (tracker1)";
	actions["E"] = new Function("bbs.mods.trn.sysopfeedback();");
	
	var sl =  new bbs.mods.vanguard.selectList(options,x1,y1,x2,y2);
	sl.showKeys = true;
	sl.padText = true;
	sl.ontick = render_time;
	sl.onkeypress = null;
	sl.onchange = null;
	
	while (console.inkey() != "") { /* clear input buffer */ };
	
	bbs.mods.trn.quit = false;
	while (bbs.online && (!bbs.mods.trn.quit) && (!bbs.mods.trn.loggedIn)) {
		if (render) {
			render_login();
			render = false;
		}
		
		bbs.mods.trn.login_clearbox();
			
		console.status &= ~CON_RAW_IN; //no raw input
		bbs.sys_status &= ~SS_ABORT; //no abort
		console.line_counter = 0;
		
		var k = sl.choose();
		if (sl.raised != null)
			k = sl.raised; //handling raised keys
			
		switch (k.charCodeAt(0)) {
			case 26: //ctrl-z - unfiltered input - ignore
				break;
			case 3: //ctrl-c
				bbs.mods.trn.quit = true;
				break;
			case 27: //escape
				// do nothing
				break;
			case 18: //ctrl-p - pager (only show users)
			case 21: //ctrl-u - user listing
				bbs.mods.trn.whoson();
				break;
			default:
				if (actions[k] && typeof(actions[k]) == "function") {
					actions[k]();
//					if ((!bbs.mods.trn.loggedIn) && (k == "L" || k == "G"))
//						bbs.mods.trn.login_clearbox();
//					else
						render = true;
				}
				break;
			
		}
	}
	if (bbs.mods.trn.loggedIn) {
		console.line_counter = 0;
		console.clear();
		bbs.logon();
	} else {
		console.ansi_gotoxy(1,23);
		console.line_counter = 0;
		console.print("\r\n\r\n\1h\1ygoodbye!\1n\r\n");
	}
}
login_main();