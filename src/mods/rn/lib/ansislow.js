/**
 * ../mods/rn/ansislow.js, showFile
 * 
 * Will detect ans/asc/msg file to display, and display it.
 * If the file is more than 25 lines long, it will have a minor sleep between
 * lines to slow the render down, to better support longer ansi art files, 
 * shorter files will show as-is.
 * 
 * There will be a \r without a \n after the last line, which will put the 
 * cursor at the beginning of the last line in the file.  This is to better 
 * support menu files.
 */
require("sbbsdefs.js", 'SS_ABORT');
require("userdefs.js", 'USER_ANSI');

function matchTextFile(fileName) {
  var hasAnsi = (
    (console.autoterm & USER_ANSI > 1) 
    || 
    (user && (user.number > 0) && ((user.settings & USER_ANSI) > 1))
	);

	var filePath = system.text_dir + fileName;
	if (file_exists(filePath)) return (filePath);
	if (hasAnsi && file_exists(filePath+'.ans'))  return (filePath+'.ans');
	if (file_exists(filePath+'.asc'))  return (filePath+'.asc');
	if (file_exists(filePath+'.msg'))  return new File(fileName+'.msg');
	throw { message: 'Unable to find the specified file (text/' + fileName + '.???).' };
}

function readFileLines(filePath) {
	var file = new File(filePath);
	if (!file.open('r')) throw { message: 'Unable to open file (' + ').' };
	var result = file.readAll();
	file.close();
	return result;
}

function clearScreen() {
  console.print('\1n\1w\x011');
  console.line_counter = 0;
  console.clear();  
}

function hasUserEscaped() {
	//allow cancel
	switch (console.inkey().toLowerCase()) {
		case " ":
		case "c":
		case "\1":
		case "q":
		case "x":
			return true;
	}
	return !!(bbs.sys_status&SS_ABORT)
}

function renderSlow(lines) {
	while (lines.length) {
		// if user escapes render
		if (hasUserEscaped()) {
			console.print('\r\n');
			return;
		}

		console.print(lines.shift());
		console.putmsg(lines.length ? '\r\n' : '\r'); // skip newline at end - for menus
		console.line_counter = 0; // reset line counter - no break/pause
		sleep(10);
	}
}

function renderFast(lines) {
	console.line_counter = 0;
	clearScreen();
	while (lines.length) {
		console.print(lines.shift());
		console.putmsg(lines.length ? '\r\n' : '\r');
	}
}

function showFile(fileName) {
  try {
		var filePath = matchTextFile(fileName);
		var lines = readFileLines(filePath);

		// short screen, just display it
		if (lines.length < 26) {
			return renderFast(lines);
		}

		clearScreen();
		renderSlow(lines);
		
		bbs.sys_status &= ~SS_ABORT; // reset break status
		console.line_counter=23; // end of screen

  } catch (error) {
		console.print(error.message);
		console.putmsg('\r\n');
		if (error.stack) {
			console.putmsg(error.stack);
			console.putmsg('\r\n');
		}
    return;
	}
}