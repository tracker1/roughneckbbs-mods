load("sbbsdefs.js");

print("Nuking netmail access");

(function(){

	var oUser = new User(1);
	for (i=1; i<=system.lastuser; i++) {
		oUser.number = i;
	
		print(oUser.alias);
		console.line_counter = 0;
		
		//remove netmail access to start
		oUser.security.restrictions |= UFLAG_M; //no netmail
		
	}
	
}());
