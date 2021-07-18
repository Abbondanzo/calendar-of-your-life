import { getAccessorType } from 'typed-vuex'
import * as birthday from '~/store/birthday'
import * as circles from '~/store/circles'

export const accessorType = getAccessorType({
  modules: {
    birthday,
    circles,
  },
})
