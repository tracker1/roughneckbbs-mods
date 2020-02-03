roughneckbbs-mods
=================

RoughneckBBS Mods Directory (for Synchronet)

The `./legacy_mods` directory is the old mods directory from Roughneck BBS.
Most of the mods in question are written by myself _Michael J. Ryan_ and 
many are relatively old.

I've resently started my board up, not public yet, but will be posting refreshes 
of my mods here in the `./src/` directory.

* `src/mods/rn/` - The source for all of these mods are meant to be in the `sbbs/mods/rn` directory.
* `src/text/rn/` - The screens meant to be used with setting up these mods.  You should evaluate each one individually.

## The mods

Copy all mods from `src/mods/rn` to `/sbbs/mods/rn`, they are all written to run in this directory.

Some mods may require the use of file from `src/text/`, these should be used as necessary if/when you enable these mods.

### ansislow

```js
// bring in the showFile method
require('rn/lib/ansislow', 'showFile');
...
// display /sbbs/text/some/file.ans
showFile("some/file");
```

Will give you a `showFile` method that will display the appropriate `.ans|.asc|.msg` file, based on the SBBS text directory.

## answer

Show a random answer screen (Requires `rn/lib/ansislow`).  The `text/answer.*` files are setup to run `../mods/rn/answer.js` which will pick a random screen from the `text/answer/` directory.  You should stick to `.asc` or `.msg` format files here, there is no detection for ansi vs ascii, it's meant to display a quick ascii prior to running the `login` script.

## pause

(coming soon) A refresh to the roughneck animated pause display.
