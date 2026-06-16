'use strict';

const db = require('./connection');

/**
 * Seed the database with the catalog that previously lived in js/config.js.
 * Runs ONLY when the collections table is empty, so redeploys against a
 * populated volume never re-seed or clobber edits.
 */

const SETTINGS = {
  WHATSAPP_NUMBER: '9647805371063',
  CURRENCY: 'د.ع'
};

const COLLECTIONS = [
  {
    id: 'basra-heritage',
    name: 'تراث البصرة',
    tag: 'الإصدار الأول',
    description: 'النخلة، الشناشيل، والمشحوف على خارطة البصرة',
    image: 'assets/keychain-enamel.jpg',
    available: 1,
    sort_order: 0,
    items: [
      {
        id: 'pin-silver',
        name: 'الدبوس الفضي العتيق',
        description: 'بروش بطلاء فضي عتيق ونقش بارز ثلاثي الأبعاد — أناقة هادئة تلبسها على الصدر أو الحقيبة.',
        price: 25000,
        image: 'assets/pin-silver.jpg'
      },
      {
        id: 'keychain-enamel',
        name: 'ميدالية المينا الملوّنة',
        description: 'ميدالية مفاتيح بمينا ملوّنة يدوياً بألوان البصرة الحقيقية وحواف معدنية بارزة.',
        price: 15000,
        image: 'assets/keychain-enamel.jpg'
      },
      {
        id: 'magnet-gold',
        name: 'المغناطيس الذهبي',
        description: 'مغناطيس ثلاجة بطلاء ذهبي لامع وظهر مغناطيسي قوي — قطعة من البصرة في بيتك.',
        price: 15000,
        image: 'assets/magnet-gold.jpg'
      }
    ]
  },
  {
    id: 'coming-soon',
    name: 'الإصدار القادم',
    tag: null,
    description: 'مجموعة جديدة قيد التصميم',
    image: null,
    available: 0,
    sort_order: 1,
    items: []
  }
];

function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM collections').get();
  if (count > 0) {
    return false;
  }

  const now = new Date().toISOString();

  const insertSetting = db.prepare(
    'INSERT INTO settings (key, value) VALUES (@key, @value)'
  );
  const insertCollection = db.prepare(`
    INSERT INTO collections (id, name, tag, description, image, available, sort_order, created_at, updated_at)
    VALUES (@id, @name, @tag, @description, @image, @available, @sort_order, @created_at, @updated_at)
  `);
  const insertItem = db.prepare(`
    INSERT INTO items (id, collection_id, name, description, price, image, sort_order, created_at, updated_at)
    VALUES (@id, @collection_id, @name, @description, @price, @image, @sort_order, @created_at, @updated_at)
  `);

  const seed = db.transaction(() => {
    Object.keys(SETTINGS).forEach((key) => {
      insertSetting.run({ key, value: SETTINGS[key] });
    });

    COLLECTIONS.forEach((collection) => {
      insertCollection.run({
        id: collection.id,
        name: collection.name,
        tag: collection.tag,
        description: collection.description,
        image: collection.image,
        available: collection.available,
        sort_order: collection.sort_order,
        created_at: now,
        updated_at: now
      });

      collection.items.forEach((item, index) => {
        insertItem.run({
          id: item.id,
          collection_id: collection.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          sort_order: index,
          created_at: now,
          updated_at: now
        });
      });
    });
  });

  seed();
  return true;
}

module.exports = seedIfEmpty;
