import {Vector, Pixel} from './vector';

export type GameData = {
    fill?: Pixel;
    rowSegmentsList: Array<number[]>;
    colSegmentsList: Array<number[]>;
    progressListener?: (game: Nonogram) => void;
};

enum Dimension {
    Row = 'Row',
    Column = 'Column'
};

const noop = () => {};

export class Nonogram {
    width: number;
    height: number;
    rows: Vector[];
    cols: Vector[];
    progressListener: (game: Nonogram) => void;

    constructor({fill, rowSegmentsList, colSegmentsList, progressListener}: GameData ) {
        this.rows = [];
        this.cols = [];
        this.height = rowSegmentsList.length;
        this.width = colSegmentsList.length;

        for ( let i = 0 ; i < this.height ; i++ ) {
            this.rows[i] = new Vector({
                size: this.width,
                fill,
                segments: rowSegmentsList[i]
            });
        }
        for ( let i = 0 ; i < this.width ; i++ ) {
            this.cols[i] = new Vector({
                size: this.height,
                fill,
                segments: colSegmentsList[i]
            });
        }

        this.progressListener = progressListener || noop;
    }

    toString(endRow: number = -1) : string {
        if ( endRow === -1 ) {
            endRow = this.rows.length;
        }
        return this.rows.slice(0,endRow).map(row => row.toString()).join('\n');
    }

    update(sourceOfTruth: Dimension): void {
        this.rows.forEach( (row, r) => {
            this.cols.forEach( (col, c) => {
                if ( sourceOfTruth === Dimension.Row ) {
                    col.set(r, row.get(c))
                } else {
                    row.set(c, col.get(r))
                }
            });
        });
    }

    isValidToRow(row: number): boolean {
        return this.cols.every( col => col.isValidUpTo(row) );
    }

    solve(): void {
        let idx = 0;
        while ( true ) {
            const row = this.rows[idx];
            let triedAtLeastOneSolution = false;
            while ( row.hasMoreSolutions() ) {
                triedAtLeastOneSolution = true;
                row.tryNextSolution();
                this.update(Dimension.Row);

                this.progressListener(this); // show progress. :)
                if ( !this.isValidToRow(idx) ) {
                    continue;
                } else {
                    break;
                }
            }
            if ( !this.isValidToRow(idx) || !triedAtLeastOneSolution ) {
                row.reset();
                if ( idx > 0 ) {
                    idx--;
                } else {
                    console.log('it doesnt appear to have a solution');
                    return;
                }
            } else {
                if ( idx !== this.rows.length - 1 ) {
                    // on to the next row...
                    idx++
                } else {
                    // solved!!
                    return;
                }
            }
        }
    }
}
