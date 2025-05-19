'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { sanitize, errors } = require('@strapi/utils');
const { UnauthorizedError } = require('@strapi/utils').errors;
module.exports = createCoreController('api::event.event', ({ strapi }) => ({
  async create(ctx) {
    const userId = ctx.state.user.id;
    const contentType = strapi.contentType('api::event.event');

    let data = ctx.request.body;
    let files = ctx.request.files;

    // Parse if data is string
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return ctx.badRequest('Invalid JSON');
      }
    }

    data.user = userId;

    const entry = await strapi.entityService.create(contentType.uid, {
      data,
      files,
    });

    return {
      data: await this.sanitizeOutput(entry, contentType, ctx.state.auth),
    };
  },

  async update(ctx) {
    const user = ctx.state.user;
    const documentId = ctx.params.documentId;

    if (!user) {
      return ctx.unauthorized('You must be logged in to update an event');
    }

    // ✅ Use query().findMany instead of service().findMany
    const events = await strapi.query('api::event.event').findMany({
      where: {
        documentId,
        user: { id: user.id },
      },
      populate: ['user'],
    });

    const event = events?.[0];

    if (!event) {
      return ctx.unauthorized("You can't update this entry");
    }

    let updatedEvent;

    if (ctx.is('multipart')) {
      const { data, files } = await parseMultipartData(ctx);

      updatedEvent = await strapi
        .service('api::event.event')
        .update(event.documentId, {
          data,
          files,
        });
    } else {
      const payload = ctx.request.body;

      if (!payload || typeof payload !== 'object' || !payload.data) {
        return ctx.badRequest(
          'Missing or invalid "data" object in request body.'
        );
      }

      updatedEvent = await strapi
        .service('api::event.event')
        .update(event.documentId, {
          data: payload.data,
        });
    }

    // ✅ Publish the document
    // await strapi.service('api::event.event').publish(updatedEvent.documentId);

    const contentType = strapi.contentType('api::event.event');

    return {
      data: await this.sanitizeOutput(
        updatedEvent,
        contentType,
        ctx.state.auth
      ),
    };
  },

  async delete(ctx) {
    const user = ctx.state.user;
    const documentId = ctx.params.documentId;

    // 1. Find the event and make sure it belongs to the authenticated user
    const events = await strapi.query('api::event.event').findMany({
      where: {
        documentId,
        user: { id: user.id },
      },
      populate: ['user'],
    });

    const event = events?.[0];

    if (!event) {
      return ctx.unauthorized(`You can't delete this event`);
    }

    // 2. Delete the event
    const deleted = await strapi
      .service('api::event.event')
      .delete(event.documentId);
    console.log(deleted);
    // 3. Sanitize output
    const sanitized = await this.sanitizeOutput(deleted, ctx);

    return ctx.send({ data: sanitized });
  },

  async me(ctx) {
    try {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('You must be logged in to view your events.');
      }

      const events = await strapi.entityService.findMany('api::event.event', {
        filters: {
          user: user.id,
        },
        populate: '*',
      });

      ctx.body = { data: events }; // No need to manually sanitize
    } catch (err) {
      console.error('Error in /events/me:', err);
      ctx.internalServerError('Something went wrong');
    }
  },
}));
