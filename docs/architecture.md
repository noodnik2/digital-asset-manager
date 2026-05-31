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
    ├── appservices.ts       # AppServices interface — technology-agnostic service contract for renderer
    ├── plugin-interface.ts  # Plugin-author contract; MetadataPlugin, OperationPlugin, Plugin
    ├── types/
    │   ├── asset.ts         # Asset, AssetRow, ColumnDefinition, LibraryQuery, LibraryViewState
    │   └── operation.ts     # OperationDefinition, ParameterDefinition, OperationResult, etc.
    └── trpc-router-type.ts  # (future) tRPC router type exported for renderer type inference
```
