import { getAccessorType } from 'typed-vuex'
import * as birthday from '~/store/birthday'

export const accessorType = getAccessorType({
  modules: {
    birthday,
  },
})
