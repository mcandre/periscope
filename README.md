# periscope: NPM/Yarn dependency scope linter

[![NPM Downloads](https://img.shields.io/npm/d18m/%40mcandre%2Fperiscope?label=NPM%20downloads)
](https://www.npmjs.com/package/@mcandre/periscope) [![Yarn](https://img.shields.io/badge/yarn-8A2BE2)](https://yarnpkg.com/package?q=%40mcandre%2Fperiscope&name=%40mcandre%2Fperiscope) [![Test](https://github.com/mcandre/periscope/actions/workflows/test.yml/badge.svg)](https://github.com/mcandre/periscope/actions/workflows/test.yml) [![Test-Futureproof-Language](https://github.com/mcandre/periscope/actions/workflows/test-futureproof-language.yml/badge.svg)](https://github.com/mcandre/periscope/actions/workflows/test-futureproof-language.yml) [![Test-Futureproof-OS](https://github.com/mcandre/periscope/actions/workflows/test-futureproof-os.yml/badge.svg)](https://github.com/mcandre/periscope/actions/workflows/test-futureproof-os.yml) [![license](https://img.shields.io/badge/license-BSD-3)](LICENSE.md)

![yellow submarine](periscope.jpg)

# EXAMPLES

```console
$ cd examples

$ cd hello-npm

$ periscope .
warning: unscoped publication name "hello-npm" vulnerable to spoofing: package.json
warning: unscoped dependency name "express" vulnerable to spoofing: package.json
warning: unscoped dependency name "redis" vulnerable to spoofing: package.json
```

See `periscope -h` for more options.

# ABOUT

NPM provides [scoped](https://docs.npmjs.com/cli/v9/using-npm/scope) package names using an at sign (`@`) prefix. Scoped names are safer than classical names. For example, anyone can publish packages with names similar to `redis`, but only authorized members of the scope are allowed to publish packages with the `@redis/` namespace.

periscope automates scanning large, complex projects to identify first party and third party code that uses unscoped package names.

# INSTALLATION

See [INSTALL.md](INSTALL.md).

# LICENSE

BSD-2-Clause

## Optional

* [Yarn](https://yarnpkg.com/) 4.5.0+

# SEE ALSO

* [booty](https://github.com/mcandre/booty), a task runner convention for ECMAScript/JavaScript/Node.js/altJS projects
* [linters](https://github.com/mcandre/linters), a wiki of common programming language linters and SAST tools
* [stank](https://github.com/mcandre/stank), a collection of shell script linter utilities
* [unmake](https://github.com/mcandre/unmake), a linter for makefiles

🤿
