import {Distribution, combinations} from './combinations';

const sum = (arr: number[]): number => arr.reduce( (a,b) => a + b, 0);

export enum Pixel {
    Empty = 0,
    On,
    Off
};

export type VectorData = {
    size: number;
    fill?: Pixel;
    segments: number[];
    solutions?: Distribution[];
};

const PixelStrs = [' ', '■', '.'];

const getSolutions = (vector: Vector) => {
    const numSlots = vector.segments.length + 1;
    const numExtraGaps = vector.size -
        (sum(vector.segments) + vector.segments.length - 1);
    return combinations(numSlots, numExtraGaps);
};

export class Vector {

    size: number;
    data: Pixel[];
    segments: number[];
    solutions: Distribution[];
    solutionIdx: number;

    constructor({size, fill, segments, solutions}: VectorData) {
        this.size = size;
        this.data = Array(size);
        this.segments = segments;
        if ( fill !== undefined ) {
            // @ts-ignore
            this.fill(fill);
        }

        this.solutions = solutions || getSolutions(this);
        this.solutionIdx = 0;
    }

    get(n: number): Pixel {
        return this.data[n];
    }

    set(n: number, val: Pixel): void {
        this.data[n] = val;
    }

    trySolution(n: number): void {
        const distribution = this.solutions[n];
        let indexInVector = 0;
        distribution.forEach( (extraGaps, i) => {
            for ( let j = 0 ; j < extraGaps ; j++ ) {
                this.set(indexInVector++, Pixel.Off);
            }
            if (i !== this.segments.length) {
                this.setRange(
                    indexInVector, indexInVector + this.segments[i], Pixel.On
                );
                indexInVector += this.segments[i];

                // don't put a gap after the last segment.
                if ( i !== this.segments.length - 1 ) {
                    this.set(indexInVector++, Pixel.Off);
                }
            }
        });
    }

    isValidUpTo(n: number): boolean {
        const tempVector = new Vector({
            size: this.size,
            segments: this.segments,
            solutions: this.solutions
        });
        return this.solutions.some( (_, idx) => {
            tempVector.trySolution(idx);
            const one = this.data.slice(0,n+1);
            const two = tempVector.data.slice(0,n+1);
            return one.every( (pixel,i) => pixel === two[i] );
        });
    }

    reset() : void {
        this.solutionIdx = 0;
    }

    hasMoreSolutions(): boolean {
        return this.solutionIdx < this.solutions.length;
    }

    tryNextSolution(): void {
        this.trySolution(this.solutionIdx++);
    }

    setRange(min: number, max: number, val: Pixel): void {
        for ( let i = min ; i < max ; i++ ) {
            this.set(i, val);
        }
    }

    fill(val: Pixel) {
        // @ts-ignore
        this.data.fill(val);
    }

    toString(): string {
        const out = this.data
            .map( pixel => PixelStrs[pixel] )
            .reduce((acc,str) => acc + str, '').split('').join('│');
        return '│' + out + '│'
    }

};
