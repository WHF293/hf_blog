<script lang="ts">
import { defineComponent, ref } from 'vue'
export default defineComponent({
  name: 'MyCheckbox',
  props: {
    val: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const state = ref(props.val)
    return {
      state,
    }
  },
})
</script>

<template>
  <div class="items-center">
    <input type="checkbox" id="inputId" v-model="state" :disabled="disabled" />
    <label for="inputId"></label>
    <span style="margin-left: 8px">{{ text }}</span>
  </div>
</template>

<style scoped>
.items-center {
  display: flex;
  align-items: center;
  margin: 12px;
}
input {
  display: none;
}
label {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 1px solid var(--vp-c-green);
  position: relative;
  cursor: pointer;
}
label::before {
  display: inline-block;
  content: ' ';
  width: 12px;
  border: 2px solid #fff;
  height: 4px;
  border-top: none;
  border-right: none;
  transform: rotate(-45deg);
  top: 5px;
  left: 3px;
  position: absolute;
  opacity: 0;
}
input:checked + label {
  background: var(--vp-c-green);
}
input:checked + label::before {
  opacity: 1;
  transform: all 0.5s;
}
</style>
