//mods.vanguard.sbbsXML.js
load("sbbsdefs.js");

function escapeToXML(str) {
	var tmp = "" + str;
	var ret = "";
	
	for (var i=0; i<tmp.length; i++) {
		c = tmp.substring(i,i+1);
		switch(c) {
			case "&":
				ret += "&amp;";
				break;
			case "<":
				ret += "&lt;";
				break;
			case ">":
				ret += "&gt;";
				break;
			case "\"":
				ret += "&quot;";
				break;
			case "'":
				ret += "&apos;";
				break;
			default:
				if ((c.charCodeAt(0) > 31) && (c.charCodeAt(0) < 128))
					ret += c;
				else
					ret += "&#" + c.charCodeAt(0) + ";";
		}
	}
	return ret;
}

//light user information, for nodelist display
function smallUserToXML(oUser) {
	return format(
		'<user number="%u" alias="%s" name="%s" handle="%s" location="%s" age="%s" gender="%s" curxtrn="%s" logontime="%s" />',
		oUser.number,
		escapeToXML(oUser.alias),
		escapeToXML(oUser.name),
		escapeToXML(oUser.handle),
		escapeToXML(oUser.location),
		escapeToXML(oUser.age),
		escapeToXML(oUser.gender),
		escapeToXML(oUser.curxtrn),
		escapeToXML((new Date(oUser.logontime*1000)).toGMTString())
	);
}

system.node_list.toXML = function() {
	var ret = "";
	
	var usersOn = new Array();
	var node;
	ret += ('\t<nodes count="' + this.length + '">\r\n');
	for(n=0;n<this.length;n++) {
		if ((this[n].status == NODE_INUSE) && (this[n].useron > 0))
			usersOn[usersOn.length] = this[n].useron;
		
		ret += format(
			'\t\t<node id="%u" status="%u" errors="%u" action="%u" useron="%u" connection="%u" misc="%u" aux="%u" extaux="%u" />\r\n',
			n,
			this[n].status,
			this[n].errors,
			this[n].action,
			this[n].useron,
			this[n].connection,
			this[n].misc,
			this[n].aux,
			this[n].extaux
		);
	}
	ret += '\t</nodes>\r\n';
	
	ret += '\t<users count="' + usersOn.length + '">\r\n';
	var u = new User(1);
	for (var i=0; i<usersOn.length; i++) {
		u.number = usersOn[i];
		ret += "\t\t" + smallUserToXML(u) + "\r\n";
	}
	ret += '\t</users>\r\n';
	
	return ret;
}

xtrn_area.toXML = function() {
	ret = "";
	for (var i=0; i<this.sec_list.length; i++) {
		var xa = this.sec_list[i];
		ret += format(
			'\t<area number="%u" code="%s" name="%s">\r\n',
			xa.number,
			escapeToXML(xa.code),
			escapeToXML(xa.name),
			escapeToXML(xa.ars)
		);
		for (var j=0; j<xa.prog_list.length; j++) {
			var xp = xa.prog_list[j];
			ret += format(
				'\t\t<program number="%u" code="%s" name="%s" />\r\n',
				xp.number,
				escapeToXML(xp.code),
				escapeToXML(xp.name)
			);
		}
		ret += "\t</area>\r\n"
	}
	
	return ret;
}

