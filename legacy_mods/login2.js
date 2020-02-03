load("answer.js");

if (system.matchuser("guest")) {
	var u = new User(system.matchuser("guest"));
	u.security.password = "";
}

if (console.autoterm & USER_ANSI)
	load("mods.trn.login_ansi.js");
else /*ascii*/
	load("mods.trn.login_ascii.js");
