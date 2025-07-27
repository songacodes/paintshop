# Project Split: HQ and Shop Sides

This project is now organized into two subfolders:

- `hq/`   : Contains all code, assets, and data for the HQ (grandadmin/masteradmin) side.
- `shop/` : Contains all code, assets, and data for the Shop (shop manager/user) side.

## Folder Structure

```
2/
  hq/
    server.js
    hq.json
    super-admin.js
    super-admin.html
    master-admin.js
    master-admin.html
    login.html
    style.css
    ... (other HQ/admin files)
  shop/
    server.js
    shop-config.json
    branch-admin.js
    branch-admin.html
    purchase-form.html
    purchase-script.js
    shopmanager-decision.html
    login.html
    style.css
    ... (other shop files)
```

## Migration Plan

1. Move all HQ/admin-related files into `hq/`.
2. Move all shop/branch-related files into `shop/`.
3. Each side will have its own `server.js` and static assets.
4. `hq.json` stays in `hq/`, shop DB files (e.g., `shop-*.json`) stay in `shop/`.
5. Shared assets (e.g., CSS, images) can be duplicated or symlinked for now.
6. When ready, each subfolder can be run/tested independently.

## Next Steps

- Move files as described above.
- Update import/require paths as needed.
- Continue development and testing in this split structure. 