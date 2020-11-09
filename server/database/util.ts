import _ from 'lodash'

/**
 * Returns the members of `databaseGuess`, which should implement the `Database`
 * interface, which it has not implemented.
 */
export function unimplementedFunctionsOfDatabase(
    databaseGuess: any
): Array<string> {
    const expectedFunctions = [
        'startDatabase',
        'storeNote',
        'storeLog',
        'getNote',
        'getLog',
        'noteExists',
        'hasBurned',
        'hasBeenRead',
        'stopDatabase',
    ]

    return _.reject(expectedFunctions, x => !!databaseGuess[x])
}
