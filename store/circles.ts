import { getterTree, mutationTree } from 'typed-vuex'

const GRAYSCALE_COLOR = '#111'
const WEEKS_PER_YEAR = 52

interface Stage {
  text: string
  color: string
  start: number
  end: number
}
const FIXED_STAGES: Stage[] = [
  {
    text: 'Childhood (age 0 - 12)'.toUpperCase(),
    color: '#eccbaa',
    start: 0,
    end: 12,
  },
  {
    text: 'Adolescence (age 13 - 19)'.toUpperCase(),
    color: '#f0b7b6',
    start: 13,
    end: 19,
  },
  {
    text: 'Early Adulthood (age 20 - 34)'.toUpperCase(),
    color: '#e69dc8',
    start: 20,
    end: 34,
  },
  {
    text: 'Middle Adulthood (age 35 - 49)'.toUpperCase(),
    color: '#f693dd',
    start: 35,
    end: 49,
  },
  {
    text: 'Mature Adulthood (age 50 - 79)'.toUpperCase(),
    color: '#76d7f6',
    start: 50,
    end: 79,
  },
  {
    text: 'Late Adulthood (age 80 - 100)'.toUpperCase(),
    color: '#74e085',
    start: 80,
    end: 100,
  },
]

interface Store {
  showStageColors: boolean
  lifeExpectancy: number
}

export const state = (): Store => ({
  showStageColors: true,
  lifeExpectancy: 100,
})

interface Circle {
  row: number
  column: number
  color: string
}

export const getters = getterTree(state, {
  circleMatrix: (state) => {
    const makeRow = (rowIndex: number) => {
      const row: Circle[] = new Array<Circle>(WEEKS_PER_YEAR)
      const color: string = state.showStageColors
        ? FIXED_STAGES.find(
            (stage) => stage.start - 1 <= rowIndex && stage.end > rowIndex
          )?.color || GRAYSCALE_COLOR
        : GRAYSCALE_COLOR
      for (let columnIndex = 0; columnIndex < WEEKS_PER_YEAR; columnIndex++) {
        row[columnIndex] = { row: rowIndex, column: columnIndex, color }
      }
      return row
    }

    const rows: Circle[][] = new Array<Circle[]>(state.lifeExpectancy)
    for (let rowIndex = 0; rowIndex < state.lifeExpectancy; rowIndex++) {
      rows[rowIndex] = makeRow(rowIndex)
    }

    return rows
  },
  rightAxisLabels: (state) => {
    const stages = FIXED_STAGES.filter(
      (stage) => stage.end <= state.lifeExpectancy
    )
    return stages.map((stage) => {
      const color = state.showStageColors ? stage.color : GRAYSCALE_COLOR
      return {
        rowStart: Math.max(stage.start - 1, 0),
        rowEnd: stage.end - 1,
        color,
        text: stage.text,
      }
    })
  },
})

export const mutations = mutationTree(state, {
  toggleStageColors(state) {
    state.showStageColors = !state.showStageColors
  },
})