system.toXML = function() {
	ret = "<system \r\n" +
		"\tname=\"" + escapeToXML(system.name) + "\" \r\n" +
		"\toperator=\"" + escapeToXML(system.operator) + "\" \r\n" +
		"\tqwk_id=\"" + escapeToXML(system.qwk_id) + "\" \r\n" +
		"\tsettings=\"" + escapeToXML(system.settings) + "\" \r\n" +
		"\tpsname=\"" + escapeToXML(system.psname) + "\" \r\n" +
		"\tpsnum=\"" + escapeToXML(system.psnum) + "\" \r\n" +
		"\tinet_addr=\"" + escapeToXML(system.inet_addr) + "\" \r\n" +
		"\tlocation=\"" + escapeToXML(system.location) + "\" \r\n" +
		"\ttimezone=\"" + escapeToXML(system.timezone) + "\" \r\n" +
		"\tpwdays=\"" + escapeToXML(system.pwdays) + "\" \r\n" +
		"\tdeldays=\"" + escapeToXML(system.deldays) + "\" \r\n" +
		"\tlastuser=\"" + escapeToXML(system.lastuser) + "\" \r\n" +
		"\tlastuseron=\"" + escapeToXML(system.lastuseron) + "\" \r\n" +
		"\tfreediskspace=\"" + escapeToXML(system.freediskspace) + "\" \r\n" +
		"\tfreediskspacek=\"" + escapeToXML(system.freediskspacek) + "\" \r\n" +
		"\tnodes=\"" + escapeToXML(system.nodes) + "\" \r\n" +
		"\tnewuser_password=\"" + ((!logged_in)||(logged_in && user.compare_ars("SYSOP"))?escapeToXML(system.newuser_password):"") + "\" \r\n" +
		"\tnewuser_magic_word=\"" + ((!logged_in)||(logged_in && user.compare_ars("SYSOP"))?escapeToXML(system.newuser_magic_word):"") + "\" \r\n" +
		"\tnewuser_level=\"" + escapeToXML(system.newuser_level) + "\" \r\n" +
		"\tnewuser_flags1=\"" + escapeToXML(system.newuser_flags1) + "\" \r\n" +
		"\tnewuser_flags2=\"" + escapeToXML(system.newuser_flags2) + "\" \r\n" +
		"\tnewuser_flags3=\"" + escapeToXML(system.newuser_flags3) + "\" \r\n" +
		"\tnewuser_flags4=\"" + escapeToXML(system.newuser_flags4) + "\" \r\n" +
		"\tnewuser_restrictions=\"" + escapeToXML(system.newuser_restrictions) + "\" \r\n" +
		"\tnewuser_exemptions=\"" + escapeToXML(system.newuser_exemptions) + "\" \r\n" +
		"\tnewuser_credits=\"" + escapeToXML(system.newuser_credits) + "\" \r\n" +
		"\tnewuser_minutes=\"" + escapeToXML(system.newuser_minutes) + "\" \r\n" +
		"\tnewuser_command_shell=\"" + escapeToXML(system.newuser_command_shell) + "\" \r\n" +
		"\tnewuser_editor=\"" + escapeToXML(system.newuser_editor) + "\" \r\n" +
		"\tnewuser_settings=\"" + escapeToXML(system.newuser_settings) + "\" \r\n" +
		"\tnewuser_download_protocol=\"" + escapeToXML(system.newuser_download_protocol) + "\" \r\n" +
		"\tnewuser_expiration_days=\"" + escapeToXML(system.newuser_expiration_days) + "\" \r\n" +
		"\tnewuser_question=\"" + escapeToXML(system.newuser_question) + "\" \r\n" +
		"\texpired_level=\"" + escapeToXML(system.expired_level) + "\" \r\n" +
		"\texpired_flags1=\"" + escapeToXML(system.expired_flags1) + "\" \r\n" +
		"\texpired_flags2=\"" + escapeToXML(system.expired_flags2) + "\" \r\n" +
		"\texpired_flags3=\"" + escapeToXML(system.expired_flags3) + "\" \r\n" +
		"\texpired_flags4=\"" + escapeToXML(system.expired_flags4) + "\" \r\n" +
		"\texpired_restrictions=\"" + escapeToXML(system.expired_restrictions) + "\" \r\n" +
		"\texpired_exceptions=\"" + escapeToXML(system.expired_exceptions) + "\" \r\n" +
		"\tnode_dir=\"" + escapeToXML(system.node_dir) + "\" \r\n" +
		"\tctrl_dir=\"" + escapeToXML(system.ctrl_dir) + "\" \r\n" +
		"\tdata_dir=\"" + escapeToXML(system.data_dir) + "\" \r\n" +
		"\ttext_dir=\"" + escapeToXML(system.text_dir) + "\" \r\n" +
		"\ttemp_dir=\"" + escapeToXML(system.temp_dir) + "\" \r\n" +
		"\texec_dir=\"" + escapeToXML(system.exec_dir) + "\" \r\n" +
		"\tmods_dir=\"" + escapeToXML(system.mods_dir) + "\" \r\n" +
		"\tlogs_dir=\"" + escapeToXML(system.logs_dir) + "\" \r\n" +
		"\tclock_ticks=\"" + escapeToXML(system.clock_ticks) + "\" \r\n" +
		"\tclock_ticks_per_second=\"" + escapeToXML(system.clock_ticks_per_second) + "\" \r\n" +
		"\tlocal_host_name=\"" + escapeToXML(system.local_host_name) + "\" \r\n" +
		"\thost_name=\"" + escapeToXML(system.host_name) + "\" \r\n" +
		"\tversion=\"" + escapeToXML(system.version) + "\" \r\n" +
		"\trevision=\"" + escapeToXML(system.revision) + "\" \r\n" +
		"\tbeta_version=\"" + escapeToXML(system.beta_version) + "\" \r\n" +
		"\tversion_notice=\"" + escapeToXML(system.version_notice) + "\" \r\n" +
		"\tplatform=\"" + escapeToXML(system.platform) + "\" \r\n" +
		"\tsocket_lib=\"" + escapeToXML(system.socket_lib) + "\" \r\n" +
		"\tmsgbase_lib=\"" + escapeToXML(system.msgbase_lib) + "\" \r\n" +
		"\tcompiled_with=\"" + escapeToXML(system.compiled_with) + "\" \r\n" +
		"\tcompiled_when=\"" + escapeToXML(system.compiled_when) + "\" \r\n" +
		"\tcopyright=\"" + escapeToXML(system.copyright) + "\" \r\n" +
		"\tjs_version=\"" + escapeToXML(system.js_version) + "\" \r\n" +
		"\tos_version=\"" + escapeToXML(system.os_version) + "\" \r\n" +
		"\tuptime=\"" + escapeToXML((new Date(system.uptime * 1000)).toGMTString()) + "\" \r\n" +
		">\r\n";
		
	ret += "\t<stats \r\n" +
		"\t\ttotal_logons=\"" + escapeToXML(system.stats.total_logons) + "\" \r\n" +
		"\t\tlogons_today=\"" + escapeToXML(system.stats.logons_today) + "\" \r\n" +
		"\t\ttotal_timeon=\"" + escapeToXML(system.stats.total_timeon) + "\" \r\n" +
		"\t\ttimeon_today=\"" + escapeToXML(system.stats.timeon_today) + "\" \r\n" +
		"\t\ttotal_files=\"" + escapeToXML(system.stats.total_files) + "\" \r\n" +
		"\t\tfiles_uploaded_today=\"" + escapeToXML(system.stats.files_uploaded_today) + "\" \r\n" +
		"\t\tbytes_uploaded_today=\"" + escapeToXML(system.stats.bytes_uploaded_today) + "\" \r\n" +
		"\t\tfiles_downloaded_today=\"" + escapeToXML(system.stats.files_downloaded_today) + "\" \r\n" +
		"\t\tbytes_downloaded_today=\"" + escapeToXML(system.stats.bytes_downloaded_today) + "\" \r\n" +
		"\t\ttotal_messages=\"" + escapeToXML(system.stats.total_messages) + "\" \r\n" +
		"\t\tmessages_posted_today=\"" + escapeToXML(system.stats.messages_posted_today) + "\" \r\n" +
		"\t\ttotal_email=\"" + escapeToXML(system.stats.total_email) + "\" \r\n" +
		"\t\temail_sent_today=\"" + escapeToXML(system.stats.email_sent_today) + "\" \r\n" +
		"\t\ttotal_feedback=\"" + escapeToXML(system.stats.total_feedback) + "\" \r\n" +
		"\t\tfeedback_sent_today=\"" + escapeToXML(system.stats.feedback_sent_today) + "\" \r\n" +
		"\t\ttotal_users=\"" + escapeToXML(system.stats.total_users) + "\" \r\n" +
		"\t\tnew_users_today=\"" + escapeToXML(system.stats.new_users_today) + "\" \r\n" +
		"\t/>\r\n";
	
	ret += "</system>\r\n";
	
	return ret;
}

