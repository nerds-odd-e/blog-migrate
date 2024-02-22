# Migration of blog.odd-e.com

Current blog is hosted on `www` and uses Movable Type (v5) and MySQL (v5), both too old and unsupported.
The plan is to move the blog to `fluxparty` k8s cluster and use <https://ghost.org> as a modern blogging platform.


## Steps

0. Backup data
  - MySQL DB on `infra` (in case we need to use it temporarily while waiting for Linode's managed DB serice): `GDrive/Backups/20240220-infra-mysqldump.sql.gz`.
  - Movable Type admin export: `GDrive/Backups/20240219_odde-blog-movable-type-backup.tar.gz`

1. Run migration

  ```bash
  git clone git@github.com:nerds-odd-e/blog-migrate.git
  cd blog-migrate
  yarn
  node migrate.js $MT_BACKUP_DIR/$MT_BACKUP.xml # -> blog.json + renames images
  ```

2. Test locally

  - Create a zip archive with blog.json and images in `$MT_BACKUP_DIR`
  - `docker-compose up`
  - Go to `http://localhost:8080/ghost/`. Create admin account if 1st time. Then go to Settings -> Advanced -> Lab -> Import and upload the zip archive
