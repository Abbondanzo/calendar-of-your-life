interface BirthdayState {
  date?: Date
}

export const state = (): BirthdayState => ({})

export const mutations = {
  set(
    state: BirthdayState,
    {
      date,
    }: {
      date: Date
    }
  ) {
    state.date = date
  },
}
