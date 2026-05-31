# Architecture

## Project Structure

```tree
src/
├── main/
│   ├── index.ts
│   ├── window.ts
│   ├── ipc/          # electron-trpc router + sub-routers
│   ├── db/           # better-sqlite3, migrations, queries
│   ├── library/      # scanner, watcher, indexer
│   └── plugins/      # registry + bundled midi plugin
├── preload/
│   └── index.ts
├── renderer/
│   ├── index.html                                                                                                     
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── trpc.ts
│       ├── components/
│       │   ├── shell/                                                                                                 
│       │   ├── library/
│       │   ├── working-set/
│       │   └── operations/
│       ├── hooks/
│       ├── stores/
│       └── types/                                                                                                     
└── shared/
├── plugin-interface.ts
├── types/
│   ├── asset.ts
│   └── operation.ts
└── trpc-router-type.ts
```
