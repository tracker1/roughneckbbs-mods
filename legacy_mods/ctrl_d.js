//Load Definition files
load("sbbsdefs.js");
if (bbs.online)
	if ((user.security.level >= 90)||(client.ip_address == "127.0.0.1")) {
		var retry = true;
		do {
			console.print("\1n\r\n");
			console.line_counter = 0;
			console.clear();

			console.print("\1h\1bString to execute (blank line to cancel)\r\n: \1n");
			bbs.debugStr = console.getstr();

			if ((bbs.online)&&(bbs.debugStr != "")) {
				do {
					bbs.exec(bbs.debugStr);
					retry = console.yesno("Reload");
				} while ((bbs.online)&&(retry == true));
			}
		} while ((bbs.online)&&(bbs.debugStr != ""));
	}

	if (bbs.menu.expertprompt)
		bbs.menu.redraw = true;
	else
		bbs.menu.reprompt = true;
