
export function scrubDraftSecrets(rawbody: string, secrets: boolean = false)
{
    if (rawbody.length === 0)
        return null

    const body = JSON.parse(rawbody)

    if (!secrets)
    {
        if (body && body.length !== 0)
        {
            const blocks = body.blocks.filter((b: any) => b.type !== 'secret')
            return {...body, blocks}
        }
    }

    return body
}

export function validateDraft(rawbody: string|object)
{
    if (typeof rawbody === 'string')
        rawbody = JSON.parse(rawbody) as object

    if (!('blocks' in rawbody))
        return false;
    if (!('entityMap' in rawbody))
        return false;

    return true;
}