//full user information, for detail display
function userToXML(oUser) {
	ret = "<user \r\n" +
		"\tnumber=\"" + escapeToXML(oUser.number) + "\" \r\n" +
		"\talias=\"" + escapeToXML(oUser.alias) + "\" \r\n" +
		"\tname=\"" + escapeToXML(oUser.name) + "\" \r\n" +
		"\thandle=\"" + escapeToXML(oUser.handle) + "\" \r\n" +
		"\tip_address=\"" + escapeToXML(oUser.ip_address) + "\" \r\n" +
		"\tnote=\"" + escapeToXML(oUser.note) + "\" \r\n" +
		"\thost_name=\"" + escapeToXML(oUser.host_name) + "\" \r\n" +
		"\tcomputer=\"" + escapeToXML(oUser.computer) + "\" \r\n" +
		"\tcomment=\"" + escapeToXML(oUser.comment) + "\" \r\n" +
		"\tnetmail=\"" + escapeToXML(oUser.netmail) + "\" \r\n" +
		"\temail=\"" + escapeToXML(oUser.email) + "\" \r\n" +
		"\taddress=\"" + escapeToXML(oUser.address) + "\" \r\n" +
		"\tlocation=\"" + escapeToXML(oUser.location) + "\" \r\n" +
		"\tzipcode=\"" + escapeToXML(oUser.zipcode) + "\" \r\n" +
		"\tphone=\"" + escapeToXML(oUser.phone) + "\" \r\n" +
		"\tbirthdate=\"" + escapeToXML(oUser.birthdate) + "\" \r\n" +
		"\tage=\"" + escapeToXML(oUser.age) + "\" \r\n" +
		"\tconnection=\"" + escapeToXML(oUser.connection) + "\" \r\n" +
		"\tmodem=\"" + escapeToXML(oUser.modem) + "\" \r\n" +
		"\tscreen_rows=\"" + escapeToXML(oUser.screen_rows) + "\" \r\n" +
		"\tgender=\"" + escapeToXML(oUser.gender) + "\" \r\n" +
		"\tcursub=\"" + escapeToXML(oUser.cursub) + "\" \r\n" +
		"\tcurxtrn=\"" + escapeToXML(oUser.curxtrn) + "\" \r\n" +
		"\teditor=\"" + escapeToXML(oUser.editor) + "\" \r\n" +
		"\tcommand_shell=\"" + escapeToXML(oUser.command_shell) + "\" \r\n" +
		"\tsettings=\"" + escapeToXML(oUser.settings) + "\" \r\n" +
		"\tqwk_settings=\"" + escapeToXML(oUser.qwk_settings) + "\" \r\n" +
		"\tchat_settings=\"" + escapeToXML(oUser.chat_settings) + "\" \r\n" +
		"\ttemp_file_ext=\"" + escapeToXML(oUser.temp_file_ext) + "\" \r\n" +
		"\tnew_file_time=\"" + escapeToXML((new Date(oUser.new_file_time * 1000)).toGMTString()) + "\" \r\n" +
		"\tdownload_protocol=\"" + escapeToXML(oUser.download_protocol) + "\" \r\n" +
		"\tlogontime=\"" + escapeToXML((new Date(oUser.logontime * 1000)).toGMTString()) + "\" \r\n" +
		">\r\n";
		
	ret += "\t<stats \r\n" +
		"\t\tlaston_date=\"" + escapeToXML((new Date(oUser.stats.laston_date * 1000)).toGMTString()) + "\" \r\n" +
		"\t\tfirston_date=\"" + escapeToXML((new Date(oUser.stats.firston_date * 1000)).toGMTString()) + "\" \r\n" +
		"\t\ttotal_logons=\"" + escapeToXML(oUser.stats.total_logons) + "\" \r\n" +
		"\t\tlogons_today=\"" + escapeToXML(oUser.stats.logons_today) + "\" \r\n" +
		"\t\ttotal_timeon=\"" + escapeToXML(oUser.stats.total_timeon) + "\" \r\n" +
		"\t\ttimeon_last_logon=\"" + escapeToXML(oUser.stats.timeon_last_logon) + "\" \r\n" +
		"\t\ttotal_posts=\"" + escapeToXML(oUser.stats.total_posts) + "\" \r\n" +
		"\t\ttotal_emails=\"" + escapeToXML(oUser.stats.total_emails) + "\" \r\n" +
		"\t\ttotal_feedbacks=\"" + escapeToXML(oUser.stats.total_feedbacks) + "\" \r\n" +
		"\t\temail_today=\"" + escapeToXML(oUser.stats.email_today) + "\" \r\n" +
		"\t\tposts_today=\"" + escapeToXML(oUser.stats.posts_today) + "\" \r\n" +
		"\t\tbytes_uploaded=\"" + escapeToXML(oUser.stats.bytes_uploaded) + "\" \r\n" +
		"\t\tfiles_uploaded=\"" + escapeToXML(oUser.stats.files_uploaded) + "\" \r\n" +
		"\t\tbytes_downloaded=\"" + escapeToXML(oUser.stats.bytes_downloaded) + "\" \r\n" +
		"\t\tfiles_downloaded=\"" + escapeToXML(oUser.stats.files_downloaded) + "\" \r\n" +
		"\t\tleech_attempts=\"" + escapeToXML(oUser.stats.leech_attempts) + "\" \r\n" +
		"\t/>\r\n";
		
		// extended properties only for current user
		if ((!logged_in /* SYSTEM */)||(user.number==oUser.number /*current user*/ || user.compare_ars("SYSOP") /* SysOp */)) {
			ret += "\t<limits \r\n" +
				"\t\ttime_per_logon=\"" + escapeToXML(oUser.limits.time_per_logon) + "\" \r\n" +
				"\t\ttime_per_day=\"" + escapeToXML(oUser.limits.time_per_day) + "\" \r\n" +
				"\t\tlogons_per_day=\"" + escapeToXML(oUser.limits.logons_per_day) + "\" \r\n" +
				"\t\tlines_per_message=\"" + escapeToXML(oUser.limits.lines_per_message) + "\" \r\n" +
				"\t\temail_per_day=\"" + escapeToXML(oUser.limits.email_per_day) + "\" \r\n" +
				"\t\tposts_per_day=\"" + escapeToXML(oUser.limits.posts_per_day) + "\" \r\n" +
				"\t\tfree_credits_per=\"" + escapeToXML(oUser.limits.free_credits_per) + "\" \r\n" +
				"\t/>\r\n";
				
			ret += "\t<security \r\n" +
				"\t\tpassword=\"" + escapeToXML(oUser.security.password) + "\" \r\n" +
				"\t\tpassword_date=\"" + escapeToXML((new Date(oUser.security.password_date * 1000)).toGMTString()) + "\" \r\n" +
				"\t\tlevel=\"" + escapeToXML(oUser.security.level) + "\" \r\n" +
				"\t\tflags1=\"" + escapeToXML(oUser.security.flags1) + "\" \r\n" +
				"\t\tflags2=\"" + escapeToXML(oUser.security.flags2) + "\" \r\n" +
				"\t\tflags3=\"" + escapeToXML(oUser.security.flags3) + "\" \r\n" +
				"\t\tflags4=\"" + escapeToXML(oUser.security.flags4) + "\" \r\n" +
				"\t\texemptions=\"" + escapeToXML(oUser.security.exemptions) + "\" \r\n" +
				"\t\trestrictions=\"" + escapeToXML(oUser.security.restrictions) + "\" \r\n" +
				"\t\tcredits=\"" + escapeToXML(oUser.security.credits) + "\" \r\n" +
				"\t\tfree_credits=\"" + escapeToXML(oUser.security.free_credits) + "\" \r\n" +
				"\t\tminutes=\"" + escapeToXML(oUser.security.minutes) + "\" \r\n" +
				"\t\textra_time=\"" + escapeToXML(oUser.security.extra_time) + "\" \r\n" +
				"\t\texpiration_date=\"" + escapeToXML((new Date(oUser.security.expiration_date * 1000)).toGMTString()) + "\" \r\n" +
				"\t/>\r\n";
			
			ret += "\t<subs>\r\n";
			
			for (x in msg_area.sub)
				ret += '\t\t<sub ' +
					'number="' + escapeToXML(msg_area.sub[x].number) + '" ' +
					'grp_number="' + escapeToXML(msg_area.sub[x].grp_number) + '" ' +
					'grp_name="' + escapeToXML(msg_area.grp_list[msg_area.sub[x].grp_number].name) + '" ' +
					'grp_description="' + escapeToXML(msg_area.grp_list[msg_area.sub[x].grp_number].name) + '" ' +
					'code="' + escapeToXML(msg_area.sub[x].code) + '" ' +
					'name="' + escapeToXML(msg_area.sub[x].name) + '" ' +
					'description="' + escapeToXML(msg_area.sub[x].description) + '" ' +
					'qwk_name="' + escapeToXML(msg_area.sub[x].qwk_name) + '" ' +
					'newsgroup="' + escapeToXML(msg_area.sub[x].newsgroup) + '" ' +
					'is_operator="' + escapeToXML(msg_area.sub[x].is_operator) + '" ' +
					'is_moderated="' + escapeToXML(msg_area.sub[x].is_moderated) + '" ' +
					'is_moderator="' + escapeToXML(oUser.compare_ars(msg_area.sub[x].moderated_ars)) + '" ' +
					'can_read="' + escapeToXML(msg_area.sub[x].can_read) + '" ' +
					'can_post="' + escapeToXML(msg_area.sub[x].can_post) + '" ' +
					'scan_ptr="' + escapeToXML(msg_area.sub[x].scan_ptr) + '" ' +
					'scan_cfg="' + escapeToXML(msg_area.sub[x].scan_cfg) + '" ' +
					'lead_read="' + escapeToXML(msg_area.sub[x].lead_read) + '" ' +
					'/>\r\n';
			
			ret += "\t</subs>\r\n";
		}
		
	ret += "</user>"
	return ret;
}
