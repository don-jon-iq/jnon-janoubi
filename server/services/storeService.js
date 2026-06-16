'use strict';

const settingsRepo = require('../repositories/settingsRepo');
const collectionsRepo = require('../repositories/collectionsRepo');
const itemsRepo = require('../repositories/itemsRepo');

/**
 * Assemble the nested object the public storefront expects, IDENTICAL in
 * shape to the old STORE_CONFIG global (note: DB column `description` maps
 * to the JSON key `desc`, which the frontend reads).
 */
function assembleStore() {
  const settings = settingsRepo.getAll();

  const collections = collectionsRepo.list().map((c) => ({
    id: c.id,
    name: c.name,
    tag: c.tag || undefined,
    desc: c.description || '',
    image: c.image || '',
    available: c.available === 1,
    items: itemsRepo.listByCollection(c.id).map((it) => ({
      id: it.id,
      name: it.name,
      desc: it.description || '',
      price: it.price,
      image: it.image || ''
    }))
  }));

  return {
    WHATSAPP_NUMBER: settings.WHATSAPP_NUMBER || '',
    CURRENCY: settings.CURRENCY || 'د.ع',
    COLLECTIONS: collections
  };
}

module.exports = { assembleStore };
