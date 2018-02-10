
export function scrubDraftSecrets(rawbody: string, secrets: boolean = false)
{
    if (!secrets)
    {
        const body = JSON.parse(rawbody)
        if (body && body.length !== 0)
        {
            const blocks = body.blocks.filter((b: any) => b.type !== 'secret')
            return JSON.stringify({...body, blocks})
        }
    }

    return rawbody
}
