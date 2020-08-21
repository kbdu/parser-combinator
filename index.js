const updateParserState = (state, index, result) => ({
    ...state,
    index,
    result
});

const updateParserResult = (state, result) => ({
    ...state,
    result,
});

const updateParserError = (state, errorMsg) => ({
    ...state,
    isError: true,
    error: errorMsg
});

class Parser {
    constructor(parserStateTransformerFn) {
        this.parserStateTransformerFn = parserStateTransformerFn;
    }

    run(targetString) {
        const initialState = {
            targetString,
            index: 0,
            result: null,
            isError: false,
            error: null
        };

        return this.parserStateTransformerFn(initialState);
    }
//map function **********
    map(fn){
       return new Parser(parserState => {
            const nextState = this.parserStateTransformerFn(parserState);

            if (nextState.isError) return nextState;

            return updateParserResult(nextState, fn(nextState.result));
        });
    } 

// end of map function *********
//errorMap function ******
    errorMap(fn ){
        return new Parser(parserState => {
            const nextState = this.parserStateTransformerFn(parserState);

            if (!nextState.isError) return nextState;

            return updateParserError(nextState, fn(nextState.error, nextState.index));
        });
    } 

}

// end of error map function *********
const str = s => new Parser(parserState => {
    const {
        targetString,
        index,
        isError
    } = parserState;

    if (isError) {
        return parserState;
    }


    const slicedTarget = targetString.slice(index)

    if(slicedTarget.length === 0) {
        return updateParserError(parserState, `str: Tried to match "${s}", but got unexpected end of input`);
    }

    if (slicedTarget.startsWith(s)){
        //success!
        return updateParserState(parserState, index + s.length, s);
    }

    return updateParserError(
        parserState,
       `Tried to match "${s}", but got "${targetString.slice(index, index + 10)}"`
    );


    throw new Error(`Tried to match${s}, but got ${targetString.slice(index, index + 10)}`);
})

//---------------------------------------
//LETTERS
const lettersRegex = /^[A-Za-z]+/;
const letters = new Parser(parserState => {
    const {
        targetString,
        index,
        isError
    } = parserState;

    if (isError) {
        return parserState;
    }


    const slicedTarget = targetString.slice(index)

    if(slicedTarget.length === 0) {
        return updateParserError(parserState, `letters: Got unexpected end of input`);
    }

    const regexMatch = slicedTarget.match(lettersRegex);

    if (regexMatch){
        //success!
        return updateParserState(parserState, index + regexMatch
            [0].length, regexMatch);
    }

    return updateParserError(
        parserState,
        `letters: Couldn't match letters at index ${index}`
    );


    throw new Error(`Tried to match${s}, but got ${targetString.slice(index, index + 10)}`);
});

//DIGITS
const digitsRegex = /^[0-9]+/;
const digits = new Parser(parserState => {
    const {
        targetString,
        index,
        isError
    } = parserState;

    if (isError) {
        return parserState;
    }


    const slicedTarget = targetString.slice(index)

    if(slicedTarget.length === 0) {
        return updateParserError(parserState, `digits: Got unexpected end of input`);
    }

    const regexMatch = slicedTarget.match(digitsRegex);

    if (regexMatch){
        //success!
        return updateParserState(parserState, index + regexMatch
            [0].length, regexMatch);
    }

    return updateParserError(
        parserState,
        `digits: Couldn't match digits at index ${index}`
    );


    throw new Error(`Tried to match${s}, but got ${targetString.slice(index, index + 10)}`);
});
//--------------------------------------




const sequenceOf = parsers => new Parser(parserState => {
    if(parserState.isError) {
        return parserState
    }


const results = [];
let nextState = parserState;

for (let p of parsers){
    nextState = p.parserStateTransformerFn(nextState);
    results.push(nextState.result);
    }

    return updateParserResult(nextState, results );

})


//how we use it
//input & tests

const parser = sequenceOf([
    digits,
    letters,
    digits
])


console.log(
parser.run('2342ej4643')
);