// Components
import VCounter from '../components/VCounter'
import VIcon from '../components/VIcon'
import VMessages from '../components/VMessages'
import VProgressLinear from '../components/VProgressLinear'

// Mixins
import Colorable from './colorable'
import Loadable from './loadable'
import Themeable from './themeable'
import Validatable from './validatable'

export default {
  name: 'input',

  components: {
    VCounter,
    VIcon,
    VMessages,
    VProgressLinear
  },

  mixins: [
    Colorable,
    Loadable,
    Themeable,
    Validatable
  ],

  data () {
    return {
      isFocused: false,
      tabFocused: false,
      internalTabIndex: null,
      lazyValue: this.value
    }
  },

  props: {
    appendIcon: String,
    appendIconCb: Function,
    disabled: Boolean,
    clearable: Boolean,
    clearIcon: String,
    hint: String,
    hideDetails: Boolean,
    label: String,
    outerIcon: String,
    persistentHint: Boolean,
    placeholder: String,
    prependIcon: String,
    prependIconCb: Function,
    readonly: Boolean,
    required: Boolean,
    tabindex: {
      default: 0
    },
    toggleKeys: {
      type: Array,
      default: () => [13, 32]
    },
    value: {
      required: false
    }
  },

  computed: {
    colorClasses () {
      return this.addTextColorClassChecks()
    },
    currentColor () {
      if (this.hasError) return 'error'
      if (this.hasSuccess) return 'success'
      if (this.isFocused) return this.color
      return null
    },
    hasState () {
      return this.hasError || this.hasSuccess || this.isFocused
    },
    inputClasses () {
      return {
        ...this.classes,
        'v-input--is-focused': this.isFocused,
        'v-input--is-loading': this.loading !== false,
        'v-input--is-dirty': this.isDirty,
        'v-input--is-disabled': this.disabled,
        'v-input--has-state': this.hasState,
        ...this.colorClasses,
        'theme--light': !this.dark,
        'theme--dark': this.dark
      }
    },
    isDirty () {
      return !!this.inputValue
    },
    wrapperClasses () {
      return this.colorClasses
    }
  },

  methods: {
    groupFocus (e) {},
    groupBlur (e) {
      this.tabFocused = false
    },
    genContent () {
      return this.$createElement('div', {
        staticClass: 'v-input__control'
      }, [
        this.genInputWrapper(),
        this.genProgress(),
        this.genMessages(),
        this.genCounter()
      ])
    },
    genCounter () {
      if (this.counter === false) return null

      const length = (this.inputValue || '').length

      return this.$createElement(VCounter, {
        props: {
          value: `${length} / ${this.counter}`
        }
      })
    },
    genLabel () {
      return this.$createElement('label', {
        staticClass: 'v-input__label',
        'class': [
          this.isFocused || this.isDirty
            ? 'v-input__label--active'
            : ''
        ],
        attrs: {
          for: this.$attrs.id
        }
      }, this.$slots.label || this.label)
    },
    genInputWrapper () {
      return this.$createElement('div', {
        staticClass: 'v-input__wrapper',
        'class': this.wrapperClasses
      }, [
        this.genLabel(),
        this.genInput(),
        this.genAppendInner()
      ])
    },
    genMessages () {
      let messages = []

      if (
        this.hint &&
        (this.isFocused || this.persistentHint) &&
        !this.validations.length
      ) {
        messages = [this.hint]
      } else if (this.validations.length) {
        messages = [this.genError(this.validations[0])]
      }

      return this.$createElement(VMessages, {
        props: { messages }
      }, this.$slots.messages)
    },
    genIcon (type, defaultCallback = null) {
      if (!this.hasIcon(type)) return null

      const shouldClear = this.shouldClear(type)
      const callback = shouldClear
        ? this.clearableCallback
        : (this[`${type}IconCb`] || defaultCallback)

      const icon = this.$createElement('v-icon', {
        props: { disabled: this.disabled },
        on: {
          click: e => {
            if (!callback) return

            e.stopPropagation()
            callback()
          }
        }
      }, shouldClear ? 'clear' : this[`${type}Icon`])

      return this.$createElement('div', {
        staticClass: `v-input__icon v-input__icon--${type}`
      }, [icon])
    },
    hasIcon (icon) {
      return this[`${icon}Icon`] || this.$slots[`${icon}Icon`]
    },
    genSlot (ref, location, slot) {
      if (!slot.length) return null

      return this.$createElement('div', {
        staticClass: `v-input__${ref}-${location}`
      }, slot)
    },
    genPrependOuter () {
      const slot = []

      if (this.$slots['prepend-outer']) {
        slot.push(this.$slots['prepend-outer'])
      // For backwards compat
      } else if (this.$slots['prepend-icon']) {
        slot.push(this.$slots['prepend-icon'])
      } else if (this.prependIcon) {
        slot.push(this.genIcon('prepend'))
      }

      return this.genSlot('prepend', 'outer', slot)
    },
    genAppendOuter () {
      const slot = []

      if (this.$slots['append-outer']) {
        slot.push(this.$slots['append-outer'])
      } else if (this.outerIcon) {
        slot.push(this.genIcon('outer'))
      }

      return this.genSlot('append', 'outer', slot)
    },
    genAppendInner () {
      const slot = []

      if (this.$slots['append-inner']) {
        slot.push(this.$slots['append-inner'])
        // For backwards compat
      } else if (this.$slots['append-icon']) {
        slot.push(this.$slots['append-icon'])
      } else if (this.appendIcon) {
        slot.push(this.genIcon('append'))
      }

      if (this.clearIcon) {
        slot.unshift(this.genIcon('clear'))
      }

      return this.genSlot('append', 'inner', slot)
    },
    genInputGroup (input, data = {}, defaultAppendCallback = null) {
      return this.$createElement('div', {
        staticClass: 'v-input',
        'class': this.inputClasses
      }, [
        this.genPrependOuter(),
        this.genContent(),
        this.genAppendOuter()
      ])
      // const children = []
      // const wrapperChildren = []
      // const detailsChildren = []

      // data = Object.assign({}, {
      //   'class': this.inputGroupClasses,
      //   attrs: {
      //     tabindex: this.disabled
      //       ? -1
      //       : this.internalTabIndex || this.tabindex
      //   },
      //   on: {
      //     focus: this.groupFocus,
      //     blur: this.groupBlur,
      //     click: () => (this.tabFocused = false),
      //     keyup: e => {
      //       if ([9, 16].includes(e.keyCode)) {
      //         this.tabFocused = true
      //       }
      //     },
      //     keydown: e => {
      //       if (!this.toggle) return

      //       if (this.toggleKeys.includes(e.keyCode)) {
      //         e.preventDefault()
      //         this.toggle()
      //       }
      //     }
      //   }
      // }, data)

      // if (this.$slots.label || this.label) {
      //   children.push(this.genLabel())
      // }

      // wrapperChildren.push(input)

      // if (this.prependIcon) {
      //   wrapperChildren.unshift(this.genIcon('prepend'))
      // }

      // if (this.appendIcon || this.clearable) {
      //   wrapperChildren.push(this.genIcon('append', defaultAppendCallback))
      // }

      // const progress = this.genProgress()
      // progress && detailsChildren.push(progress)

      // children.push(
      //   this.$createElement('div', {
      //     'class': 'input-group__input'
      //   }, wrapperChildren)
      // )

      // !this.hideDetails && detailsChildren.push(this.genMessages())

      // if (this.counter) {
      //   detailsChildren.push(this.genCounter())
      // }

      // children.push(
      //   this.$createElement('div', {
      //     'class': 'input-group__details'
      //   }, detailsChildren)
      // )

      // return this.$createElement('div', data, children)
    },
    shouldClear (type) {
      return type === 'append' &&
        this.clearable &&
        this.isDirty
    }
  }
}
