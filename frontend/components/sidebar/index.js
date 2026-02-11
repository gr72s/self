Component({
  properties: {
    expanded: {
      type: Boolean,
      value: true
    },
    selectedItem: {
      type: String,
      value: 'home'
    }
  },
  data: {
  },
  methods: {
    handleItemClick(e) {
      const { id, url } = e.currentTarget.dataset;
      this.setData({ selectedItem: id });
      wx.navigateTo({ url });
      this.triggerEvent('itemClick', { id, url });
    },
    handleCollapse() {
      this.triggerEvent('toggleExpanded', { expanded: false });
    }
  }
});