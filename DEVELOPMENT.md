# BUILDTIME REQUIREMENTS

# REQUIREMENTS

* [Node.js](https://nodejs.org/en/) 20.17.0+ with `corepack enable`
* [Yarn](https://yarnpkg.com/) 4.5.0+
* Install additional dependencies with `npm install -g`

Note: Periodically regenerate `package-lock.json` to account for updates in floating (`*`) dependencies.

## Recommended

* [ASDF](https://asdf-vm.com/) 0.14.1 (run `asdf reshim` after provisioning)

# AUDIT

```sh
npm run audit
```

# INSTALL

```sh
npm install [-g]
```

# UNINSTALL

```sh
npm uninstall [-g]
```

# TEST

```sh
npm test
```

# PUBLISH

```sh
npm run upload
```
