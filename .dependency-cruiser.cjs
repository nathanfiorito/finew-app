/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependencies are forbidden.",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-orphans",
      severity: "warn",
      comment: "Module is not imported anywhere and is not an entry point.",
      from: {
        orphan: true,
        pathNot: [
          "(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$",
          "\\.d\\.ts$",
          "(^|/)tsconfig\\.json$",
          "(^|/)src/main\\.tsx$",
          "(^|/)src/architecture\\.test\\.ts$",
          "(^|/)src/test/setup\\.ts$",
          "\\.test\\.(ts|tsx)$",
          "\\.css$",
        ],
      },
      to: {},
    },
    {
      name: "fsd-layer-deps",
      severity: "error",
      comment: "FSD: a layer may only import from layers below it.",
      from: { path: "^src/(app|pages|widgets|features|entities|shared)/" },
      to: {
        path: "^src/(app|pages|widgets|features|entities|shared)/",
        pathNot: "^src/$1/",
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};
