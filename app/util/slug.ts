export function sanitizeSlug(slug: string) : string
{
    return slug.replace(/[^a-zA-Z0-9-]+/g, '-').substring(0, 32).toLowerCase();
}