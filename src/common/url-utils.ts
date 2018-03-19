import { URL } from 'url'

export function makeCampaignURL({slug, publicURL}: {slug: string, publicURL: URL}): URL
{
    const campaignURL = new URL('', publicURL)
    campaignURL.host = `${slug}.${campaignURL.host}`
    return campaignURL
}