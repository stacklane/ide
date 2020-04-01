/**
 * Separate JS file to assist with 'defer' loading which requires a 'src'
 */
if (typeof IDERoot === "undefined") throw 'Initialization Error: Missing class IDERoot';
const IDE_ROOT = document.documentElement.querySelector('ide-root');
if (!(IDE_ROOT instanceof IDERoot)) throw 'Initialization Error: Missing IDERoot';
IDE_ROOT.ready();