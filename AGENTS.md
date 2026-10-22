# Repository instructions

## Closure and clean-up

This MCP server reaches users through npm; nothing is installed locally from this checkout. When a change is complete:

1. Run `npm run build` plus any tests the change needs, then commit locally.
2. Remove the build output and dependencies: `build/` and `node_modules/`.

## Releases

- A push to `main` that changes `package.json` triggers `.github/workflows/publish.yml`, which publishes to npm. Change the version, or anything else in `package.json`, only when Stefan explicitly asks for a release.

## Git workflow

- Commit locally as work progresses. Push only when Stefan asks; when a milestone is done, ask once whether to push now or not yet.
- Use plain `git` on `main`. Create branches or pull requests only when asked.
