/********** BEGIN - logon.js **********/
load("sbbsdefs.js");
load("mods.vanguard.ansislow.js");
load("inc_dates.js");
load("mods.vanguard.ansislow.js");

bbs.replace_text(563,"@EXEC:SYS_PAUSE@");
bbs.replace_text(71,"@EXEC:SYS_READP@");

console.clear();
//console.print("\1nSaving to Login to MySQL.\r\n")
//var logon_util_run = "SynchroNet.LogonUtil.AddLogon.exe " + user.number.toString() + " telnet " + bbs.node_num.toString();
//var logon_util_path = "..\\util\\";
//bbs.exec(logon_util_run,EX_BG | EX_NATIVE,logon_util_path);

if (!bbs.menu) bbs.menu = {};
bbs.menu.paused = false;

function sendNewPassword() {
	//randomized password
	user.security.password = parseInt(Math.random()*1000000000000).toString(36).toUpperCase().substr(0,8);
	user.security.password_date = 0; //force change at next login

	var mail = new MsgBase("mail");
	if(mail.open!=undefined && mail.open()==false) {
		var err_msg = "!ERROR " + msgbase.last_error;
		console.print(err_msg);
		log(err_msg);
		exit();
	}

	var hdr = {
		from:system.name,
		from_net_addr:"sysop@"+system.inetaddr,
		to:user.name,
		to_net_addr:user.netmail,
		subject:"Your new password",
		to_net_type:NET_INTERNET
		}

	var msg = "" +
		"Welcome to "+system.name+"!\r\n" +
		"\r\n" +
		"USERNAME: "+user.alias+"\r\n" +
		"PASSWORD: "+user.security.password+"\r\n" +
		"\r\n" +
		"It can be changed via =CFG at any prompt, then select W.\r\n";

	if (!mail.save_msg(hdr,msg)) {
		var err_msg = "!ERROR " + msgbase.last_error + " saving mail.";
		console.print(err_msg);
		log(err_msg);
		exit();
	}
	console.print("\r\n\r\n\1h\1yYour password was sent to the email address entered.\1n\r\n\r\n");
}

function getNewEmail() {
	console.line_counter = 0;
	console.print("\1l\1h\1b" + system.name + " now requires a VALID email address.\r\n\r\n");
	console.print("\1nYour password will be changed, and sent to the email address you enter.\r\n\r\n");

	while (bbs.online) {
		console.print("\r\n\1n\1cPlease enter your email address.\r\n\1h\1b: \1n")
		user.netmail = console.getstr(user.netmail,60,K_EDIT).toLowerCase();

		if (user.netmail.match(/^[a-z0-9][\w\.\_-]*@[a-z0-9][\w\.\_-]+\.[a-z]{2,7}$/)) {
			console.print("\r\n\1n\1cPlease \1h\1yCONFIRM\1n\1c your email address.\1h\1b\r\n: \1n");
			if (console.getstr("",60,K_EDIT).toLowerCase() == user.netmail) {
				console.print("\r\nBy choosing to have bbs email forwarded, email that is recieved for\r\n" +
					"you on this BBS will be delivered to your email address on file.\r\n\r\n");
				if (console.yesno("Would you like to forward BBS mail to your email address"))
					user.settings |= USER_NETMAIL;
				else
					user.settings &= ~USER_NETMAIL;

				return;
			} else
				console.print("\r\n\1h\1yEmail addresses don't match.\1n\r\n");
		} else
			console.print("\r\n\1h\1yPlease enter a VALID email address. \1n(no ip addressing).\r\n");
	}
}



//shows a random welcome file
function showWelcome(max) {
	var rnd = parseInt(Math.random() * max);
	//var welcome = "..\\text\\menu\\welcome" + rnd + ".asc";
	var welcome = "welcome" + rnd;
	bbs.mods.vanguard.ansislow(welcome);
	return;

//	console.print("\1n\10\1W\1L");
//	fileShow(welcome);
//	console.print("\1n\10\r\n\r\n");
//	console.line_counter = 0;
}

