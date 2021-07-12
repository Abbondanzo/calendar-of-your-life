import { mutationTree } from 'typed-vuex'

interface Store {
  date: Date | null
}

interface SetPayload {
  date: Date
}

export const state = (): Store => ({ date: null })

export const mutations = mutationTree(state, {
  set(state, { date }: SetPayload) {
    state.date = date
  },
})
