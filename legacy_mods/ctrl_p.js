load("menu.js");
//load("sys_profiles.js");
if (!bbs.pageUser)
	bbs.pageUser = "";

if (!bbs.menu)
	bbs.menu = {};

function showMessages() {
	//If any awaiting messages, display them
	if (((system.node_list[bbs.node_num-1].misc&NODE_NMSG) != 0)||((system.node_list[bbs.node_num-1].misc&NODE_MSGW) != 0)) {
		bbs.menu.redraw = true; //redraw flag
		console.print("\1h\1n ");
		console.ansi_left(80);
		console.clearline();
		console.print("\1h\1n\1c---\r\n");
		while (((system.node_list[bbs.node_num-1].misc&NODE_NMSG) != 0)||((system.node_list[bbs.node_num-1].misc&NODE_MSGW) != 0)) {
			//bbs.node_action = system.node_list[bbs.node_num-1].action;
			bbs.nodesync();
			sleep(200);
		}
		console.print("\r\n");
	}
}

function findUserOnline(inName) {
	/* finds a user online from the inputted string, returns node# */
	var arrMatches = new Array(); //matching usernames
	var sMatches = ""
	var oUser = new User(1);

	for (var i=0; i<system.node_list.length; i++) {
		var node = system.node_list[i]
		if (node.status==NODE_INUSE) {
			oUser.number = node.useron;
			switch (inName.toLowerCase()) {
				case oUser.name.toLowerCase():
				case oUser.alias.toLowerCase():
				case oUser.handle.toLowerCase():
					if (bbs.node_num == i+1) {
						console.print("\1nYou can't message yourself, silly.\r\n")
						return 0;
					}else{
						return i+1;
					}
					break;
				default:
					var s = "                         "
					if ((oUser.alias.toLowerCase().indexOf(inName.toLowerCase()) >= 0)||(oUser.name.toLowerCase().indexOf(inName.toLowerCase()) >= 0)||(oUser.handle.toLowerCase().indexOf(inName.toLowerCase()) >= 0))
						arrMatches[arrMatches.length] = i;
			}
		}
	}

	if (arrMatches.length == 1) {
		if (bbs.node_num == arrMatches[0]+1)
			console.print("\1nYou can't message yourself, silly.\r\n");
		else
			return arrMatches[0]+1;
	}else if (arrMatches > 1) {
			//Display Matches
			console.print("" +
				"\1n\1h\1w" +
				(arrMatches.length + 1) +
				"\1n\1c matches found:" +
				"\r\n");
			for (var i=0; i<arrMatches.length; i++) {
				oUser.number = system.node_list[arrMatches[i]].useron;
				var s = "                                                                               "
				console.print("" +
					"     \1n\1h\1w" + (i + s).substring(0,3) +
					" \1n\c" + (oUser.handle + s).substring(0,8) +
					" \1h\1c" + (oUser.alias + s).substring(0,25) +
					"  \1h\1b" + (oUser.name + s).substring(0,35) +
					"\r\n")
			}
	}else{
		console.print("\1nInvalid Username, or user not online.\r\n");
	}
	return 0;
}

