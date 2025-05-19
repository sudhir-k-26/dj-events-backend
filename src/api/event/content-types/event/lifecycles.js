const slugify = require('slugify').default;

module.exports = {
  beforeCreate(event) {
    const { name } = event.params.data;

    if (name) {
      event.params.data.slug = slugify(name, { lower: true, strict: true });
    }
  },

  beforeUpdate(event) {
    const { name } = event.params.data;

    if (name) {
      event.params.data.slug = slugify(name, { lower: true, strict: true });
    }
  },
};
