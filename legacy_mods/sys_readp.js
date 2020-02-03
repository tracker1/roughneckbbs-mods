// =====================================================
// Custom Read Prompt - For Synchronet 3.10j+
// -----------------------------------------------------
// Replace line 071 in text.dat with "@EXEC:sys_readp@"
// =====================================================
load("sbbsdefs.js");

//Ansi Keys
var KEY_UP = String.fromCharCode(0x1e);
var KEY_DOWN = String.fromCharCode(0x0a);
var KEY_RIGHT = String.fromCharCode(0x06);
var KEY_LEFT = String.fromCharCode(0x1d);
var KEY_HOME = String.fromCharCode(0x02);
var KEY_END = String.fromCharCode(0x05);
var KEY_BACK = String.fromCharCode(0x08);
var KEY_DEL = String.fromCharCode(0x7F);

function inputNumber(inNumber,iMax) {
	
	var bDone = false;
	var sRet = "" + inNumber;
	
	console.print(inNumber);
	while (bbs.online && (!bDone)) {
		if ((sRet.length >= iMax.toString().length)||((sRet.length == iMax.toString().length-1)&&(parseInt(sRet.substr(0,1)) > parseInt(iMax.toString().substr(0,1))))) {
			console.ansi_left(sRet.length);
			console.print("                                             ".substr(0,sRet.length));
			console.ansi_left(sRet.length);
			return "" + sRet;
		}

		var c = console.getkey();
		
		if (c != "") {
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
				case "0":
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				case "7":
				case "8":
				case "9":
					sRet += "" + c;
					console.print(c);
					break;
				case "\r":
				case "\n":
					bDone = true;
					break;
				default:
					sleep(200);
			}
		}
	}
	
	if (sRet != "") {
		console.ansi_left(sRet.length);
		console.print("                                             ".substr(0,sRet.length));
		console.ansi_left(sRet.length);
		return sRet + "\r";
	} else {
		return "";
	}
}

//Main function that is called on load
function readPrompt() {
	//Ansi Prompt(s)
	var arrPrompts = new Array(5);
	arrPrompts[0] = "\1h\r\1n\1cReading Messages \1h\1k³³ \1n<\1" + "6\1h\1wprev\1n>\1h\1k [\1nnext\1n\1h\1k] [\1nreply\1n\1h\1k] [\1npost\1n\1h\1k] [\1nquit\1n\1h\1k] ³³ (\1y?\1k-\1n\1chelp\1h\1k) \1n\1c: \1n";
	arrPrompts[1] = "\1h\r\1n\1cReading Messages \1h\1k³³ [\1nprev\1n\1h\1k] \1n<\1" + "6\1h\1wnext\1n>\1h\1k [\1nreply\1n\1h\1k] [\1npost\1n\1h\1k] [\1nquit\1n\1h\1k] ³³ (\1y?\1k-\1n\1chelp\1h\1k) \1n\1c: \1n";
	arrPrompts[2] = "\1h\r\1n\1cReading Messages \1h\1k³³ [\1nprev\1n\1h\1k] [\1nnext\1n\1h\1k] \1n<\1" + "6\1h\1wreply\1n>\1h\1k [\1npost\1n\1h\1k] [\1nquit\1n\1h\1k] ³³ (\1y?\1k-\1n\1chelp\1h\1k) \1n\1c: \1n";
	arrPrompts[3] = "\1h\r\1n\1cReading Messages \1h\1k³³ [\1nprev\1n\1h\1k] [\1nnext\1n\1h\1k] [\1nreply\1n\1h\1k] \1n<\1" + "6\1h\1wpost\1n>\1h\1k [\1nquit\1n\1h\1k] ³³ (\1y?\1k-\1n\1chelp\1h\1k) \1n\1c: \1n";
	arrPrompts[4] = "\1h\r\1n\1cReading Messages \1h\1k³³ [\1nprev\1n\1h\1k] [\1nnext\1n\1h\1k] [\1nreply\1n\1h\1k] [\1npost\1n\1h\1k] \1n<\1" + "6\1h\1wquit\1n>\1h\1k ³³ (\1y?\1k-\1n\1chelp\1h\1k) \1n\1c: \1n";
	
	if ((system.settings & SYS_RA_EMU) != 0)
		var arrValues = new Array("-","\r","R","P","Q"); //R=replay; A=again
	else
		var arrValues = new Array("-","\r","A","P","Q"); //A=answer; R=ReRead
	
	var iCurrent = 1; //default is next.
	bbs.menu.redraw = true;	//set redraw flag
	bbs.menu.paused = true; //set paused/prompt flag
	bbs.nodesync(); //sync node... :)
	
	var sRet = ""; //return value
	
	console.print("\1h\1n\1cÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ\r\n")
	while (bbs.online && (sRet == "")) {
		//If any awaiting messages, display them
		if (((system.node_list[bbs.node_num-1].misc&NODE_NMSG) != 0)||((system.node_list[bbs.node_num-1].misc&NODE_MSGW) != 0)) {
			console.ansi_left(80);
			console.clearline();
			bbs.nodesync();
			console.print("\r\n");
			console.ansi_up();
			bbs.menu.redraw = true;
			sleep(100);
		}

		//draw/redraw prompt if needed.
		if (bbs.menu.redraw) {
			console.ansi_left(80);
			console.line_counter = 0;
			bbs.menu.redraw = false;
			console.print(arrPrompts[iCurrent]);
		}
		
		//Get any waiting input.
		var c = console.inkey();
		if (c == "") 
			sleep(200);
		else
			switch (c) {
				case KEY_LEFT:
					//previous menu item
					iCurrent -= 1;
					if (iCurrent < 0)
						iCurrent = arrPrompts.length-1;
					bbs.menu.redraw = true;
					break;
				case KEY_RIGHT:
					//next menu item
					iCurrent += 1;
					if (iCurrent >= arrPrompts.length)
						iCurrent = 0;
					bbs.menu.redraw = true;
					break;
				case KEY_UP:
					//up arrow
					sRet = "-";
					break;
				case KEY_DOWN:
					sRet = "\r";
					break;
				case "0":
					break;
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				case "7":
				case "8":
				case "9":
					sRet = inputNumber(c,bbs.smb_msgs);
					if (sRet != "") {
						sRet = sRet;
					}
					break;
				case "\r":
				case "\n":
					sRet = arrValues[iCurrent];
					break;
				case "?":
					console.print("\r\n\r\n\1nSynchronet Read Prompt by tracker1@theroughnecks.net\r\n\r\n");
					sleep(500);
				default:
					if ("\r-CALTPDRMYFBIQO<>{}[]?".indexOf(c.toUpperCase()) >= 0)
						sRet = c;
			}
	}
	
	bbs.menu.redraw = true; //reset redraw flag
	bbs.menu.paused = false; //reset paused/prompt flag

	return sRet;
}

//Checks online status, shouldn't be run. :)
function main() {
	if (bbs.online) {
		if (!bbs.menu) bbs.menu = {};
		if ((user.settings&USER_ANSI) == 0) {
			//Ascii User, display default prompt.
			console.print("\1n\1cReading Messages \1h\1k(\1y?\1k-\1n\1chelp\1h\1k) \1n\1c: \1n");
		} else {
			var sRet = readPrompt();
			sleep(10)
			while (console.inkey() != "") {};
			console.ungetstr(sRet);
			sleep(10);
		}
		bbs.menu.paused = false;
	}
}
main();