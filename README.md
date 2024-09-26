# periscope: NPM dependency scope linter

# EXAMPLES

```console
$ cd example

$ periscope .
warning: unscoped publication name "hello" vulnerable to spoofing: /Users/andrew/go/src/github.com/mcandre/periscope/example/package.json
warning: unscoped dependency name "express" vulnerable to spoofing: /Users/andrew/go/src/github.com/mcandre/periscope/example/package.json
warning: unscoped dependency name "redis" vulnerable to spoofing: /Users/andrew/go/src/github.com/mcandre/periscope/example/package.json
```

# ABOUT

NPM provides [scoped](https://docs.npmjs.com/cli/v9/using-npm/scope) package names using an at sign (`@`) prefix. Scoped names are safer than classical names. For example, anyone can publish packages with names similar to `redis`, but only authorized members of the scope are allowed to publish packages with the `@redis/` namespace.

periscope automates scannign large, complex projects to identify first party and third party code that uses unscoped package names.

# LICENSE

BSD-2-Clause

# REQUIREMENTS

* [Node.js](https://nodejs.org/en/) 20.17.0+

# CONTRIBUTING

For more information on developing periscope itself, see [DEVELOPMENT.md](DEVELOPMENT.md).

# SEE ALSO

* [booty](https://github.com/mcandre/booty), a task runner convention for ECMAScript/JavaScript/Node.js/altJS projects
* [linters](https://github.com/mcandre/linters), a wiki of common programming language linters and SAST tools
* [stank](https://github.com/mcandre/stank), a collection of shell script linter utilities
* [unmake](https://github.com/mcandre/unmake), a linter for makefiles

![yellow submarine](periscope.jpg)
