//Load Definition files
load("sbbsdefs.js");
//load("sys_doors_inc.js");

if (!bbs.menu)
	bbs.menu = {};

var System = eval("system");
var esc = "";
var bAnsi;
var bColor;
if ((bbs.sys_status&SS_USERON) !=0) {
	bAnsi = ((user.settings&USER_ANSI) != 0);
	bColor = ((user.settings&USER_COLOR) != 0);
}else{
	bAnsi = ((console.autoterm&USER_ANSI) != 0);
	bColor = ((console.autoterm&USER_COLOR) != 0);
}


var KEY_UP = String.fromCharCode(0x1e);
var KEY_DOWN = String.fromCharCode(0x0a);
var KEY_RIGHT = String.fromCharCode(0x06);
var KEY_LEFT = String.fromCharCode(0x1d);
var KEY_HOME = String.fromCharCode(0x02);
var KEY_END = String.fromCharCode(0x05);
var KEY_BACK = String.fromCharCode(0x08);
var KEY_DEL = String.fromCharCode(0x7F);

function ansixy(x,y) {
        return "" + esc + "[" + y + ";" + x + "H"
}

function formatDate(inDate) {
	var y = inDate.getYear();
	var m = inDate.getMonth();
	var d = inDate.getDate();

	if (y<1900) y += 1900;
	if (m<10) m="0"+m;
	if (d<10) d="0"+d;

	return (y + "-" + m + "-" + d);
}

function formatTime(inTime) {
	var h = inTime.getHours();
	var n = inTime.getMinutes();
	var s = inTime.getSeconds();

	if (h < 10) h = "0" + h
	if (n < 10) n = "0" + n
	if (s < 10) s = "0" + s

	return ("" + h + ":" + n + ":" + s);
}

function formateDateTime(inDT) {
	return formatDate(inDT) + " " + formatTime(inDT);
}

function checkMessages() {
	var bRet = false;
	if ((bbs.sys_status&SS_USERON) != 0) {
		if (bbs.menu.redraw) {
			console.line_counter = 0;
			console.print("\r\n");
			console.pause();
			bRet = true;
		}
		if (((system.node_list[bbs.node_num-1].misc&NODE_NMSG) != 0)||((system.node_list[bbs.node_num-1].misc&NODE_MSGW) != 0)) {
			console.print("\1" + "0");
			console.line_counter = 0;
			console.clear();
			console.print("\1n\1h\1yIncoming Private Message(s)!!\r\n");
			console.print("\r\n");
			while (((system.node_list[bbs.node_num-1].misc&NODE_NMSG) != 0)||((system.node_list[bbs.node_num-1].misc&NODE_MSGW) != 0)) {
				bbs.nodesync();
				sleep(500);
			}
			console.pause();
		}
	}
	return bRet;
}

