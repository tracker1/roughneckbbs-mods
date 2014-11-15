load("sbbsdefs.js");
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
				if (parseInt(system.node_list[n].aux) > 0)
					sStatus = "Chat #" + system.node_list[n].aux + " (" + oUser.handle + ")";
				else
					sStatus = "Chatting";
				sStatus = (sStatus + sBuffer).substring(0,19);
			} else {
				if(system.node_list[n].action==NODE_XTRN && system.node_list[n].aux) {
					//sStatus= doors[system.node_list[n].aux-1]
					sStatus = oUser.curxtrn;

					for (var i=0; i<xtrn_area.sec_list.length; i++) {
						var xa = xtrn_area.sec_list[i];
						for (var j=0; j<xa.prog_list.length; j++) {
							var xp = xa.prog_list[j];
							if (xp.can_run)
								if (xp.code == sStatus) {
									sStatus = xp.name;
									j = 9999;
									i = 9999;
								}
						}
					}

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
			t = sBuffer + Math.floor(t/60);
			t = t.substr(t.length - 3, 3);


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

	console.print("\r");
	console.up();
	bbs.menu("webusers");
	
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

showNodelist();
if (bbs.online && (bbs.sys_status&SS_USERON) != 0) {
	if ((user.security.restrictions&UFLAG_C) == 0) {
//		showNodelist();
		var iStatus = system.node_list[bbs.node_num-1].action
		switch (iStatus) {
			case (NODE_LCHT):
			case (NODE_MCHT):
			case (NODE_GCHT):
			case (NODE_PCHT):
			case (NODE_PAGE):
				//User in Chat, no pause.
				break;
			default:
				console.pause();
				bbs.menu.paused = false;
		}
	}

	if (bbs.menu.expertprompt)
		bbs.menu.redraw = true;
	else
		bbs.menu.reprompt = true;
}else{
	console.ansi_up();
	console.ansi_up();
}
