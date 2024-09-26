'use strict';

import child_process from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/** Scanner models a scope linter. */
export default class PeriscopeScanner {
    /** constructor creates a new Scanner. */
    constructor() {
        this.errors = [];
        this.warnings = [];
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

        this.#scanPublicationNames(pth);
        this.#scanNPMDependencies(pth);
    }

    /** scanPublicationNames checks an absolute file path for an unscoped in the publication name. */
    #scanPublicationNames(pth) {
        const pkg = JSON.parse(fs.readFileSync(pth, 'utf8'));

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

/** EXCLUDE_DIRECTORY_PATTERN matches junk directory parts that are not part of first party code. */
export const EXCLUDE_DIRECTORY_PATTERN=/^(node_modules|\.git|\.svn)$/;
