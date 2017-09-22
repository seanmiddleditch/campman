export function sanitize(slug: string) : string
{
    return slug.replace(/[^a-zA-Z0-9-]+/g, ' ').trim().substring(0, 32).trim().toLowerCase().replace(' ', '-');
}

export function isValid(slug: string): boolean
{
    return slug.length >= 3 &&
        slug === sanitize(slug) &&
        slug != 'dev' &&
        slug != 'www' &&
        slug != 'api' &&
        slug != 'staging';
}