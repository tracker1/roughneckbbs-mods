//Load Definition files
load("sbbsdefs.js");
if (bbs.online)
	if ((user.security.level >= 80)||(client.ip_address == "127.0.0.1")) {
		bbs.exec("iisreset");
	}

	if (bbs.menu.expertprompt)
		bbs.menu.redraw = true;
	else
		bbs.menu.reprompt = true;
