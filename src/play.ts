import {readFileSync} from 'fs';
import {Nonogram} from './nonogram';
import {Pixel} from './vector';
import {terminal} from 'terminal-kit';

const [,,...args] = process.argv;

const parseMetaData = (str: string) =>
    str.split('|')
    .map(segments =>
         segments
         .split(',')
         .map(seg => parseInt(seg,10))
        );

if ( !args[0] ) {
    console.log('Usage: nonogram <filename> --showProgress');
    process.exit(-1);
}

const [ rsStr, csStr ] = readFileSync(args[0], 'utf-8').split('\n');
const rowSegmentsList = parseMetaData(rsStr);
const colSegmentsList = parseMetaData(csStr);

if ( rowSegmentsList.length !== colSegmentsList.length ) {
    console.log(
      `${args[0]} data is invalid ${rowSegmentsList.length} row, ${colSegmentsList.length} columns.`
    );
    process.exit(-1);
}

const showProgress = args[1] === '--showProgress';
const progressListener = showProgress ?
    (game: Nonogram) => {
        terminal(game.toString());
        terminal.restoreCursor();
    } : undefined;

if ( showProgress ) {
    terminal.clear();
    terminal.moveTo(1, 1);
    terminal.saveCursor();
}

const nonogram = new Nonogram({
    size: rowSegmentsList.length,
    fill: Pixel.Empty,
    rowSegmentsList,
    colSegmentsList,
    progressListener
});
nonogram.solve();

if ( showProgress ) {
    terminal.clear();
}
console.log(nonogram.toString());
