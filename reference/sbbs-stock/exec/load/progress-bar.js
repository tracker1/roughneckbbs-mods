load('sbbsdefs.js');
load('frame.js');

var ProgressBar = function (x, y, w, pframe) {

    if (x < 1 || x > console.screen_columns) throw 'Invalid x: ' + x;
    if (y < 1 || y > console.screen_rows) throw 'Invalid y: ' + y;
    if (typeof w !== 'number' || w < 5 || (w + x - 1) > console.screen_columns) {
        throw 'Invalid width: ' + w;
    }

    this.bg = BG_BLUE;
    this.fg = WHITE;

    if (typeof w === 'undefined') w = console.screen_columns;
    var frame = new Frame(x, y, w, 1, this.fg, pframe);
    var subframe = new Frame(x + 1, y, 1, 1, this.bg|this.fg, frame);
    frame.putmsg(format('[%-' + (w - 2) + 's]', ''));

    this.init = function () {
        frame.open();
    }

    this.set_progress = function (percent) {
        subframe.width = Math.max(5, Math.floor((w - 2) * (percent * .01)));
        subframe.clear();
        subframe.center(Math.round(percent) + '%');
    }

    this.cycle = function () {
        frame.cycle();
    }

    this.close = function () {
        frame.close();
    }

}
