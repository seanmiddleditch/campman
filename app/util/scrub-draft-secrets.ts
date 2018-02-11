
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
