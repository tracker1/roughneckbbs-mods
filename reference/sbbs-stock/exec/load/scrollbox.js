load('sbbsdefs.js');

function ScrollBox(opts) {
    this.y1 = opts.y1;
    this.y2 = opts.y2;
    this.y = 0; // Current item
    this.scrollbar = opts.scrollbar;
    this.width = this.scrollbar ? console.screen_columns - 2 : console.screen_columns;
    this.height = opts.y2 - opts.y1;
    this.wrap_map = [];
    this.ss = bbs.sys_status;
    this.putmsg_mode = opts.putmsg_mode ? opts.putmsg_mode : P_NONE;
}

ScrollBox.prototype.putmsg = function (msg) {
    console.putmsg(msg, this.putmsg_mode|P_NOPAUSE);
}

ScrollBox.prototype.draw_scrollbar = function () {
    const bar_height = Math.round(Math.min(this.height - 2, Math.max(1, (this.height - 2) * (this.height / this._text.length))));
    const bar_y = Math.round((this.height - 2 - bar_height) * (this.y / (this._text.length - this.height)));
    const x = console.screen_columns - 1;
    console.gotoxy(x, this.y1);
    this.putmsg(ascii(30));
    for (var y = 0; y <= this.height - 2; y++) {
        console.gotoxy(x, this.y1 + 1 + y);
        this.putmsg(y < bar_y || y > bar_y + bar_height ? ascii(176) : ascii(219));
    }
    console.gotoxy(x, this.y2);
    this.putmsg(ascii(31));
}

ScrollBox.prototype.init = function () {
    bbs.sys_status|=SS_MOFF;
    console.write(format('\x1b[%s;%sr', this.y1, this.y2));
    console.gotoxy(1, this.y1);
}

ScrollBox.prototype.clear = function() {
    console.gotoxy(1, this.y1);
    for (var y = this.y1; y <= this.y2; y++) {
        console.clearline();
        if (y != this.y2) console.crlf();
    }
}

ScrollBox.prototype.reset = function () {
    this.clear();
    this.y = 0;
    this._text = [];
    this.wrap_map = [];
    console.gotoxy(1, this.y1);
}

ScrollBox.prototype._load = function () {
    this.clear();
    console.gotoxy(1, this.y1);
    for (var y = 0; y <= this.height && this.y + y < this._text.length; y++) {
        this.putmsg(this._text[this.y + y]);
        if (y != this.height) console.crlf();
    }
    if (this.scrollbar) this.draw_scrollbar();
}

// Load an array of strings
ScrollBox.prototype.load_array = function (arr) {
    this.y = 0;
    var index = 0;
    const self = this;
    this.wrap_map = [];
    this._text = arr.reduce(function (a, c, i) {
        const split = truncsp(word_wrap(c, self.width)).split(/\r*\n/);
        a = a.concat(split);
        self.wrap_map[i] = { index: index, rows: split.length };
        index += split.length;
        return a;
    }, []);
    return this._load();
}

// Load a string
ScrollBox.prototype.load_string = function (text) {
    return this.load_array(text.split(/\r*\n/));
}

// Load a file
ScrollBox.prototype.load_file = function (fn) {
    const f = new File(fn);
    if (!f.open('r')) throw new Error('Failed to open ' + fn + ' for reading.');
    const str = f.read();
    f.close();
    return this.load_string(str);
}

ScrollBox.prototype.load = function (c) {
    if (typeof c == 'string') {
        if (file_exists(c)) {
            return this.load_file(c);
        } else {
            return this.load_string(c);
        }
    } else if (Array.isArray(c)) {
        return this.load_array(c);
    } else {
        return false;
    }
}

ScrollBox.prototype.scroll_to = function (n) {
    this.y = this.wrap_map[n].index;
    this._load();
}

ScrollBox.prototype.scroll_into_view = function (n) {
    if (this.wrap_map[n].index >= this.y && this.wrap_map[n].index < this.y + this.height) return;
    if (this.wrap_map[n].index < this.y) {
        this.y = this.wrap_map[n].index;
    } else {
        this.y = this.wrap_map[n].index - this.height;
    }
    this._load();
}

ScrollBox.prototype._redraw = function (n) {
    if (this.wrap_map[n].index < this.y || this.wrap_map[n].index > this.y + this.height) return;
    for (var i = 0; i < this.wrap_map[n].rows; i++) {
        console.gotoxy(1, this.y1 + this.wrap_map[n].index - this.y + i);
        console.clearline();
        this.putmsg(this._text[this.wrap_map[n].index + i]);
    }
    if (this.scrollbar) this.draw_scrollbar();
}

ScrollBox.prototype.transform = function (n, transform) {
    const str = transform(this._text.slice(this.wrap_map[n].index, this.wrap_map[n].index + this.wrap_map[n].rows).join(' '));
    const split = truncsp(word_wrap(str, this.width)).split(/\r*\n/);
    Array.prototype.splice.apply(this._text, [this.wrap_map[n].index, this.wrap_map[n].rows].concat(split));
    var nl = false;
    if (split.length != this.wrap_map[n].rows) {
        nl = true;
        this.wrap_map[n].rows = split.length;
        for (var i = n + 1; i < this.wrap_map.length; i++) {
            if (split.length > this.wrap_map[n].rows) {
                this.wrap_map[i].index += (split.length - this.wrap_map[n].rows);
            } else {
                this.wrap_map[i].index -= (this.wrap_map[n].rows - split.length);
            }
        }
    }
    if (this.wrap_map[n].index >= this.y && this.wrap_map[n].index <= this.y + this.height) {
        if (nl) {
            this._load();
        } else {
            this._redraw(n);
        }
    }
}

ScrollBox.prototype.getcmd = function (c) {
    if (c == KEY_UP) {
        if (this.y > 0) {
            console.write('\x1b[1T');
            this.y--;
            console.gotoxy(1, this.y1);
            this.putmsg(this._text[this.y]);
            if (this.scrollbar) this.draw_scrollbar();
        }
        return true;
    }
    if (c == KEY_DOWN) {
        if (this.y + this.height < this._text.length - 1) {
            console.write('\x1b[1S');
            this.y++;
            console.gotoxy(1, this.y2);
            this.putmsg(this._text[this.y + (this.y2 - this.y1)])
            if (this.scrollbar) this.draw_scrollbar();
        }
        return true;
    }
    if (c == KEY_HOME) {
        this.scroll_to(0);
        return true;
    }
    if (c == KEY_END) {
        this.y = this._text.length - 1 - this.height;
        this._load();
        return true;
    }
    if (c == KEY_PAGEUP) {
        this.y = Math.max(0, this.y - this.height);
        this._load();
        return true;
    }
    if (c == KEY_PAGEDN) {
        this.y = Math.min(this._text.length - 1 - this.height, this.y + this.height);
        this._load();
        return true;
    }
}

ScrollBox.prototype.close = function () {
    console.write(format('\x1b[%s;%sr', 1, console.screen_rows));
    console.gotoxy(1, 1);
    bbs.sys_status = this.ss;
}
