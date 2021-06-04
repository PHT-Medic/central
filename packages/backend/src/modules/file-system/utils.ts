import fs from "fs";

export async function ensureDirectoryExists(path: string) {
    try {
        await fs.promises.stat(path);
        await fs.promises.chmod(path, 0o775);
    } catch (e) {
        await fs.promises.mkdir(path, {
            mode: 0o775
        });
    }
}