function showNodelist() {
	bbs.menu.redraw = true; //reset redraw key
	console.print("\1h\1" +"0\1n");

	switch (system.node_list[bbs.node_num-1].action) {
		case (NODE_MCHT):
		case (NODE_LCHT):
		case (NODE_GCHT):
		case (NODE_PCHT):
		case (NODE_PAGE):
		case (NODE_RMSG):
			//User in Chat, or reading messages, no cls, no header.
			if (bbs.menu.paused) {
				//at a p-prompt
				console.ansi_up();
				console.clearline();
			}
			console.print("\1n \r\n");
			break;
		default:
			console.line_counter = 0;
			console.clear();
	}

	//Nodelist Header
	console.print("" +
		"\1h\1n\1c" +
		" N    User              A:S   Location                 Status               On\r\n" +
		"\1h\1k" +
		"ÄÄÄÄ ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ ÄÄÄÄÄ ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ ÄÄÄÄ\r\n" +
		"\1h\r\1n \r\n" +
		"");
	console.ansi_up();

	var iUsers = 0
	for (var n=0; n<system.node_list.length; n++) {
		var node = system.node_list[n]
		if(node.status==NODE_INUSE) {
			iUsers++;
			var oUser = new User(node.useron);
			var sBuffer = "                                                        ";
			var sNode = ((n+1) + sBuffer).substring(0,2);
			var sAgeSex = (oUser.age + oUser.gender.substring(0,1).toUpperCase() + sBuffer).substring(0,3);
			var sLocation = (oUser.location + sBuffer).substring(0,23);
			var sStatus = "";

			if(system.node_list[n].action==NODE_MCHT) {
				sStatus = "Chat #" + system.node_list[n].aux + " (" + oUser.handle + ")";
				sStatus = (sStatus + sBuffer).substring(0,19);
			} else {
				if(system.node_list[n].action==NODE_XTRN && system.node_list[n].aux) {
					//sStatus= doors[system.node_list[n].aux-1]
					sStatus = oUser.curxtrn;
					for (var g=0; g<xtrn_area.sec_list.length; g++)
						for (var a=0; a<xtrn_area.sec_list[g].prog_list.length; a++)
							if (xtrn_area.sec_list[g].prog_list[a].code.toLowerCase() = sStatus.toLowerCase())
								sStatus = xtrn_area.sec_list[g].prog_list[a].name;

				}else{
					sStatus=format(NodeAction[system.node_list[n].action],system.node_list[n].aux);
				}
				sStatus = (sStatus + sBuffer).substring(0,19);
			}

			var sFlags = "";

			if (oUser.security.level >= 85) {
				sUser = "\1h\1w" + (oUser.alias + sBuffer).substring(0,15);
			} else if (oUser.security.level >= 80) {
				sUser = "\1h\1y" + (oUser.alias + sBuffer).substring(0,15);
			} else if ((oUser.security.restrictions&UFLAG_G) != 0) {
				sUser = "\1h\1n\1c" + (oUser.alias + sBuffer).substring(0,15);
			} else {
				sUser = "\1h\1n" + (oUser.alias + sBuffer).substring(0,15);
			}

			if (oUser.security.flags2&UFLAG_G)
				sUser = "\1h\1g" + (oUser.alias + sBuffer).substring(0,15);

			if (oUser.security.flags2&UFLAG_C)
				sUser = "\1h\1c" + (oUser.alias + sBuffer).substring(0,15);

			if (oUser.security.flags1&UFLAG_V)
				sLocation = "\1n" + sLocation + "\1n\1c"


			t=time()-oUser.logontime;
        	if(t&0x80000000) t=0;
			t = Math.floor(t/60);


			if (false) sFlags += "";

			console.print("" +
				"\1h\1c " + sNode +
				"   " + sUser  +
				"  \1n\1c " + sAgeSex +
				"   " + sLocation +
				"  " + sStatus +
				"  " + t +
				"\r\n" +
				"");
		}
	}

	//Nodelist footer...
	console.print("" +
		"\1h\1k" +
		"ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ\r\n" +
		"\1h\r\1n" +
		"");

//	if (iUsers < 2) {
//		console.print("\1h\1r No other active nodes.\1n\r\n");
//	}

	return iUsers;
}

function fileShowFast(fname) {
	f = new File(fname);
	if(!f.open("r")) {
		alert("Error opening file: " + fname);
		return;
	}

	console.line_counter = 0;
	console.print("\1"+"0\1n\1w\1l");
	console.ansi_gotoxy(0,0);
	text = f.readAll();
	for (var i=0;i<text.length;i++) {
		console.print(text[i]);
		if (i<text.length-1)
			console.print("\r\n")
		console.line_counter = 0;
	}
	f.close();
}

function RunMenu(inName) {
	bbs.exec("?" + inName + ".js");
}

function MenuItem(inName,inCmdKey,inAction,inText,inTextOn,inTextOff,x,y) {
	this.name = inName;
	this.key = inCmdKey;
	this.go = inAction;
	this.text = inText;
	this.textOn = inTextOn;
	this.textOff = inTextOff;
	this.x = x;
	this.y = y;
	this.up = "";
	this.down = "";
	this.left = "";
	this.right = "";
	this.action = "";
}

function menuGetItemNumber(inMenu,inItem) {
	for (var item=0; item<inMenu.items.length; item++) {
		if (inMenu.items[item].name == inItem) {
			return item;
		}
	}
	return -1;
};

function menuAddItem(inMenu,inName,inCmdKey,inAction,inText,inTextOn,inTextOff,x,y) {
	inMenu.items[inMenu.items.length] = new MenuItem(inName,inCmdKey,inAction,inText,inTextOn,inTextOff,x,y)
	return inMenu.items[inMenu.items.length - 1];
}

function menuPrompt(inMenu) {
	if (bAnsi) {
		console.print("" +
			ansixy(inMenu.promptAnsiX,inMenu.promptAnsiY-1) +
			"\r\n" +
			ansixy(inMenu.promptAnsiX,inMenu.promptAnsiY) +
			inMenu.promptAnsi);
	}else{
		console.print(inMenu.prompt);
	}
}

function menuDeselectItem(inMenu,inItem) {
	var item = inMenu.items[inItem]
	console.ansi_gotoxy(item.x,item.y);
	if (bColor)
		console.print("\1h\1n"+item.textOff+"\1n");
	else
		console.print("\1h\1n"+item.textOff.toLowerCase()+"\1n");
}

function menuSelectItem(inMenu,inItem) {
	var item = inMenu.items[inItem]
	console.ansi_gotoxy(item.x,item.y);
	if (bColor)
		console.print("\1n"+item.textOn+"\1n");
	else
		console.print("\1n\1h"+item.textOn.toUpperCase()+"\1n");
}

