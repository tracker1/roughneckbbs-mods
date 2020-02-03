/**
 * Displays a random answer ascii screen
 * 
 * Remove existing /sbbs/text/answer.* and replace with the text files
 * from this mod pack.
 * 
 * Place roughneck bbs mods in /sbbs/mods/rn
 */
require("rn/lib/ansislow.js", 'showFile');

function clearScreen() {
  console.print('\1n\1w\x011');
  console.line_counter = 0;
  console.clear();  
}

function getAnswerScreen() {
  var answerList = directory(system.text_dir + 'answer/*.asc');
  var pick = Math.floor(Math.random() * answerList.length);
  return answerList[pick].replace(system.text_dir, '');
}

(function main(){
  clearScreen();
  var screen = getAnswerScreen();
  showFile(screen);
  console.line_counter = 0;
  console.print('\r\n\r\n');
  console.line_counter = 0;
}())
