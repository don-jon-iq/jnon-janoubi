'use strict';

const db = require('../db/connection');

const listStmt = db.prepare('SELECT * FROM media ORDER BY created_at DESC');
const getByIdStmt = db.prepare('SELECT * FROM media WHERE id = ?');
const insertStmt = db.prepare(`
  INSERT INTO media (id, filename, path, mime, size, created_at)
  VALUES (@id, @filename, @path, @mime, @size, @created_at)
`);
const deleteStmt = db.prepare('DELETE FROM media WHERE id = ?');

function list() {
  return listStmt.all();
}

function getById(id) {
  return getByIdStmt.get(id) || null;
}

function create(data) {
  insertStmt.run({
    id: data.id,
    filename: data.filename,
    path: data.path,
    mime: data.mime,
    size: data.size,
    created_at: new Date().toISOString()
  });
  return getById(data.id);
}

function remove(id) {
  return deleteStmt.run(id).changes > 0;
}

module.exports = { list, getById, create, remove };
