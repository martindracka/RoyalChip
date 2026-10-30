import { reactive, ref } from 'vue'

// Small form helper: holds values, runs validation rules and stores error messages.
// A rule is a function (value, allValues) => error message | '' .
export function useForm(initialValues, rules = {}) {
  const values = reactive({ ...initialValues })
  const errors = reactive({})
  const submitting = ref(false)

  function validateField(field) {
    const fieldRules = rules[field] || []
    errors[field] = ''
    for (const rule of fieldRules) {
      const message = rule(values[field], values)
      if (message) {
        errors[field] = message
        break
      }
    }
    return !errors[field]
  }

  function validate() {
    return Object.keys(rules).map(validateField).every(Boolean)
  }

  function setValues(newValues) {
    Object.assign(values, newValues)
  }

  // Runs `action` only when the form is valid and prevents double submits.
  async function handleSubmit(action) {
    if (submitting.value || !validate()) return
    submitting.value = true
    try {
      await action({ ...values })
    } finally {
      submitting.value = false
    }
  }

  return { values, errors, submitting, validate, validateField, setValues, handleSubmit }
}

// Reusable validation rules
export const required = (msg = 'This field is required') => (v) =>
  v === null || v === undefined || String(v).trim() === '' ? msg : ''
export const minLength = (n) => (v) => (v && String(v).trim().length < n ? `Must be at least ${n} characters` : '')
export const maxLength = (n) => (v) => (v && String(v).length > n ? `Must be at most ${n} characters` : '')
export const email = () => (v) => (v && !/^\S+@\S+\.\S+$/.test(v) ? 'Enter a valid e-mail address' : '')
export const minValue = (n) => (v) => (Number(v) < n ? `Must be at least ${n}` : '')
export const integer = () => (v) => (!Number.isInteger(Number(v)) ? 'Must be a whole number' : '')
