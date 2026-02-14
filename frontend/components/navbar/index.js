Component({
  properties: {
    menuOpen: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: 'Fitness Tracker'
    },
    userInfo: {
      type: Object,
      value: null
    }
  },
  data: {
  },
  methods: {
    handleMenuToggle() {
      this.triggerEvent('toggleMenu', { open: !this.data.menuOpen });
    }
  }
});