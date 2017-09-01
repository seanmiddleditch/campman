export function sanitizeSlug(slug: string) : string
{
    return slug.replace(/[^a-zA-Z0-9-]+/g, ' ').trim().substring(0, 32).trim().toLowerCase().replace(' ', '-');
}