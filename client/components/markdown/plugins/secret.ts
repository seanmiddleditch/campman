import {MarkdownIt, } from 'markdown-it'

export default function secretPlugin(md: MarkdownIt)
{
    const id = 'SECRET'

    const regex = /^\s*!!\s+(.*)$/m

    md.inline.ruler.push(id, (state: any) => {
        const match = regex.exec(state.src)
        if (match)
        {
            const content = match[1]
            state.pos += match[0].length

            const startToken = state.push('paragraph_open', 'p', 1)
            startToken.attrJoin('class', 'markdown-secret')

            state.md.inline.parse(content, state.md, state.end, state.tokens)

            const endToken = state.push('paragraph_close', 'p', -1)
            return true
        }
        return false
    })

    // md.renderer.rules[id] = (tokens, id, options, env) => {
    //     const token = tokens[id]
    //     if (token.level == 1)
    //         return '<p class="markdown-secret">'
    //     else if (token.level == -1)
    //         return '</p>'
    // }
}