//web_login service
load("sbbsdefs.js");
load("newsutil.js");

var u = client.socket.recvline(25 /*maxlen*/, 30 /*timeout*/);
var p = client.socket.recvline(8 /*maxlen*/, 30 /*timeout*/);

if (u && u.length > 0) {
	if (p == null) p = "";
	if (login(u, p)) {
		var fn = user.number.toString();
		
		
		//write door list for use with auto-connect web mode.. :D
		
		while (fn.length < 4)
			fn = "0" + fn;
			
		fn += ".doorlist.xml"
		
		
		var f = new File(system.data_dir + "/user/" + fn);
		if (f.open("wb")) {
			try {
				f.write('<groups>\r\n');
				for (x in xtrn_area.sec_list) {
					f.write(
						'\r\n\t<group code="{0}" name="{1}" count="{2}">\r\n\t\t<doors>\r\n'.replace('{0}', xtrn_area.sec_list[x].code).replace('{1}', xtrn_area.sec_list[x].name).replace('{2}', xtrn_area.sec_list[x].prog_list.length)
					);
					
					for (y in xtrn_area.sec_list[x].prog_list) {
						f.write(
							'\t\t<door code="{0}" name="{1}" />\r\n'.replace(
								'{0}',
								xtrn_area.sec_list[x].prog_list[y].code
							).replace(
								'{1}',
								xtrn_area.sec_list[x].prog_list[y].name
							)
						);
					}
					f.write("\t\t</doors>\r\n\t</group>\r\n");
				}
				f.write("</groups>\r\n");
			} catch(err) {
				f.write("<!--//\r\n" + err.toString() + "\r\n-->\r\n")
			}
			f.flush();
			f.close();
		}
			
	}
}
