# Production container topology

The wedding invitation runs as a private Nginx/PHP-FPM Compose stack on one host. Host Nginx terminates TLS and proxies to port 8112, while the application joins the existing `docker_default` network for PostgreSQL and authenticated Redis; uploaded media is retained in a named Docker volume. This keeps the public edge and shared data services host-managed without duplicating them per application.