//Sets Default User Flags
function setFirstLogonDefaults() {
	//toggle default user settings.
	user.settings |= USER_PAUSE;
	user.settings |= USER_CLRSCRN;
	user.settings &= ~USER_SPIN;

	//toggle default user chat settings
	user.chat_settings |= CHAT_ECHO;
	user.chat_settings |= CHAT_ACTION;

	//force update changes active
	system.node_list[bbs.node_num-1].misc|=NODE_UDAT;
	bbs.nodesync();
	sleep(100);
}
function setLogonDefaults() {
	//needed to display ansis correctly, may interfere with msg reading.
	//if (user.screen_rows < 25)
	//	user.screen_rows = 25;

	//reset pausing flags
	bbs.menu.pager = false;
	bbs.menu.paused = false;
	bbs.menu.redraw = false;
	bbs.menu.reprompt = false;

	//toggle default user settings.
	user.settings |= USER_COLOR;
	user.settings |= USER_ANSI;
	user.settings &= ~USER_NO_EXASCII
	user.settings &= ~USER_QUIET;
	user.settings |= USER_ASK_NSCAN;
	user.settings |= USER_NOPAUSESPIN;
	
	user.security.restrictions &= ~UFLAG_C; //can use chat functions.
	user.security.restrictions |= UFLAG_M; //no netmail
	user.security.exemptions |= UFLAG_H;
	user.flags4 &= ~UFLAG_P; //reset pausePlus Flag

	//toggle default user chat settings
	user.chat_settings &= ~CHAT_NOPAGE;
	user.chat_settings &= ~CHAT_NOACT;
	user.chat_settings &= ~CHAT_SPLITP;

	//toggle default system settings
	system.settings |= SYS_RA_EMU;
	system.settings |= SYS_DELEMAIL;

	//toggle default console settings
	console.status |= CON_NO_INACT;

	//CLEAR STAT SCREEN//
	bbs.replace_text(100,"\1n");
	bbs.replace_text(101,"\1n");
	bbs.replace_text(102,"\1n");
	bbs.replace_text(103,"\1n");
	bbs.replace_text(104,"\1n");
	bbs.replace_text(105,"\1n");
	bbs.replace_text(106,"\1n");
	bbs.replace_text(107,"\1n");
	bbs.replace_text(108,"\1n");
	bbs.replace_text(109,"\1n");
	bbs.replace_text(110,"\1n");
	bbs.replace_text(111,"\1n");
	bbs.replace_text(112,"\1n");
	bbs.replace_text(351,"\1n");
	bbs.replace_text(352,"\1n");
	bbs.replace_text(353,"\1n");
	bbs.replace_text(354,"\1n");
	bbs.replace_text(355,"\1n");
	bbs.replace_text(356,"\1n");
	bbs.replace_text(357,"\1n");
	bbs.replace_text(567,"\1n");

	//force update changes active
	system.node_list[bbs.node_num-1].misc|=NODE_UDAT;
	bbs.nodesync();
	sleep(100);
}

function showLogonInfo() {
	console.print("\10\1h\1n");
	console.print("" +
		"\r\n" +
		"\1n\1c OPERATORS            CHAT HOSTS        NIGHTLY CHATS\r\n" +
		"\1h\1kÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ\r\n" +
		"\1h\1w Tracker1               \1h\1yAkasha            \1h\1bMON : \1cTandrus Silvermoon\r\n" +
		"\1h\1w Tandrus Silvermoon     \1h\1yFirecracker       \1h\1bTUES: \1cFirecracker   \r\n" +
		"\1h\1n                        \1h\1yFrozen Fire       \1h\1bWEDS: \1cVenom         \r\n" +
		"\1h\1n                        \1h\1yJokester          \1h\1bTHUR: \1cTwinkler      \r\n" +
		"\1n\1c MESSAGE OPS            \1h\1gTwinkler          \1h\1bFRI : \1cJokester      \r\n" +
		"\1h\1kÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ  \1h\1yVenom             \1h\1bSAT : \1cFrozen Fire   \r\n" +
		"\1h\1b Darkhalf               \1h\1y                  \1h\1bSUN : \1cAkasha        \r\n" +
		"\r\n" +
		"\1nNightly Hosts should be available on the given evening from 17:00-21:00 MST\r\n" +
		"\1h\1yWould you like to be a Message Op?  \1nEmail \1hTracker1\1n.\r\n" +
		"\r\n" +
		"");
}

