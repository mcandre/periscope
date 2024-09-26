'use strict';

import packageJSON from '../package.json' with { type: 'json' };

import child_process from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/** Version is semver. */
export const Version = packageJSON.version;

/** EXCLUDE_DIRECTORY_PATTERN matches junk directory parts that are not part of first party code. */
export const EXCLUDE_DIRECTORY_PATTERN=/^(node_modules|\.git|\.svn)$/;

/** YARN_PACKAGE_MANAGER matches package.json yarn configurations. */
export const YARN_PACKAGE_MANAGER=/^yarn@.+$/

/** YARN_INFO_PACKAGE captures package names from yarn info NDJSON output. */
export const YARN_INFO_PACKAGE=/^\"(?<name>.+)@(?<type>npm|workspace):.+\"$/


/** Scanner models a scope linter. */
export class PeriscopeScanner {
    /** constructor creates a new Scanner. */
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.packageManager = null;
    }

    /** excludeDirectory reports whether a directory path is excluded from scanning. */
    excludeDirectory(pth) {
        for (const e of pth.split(path.sep)) {
            if (EXCLUDE_DIRECTORY_PATTERN.test(e)) {
                return true;
            }
        }

        return false;
    }

    /** scanPaths checks a list of paths recursively. */
    scanPaths(paths) {
        for (const pth of paths) {
            this.#scan(path.resolve(pth));
        };
    }

    /** scan checks an absolute path recursively. */
    #scan(pth) {
        if (fs.statSync(pth).isDirectory()) {
            this.#scanDirectory(pth);
            return;
        }

        this.#scanFile(pth);
    }

    /** scanDirectory checks an absolute directory path, non-recursively. */
    #scanDirectory(pth) {
        if (this.excludeDirectory(pth)) {
            return;
        }

        for (const child of fs.readdirSync(pth, { recursive: true })) {
            const pth2 = path.join(pth, child);

            if (this.excludeDirectory(pth2)) {
                continue;
            }

            if (fs.statSync(pth2).isDirectory()) {
                continue;
            }

            this.#scanFile(pth2);
        }
    }

    /** scanFile checks an absolute file path. */
    #scanFile(pth) {
        if (this.excludeDirectory(pth)) {
            return;
        }

        if (path.basename(pth) !== 'package.json') {
            return;
        }

        this.#scanPackage(pth);
        this.#scanDependencies(pth);
    }

    /** scanPackage checks an absolute file path for an unscoped publication name. */
    #scanPackage(pth) {
        const pkg = JSON.parse(fs.readFileSync(pth, 'utf8'));
        this.packageManager = pkg.packageManager;

        if (!'name' in pkg) {
            this.warnings.push(`warning: missing name key: ${pth}`);
            return;
        }

        const name = pkg.name;

        if (!name.startsWith('@')) {
            this.warnings.push(`warning: unscoped publication name "${name}" vulnerable to spoofing: ${pth}`);
            return;
        }
    }

    #scanDependencies(pth) {
        if (YARN_PACKAGE_MANAGER.test(this.packageManager)) {
            this.#scanYarnDependencies(pth);
            return;
        }

        this.#scanNPMDependencies(pth);
    }

    /** scanYarnDependencies checks a Yarn dependency tree for unscoped package names. */
    #scanYarnDependencies(pth) {
        const
            command = 'yarn info --name-only --json',
            cwd = path.dirname(pth);

        let
            yarnInfoStdout = '',
            dependenciesNDJSON = [],
            dependencies = [];

        try {
            yarnInfoStdout = child_process.execSync(command, { cwd, stdio: 'pipe' });
            dependenciesNDJSON = yarnInfoStdout.toString().split(/\r?\n/);

            for (const dependencyNDJSON of dependenciesNDJSON) {
                if (dependencyNDJSON === '') {
                    continue;
                }

                const dependencyMatch = YARN_INFO_PACKAGE.exec(dependencyNDJSON);

                if (dependencyMatch === null) {
                    this.errors.push(`error invalid yarn package NDJSON: ${dependencyNDJSON}`);
                    return;
                }

                if (!'name' in dependencyMatch.groups) {
                    this.errors.push(`error yarn package NDJSON missing name: ${dependencyNDJSON}`);
                    return;
                }

                if (!'type' in dependencyMatch.groups) {
                    this.errors.push(`error yarn package NDJSON missing type: ${dependencyNDJSON}`);
                    return;
                }

                if (dependencyMatch.groups.type === 'workspace') {
                    continue;
                }

                dependencies.push(dependencyMatch.groups.name);
            }
        } catch (error) {
            this.errors.push(`error running dependency tree command: ${command}: ${error.stderr}`);
            return;
        }

        for (const dependency of dependencies) {
            this.#scanDependency(pth, dependency);
        }
    }

    /** scanNPMDependencies checks an NPM dependency tree for unscoped package names. */
    #scanNPMDependencies(pth) {
        const
            command = 'npm ls --all --json',
            cwd = path.dirname(pth);

        let pkg = {};

        try {
            pkg = JSON.parse(child_process.execSync(command, { cwd, stdio: 'pipe' }));
        } catch (error) {
            this.errors.push(`error running dependency tree command: ${command}: ${error.stderr}`);
            return;
        }

        if ('dependencies' in pkg) {
            for (const dependency in pkg.dependencies) {
                this.#scanDependency(pth, dependency);
            }
        }

        if ('devDependencies' in pkg) {
            for (const dependency in pkg.devDependencies) {
                this.#scanDependency(pth, dependency);
            }
        }
    }

    /** scanDependency checks a given file path and dependency for unscoped package names. */
    #scanDependency(pth, dependency) {
        if (!dependency.startsWith('@')) {
            this.warnings.push(`warning: unscoped dependency name "${dependency}" vulnerable to spoofing: ${pth}`);
        }
    }
}
