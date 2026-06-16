'use strict';

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const config = require('./config');

const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');
const collectionsRoutes = require('./routes/collectionsRoutes');
const itemsRoutes = require('./routes/itemsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const { requireAuth } = require('./middleware/auth');
const { errorHandler, notFound } = require('./middleware/error');

function buildApp() {
  const app = express();
  const ROOT = config.PROJECT_ROOT;

  // Behind Dokploy/Traefik: trust the proxy so Secure cookies + real IPs work.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // ---- Security headers + tuned CSP (keeps Google Fonts, video, grain SVG) ----
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        mediaSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '100kb' }));

  // ---- API ----
  // Admin: login/logout/me are reachable without a session; the rest require auth.
  const adminRouter = express.Router();
  adminRouter.use('/', authRoutes);

  const protectedRouter = express.Router();
  protectedRouter.use(requireAuth);
  protectedRouter.use('/collections/:cid/items', itemsRoutes);
  protectedRouter.use('/collections', collectionsRoutes);
  protectedRouter.use('/settings', settingsRoutes);
  protectedRouter.use('/media', mediaRoutes);
  adminRouter.use('/', protectedRouter);

  app.use('/api/admin', adminRouter);
  app.use('/api', publicRoutes);

  app.get('/healthz', (req, res) => res.json({ ok: true }));

  // ---- Static assets ----
  const weekCache = { maxAge: '7d' };
  const monthCache = { maxAge: '30d' };

  app.use('/css', express.static(path.join(ROOT, 'css'), weekCache));
  app.use('/js', express.static(path.join(ROOT, 'js'), weekCache));
  app.use('/assets', express.static(path.join(ROOT, 'assets'), monthCache));
  app.use('/uploads', express.static(config.UPLOADS_DIR, monthCache));
  app.use('/admin', express.static(path.join(ROOT, 'admin'), { extensions: ['html'] }));

  // ---- Public pages (HTML never cached so edits/config go live instantly) ----
  app.get('/', (req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(ROOT, 'index.html'));
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = buildApp;