function passCheck() {
	bbs.user_event(EVENT_NEWUSER);
	var pwdchgd=false;

	while (bbs.online && !pwdchgd) {

		console.line_counter = 0;
		console.print("\1l\1n\1cYour password is currently: \1h\1w"+user.security.password+"\r\n");
		bDone=false;

		if (console.yesno(bbs.text(331))) {
			while (bbs.online && !bDone) {

			        printf("\1n[\1gû\1n] \1cEnter your new password: \1h\1w");
				console.status |= CON_R_ECHOX;
				newpwd=console.getstr(8);
				console.status &= ~CON_R_ECHOX;
				okay=true;
				if (newpwd=="") {						// Blank
						console.print("    \1r\1h\1iAborted\1n\r\n");
						bbs.menu.paused = false;
						console.pause();
						okay=false;
						break;
				}
				if (newpwd.length<4) {						// Not long enough
						console.print("    "+bbs.text(408)+"\r\n");
						okay=false;
				}

			        if (newpwd.toUpperCase()==user.security.password.toUpperCase()) {				// Same as current
			                        console.print("    "+bbs.text(409)+"\r\n")
						okay=false;
				}


	                        if (newpwd=="1234" || newpwd=="12345678" || newpwd.toUpperCase()=="PASSWORD") {                                               // Too obvious
	                		        console.print("    "+bbs.text(411)+"\r\n")
						okay=false;
				}

				if (okay) {
						printf(bbs.text(372));
						console.status |= CON_R_ECHOX;
						cnfnewpwd=console.getstr(8);
						console.status &= ~CON_R_ECHOX;

		                        if (newpwd!=cnfnewpwd) {
		                                console.print(bbs.text(334)+"\r\n\r\n");
		                bbs.menu.paused = false;
						console.pause();
						bDone=true;
						pwdchgd=false;
					} else {
			                        user.security.password=newpwd;
						bDone=true;
						pwdchgd=true;
						console.print("\r\n"+bbs.text(335)+"\r\n");

					}
				}
			}
		} else { pwdchgd=true; }
	}
	user.security.password_date = (new Date()).valueOf()/1000;
}

//Kill leftover drop files
function kill_drops() {
	if (file_exists(system.node_dir + "/msginfT")) file_remove(system.node_dir + "/msginf");
	if (file_exists(system.node_dir + "/msgtmpT")) file_remove(system.node_dir + "/msgtmp");
	if (file_exists(system.node_dir + "/XTRN.DAT")) file_remove(system.node_dir + "/XTRN.DAT");
	if (file_exists(system.node_dir + "/CHAIN.TXT")) file_remove(system.node_dir + "/CHAIN.TXT");
	if (file_exists(system.node_dir + "/DOOR.SYS")) file_remove(system.node_dir + "/DOOR.SYS");
	if (file_exists(system.node_dir + "/DORINFO1.DEF")) file_remove(system.node_dir + "/DORINFO1.DEF");
	if (file_exists(system.node_dir + "/DORINFO" + bbs.node_num + ".DEF")) file_remove(system.node_dir + "/DORINFO" + bbs.node_num + ".DEF");
	if (file_exists(system.node_dir + "/CALLINFO.BBS")) file_remove(system.node_dir + "/CALLINFO.BBS");
	if (file_exists(system.node_dir + "/PCBOARD.SYS")) file_remove(system.node_dir + "/PCBOARD.SYS");
	if (file_exists(system.node_dir + "/SFDOORS.DAT")) file_remove(system.node_dir + "/SFDOORS.DAT");
	if (file_exists(system.node_dir + "/UTIDOOR.TXT")) file_remove(system.node_dir + "/UTIDOOR.TXT");
	if (file_exists(system.node_dir + "/DOORFILE.SR")) file_remove(system.node_dir + "/DOORFILE.SR");
	if (file_exists(system.node_dir + "/TRIBBS.SYS")) file_remove(system.node_dir + "/TRIBBS.SYS");
	if (file_exists(system.node_dir + "/DOOR32.SYS")) file_remove(system.node_dir + "/DOOR32.SYS");
}

function guest_logon() {
	while(bbs.online) {
		printf("\1y\1hFor our records, please enter your full name: \1w");
		name=console.getstr(25,K_UPRLWR);
		if(!name || !name.length)
			continue;
		bbs.log_str("Guest: " + name);
		user.name = name;
		break;
	}
	
	while(bbs.online) {
		printf("\1y\1hPlease enter your location (City, State): \1w");
		location=console.getstr(30,K_UPRLWR);
		if(!location || !location.length)
			continue;
		bbs.log_str("  " + location);
		user.location=location;
		break;
	}

	if(bbs.online)
		bbs.log_str("\r\n");
	while(bbs.online) {
		printf("\1y\1hWhere did you hear about this BBS?\r\n: \1w");
		ref=console.getstr(70);
		if(!ref || !ref.length)
			continue;
		bbs.log_str(ref + "\r\n");
		break;
	}
}

function getXtrnName(code) {
	for (x in xtrn_area.sec_list) {
		for (y in xtrn_area.sec_list[x].prog_list) {
			if (xtrn_area.sec_list[x].prog_list[y].code.toLowerCase() == code.toLowerCase()) {
				return xtrn_area.sec_list[x].prog_list[y].name
			}
		}
	}
	
	return code;
}

