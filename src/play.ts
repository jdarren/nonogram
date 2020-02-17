import {readFileSync} from 'fs';
import {Nonogram} from './nonogram';
import {Pixel} from './vector';

const [,,...args] = process.argv;

const parseMetaData = (str: string) =>
    str.split('|')
    .map(segments =>
         segments
         .split(',')
         .map(seg => parseInt(seg,10))
        );

if ( !args[0] ) {
    console.log('Usage: nonogram <filename>');
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

new Nonogram({
    size: rowSegmentsList.length,
    fill: Pixel.Empty,
    rowSegmentsList,
    colSegmentsList
}).solve();
