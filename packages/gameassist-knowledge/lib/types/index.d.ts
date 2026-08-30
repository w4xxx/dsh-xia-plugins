/**
 * Tree-shaped knowledge base for the Xia game-assistant preset. Each library
 * is a directory under the configured root: directories are branches and
 * `.md` files are leaf nodes whose first `# heading` line is the display
 * title. The browser panel reads the tree and node bodies over two HTTP
 * routes; the agent gets `kb_list` / `kb_read` / `kb_write` tools plus a
 * compact prompt index that names libraries and their top level only, so
 * reading bodies stays strictly on demand (token-cheap).
 *
 * @module @w4xxx/dsh-gameassist-knowledge
 */
import z from '@deepseek-ai/schemastery';
/** Cordis plugin name used by loader diagnostics. */
export declare const name = "gameassist-knowledge";
/** The registries this plugin contributes to. */
export declare const inject: string[];
/** Plugin configuration validated by the loader. */
export interface Config {
    /** Absolute path of the knowledge-base root (one subdirectory per library). */
    kbRoot: string;
}
/** Schemastery validation for {@link Config}. */
export declare const Config: z<Config>;
/** One `.md` leaf node. */
export interface KbFileNode {
    kind: 'file';
    /** Display name without the `.md` suffix. */
    name: string;
    /** Library-relative POSIX path including `.md`. */
    path: string;
    /** First `# heading` line (BOM-tolerant) or the file name. */
    title: string;
    /** File size in bytes. */
    size: number;
}
/** One directory branch. */
export interface KbDirNode {
    kind: 'dir';
    name: string;
    /** Library-relative POSIX path with a trailing `/`. */
    path: string;
    children: KbTreeNode[];
}
export type KbTreeNode = KbFileNode | KbDirNode;
/** One knowledge library (a top-level directory). */
export interface KbLibrary {
    name: string;
    /** `README.md` heading, or the directory name. */
    title: string;
    /** Total node count (files plus directories). */
    nodeCount: number;
    nodes: KbTreeNode[];
}
/** Single-node byte ceiling; larger files are skipped by tree scans. */
export declare const MAX_NODE_BYTES: number;
/** Strip a leading UTF-8 BOM (Node keeps it in decoded strings). */
export declare function stripBom(text: string): string;
/** Extract the first `# heading` line, tolerating a BOM; falls back when absent. */
export declare function extractTitle(text: string, fallback: string): string;
/** Normalize a native path to POSIX separators. */
export declare function toPosix(path: string): string;
/**
 * Parse a user-facing node path of the form `library/dir/name` (`.md` suffix
 * optional) into its library name and normalized relative path.
 * @returns null when the shape is invalid or contains traversal segments.
 */
export declare function parseKbPath(input: string): {
    library: string;
    rel: string;
} | null;
/**
 * Resolve a user-facing node path against the knowledge root with traversal
 * protection.
 * @returns the absolute path plus library/relative identity, or null.
 */
export declare function resolveLibraryNode(kbRoot: string, input: string): {
    abs: string;
    library: string;
    rel: string;
} | null;
/** Recursively scan one directory into tree nodes (sorted: directories first). */
export declare function scanDir(absDir: string, relDir: string): Promise<KbTreeNode[]>;
/** Count files and directories in a node list. */
export declare function countNodes(nodes: KbTreeNode[]): number;
/** Scan one library directory into a {@link KbLibrary}; null when absent/not a dir. */
export declare function scanLibrary(kbRoot: string, libName: string): Promise<KbLibrary | null>;
/** Scan every library under the root (non-dot directories, sorted by name). */
export declare function scanLibraries(kbRoot: string): Promise<KbLibrary[]>;
/** Compact prompt index: library names plus their top level only. */
export declare function renderIndex(libs: KbLibrary[]): string;
/** Full tree rendering for the `kb_list` tool. */
export declare function renderTree(libs: KbLibrary[]): string;
/**
 * Register the prompt index, the two browser routes, and the three tools.
 * Every contribution is disposed with the fiber.
 * @param ctx - plugin context carrying systemPrompt, tools, and webServer.
 * @param config - the validated plugin configuration.
 */
export declare function apply(ctx: any, config: Config): void;
//# sourceMappingURL=index.d.ts.map