// $Id: ircbot_functions.js,v 1.32 2019/05/15 16:45:18 mcmlxxix Exp $
/*

 This program is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details:
 http://www.gnu.org/licenses/gpl.txt

 Copyright 2010 Randolph E. Sommerfeld <sysop@rrx.ca>

*/

/* Server methods */
function Server_command(srv,cmdline,onick,ouh) {
	var cmd=IRC_parsecommand(cmdline);
	if (cmd === 0)
		return;
	var chan=get_command_channel(srv,cmd);
	var main_cmd=cmd.shift();
	if(Server_Commands[main_cmd]) Server_Commands[main_cmd](srv,cmd,onick,ouh);
	for(var m in Modules) {
		var module=Modules[m];
		if(chan	&& chan.modules[m] != true) {
			continue;
		}
		if(module 
			&& module.enabled 
			&& module.Server_Commands[main_cmd]) {
			try {
				cmd=IRC_parsecommand(cmdline);
				if (cmd === 0)
					return;
				cmd.shift();
				module.Server_Commands[main_cmd](srv,cmd,onick,ouh);	
			} catch(e) {
				log(m + " module error: " + e);
				module.enabled=false;
			}
		}
	}
}

function Server_CTCP(onick,ouh,cmd) {
	switch (cmd[0]) {
		case "DCC":
			var usr = new User(system.matchuser(onick));
			if (!usr.number) {
				this.o(onick, "I don't talk to strangers.", "NOTICE");
				return;
			}
			if (cmd[4]) {
				if ((cmd[1].toUpperCase() == "CHAT")
					&& (cmd[2].toUpperCase() == "CHAT")
					&& (parseInt(cmd[3]) == cmd[3])
					&& (parseInt(cmd[4]) == cmd[4])) {
						var ip = int_to_ip(cmd[3]);
						var port = parseInt(cmd[4]);
						var sock = new Socket();
						sock.connect(ip, port, 3 /* Timeout */);
						if (sock.is_connected) {
							sock.write("Enter your password.\r\n");
							dcc_chats.push(new DCC_Chat(sock,onick));
						}
						else
							sock.close();
				}
			}
			break;
		case "PING":
			var reply = "PING ";
			if (parseInt(cmd[1]) == cmd[1]) {
				reply += cmd[1];
				if (cmd[2] && (parseInt(cmd[2]) == cmd[2]))
					reply += " " + cmd[2];
				this.ctcp_reply(onick, reply);
			}
			break;
		case "VERSION":
			this.ctcp_reply(onick, "VERSION "
				+ "Synchronet IRC Bot by Randy E. Sommerfeld <cyan@rrx.ca> & Matt D. Johnson <mdj1979@gmail.com>");
			break;
		case "FINGER":
			this.ctcp_reply(onick, "FINGER "
				+ "Finger message goes here.");
			break;
		default:
			break;
	}
	return;
}

function Server_CTCP_reply(nick,str) {
	this.writeout("NOTICE " + nick + " :\1" + str + "\1");
}

function Server_bot_command(srv,bot_cmds,target,onick,ouh,cmdline) {
	var cmd=IRC_parsecommand(cmdline);
	if (cmd === 0)
		return 0;
	
	var access_level = srv.bot_access(onick,ouh);
	var botcmd = bot_cmds[cmd[0].toUpperCase()];
	if (botcmd) {
		if (botcmd.ident_needed && !srv.users[onick.toUpperCase()].ident) {
			srv.o(target,"You must be identified to use this command.");
			return 0;
		}
		if (access_level < botcmd.min_security) {
			srv.o(target,"You do not have sufficient access to this command.");
			return 0;
		}
		if ((botcmd.args_needed == true) && !cmd[1]) {
			srv.o(target,"Hey buddy, I need some arguments for this command.");
			return 0;
		} else if ((parseInt(botcmd.args_needed) == botcmd.args_needed)
					&& !cmd[botcmd.args_needed]) {
			srv.o(target,"Hey buddy, incorrect number of arguments provided.");
			return 0;
		}
		/* If we made it this far, we're good. */
		try {
			botcmd.command(target,onick,ouh,srv,access_level,cmd);
		} catch (err) {
			srv.o(target,err);
			srv.o(target,"file: " + err.fileName);
			srv.o(target,"line: " + err.lineNumber);
		}
		return 1;
	}
	return 0; /* No such command */
}

function Server_bot_access(nick,uh) { // return the access level of this user.
	var ucnick = nick.toUpperCase();
	if (this.users[ucnick] && this.users[ucnick].ident) {
		var usrnum = this.users[ucnick].ident;
		var thisuser = new User(usrnum);
		return thisuser.security.level;
	}
	var usrnum = system.matchuser(nick);
    if (!usrnum)
        return 0;
    var thisuser = new User(usrnum);
    for (m in Masks[usrnum]) {
        if (wildmatch(uh,Masks[usrnum][m]))
            return thisuser.security.level;
    }
    return 0; // assume failure
}

function Server_get_buffer(target) {
	var target_buffer=false;
	for(t=0;t<this.buffers.length;t++) {
		if(this.buffers[t].target==target) {
			target_buffer=this.buffers[t];
			break;
		}
	}
	if(target_buffer == false) {
		target_buffer=new Server_Buffer(target);
		this.buffers.push(target_buffer);
	} 
	return target_buffer;
}

function Server_writeout(str) {
	log("--> " + this.host + ": " + str);
	
	var target="~";
	var target_buffer=this.get_buffer(target);
	target_buffer.buffer.push(str.slice(0, max_paragraph_length) + "\r\n");
}

