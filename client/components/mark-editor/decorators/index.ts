import {CompositeDecorator} from 'draft-js'
import wikiLinkDecorator from './wiki-link'

const decorators = new CompositeDecorator([
    wikiLinkDecorator
])
export default decorators
