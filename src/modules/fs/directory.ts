import fs from 'fs';

export async function ensureDirectory(str: string) {
    try {
        await fs.promises.stat(str);
        await fs.promises.chmod(str, 0o775);
    } catch (e) {
        await fs.promises.mkdir(str, {
            mode: 0o775,
        });
    }
}