function findUser(inName) {
	/* finds a username from the inputed string, returns the user_id */
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
			}else if (oUser.name.toLowerCase().indexOf(inName.toLowerCase()) >= 0) {
				arrMatches[arrMatches.length] = i;
			}else if (oUser.handle.toLowerCase().indexOf(inName.toLowerCase()) >= 0) {
				arrMatches[arrMatches.length] = i;
			}
		}
		console.print("\r\n");
		if (arrMatches.length < 1) {
			//No matches found
			console.print("\1h\1yNo matches found.\r\n");
		} else if (arrMatches.length == 1) {
			//1 match found, use that match
			console.print("\1h\1c1 match found.\r\n");
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

function getUser(inType) {
/*
	Obtains a username, returns the node # for "message" and the user-id
	for "telegram"

	If blank string, returns a -1
	If errors, displays the error, returns 0
*/

	var iRet = 0; //default = invalid
	var strInput = "";
	var bSelected = false;

	console.print("\1h\1w" + inType + " \1k- \1bEnter the Node #, or Username: \1n")
	bbs.pageUser = console.getstr(bbs.pageUser,25,K_EDIT|K_LINE|K_AUTODEL);
	console.ansi_up();
	console.print("\1h\1n ");
	console.ansi_left(80);
	console.clearline();
	bbs.nodesync();

	if (bbs.pageUser.length < 1) return -1; //return to stop loop on a blank entry.

	if (!isNaN(bbs.pageUser)) {
		var iNode = parseInt(bbs.pageUser) - 1;
		var node;
		var iStatus = 0;
		if ((iNode >= 0)&&(iNode < system.node_list.length)) {
			node = system.node_list[iNode]
			if (bbs.node_num == iNode+1) {
				iStatus = 2;
			} else if (node.status==NODE_INUSE) {
				iStatus = 1;
			}else{
				iStatus = 3;
			}
		} else {
			iStatus = 4;
		}
		switch (iStatus) {
			case 4:
			case 3:
				if ((inType.toLowerCase() == "telegram")&&(iNode > 0)&&(iNode <= system.stats.total_users))
					iRet = iNode + 1;
				else
					if (inType.toLowerCase() == "telegram")
						console.print("\1nNode not in use, invalid node, or Invalid User.\r\n");
					else
						console.print("\1nNode not in use, or invalid node.\r\n");
				break;
			case 2:
				console.print("\1nYou can't message yourself, silly.\r\n");
				break;
			case 1:
				if (inType.toLowerCase() == "telegram")
					iRet = system.node_list[iNode].useron;
				else
					iRet = iNode + 1;
		} //default is already 0
	} else {
		if (inType.toLowerCase() == "telegram")
			return findUser(bbs.pageUser);
		else
			return findUserOnline(bbs.pageUser);
	}
	return iRet;
}

function pageTelegram() {
	var iUser = 0;
	var sMessage = ""

	bbs.menu.paused = false;
	console.print("\1h\1n ");
	console.ansi_left(80);
	console.clearline();

	while (iUser == 0) {
		iUser = getUser("Telegram")
		if (iUser > 0) {
			oUser = new User(iUser);
			console.print("" +
				"\1n\1cSending telegram to \1h\1w" +
				oUser.alias +
				"\1n\1c (\1w" +
				oUser.name +
				" #" +
				oUser.number +
				"\1n\1c)\r\n\1h\1bMax 5 lines. Blank line ends\r\n" +
				"");
			for (var i=0; i<5; i++) {
				console.print("     \1h\1b: \1n");
				var s = console.getstr(70);
				if (s.length < 1)
					i = 5;
				else
					sMessage += "     " + s + "\r\n";
			}
			if (sMessage.length > 0) {
				sMessage = "" +
					"\1n\1cTelegram from " +
					user.alias +
					" on " + formateDateTime(new Date()) +
					"\r\n\1n" + sMessage + "\r\n";

				bbs.put_telegram(iUser,sMessage);
				console.print("\r\n\1h\1cTelegram Sent!\1n\r\n");
			} else {
				console.ansi_up();
				console.clearline();
				console.ansi_up();
				console.clearline();
				console.ansi_up();
				console.clearline();
				console.print("\1h\1yTelegram Aborted!\1n\r\n");
			}
		}
	}
}

function pageMessage() {
	console.print("\1h\1n ");
	console.ansi_left(80);
	console.clearline();

	bbs.menu.paused = false;

	//console.print("PAGE PROMPT UNDER CONSTRUCTION, SORRY!");
	//bbs.private_message()
	bbs.menu.redraw = true; //set redraw flag

	var iNode = 0
	while (iNode == 0) {
		iNode = getUser("Message");
		if (iNode > 0) {
			var oUser = new User(system.node_list[iNode-1].useron);

			console.print("\1h\1n\1cMessage to \1h\1w" + oUser.alias + "\1n\1c (Press ENTER to finish): \1n\r\n");
			var sMessage = console.getstr(239);
			if (sMessage.length != "") {
				sMessage = "" +
					"\1h\1n\1h\1w" + user.alias +
					"\1n\1c Sent you a message from Node " + bbs.node_num +
					":\r\n\1n" + sMessage + "\r\n\r\n";
				bbs.put_node_message(iNode,sMessage);
				console.print("\r\n\1h\1cMessage Sent!\1n\r\n");
			}else{
				console.ansi_up(2);
				console.clearline();
				console.print("\1h\1yMessage Aborted!\1n\r\n");
			}
		}
	}
}

function pageChat() {
	bbs.menu.paused = false;
	console.print("\1h\1n ");
	console.ansi_left(80);
	console.clearline();
	bbs.private_chat()
	bbs.menu.paused = false; //reset paused flag
	bbs.menu.redraw = true; //set redraw flag
	console.pause();
}

function pageSysop() {
	console.print("\1h\1n ");
	console.ansi_left(80);
	console.clearline();
	bbs.page_sysop()
	bbs.menu.paused = false; //reset paused flag
	bbs.menu.redraw = true; //set redraw flag
	console.pause();
}

function pagePrompt() {
	if (bbs.menu.pager) {
		//If already at a paging Prompt
		console.ansi_up(2);
		if (bbs.menu.profile)
			bbs.menu.profile = false; //return from profile prompt;
		return;
	}

	var iRet = 0; //normal exit
	bbs.menu.paused = true;
	bbs.exec("?ctrl_u.js"); //show nodelist
	bbs.menu.paused = false;

	var arrPrompts = new Array(5);
	arrPrompts[0] = "\r\1h\1n\1cPrivate:  \1n\1w[\1n\1" + "6\1h Telegram \1n]  \1h\1k[\1w M\1nessage \1h\1k]  \1h\1k[\1w C\1nhat \1h\1k]  \1h\1k[\1w P\1nrofiles \1h\1k]  \1h\1k[\1w Q\1nuit \1h\1k]\1n\1w ";
	arrPrompts[1] = "\r\1h\1n\1cPrivate:  \1h\1k[\1w T\1nelegram \1h\1k]  \1n\1w[\1n\1" + "6\1h Message \1n]  \1h\1k[\1w C\1nhat \1h\1k]  \1h\1k[\1w P\1nrofiles \1h\1k]  \1h\1k[\1w Q\1nuit \1h\1k]\1n\1w ";
	arrPrompts[2] = "\r\1h\1n\1cPrivate:  \1h\1k[\1w T\1nelegram \1h\1k]  \1h\1k[\1w M\1nessage \1h\1k]  \1n\1w[\1n\1" + "6\1h Chat \1n]  \1h\1k[\1w P\1nrofiles \1h\1k]  \1h\1k[\1w Q\1nuit \1h\1k]\1n\1w ";
	arrPrompts[3] = "\r\1h\1n\1cPrivate:  \1h\1k[\1w T\1nelegram \1h\1k]  \1h\1k[\1w M\1nessage \1h\1k]  \1h\1k[\1w C\1nhat \1h\1k]  \1n\1w[\1n\1" + "6\1h Profiles \1n]  \1h\1k[\1w Q\1nuit \1h\1k]\1n\1w ";
	arrPrompts[4] = "\r\1h\1n\1cPrivate:  \1h\1k[\1w T\1nelegram \1h\1k]  \1h\1k[\1w M\1nessage \1h\1k]  \1h\1k[\1w C\1nhat \1h\1k]  \1h\1k[\1w P\1nrofiles \1h\1k]  \1n\1w[\1n\1" + "6\1h Quit \1n]\1n\1w ";

	arrValues = new Array("T","M","C","P","Q");

	var iCurrent = 4;
	var bActive = true;
	bbs.menu.redraw = true;	//set redraw flag

	console.print("\r\n");
	while (bActive && bbs.online) {
		bbs.menu.paused = true; //reset paused flag
		bbs.menu.pager = true; //reset paging flag

		showMessages(); //show any waiting messages

		if (bbs.menu.redraw) {
			console.ansi_left(80);
			console.line_counter = 0;

			bbs.menu.redraw = false;
			if (bAnsi)
				console.print(arrPrompts[iCurrent]);
			else
				console.print("\1n\r\nPrivate: [T]elegram  [M]essage  [C]hat  [P]rofiles  [Q]uit  (tmcQ)?");
		}

		var c = console.inkey().toUpperCase();
		if ((c=="\r")||(c=="\n")) c = arrValues[iCurrent];
		if (c == "") {
			sleep(200);
		}else{
			switch (c) {
				case(KEY_RIGHT):
					iCurrent++;
					if (iCurrent >= arrPrompts.length)
						iCurrent = 0;
					bbs.menu.redraw = true;
					break;
				case(KEY_LEFT):
					iCurrent--;
					if (iCurrent < 0)
						iCurrent = arrPrompts.length-1;
					bbs.menu.redraw = true;
					break;
				case("T"):
					pageTelegram();
					iCurrent = 0;
					bbs.menu.redraw = true;
					break;
				case("M"):
					pageMessage();
					iCurrent = 1;
					bbs.menu.redraw = true;
					break;
				case("C"):
					pageChat();
					bActive = false;
					break;
				case("S"):
					pageSysop();
					bActive = false;
					break;
				case("P"):
//					console.ansi_left(80);
//					console.clearline();
//					console.ansi_up();
//					console.print("\1h\1n");
//
//					if (!profilePrompt())
//						bActive = false;
					break;
				case("Q"):
					console.print("\1h\1n ");
					console.ansi_left(80);
					console.clearline();
					console.ansi_up();
					console.print("\1h\1n");

					bActive = false;
					break;
			}
		}
	}

	return iRet;
}

if (bbs.online && (bbs.sys_status&SS_USERON) != 0) {
	if ((user.security.restrictions&UFLAG_C) == 0) {
		switch (pagePrompt()) { //use return code, for exit function.
			case 3:
				bbs.exec("?sys_profiles.js");
				break;
			case 2:
				break;
			case 1:
				break;
			case 0:
			default:
				//normal exit
		}
	}

	bbs.menu.pager = false;
	bbs.menu.paused = false;
	if (bbs.menu.expertprompt)
		bbs.menu.redraw = true;
	else
		bbs.menu.reprompt = true;
}else{
	console.ansi_up();
	console.ansi_up();
}