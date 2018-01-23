export function sanitize(slug: string) : string
{
    return slug.replace(/[^a-zA-Z0-9-]+/g, ' ').trim().substring(0, 32).trim().toLowerCase().replace(' ', '-')
}

export function isValid(slug: string): boolean
{
    return slug.length >= 3 && slug === sanitize(slug)

}

const illegalSlugs = [
    'www', 'api', 'mail', // real sub-domains used by the app
    'dev', 'staging', // sub-domains used by branches
    'admin', 'profile', 'app', 'login' // official-looking subdomains
]
export function isLegal(slug: string): boolean
{
    return !(slug in illegalSlugs)
}
