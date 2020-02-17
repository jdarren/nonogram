export type Distribution = number[];

export const combinations = (
    numSlots: number,
    numExtraGaps: number
): Distribution[] => {

    const combos: Distribution[] = [];
    const enumerate = (
        numSlots: number,
        numExtraGaps: number,
        distribution: Distribution
    ): void => {
        if ( numSlots === 0 ) {
            combos.push([...distribution]);
        } else if ( numSlots === 1) {
            distribution[0] = numExtraGaps;
            enumerate(0, 0, distribution);
        } else {
            for ( let i = 0 ; i < numExtraGaps+1 ; i++ ) {
                distribution[numSlots-1] = i;
                enumerate(numSlots - 1, numExtraGaps - i, distribution);
            }
        }
    };

    // @ts-ignore
    enumerate(numSlots, numExtraGaps, new Array(numSlots).fill(0) );
    return combos;
};
