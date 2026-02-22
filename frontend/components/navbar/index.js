Component({
  properties: {
    menuOpen: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: 'Fitness Tracker'
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