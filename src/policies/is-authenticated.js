'use strict';

module.exports = (policyContext, config, { strapi }) => {
  const { state } = policyContext;

  if (state.user) {
    return true; // allow request to proceed
  }

  return false; // will trigger a 403 Forbidden
};
