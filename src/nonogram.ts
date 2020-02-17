export type GameData = {
    size: number;
    fill?: Pixel;
    rowSegmentsList: Array<number[]>;
    colSegmentsList: Array<number[]>;
};

enum Dimension {
    Row = 'Row',
    Column = 'Column'
};

import {Vector, Pixel} from './vector';
import {terminal} from 'terminal-kit'; // todo - externalize UI (listener based?)

export class Nonogram {
    rows: Vector[];
    cols: Vector[];

    constructor({size, fill, rowSegmentsList, colSegmentsList}: GameData ) {
        this.rows = [];
        this.cols = [];
        for ( let i = 0 ; i < size ; i++ ) {
            this.rows[i] = new Vector({
                size,
                fill,
                segments: rowSegmentsList[i]
            });
            this.cols[i] = new Vector({
                size,
                fill,
                segments: colSegmentsList[i]
            });
        }
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
        terminal.saveCursor();
        while ( true ) {
            const row = this.rows[idx];
            let triedAtLeastOneSolution = false;
            while ( row.hasMoreSolutions() ) {
                triedAtLeastOneSolution = true;
                row.tryNextSolution();
                this.update(Dimension.Row);

                terminal.restoreCursor();
                terminal(this.toString()); // show progress. :)
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
