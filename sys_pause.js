// =====================================================
// Custom Pause Prompt - For Synchronet 3.10j+
// -----------------------------------------------------
// Replace line 563 in text.dat with "@EXEC:sys_pause@"
// =====================================================
load("sbbsdefs.js");

var bAnsi = ((console.autoterm&USER_ANSI) != 0)
if ((bbs.sys_status&SS_USERON) != 0) {
	bAnsi = ((user.settings&USER_ANSI) != 0)
}
if (!bbs.menu)
	bbs.menu = {};

//Loads the string into an array for animation. :)
function loadPrompts(inStr) {
	var arr = new Array();
	
	var strCenter = "                                        ".substr(0,35-parseInt(inStr.length/2));

	arr[0] = "\r" + strCenter + "\1h\1k<³\1n\1c " + inStr + " \1h\1k³>\1n "
	
	for (var i=-1; i<=inStr.length; i++) {
		var strAdd = "\r" + strCenter + "\1h\1k<³ ";
		
		if (i > 1)
			strAdd += "\1n\1c" + inStr.substr(0,i-1);
		
		if (i > 0)
			if (inStr.substr(i-1,1) == " ")
				strAdd += "\1h\1c_";
			else
				strAdd += "\1h\1c" + inStr.substr(i-1,1);
			
		if ((i >= 0)&&(i<inStr.length))
			if (inStr.substr(i,1) == " ")
				strAdd += "\1h\1w_";
			else
				strAdd += "\1h\1w" + inStr.substr(i,1)
		
		if (i < inStr.length-1)
			if (inStr.substr(i+1,1) == " ")
				strAdd += "\1h\1c_";
			else
				strAdd += "\1h\1c" + inStr.substr(i+1,1);
			
		if (i < inStr.length-2)
			strAdd += "\1n\1c" + inStr.substr(i+2);
		
		strAdd += " \1h\1k³>\1n ";
		arr[arr.length] = strAdd;
	}
	
	arr[arr.length] = "\r" + strCenter + "\1h\1k<³\1n\1c " + inStr + " \1h\1k³>\1n "
	return arr;
}

function showMessages() {
	//If any awaiting messages, display them
	if (((system.node_list[bbs.node_num-1].misc&NODE_NMSG) != 0)||((system.node_list[bbs.node_num-1].misc&NODE_MSGW) != 0)) {
		bbs.menu.redraw = true; //redraw flag
		console.ansi_left(80);
		console.clearline();
		console.print("\1h\1n\1c---\r\n");
		while (((system.node_list[bbs.node_num-1].misc&NODE_NMSG) != 0)||((system.node_list[bbs.node_num-1].misc&NODE_MSGW) != 0)) {
			bbs.nodesync();
			sleep(200);
		}
	}
}

function pausePrompt(str) {
	//no pause in chat
	switch (system.node_list[bbs.node_num-1].action) {
		case (NODE_LCHT):
		case (NODE_MCHT):
		case (NODE_GCHT):
		case (NODE_PCHT):
		case (NODE_PAGE):
			//User in Chat, no pause.
			return "\r";
			break;
	}
	
	var sRet = ""; //return value
	var arrPrompts = loadPrompts(str); //Ansi Prompt(s)
	var iCurrent = 0; //current instance
	var bForward = true;
	
	console.ansi_left(80);
	console.clearline();
	while(bbs.online && bbs.menu.paused && (sRet == "")) {
		showMessages(); //show waiting messages, if any.
		sleep(150);

		//Display the current prompt		
		console.ansi_left(80);
		console.print(arrPrompts[iCurrent]);
		if (bForward) {
			iCurrent++;
			if (iCurrent == arrPrompts.length-1) bForward = false;
		} else {
			iCurrent--;
			if (iCurrent == 0) bForward = true;
		}
		
		//Get any waiting input.
		sRet = console.inkey();
		if (bbs.sys_status&SS_ABORT) {
			bbs.sys_status &= ~SS_ABORT;
			sRet = "\3";
		}
	}
	
	bbs.menu.paused = false;
	bbs.menu.redraw = true;
	console.ansi_left(80);
	console.clearline();
	console.print("\1h\1n\r");
	return sRet;
}

//Checks online status, shouldn't be run. :)
function main() {
	if (!bbs.online) return;
	
	//clear input buffer first.
//	while (console.inkey() != "") {
//		//do nothing	
//	};

	//clear abort tag
	bbs.sys_status &= ~SS_ABORT;
	
	if (bbs.menu.paused) {
		console.ansi_left(80);
		console.clearline();
		console.ansi_up();
		console.ungetstr("\r");
	} else {
		bbs.menu.paused = true;
		if (bAnsi) {
			//Ansi User	
			var sRet = pausePrompt("Press A Key");
			if (sRet != "") {
				sleep(10)
				//while (console.inkey() != "") {};
				console.ungetstr(sRet);
				sleep(10);
			}else{
				console.ungetstr("\r");
			}
		} else {
			console.print("\1h\1n\r[Press A Key] "); //Ascii User, display default prompt.
			sleep(100);
		}
		bbs.menu.paused = false;
		bbs.menu.redraw = true;
	}
}

main();
bbs.menu.paused = false;
bbs.menu.redraw = true;