function Server_target_out(target,str,msgtype) {
	for (c in Squelch_List) {
		if (target.toUpperCase() == Squelch_List[c].toUpperCase())
			return;
	}

	if (!msgtype)
		msgtype = "PRIVMSG";
	
	var irc_header = msgtype + " " + target + " :";
	var msg_queue = chunk_string(str, max_paragraph_length - irc_header.length);
	var target_buffer=this.get_buffer(target);

	for(var m = 0; m < max_paragraphs && msg_queue.length > 0;m++) {
		var outstr = irc_header + msg_queue.shift();
		log("--> " + this.host + ": " + outstr);
		target_buffer.buffer.push(outstr + "\r\n");
	}
	
}

/* server functions */
function chunk_string(str, length) {
	var re = new RegExp('[^\r\n]{1,'+length+'}', 'g');
	return typeof(str) != "string"?[]:str.match(re);
}

function save_everything() { // save user data, and call save() method for all enabled modules
	if (!config.open("r+"))
		return false;

	config.iniSetValue(null, "command_prefix", command_prefix);
	config.iniSetValue(null, "real_name", real_name);
	config.iniSetValue(null, "config_write_delay", config_write_delay);
	config.iniSetValue(null, "squelch_list", Squelch_List.join(","));

	for (m in Masks) {
		var uid_str = format("%04u", m);
		var us_filename = system.data_dir + "user/" +uid_str+ ".ircbot.ini";
		var us_file = new File(us_filename);
		if (us_file.open(file_exists(us_filename) ? 'r+':'w+')) {
			us_file.iniSetValue(null, "masks", Masks[m].join(","));
			us_file.close();
		}
	}

	for (q in Quotes) {
		config.iniSetValue("quotes", q, Quotes[q]);
	}

	config.close();

	for (var m in Modules) {
		var module=Modules[m];
		if(module && module.enabled && module.save) {
			try {
				module.save();
			} catch(e) {
				log(m + " module error: " + e);
				module.enabled=false;
			}
		}
	}

	config_last_write = time();
	return true;
}

function get_command_channel(srv,cmd) {
	switch(cmd[0]) {
	case "PRIVMSG":
		break;
	case "PART":
	case "QUIT":
	case "KICK":
	case "JOIN":
		if (cmd[1][0] == ":")
			cmd[1] = cmd[1].substr(1);
		break;
	default:
		return false;
	}
	var chan_str = cmd[1].toUpperCase();
	var chan = srv.channel[chan_str];
	if (!chan)
		return false;
	return chan;
}

/*
 * Supports both "prefix command" and "prefixcommand" formats
 * Maybe a separate option is needed?
 */
function parse_cmd_prefix(cmd) {
	var pre=command_prefix || '';

	cmd[1] = cmd[1].substr(1).toUpperCase();
	if ((cmd[1] == pre) && cmd[2]) {
		cmd.shift();
		cmd.shift();
	} else if(cmd[1].substr(0, pre.length) == pre) {
		cmd.shift();
		cmd[0] = cmd[0].substr(pre.length);
	} else {
		return false;
	}
	cmd[0] = cmd[0].toUpperCase();
	return cmd;
}

/*
 * Used to construct help strings
 */
function get_cmd_prefix() {
	var ret = command_prefix || '';

	if(ret.length > 1)
		ret += ' ';
	return ret;
}

function parse_channel_list(str) {
	var channels=[];
	if(str) {
		str = str.split(",");
		for (var c in str) {
			var channel=str[c].split(" ");
			var name=channel[0];
			var key=channel[1];
			channels[name.toUpperCase()] = new Bot_IRC_Channel(name,key);
		}
	}
	return channels;
}

function true_array_len(my_array) {
	var counter = 0;
	for (i in my_array) {
		counter++;
	}
	return counter;
}

function login_user(usr) {
	usr.connection = "IRC";
	usr.logontime = time();
}

function ctrl_a_to_mirc(s) {

    var ctrl_a = false;
    var bright = false;
    var last_colour = '';
    var fg = 15;
    var set_fg = false;
    var ret = '';

    function add_fg(nn, nb, c) {
        ret += ascii(3);
        if (bright) {
            fg = nb;
            ret += nb;
        } else {
            fg = nn;
            ret += nn;
        }
        last_colour = c.toUpperCase();
        set_fg = true;
    }

    function add_bg(c) {
        if (!set_fg) ret += ascii(3) + fg;
        ret += ',' + c;
    }

    s = s.split('');
    while (s.length) {
        var c = s.shift();
        if (c == '\1') {
            ctrl_a = true;
        } else if (ctrl_a) {
            switch (c.toUpperCase()) {
                case 'H':
                    bright = true;
                    break;
                case 'N':
                    bright = false;
                    s.unshift(last_colour);
                    s.unshift('\1');
                    break;
                case 'K':
                    add_fg(1, 14, c);
                    break;
                case 'R':
                    add_fg(4, 7, c); // Red -> light red, high red -> orange
                    break;
                case 'G':
                    add_fg(3, 9, c);
                    break;
                case 'Y':
                    add_fg(5, 8, c);
                    break;
                case 'B':
                    add_fg(2, 12, c);
                    break;
                case 'M':
                    add_fg(6, 13, c);
                    break;
                case 'C':
                    add_fg(10, 11, c);
                    break;
                case 'W':
                    add_fg(15, 0, c);
                    break;
                case '0':
                    add_bg(1);
                    break;
                case '1':
                    add_bg(4);
                    break;
                case '2':
                    add_bg(3);
                    break;
                case '3':
                    add_bg(5);
                    break;
                case '4':
                    add_bg(2);
                    break;
                case '5':
                    add_bg(6);
                    break;
                case '6':
                    add_bg(10);
                    break;
                case '7':
                    add_bg(14);
                    break;
                default:
                    break;
            }
            ctrl_a = false;
        } else {
            set_fg = false;
            ret += c;
        }
    }

    return ret;

}