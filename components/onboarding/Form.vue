<template>
  <el-container>
    <el-main justify="center">
      <h1 class="title">Enter Your Birthdate</h1>
      <el-form ref="form" :model="form">
        <el-form-item
          prop="tempBirthday"
          :rules="[{ validator: checkBirthday, trigger: 'blur' }]"
        >
          <el-date-picker
            v-model="form.tempBirthday"
            class="date-picker"
            :default-value="defaultBirthday"
            type="date"
            placeholder="e.g. May 21, 1998"
            format="MMMM d, yyyy"
            size="large"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :disabled="disabled"
            size="large"
            @click="submitForm"
            >Save</el-button
          >
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      form: {
        tempBirthday: null,
      },
    }
  },
  computed: {
    defaultBirthday() {
      // Default to 18 years ago
      return new Date().setFullYear(new Date().getFullYear() - 18)
    },
    disabled() {
      return !(this as any).form.tempBirthday
    },
  },
  methods: {
    checkBirthday(_field: any, value: any, callback: (...args: any[]) => void) {
      if (!value) {
        return callback(new Error('Please input a birthday'))
      }
      try {
        if (Number.isNaN(Date.parse(value))) {
          return callback(new Error("That's not a valid birthday"))
        } else if (new Date() <= value) {
          return callback(
            new Error("You've been born already, use a real birthday!")
          )
        } else {
          return callback()
        }
      } catch (error) {
        return callback(error)
      }
    },
    submitForm() {
      const formRef = this.$refs.form as any
      formRef.validate((valid: boolean) => {
        if (valid) {
          const date = this.form.tempBirthday as unknown as Date
          this.$accessor.birthday.set({ date })
        }
      })
    },
  },
})
</script>

<style>
.title {
  text-align: center;
}
</style>
