import { useDocker } from './instance';

export async function removeLocalRegistryImage(image: string) {
    await useDocker()
        .getImage(image)
        .remove();
}
