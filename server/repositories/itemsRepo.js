'use strict';

const db = require('../db/connection');

const listByCollectionStmt = db.prepare(
  'SELECT * FROM items WHERE collection_id = ? ORDER BY sort_order ASC, created_at ASC'
);
const getByIdStmt = db.prepare('SELECT * FROM items WHERE id = ?');
const maxSortStmt = db.prepare(
  'SELECT COALESCE(MAX(sort_order), -1) AS maxSort FROM items WHERE collection_id = ?'
);
const countImageRefsStmt = db.prepare('SELECT COUNT(*) AS count FROM items WHERE image = ?');
const insertStmt = db.prepare(`
  INSERT INTO items (id, collection_id, name, description, price, image, sort_order, created_at, updated_at)
  VALUES (@id, @collection_id, @name, @description, @price, @image, @sort_order, @created_at, @updated_at)
`);
const updateStmt = db.prepare(`
  UPDATE items
     SET name = @name, description = @description, price = @price, image = @image, updated_at = @updated_at
   WHERE id = @id
`);
const deleteStmt = db.prepare('DELETE FROM items WHERE id = ?');
const setSortStmt = db.prepare('UPDATE items SET sort_order = @sort_order, updated_at = @updated_at WHERE id = @id');

function listByCollection(collectionId) {
  return listByCollectionStmt.all(collectionId);
}

function getById(id) {
  return getByIdStmt.get(id) || null;
}

function create(collectionId, data) {
  const now = new Date().toISOString();
  const { maxSort } = maxSortStmt.get(collectionId);
  insertStmt.run({
    id: data.id,
    collection_id: collectionId,
    name: data.name,
    description: data.description ?? null,
    price: data.price,
    image: data.image ?? null,
    sort_order: maxSort + 1,
    created_at: now,
    updated_at: now
  });
  return getById(data.id);
}

function update(id, data) {
  const now = new Date().toISOString();
  updateStmt.run({
    id,
    name: data.name,
    description: data.description ?? null,
    price: data.price,
    image: data.image ?? null,
    updated_at: now
  });
  return getById(id);
}

function remove(id) {
  return deleteStmt.run(id).changes > 0;
}

function reorder(orderedIds) {
  const now = new Date().toISOString();
  const tx = db.transaction((ids) => {
    ids.forEach((id, index) => {
      setSortStmt.run({ id, sort_order: index, updated_at: now });
    });
  });
  tx(orderedIds);
}

function countImageRefs(imagePath) {
  return countImageRefsStmt.get(imagePath).count;
}

module.exports = { listByCollection, getById, create, update, remove, reorder, countImageRefs };
