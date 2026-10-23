# Repository instructions

## Closure and clean-up

This MCP server reaches users through npm; nothing is installed locally from this checkout. When a change is complete:

1. Run `npm run build` plus any tests the change needs, then commit locally.
2. Remove the build output and dependencies: `build/` and `node_modules/`.

For documentation-only changes to repository instructions, review the diff and commit locally; no version bump, dependency installation, build or test run is needed.

## Releases

- A push to `main` that changes `package.json` triggers `.github/workflows/publish.yml`, which publishes to npm. Change the version, or anything else in `package.json`, only when Stefan explicitly asks for a release.
- When a release fixes a defect or dependency security issue in a published version, deprecate the affected versions after verifying that the replacement is available on npm. Use narrowly scoped `npm deprecate unichat-ts-mcp-server@<affected-version> "Upgrade to unichat-ts-mcp-server <fixed-version> or later: <reason>."` notices; do not deprecate all older versions merely because a new version exists.
- Verify each notice with `npm view unichat-ts-mcp-server@<affected-version> deprecated`. Deprecation needs npm maintainer authentication separately from the publishing workflow. If authentication blocks it, report the exact versions still pending and do not claim deprecation is complete.

## Git workflow

- Commit locally as work progresses. Push only when Stefan asks; when a milestone is done, ask once whether to push now or not yet.
- Use plain `git` on `main`. Create branches or pull requests only when asked.
