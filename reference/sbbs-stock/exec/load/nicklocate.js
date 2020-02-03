function get_nicklocation(userhost,srvhost,nick)
{
	var ret,geo;

	function finger_from()
	{
		var sock = new Socket();
		var resp = '';
		var m;

		if(sock.connect(userhost,"finger")) {
			sock.send(nick+"\r\n");
			while(sock.is_connected) {
				var line=sock.readline();
				if(line)
					resp+=line+"\r\n";
			}
			if(m=resp.match(/\r\nLast login .*?\r\nvia .*? from .*? \[([^\]]+)\]/)) {
				sock.close();
				return m[1];
			}
		}
		sock.close();
		return userhost;
	}

	try {
		var userhost=userhost.replace(/^.*\@/,'');
		var i;
		var uha;
		// If the hostname is not a FQDN, use the server name and replace the first element...
		if(userhost.indexOf('.')==-1)
			userhost += (srvhost.replace(/^[^\.]+\./,'.'));
		// If the address is local, finger the server for the nick and use the From:
		userhost=resolve_ip(userhost, true);
		if(userhost.constructor==Array)
			uha=userhost;
		else
			userhost=[userhost];
		for(i in uha) {
			userhost=uha[i];
			if(userhost.search(/^10\./) != -1
					|| userhost.search(/^192\.168\./) != -1
					|| userhost.search(/^172\.16\./) != -1
					|| userhost.search(/^172\.17\./) != -1
					|| userhost.search(/^172\.18\./) != -1
					|| userhost.search(/^172\.19\./) != -1
					|| userhost.search(/^172\.2[0-9]\./) != -1
					|| userhost.search(/^172\.30\./) != -1
					|| userhost.search(/^172\.31\./) != -1
					|| userhost.search(/^127\.0\.0\./) != -1
					|| (userhost.search(/^169\.254\./) != -1
						&& userhost.search(/^169\.254\.0\./) == -1
						&& userhost.search(/^169\.254\.255\./) == -1
						)
					|| userhost.search(/^fc[0-9a-f][0-9a-f]:/) != -1
					|| userhost.search(/^fd[0-9a-f][0-9a-f]:/) != -1
					|| userhost.search(/^fec[0-9a-f]:/) != -1
					|| userhost.search(/^fed[0-9a-f]:/) != -1
					|| userhost.search(/^fee[0-9a-f]:/) != -1
					|| userhost.search(/^fef[0-9a-f]:/) != -1
					|| userhost.search(/^fe8[0-9a-f]:/) != -1
					|| userhost.search(/^fe9[0-9a-f]:/) != -1
					|| userhost.search(/^fea[0-9a-f]:/) != -1
					|| userhost.search(/^feb[0-9a-f]:/) != -1)
				userhost=finger_from();
			geo=get_geoip(userhost);
			if(geo != undefined)
				return geo;
		}
	}
	catch(e) {
		log("ERROR: " + e);
	}
}
