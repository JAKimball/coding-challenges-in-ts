import fs from 'fs'

const fullPath = `src/text/sample.md`
const rawInput = fs.readFileSync(fullPath, 'utf8')

rawInput

/****
 * Parse markdown for inline links that redirect and replace them with direct links.
 *
 * Markdown inline links are of the form:
 *  [link-text](link-destination link-title)
 *
 * Where:
 * - link-text is the text that is displayed in the rendered markdown.
 * - link-destination is the URI that the link points to.
 * - link-title (optional) is the title of the link. It is displayed as a tooltip when the
 *   user hovers over the link.
 *
 * (See https://spec.commonmark.org/0.30/#links
 * and https://www.markdownguide.org/basic-syntax/#links)
 *
 * While the link-destination can be any URI, for purposes of this function, we are only
 * interested in URLs (URIs with the http or https scheme) that redirect to other URLs. We
 * want to replace these with direct links to the final destination. We will identify these
 * as any URL that contains a query parameter of any name that has a value that is a valid
 * http or https URL. The value of this parameter is the URL that the link redirects to.
 *
 * We want to replace the link-destination with the value of the query parameter. We also
 * want to replace the link-text with the title of the page that is redirected to if the
 * link-text starts with "http://" or "https://". Otherwise, we will leave the link-text as
 * it is. To find the title of the page, we will make a GET request to the link-destination
 * recursively following redirects until we get a 200 response (with a depth limit set by
 * REDIRECT_LIMIT). We will then parse the HTML response and extract the title from the
 * <title> tag.
 *
 * If the link-destination is not a URL, or a URL with no parameter with a URL value, we
 * will leave the link as it is.
 *
 * If a link-title is present, we will leave the link-title as it is.
 *
 */

const REDIRECT_LIMIT = 10

const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\s*("([^"]+)")?\)/g

const httpRegex = /^https?:\/\//

const urlRegex = /url=([^&]+)/

const titleRegex = /<title>([^<]+)<\/title>/i
