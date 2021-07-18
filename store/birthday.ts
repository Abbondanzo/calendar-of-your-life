import { getterTree, mutationTree } from 'typed-vuex'

interface Store {
  date: Date | null
}

interface SetPayload {
  date: Date
}

// May 21, 1998
const tmp = new Date(1998, 4, 21)

export const state = (): Store => ({
  date: null,
})

const ONE_DAY = 1000 * 60 * 60 * 24

export const getters = getterTree(state, {
  currentWeek: (state) => {
    const birthdate = state.date
    if (!birthdate) return null
    const nowEpoch = new Date().getTime()
    const birthdayEpoch = birthdate.getTime()
    const daysBetween = Math.round((nowEpoch - birthdayEpoch) / ONE_DAY)
    return Math.ceil(daysBetween / 7)
  },
})

export const mutations = mutationTree(state, {
  set(state, { date }: SetPayload) {
    state.date = date
  },
})
