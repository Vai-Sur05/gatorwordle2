import { createStore } from 'vuex'
import { reactive } from 'vue'



const evaluateRow = (row, answer) => {
    let evaluation = []
    for(let i = 0; i < answer.length; i++) {
        if(!row[i]) {
            evaluation.push('Empty')
        }
        else if(row[i] === answer[i]) {
            evaluation.push('Correct')
        }
        else if(answer.includes(row[i])) {
            evaluation.push('Present')
        }
        else {
            evaluation.push('Absent')
        }
    }
    return evaluation
}

const getDefaultState = () => {
    return {
        answer: '',
        gameStatus: 'IN-PROGRESS',
        gameGrid: [
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
        ],
        evaluations: [
            ['Empty', 'Empty', 'Empty', 'Empty', 'Empty'],
            ['Empty', 'Empty', 'Empty', 'Empty', 'Empty'],
            ['Empty', 'Empty', 'Empty', 'Empty', 'Empty'],
            ['Empty', 'Empty', 'Empty', 'Empty', 'Empty'],
            ['Empty', 'Empty', 'Empty', 'Empty', 'Empty'],
            ['Empty', 'Empty', 'Empty', 'Empty', 'Empty'],
        ],
        rowIndex: 0,
        charIndex: 0,
        keyColors: reactive({})
    }
    
}

export default createStore({
    state() {
        return getDefaultState()
    },
    mutations: {
        resetGame: (state) => {
            Object.assign(state, getDefaultState())
            state.answer = '';
        },
        setAnswer(state, answer) {
            state.answer = answer
        },
        setCharacter(state, { rowIndex, charIndex, char }) {
            state.gameGrid[rowIndex][charIndex] = char
        },
        setEvaluation(state, { evalIndex, evals }) {
            state.evaluations[evalIndex] = evals
        },
        incrementRowIndex(state) {
            state.rowIndex++
        },
        incrementCharIndex(state) {
            state.charIndex++
        },
        decrementCharIndex(state) {
            if (state.charIndex > 0) {  // Prevents going below index 0
                state.charIndex--;
            }
        },
        resetCharIndex(state) {
            state.charIndex = 0
        },
        win(state) {
            state.gameStatus = 'WIN'
        },
        lose(state) {
            state.gameStatus = 'LOSE'
        }
    },
    getters: {
        onLastRow: (state) => {
          return state.rowIndex === 5
        },
        allCharsEntered: (state) => {
            return state.charIndex === 5
        },
        currentWord: (state) => {
            return state.gameGrid[state.rowIndex].join('').toLowerCase(); // ✅ New Getter
        },
        currentCellHasChar: (state) => {
            return state.gameGrid[state.rowIndex][state.charIndex] !== ''
        }
    },
    actions: {
        submitCharacter({ state, commit, getters }, char) {
            if (getters.allCharsEntered || getters.currentCellHasChar) {
                return // Prevents overwriting the same spot
            }
            commit('setCharacter', { rowIndex: state.rowIndex, charIndex: state.charIndex, char })
            commit('incrementCharIndex');
        },
        undoLastCharacter({ state, commit }) {
            if (state.charIndex > 0) {
                commit('decrementCharIndex');
                commit('setCharacter', { rowIndex: state.rowIndex, charIndex: state.charIndex, char: '' });
            }
        },
        guessIsValid({ getters }) {
            return axios.get("/api/words/valid", { params: { answer: getters.currentWord}})

        },
       submitGuess({ state, commit, getters }) {
            if (!getters.allCharsEntered) {
                return // Can't submit if all letters are not filled
            }
        
            const currentWord = getters.currentWord; // Convert input to lowercase
        
        
            let evals = evaluateRow(state.gameGrid[state.rowIndex], state.answer);
            commit('setEvaluation', { evalIndex: state.rowIndex, evals });
                    
        
            if (evals.every(e => e === 'Correct')) {
                commit('win'); // User wins!
            } else if (getters.onLastRow) {
                commit('lose'); // Last row reached and incorrect guess
            } else {
                commit('incrementRowIndex')
                commit('resetCharIndex')
            }
        }
        
    }
})