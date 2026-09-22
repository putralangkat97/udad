# Production container topology

The wedding invitation runs as a private Nginx/PHP-FPM Compose stack on one host. Host Nginx terminates TLS and proxies to port 8112, while the application keeps its SQLite database, database-backed cache/session/queue data, and uploaded media in named Docker volumes. No external database or cache service is required, so the stack does not depend on another Compose project or a shared Docker network.
