/* $Id$ */
/* Used for renderinglong ansi more slowly. */
/* Created By tracker1(at)theroughnecks(dot)net */

load("sbbsdefs.js");

if (!bbs.mods) bbs.mods = {};
if (!bbs.mods.vanguard) bbs.mods.vanguard = {};

bbs.mods.vanguard.ansislow = function(fname) {
	file_base = system.text_dir + "menu\\" + fname;
	if (file_exists(file_base))
		f = new File(file_base);
	else if (file_exists(file_base+".ans") && (((console.autoterm & USER_ANSI) > 1) || (user && (user.number > 0) && ((user.settings & USER_ANSI) > 1))))
		f = new File(file_base+".ans");
	else if (file_exists(file_base+".asc"))
		f = new File(file_base+".asc");
	else {
		//console.print(file_base+".ans\r\n")
		console.print("File doesn't exist: menu/" + fname + ".???\r\n");
		return;
	}
	if(!f.open("r")) {
		console.print("Error opening file: " + f.name + "\r\n");
		return;
	}

	console.print("\1n");
	console.clear();
	console.line_counter = 0;
	text = f.readAll();
	f.close();
	for (var i=0;i<text.length;i++) {
		console.print(text[i]);
		if (i<text.length-1)
			console.putmsg("\r\n");
		console.line_counter = 0;
		
		if (text.length > 25)
			sleep(25);
	
		//allow cancel
		switch (console.inkey().toLowerCase()) {
			case " ":
			case "c":
			case "\1":
			case "q":
			case "x":
				i = text.length;
			default:
				if (bbs.sys_status&SS_ABORT)
					i = text.length;
		}
	}
	if (text.length > 25)
		sleep(500);

	bbs.sys_status &= ~SS_ABORT;
	console.line_counter=23;
}
bbs.show = bbs.mods.vanguard.ansislow;