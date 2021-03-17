export async function streamToString(stream: NodeJS.ReadableStream) : Promise<string> {
    const chunks : Uint8Array[] = [];

    return new Promise(((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk))
        stream.on('error', reject)
        stream.on('end', () => resolve(Buffer.concat(chunks).toString()))
    }))
}