function menuShowAscii(inMenu) {
	var text = "";
	var count=0;
	var col=0;
	var len = parseInt(80/inMenu.columns)-4;
	console.print("\r\n")
	while (count < inMenu.items.length) {
		item = inMenu.items[count];
		text = "\1w\1h " + item.key + "\1n - " + item.text;
		console.print(text.substring(0,len) + " ");

		count++
		col++
		if ((col == inMenu.columns)||(count == inMenu.items.length)) {
			console.print("\r\n");
			col = 0;
		}
	}
	menuPrompt(inMenu);
}

function menuShowAnsi(inMenu) {
	for (var i=0; i<inMenu.items.length; i++) {
		menuDeselectItem(inMenu,i);
	}
}

function menuMove(inMenu,inNext) {
	if (bAnsi) {
		var next = menuGetItemNumber(inMenu,inNext);
		if (next >= 0) {
			menuDeselectItem(inMenu,inMenu.current);
			menuSelectItem(inMenu,next);
			inMenu.current = next;
			if (inMenu.onChange) inMenu.onChange();
		}
	}
}

function menuRunItem(inMenu,inCmdKey) {
	if ((inCmdKey == "\n")||(inCmdKey == "\r")) {
		if (bAnsi&&(inMenu.items[inMenu.current].go)) {
			inMenu.items[inMenu.current].go();
		}else{
			if (inMenu.defaultOption && (inMenu.items[inMenu.defaultOption].go)) {
				inMenu.items[inMenu.defaultOption].go();
			}
		}
		return;
	}else{
		if ((inCmdKey == "\n")||(inCmdKey == "\r")) return;

		for (var i=0; i<inMenu.items.length; i++) {
			var key = inMenu.items[i].key.toUpperCase();
			if (key == inCmdKey.toUpperCase()) {
				if (inMenu.items[i].go) inMenu.items[i].go();
				return;
			}
		}
	}

	console.print("\1nINVALID COMMAND!");
	inMenu.redraw = true;
}

function menuGetOption(inMenu) {
	while (bbs.online && inMenu.active) {
		if (checkMessages()) {
			inMenu.redraw = true;
			return;
		}

//		if (inMenu.onRefresh) inMenu.onRefresh();
		if (bAnsi) menuPrompt(inMenu);

//		console.ansi_gotoxy(1,23);
		var c = console.inkey();
		if (c == "") {
			sleep(200);
		}else{
			switch (c) {
				case(KEY_UP):
					menuMove(inMenu,inMenu.items[inMenu.current].up);
					break;
				case(KEY_DOWN):
					menuMove(inMenu,inMenu.items[inMenu.current].down);
					break;
				case(KEY_RIGHT):
					menuMove(inMenu,inMenu.items[inMenu.current].right);
					break;
				case(KEY_LEFT):
					menuMove(inMenu,inMenu.items[inMenu.current].left);
					break;
				case("ÿ"):
					inMenu.active = false;
					break;
				case("!"):
					inMenu.redraw = true;
					return;
				default:
					menuRunItem(inMenu,c);
					return;
			}
		}
	}
}

function menuShow(inMenu) {
	inMenu.active = true;
	if (inMenu.defaultOption) inMenu.current=inMenu.defaultOption;

	while (bbs.online && inMenu.active) {
		if (inMenu.redraw) {
			fileShowFast(inMenu.background);
			if (inMenu.onChange) inMenu.onChange();
			inMenu.redraw = false;
			if ((bbs.sys_status&SS_USERON) != 0) bbs.menu.redraw = false;
		}

		if (inMenu.onLoad) inMenu.onLoad();

		if (bAnsi) {
			menuShowAnsi(inMenu);
			menuSelectItem(inMenu,inMenu.current);
		} else {
			menuShowAscii(inMenu);
		}
		console.line_counter = 0;
		menuGetOption(inMenu);
	}
}

function Menu(inName,inBG) {
	this.name = inName;
	this.active = false;
	this.quit = new Function("this.active = false;");
	this.background = "..\\text\\menu\\" + inBG + ((bAnsi)?".ans":".asc");
	this.redraw = true;
	this.columns = 1;
	this.prompt = "";
	this.promptAnsi = "\r\n";
	this.promptAnsiX = 1;
	this.promptAnsiY = 23;
	this.items = new Array();
	this.current = 0;
	this.defaultOption = null;
	this.onChange = "";
	this.onRefresh = "";
	this.onLoad = "";
	this.addItem = new Function("inName","inCmdKey","inAction","inText","inTextOn","inTextOff","x","y","return menuAddItem(this,inName,inCmdKey,inAction,inText,inTextOn,inTextOff,x,y);");
	this.appendItem = new Function("" +
		"inItem","" +
		"this.items[this.items.length]=inItem;" +
		"this.items[this.items.length-1].menu = this;" +
		"");
	this.show = new Function("menuShow(this);");
}
