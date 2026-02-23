const { muscleApi, unwrapResponseData } = require('../../../../services/api');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  properties: {
    entityId: {
      type: String,
      value: ''
    }
  },

  data: {
    id: '',
    name: '',
    functionText: '',
    originName: '',
    loading: true,
    submitting: false,
    error: '',
    errors: {}
  },

  observers: {
    entityId(value) {
      if (!value) return;
      this.setData({ id: value }, () => this.loadMuscleData());
    }
  },

  lifetimes: {
    attached() {
      if (this.data.entityId) {
        this.setData({ id: this.data.entityId }, () => this.loadMuscleData());
      } else {
        this.setData({
          error: '缺少肌肉 ID',
          loading: false
        });
      }
    }
  },

  methods: {
    loadMuscleData() {
      this.setData({ loading: true, error: '' });

      muscleApi.getById(this.data.id)
        .then((res) => {
          const muscle = unwrapResponseData(res);
          this.setData({
            name: muscle.name || '',
            functionText: muscle.function || '',
            originName: muscle.origin_name || '',
            loading: false
          });
        })
        .catch((err) => {
          console.error('Failed to load muscle data:', err);
          this.setData({
            error: '加载肌肉数据失败，请重试',
            loading: false
          });
        });
    },

    handleNameChange(e) {
      this.setData({ name: e.detail.value });
      if (this.data.errors.name) {
        this.setData({ 'errors.name': '' });
      }
    },

    handleFunctionChange(e) {
      this.setData({ functionText: e.detail.value });
    },

    handleOriginNameChange(e) {
      this.setData({ originName: e.detail.value });
    },

    validateForm() {
      const errors = {};
      const trimmedName = this.data.name.trim();
      if (trimmedName.length < 2) {
        errors.name = '肌肉名称至少2个字符';
      }

      this.setData({ errors });
      return Object.keys(errors).length === 0;
    },

    handleSubmit() {
      if (!this.validateForm()) {
        return;
      }

      this.setData({ submitting: true });

      const muscleData = {
        name: this.data.name.trim(),
        function: this.data.functionText.trim() || undefined,
        origin_name: this.data.originName.trim() || undefined
      };

      muscleApi.update(this.data.id, muscleData)
        .then(() => {
          wx.showToast({
            title: '肌肉已更新',
            icon: 'success'
          });

          setTimeout(() => {
            this.triggerEvent('submitted', { resource: 'muscle', action: 'update' });
          }, 800);
        })
        .catch((err) => {
          console.error('Failed to update muscle:', err);
          wx.showToast({
            title: '更新肌肉失败',
            icon: 'none'
          });
        })
        .finally(() => {
          this.setData({ submitting: false });
        });
    },

    handleBack() {
      this.triggerEvent('cancel');
    }
  }
});