function showRandomAnswerScreen() {
	//clear screen
	console.line_counter = 0;
	console.clear();
	
	//display answer screen		
	var last = 6;
	var j = parseInt(Math.random() * last) + 1;
	var s = j.toString();
	s = "000".substring(0,3 - s.length) + s
	var f = "answer/answer_" + s + ".asc"
	console.line_counter = 0;
	bbs.mods.vanguard.ansislow(f);
	console.line_counter = 0;
}

function checkAutoPlay() {
	if (user.security.restrictions&UFLAG_G == 0) {
		return false;
	}
	
	//get autoplay
	var fn = user.number.toString();
	while (fn.length < 4)
		fn = "0" + fn;
	fn += ".doorlist.auto"
	
	//console.write(fn + "\r\n");
	
	var f = new File(system.data_dir + "/user/" + fn);
	if (f.exists) {
		//file exists
		
		if (f.date > ((new Date).valueOf() /1000) - 60) {
			//file created within 60 seconts
			
			if (f.open("r")) {
				//read file
				var c = f.read();
				f.close();

				//delete file
				f.remove();
						
				showRandomAnswerScreen()
				
				console.print("\r\n\r\n\1n\1cLoading \1h" + getXtrnName(c) + "\1n\1c...\r\n");
				console.line_counter = 0;
				sleep(1000); //short pause
				
				//execute the door
				bbs.exec_xtrn(c);
				
				return true;

			}
			
		}
		
	}
	
	//default nothing to run
	return false;
	
}

function main() {
	if (!bbs.online) exit;
	
	kill_drops();
	
	if (user.security.restrictions&UFLAG_G) guest_logon();

	//check for email address pattern, for existing users.
	if (!user.netmail.match(/^[a-z0-9][\w\.\_-]*@[a-z0-9][\w\.\_-]+\.[a-z]{2,7}$/)) {
		getNewEmail();
		if (bbs.online) {
			sendNewPassword();
			bbs.hangup();
			sleep(100);
		}
	}

	//if this is the first logon, prompt for a new password. :)
	if ((user.stats.total_logons==1)||(user.security.password_date < 1)) {
		passCheck();
		setFirstLogonDefaults();
	}

	
	//autoplay set from website
	if (checkAutoPlay()) {
		bbs.hangup();
		return;
	}

	//set user default settings, chat, etc.
	setLogonDefaults();
	
	//Fast Logon?
	console.line_counter = 0;
	console.clear();

		
	bbs.mods.vanguard.ansislow("trn/logonx");
//	console.ansi_gotoxy(1,23);
	console.line_counter = 1;
	
//	console.print("\r\n");
//	if (console.noyes("Fast Logon")) {
		//display welcome ansi
		//showWelcome(3);
		//bbs.mods.vanguard.ansislow("trn/welcome4");
		//showLogonInfo();	//display sysop & cosysop info...
		console.pause();

		//Last Callers
		load("laston.js");

		//Oneliners
		load("oneliner.js");


//	}

	//view notices
	bbs.scan_posts("notices", 2 /* SCAN_NEW */);

	console.line_counter = 0;
	console.clear();
	bbs.menu.paused = true; //dissable pause, ie already paused.
	load("ctrl_u.js");
	bbs.menu.paused = false; //re-enable pausing.
	console.print("\r\n\r\n\1n\1cGLOBAL COMMANDS:\r\n");
	console.print("\1h\1c  CTRL-U \1k- \1bUsers Online\r\n");
	console.print("\1h\1c  CTRL-P \1k- \1bPage \1k(Chat Page [User/Sysop], Message, Telegram, Profiles)\r\n");
	console.print("\1h\1c  CTRL-R \1k- \1bRefresh/Redraw\r\n\r\n");
	console.print("\1n\1cNOTICE: \1hEVENTS RUN AT Midnight. \1k[\1bIt is now " + (new Date()).formatDate("hh:mmap") + " MST\1k]\1n\r\n\r\n");

	
	var us = user.number.toString();
	while (us.length < 4)
		us = "0" + us;
	var f = new File(system.data_dir + "/msgs/" + us + ".msg");
	if (f.exists && !console.noyes("Skip offline messages"))
		f.remove();
	console.print("\r\n");

	//bbs.exec("?logonmsg.js"); //notify other users.
	console.line_counter = 15;
	if (user.editor == "")
		user.editor = "DCT";

	//force update changes active
	system.node_list[bbs.node_num-1].misc|=NODE_UDAT;
	bbs.nodesync();
	sleep(100);
}
main();
/********** END - logon.js **********/