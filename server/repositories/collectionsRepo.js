'use strict';

const db = require('../db/connection');

const listStmt = db.prepare('SELECT * FROM collections ORDER BY sort_order ASC, created_at ASC');
const getByIdStmt = db.prepare('SELECT * FROM collections WHERE id = ?');
const maxSortStmt = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS maxSort FROM collections');
const insertStmt = db.prepare(`
  INSERT INTO collections (id, name, tag, description, image, available, sort_order, created_at, updated_at)
  VALUES (@id, @name, @tag, @description, @image, @available, @sort_order, @created_at, @updated_at)
`);
const updateStmt = db.prepare(`
  UPDATE collections
     SET name = @name, tag = @tag, description = @description, image = @image,
         available = @available, updated_at = @updated_at
   WHERE id = @id
`);
const deleteStmt = db.prepare('DELETE FROM collections WHERE id = ?');
const setSortStmt = db.prepare('UPDATE collections SET sort_order = @sort_order, updated_at = @updated_at WHERE id = @id');
const countImageRefsStmt = db.prepare('SELECT COUNT(*) AS count FROM collections WHERE image = ?');

function list() {
  return listStmt.all();
}

function getById(id) {
  return getByIdStmt.get(id) || null;
}

function create(data) {
  const now = new Date().toISOString();
  const { maxSort } = maxSortStmt.get();
  insertStmt.run({
    id: data.id,
    name: data.name,
    tag: data.tag ?? null,
    description: data.description ?? null,
    image: data.image ?? null,
    available: data.available ? 1 : 0,
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
    tag: data.tag ?? null,
    description: data.description ?? null,
    image: data.image ?? null,
    available: data.available ? 1 : 0,
    updated_at: now
  });
  return getById(id);
}

function remove(id) {
  return deleteStmt.run(id).changes > 0;
}

/**
 * Reorder by an explicit list of ids. Ids not present keep their order
 * after the listed ones (handled by the caller passing the full set).
 */
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

module.exports = { list, getById, create, update, remove, reorder, countImageRefs };
